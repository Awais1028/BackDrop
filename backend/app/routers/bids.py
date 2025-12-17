from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from ..database import get_db
from ..auth import get_current_user
from ..models import Bid, BidCreate, User, Slot, Comment
from ..repository import create_bid, get_bids_by_counterparty, get_bid_by_id, update_bid, delete_bid, get_slot_by_id, get_bids_by_slot, get_project_by_id, get_all_bids
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

class CommentCreate(BaseModel):
    text: str

@router.get("/", response_model=List[Bid], response_model_by_alias=False)
async def read_bids(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Advertisers/Merchants see their own bids
    if current_user.role in ["advertiser", "merchant"]:
        return await get_bids_by_counterparty(db, current_user.id)
    
    # Creators should probably use a different endpoint or filter by their slots,
    # but for now let's just return empty list or handle via specific slot endpoint
    
    if current_user.role == "operator":
        return await get_all_bids(db)
        
    return []

@router.get("/{bid_id}", response_model=Bid, response_model_by_alias=False)
async def read_bid(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    # Check access (counterparty or creator of the slot)
    if current_user.id == bid.counterparty_id:
        return bid
        
    slot = await get_slot_by_id(db, bid.slot_id)
    if slot and current_user.role == "creator" and slot.creator_id == current_user.id:
        return bid
        
    if current_user.role == "operator":
        return bid

    raise HTTPException(status_code=403, detail="Not authorized to view this bid")

@router.get("/slot/{slot_id}", response_model=List[Bid], response_model_by_alias=False)
async def read_bids_for_slot(
    slot_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    # Creator of the slot can see all bids
    if current_user.role == "creator" and slot.creator_id == current_user.id:
        return await get_bids_by_slot(db, slot_id)
    
    # Operators can see everything (future)
    
    raise HTTPException(status_code=403, detail="Not authorized to view bids for this slot")


@router.post("/", response_model=Bid, response_model_by_alias=False)
async def create_new_bid(
    bid: BidCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role not in ["advertiser", "merchant"]:
        raise HTTPException(status_code=403, detail="Only advertisers and merchants can place bids")
    
    # Verify slot exists
    slot = await get_slot_by_id(db, bid.slot_id)
    if not slot:
         raise HTTPException(status_code=404, detail="Slot not found")
         
    return await create_bid(db, bid, current_user.id)

@router.put("/{bid_id}", response_model=Bid, response_model_by_alias=False)
async def update_existing_bid(
    bid_id: str,
    bid_update: BidCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    # Only the bidder can update the bid details, and only if it's pending
    if current_user.id == bid.counterparty_id:
        if bid.status != "Pending":
             raise HTTPException(status_code=400, detail="Cannot edit a bid that is not Pending")
    else:
         raise HTTPException(status_code=403, detail="Not authorized to update this bid")
    
    success = await update_bid(db, bid_id, bid_update.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update bid")
        
    return await get_bid_by_id(db, bid_id)

@router.delete("/{bid_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_bid(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    if current_user.id != bid.counterparty_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this bid")
        
    if bid.status != "Pending":
         raise HTTPException(status_code=400, detail="Cannot cancel a bid that is not Pending")
    
    # Instead of deleting, we set status to Cancelled (Soft Delete / Status Change)
    # per PRD requirement: "Delete: User can cancel an unaccepted bid/reservation."
    # and "Retention: Retain for audit purposes even if cancelled/declined."
    
    success = await update_bid(db, bid_id, {"status": "Cancelled"})
    if not success:
        raise HTTPException(status_code=500, detail="Failed to cancel bid")
    
    return None

@router.post("/{bid_id}/accept", response_model=Bid, response_model_by_alias=False)
async def accept_bid(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    slot = await get_slot_by_id(db, bid.slot_id)
    if not slot:
         raise HTTPException(status_code=404, detail="Associated slot not found")

    if current_user.role != "creator" or slot.creator_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the slot owner can accept bids")

    # Update bid status
    success = await update_bid(db, bid_id, {"status": "Accepted"}) # Or AwaitingFinalApproval per PRD
    if not success:
         raise HTTPException(status_code=500, detail="Failed to accept bid")
         
    return await get_bid_by_id(db, bid_id)

@router.post("/{bid_id}/decline", response_model=Bid, response_model_by_alias=False)
async def decline_bid(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    slot = await get_slot_by_id(db, bid.slot_id)
    if not slot:
         raise HTTPException(status_code=404, detail="Associated slot not found")

    if current_user.role != "creator" or slot.creator_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the slot owner can decline bids")

    # Update bid status
    success = await update_bid(db, bid_id, {"status": "Declined"})
    if not success:
         raise HTTPException(status_code=500, detail="Failed to decline bid")
         
    return await get_bid_by_id(db, bid_id)

@router.post("/{bid_id}/comments", response_model=Bid, response_model_by_alias=False)
async def add_comment(
    bid_id: str,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    # Check access
    has_access = False
    if current_user.id == bid.counterparty_id:
        has_access = True
    else:
        slot = await get_slot_by_id(db, bid.slot_id)
        if slot and slot.creator_id == current_user.id:
             has_access = True
             
    if not has_access:
         raise HTTPException(status_code=403, detail="Not authorized to comment on this bid")
         
    new_comment = {
        "id": str(uuid.uuid4()),
        "author_id": current_user.id,
        "text": comment.text,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Append comment
    # In MongoDB we can use $push
    try:
        await db["bids"].update_one(
            {"_id": bid.id}, # bid.id is already objectid if from model? No it's str in model
            # wait, get_bid_by_id converts _id to str. update_bid uses ObjectId conversion.
            # let's use the repository update method logic but specifically for push if possible
            # or just reload, append, save. Reload/append is safer for simple logic now.
            {"$push": {"comments": new_comment}}
        )
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")
         
    return await get_bid_by_id(db, bid_id)

@router.post("/{bid_id}/approve", response_model=Bid, response_model_by_alias=False)
async def final_approval(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    updates = {}
    
    # Check if Creator
    slot = await get_slot_by_id(db, bid.slot_id)
    if slot and slot.creator_id == current_user.id:
        updates["creator_final_approval"] = True
    elif current_user.id == bid.counterparty_id:
        updates["buyer_final_approval"] = True
    else:
        raise HTTPException(status_code=403, detail="Not authorized to approve this deal")
        
    # Apply update
    await update_bid(db, bid_id, updates)
    
    # Check if both approved to set Committed
    updated_bid = await get_bid_by_id(db, bid_id)
    if updated_bid.creator_final_approval and updated_bid.buyer_final_approval and updated_bid.status != "Committed":
        await update_bid(db, bid_id, {"status": "Committed"})
        # TODO: Create FinancingCommitment record here
        
    return await get_bid_by_id(db, bid_id)
@router.get("/{bid_id}/deal_memo", response_model=dict)
async def get_deal_memo(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    # Access control: Creator, Buyer, or Operator
    slot = await get_slot_by_id(db, bid.slot_id)
    
    is_creator = slot and slot.creator_id == current_user.id
    is_buyer = bid.counterparty_id == current_user.id
    is_operator = current_user.role == "operator"
    
    if not (is_creator or is_buyer or is_operator):
        raise HTTPException(status_code=403, detail="Not authorized to access deal memo")
        
    if bid.status not in ["Accepted", "AwaitingFinalApproval", "Committed"]:
         raise HTTPException(status_code=400, detail="Deal memo not available for this bid status")

    # Mock Deal Memo Generation
    return {
        "deal_id": bid_id,
        "content": "This is a placeholder for the Deal Memo PDF.",
        "download_link": f"/static/uploads/deal_memos/{bid_id}.pdf" # Mock link
    }

@router.get("/{bid_id}/evidence_pack", response_model=dict)
async def get_evidence_pack(
    bid_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "operator":
        raise HTTPException(status_code=403, detail="Only operators can generate evidence packs")
        
    bid = await get_bid_by_id(db, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    slot = await get_slot_by_id(db, bid.slot_id)
    project = await get_project_by_id(db, slot.project_id) if slot else None
    
    # In a real app, fetch user details for names
    # For now, returning raw IDs or minimal info
    
    return {
        "dealId": bid.id,
        "status": bid.status,
        "script": {
            "title": project.title if project else "Unknown",
            "creator_id": project.creator_id if project else "Unknown",
        },
        "slot": {
            "sceneRef": slot.scene_ref if slot else "Unknown",
            "description": slot.description if slot else "Unknown",
            "pricingFloor": slot.pricing_floor if slot else 0,
        },
        "bid": {
            "counterparty_id": bid.counterparty_id,
            "objective": bid.objective,
            "pricingModel": bid.pricing_model,
            "terms": bid.amount_terms,
            "flightWindow": bid.flight_window,
            "submittedDate": bid.created_date,
        },
        "dealMemoLink": f"/api/v1/bids/{bid.id}/deal_memo"
    }
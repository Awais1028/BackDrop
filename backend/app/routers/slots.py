from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_user
from ..models import Slot, SlotCreate, User
from ..repository import create_slot, get_slots_by_project, get_all_slots, get_project_by_id, update_slot, delete_slot, get_slot_by_id

router = APIRouter()

@router.get("/", response_model=List[Slot], response_model_by_alias=False)
async def read_slots(
    project_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if project_id:
        return await get_slots_by_project(db, project_id)
    
    # Discovery mode: Return all slots (filtering can be added later)
    # For S2/S4, we just need to list them.
    return await get_all_slots(db)

@router.get("/{slot_id}", response_model=Slot, response_model_by_alias=False)
async def read_slot(
    slot_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot

@router.post("/", response_model=Slot, response_model_by_alias=False)
async def create_new_slot(
    slot: SlotCreate,
    project_id: str = Query(..., description="The ID of the project to add this slot to"),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create slots")

    # Verify project ownership
    project = await get_project_by_id(db, project_id)
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
    if project.creator_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to add slots to this project")

    return await create_slot(db, slot, current_user.id, project_id)

@router.put("/{slot_id}", response_model=Slot, response_model_by_alias=False)
async def update_existing_slot(
    slot_id: str,
    slot_update: SlotCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    if current_user.role != "creator" or slot.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this slot")
    
    success = await update_slot(db, slot_id, slot_update.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update slot")
        
    return await get_slot_by_id(db, slot_id)

@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_slot(
    slot_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    if current_user.role != "creator" or slot.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this slot")
    
    success = await delete_slot(db, slot_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete slot")
    
    return None
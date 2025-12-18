from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict

from ..database import get_db
from ..auth import get_current_user
from ..models import User, Project
from ..repository import get_projects_by_creator, get_all_slots, get_bids_by_slot

router = APIRouter()

@router.get("/dashboard", response_model=Dict)
async def get_financing_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can access financing dashboard")

    # 1. Get all projects for this creator
    projects = await get_projects_by_creator(db, current_user.id)
    
    dashboard_data = {
        "projects": [],
        "total_budget_target": 0,
        "total_committed_amount": 0,
        "percentage_covered": 0
    }

    for project in projects:
        project_data = project.dict()
        project_data["committed_amount"] = 0
        
        # Add budget to total
        if project.budget_target:
            dashboard_data["total_budget_target"] += project.budget_target

        # 2. Get slots for each project
        slots = await get_all_slots(db, {"project_id": project.id})
        
        for slot in slots:
            # 3. Get committed bids for each slot
            # Optimization: could query all committed bids for these slots in one go
            bids = await get_bids_by_slot(db, slot.id)
            # Include Accepted and AwaitingFinalApproval as they are effectively commitments in progress
            committed_bids = [b for b in bids if b.status in ["Committed", "Accepted", "AwaitingFinalApproval"]]
            
            for bid in committed_bids:
                # Parse amount from terms (Naive implementation for MVP)
                # In a real app, amount should be a numeric field
                try:
                    # Extracting number from string like "$5000 (Fixed)"
                    import re
                    # Remove non-numeric except dot
                    amount_str = re.sub(r'[^\d.]', '', bid.amount_terms.split(' ')[0])
                    amount = float(amount_str) if amount_str else 0
                    project_data["committed_amount"] += amount
                    dashboard_data["total_committed_amount"] += amount
                except:
                    pass # Ignore parsing errors for now
        
        dashboard_data["projects"].append(project_data)

    if dashboard_data["total_budget_target"] > 0:
        dashboard_data["percentage_covered"] = (dashboard_data["total_committed_amount"] / dashboard_data["total_budget_target"]) * 100

    return dashboard_data

@router.get("/operator/overview", response_model=Dict)
async def get_operator_financing_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "operator":
        # For prototype, allowing 'operator' role. In database seed, ensure user has this role.
        # If user doesn't have it, they can't access.
        # Fallback for demo: if no explicit operator role, maybe allow if name is specific? No, strict RBAC is better.
        raise HTTPException(status_code=403, detail="Only operators can access this view")

    # 1. Total Committed Funds (Aggregated from all committed bids)
    # 2. Total Project Budgets (Aggregated from all projects)
    
    # Fetch all committed bids
    # We need a direct repository method for efficiency, but using raw find here for MVP speed
    # Including Accepted and AwaitingFinalApproval to reflect all agreed deals
    query = {"status": {"$in": ["Committed", "Accepted", "AwaitingFinalApproval"]}}
    
    committed_bids = []
    cursor = db["bids"].find(query)
    async for doc in cursor:
        committed_bids.append(doc)
        
    total_committed = 0
    for bid in committed_bids:
        try:
            import re
            amount_str = re.sub(r'[^\d.]', '', bid.get("amount_terms", "").split(' ')[0])
            total_committed += float(amount_str) if amount_str else 0
        except:
            pass

    # Fetch all projects for total budget
    total_budget = 0
    cursor = db["projects"].find({})
    async for doc in cursor:
        total_budget += doc.get("budget_target", 0)

    return {
        "total_committed": total_committed,
        "total_budgets": total_budget,
        "marketplace_margin": total_committed * 0.1 # 10% fee assumption
    }
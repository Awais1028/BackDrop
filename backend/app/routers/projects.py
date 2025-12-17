from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
import shutil
import os
import json
from pydantic import ValidationError

from ..database import get_db
from ..auth import get_current_user
from ..models import Project, ProjectCreate, User
from ..repository import create_project, get_projects_by_creator, get_project_by_id, update_project, delete_project, get_all_projects
from ..models import ProjectCreate

router = APIRouter()

@router.get("/", response_model=List[Project], response_model_by_alias=False)
async def read_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # For now, assuming this endpoint is primarily for creators to list their own scripts
    # or for others to see public ones (though search is usually separate).
    # Based on "MyScriptsPage", this should return the current user's projects.
    
    if current_user.role == "operator":
        return await get_all_projects(db)
    
    # Allow merchants and advertisers to see projects for discovery
    if current_user.role in ["merchant", "advertiser"]:
        return await get_all_projects(db)
        
    return await get_projects_by_creator(db, current_user.id)

@router.post("/", response_model=Project, response_model_by_alias=False)
async def create_new_project(
    file: UploadFile = File(...),
    metadata: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create projects")
    
    try:
        project_data = ProjectCreate.parse_raw(metadata)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Invalid metadata: {str(e)}")

    # Save file
    # Ensure directory exists just in case
    os.makedirs("static/uploads", exist_ok=True)
    
    # Generate a safe filename or use original (risky but okay for demo)
    # For better safety in production, we'd UUID this.
    file_path = f"static/uploads/{file.filename}"
    
    with open(file_path, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Create project in DB
    # Note: doc_link is stored as relative path or full URL. relative is fine for now.
    new_project = await create_project(db, project_data, current_user.id, doc_link=file_path)
    return new_project

@router.get("/{project_id}", response_model=Project, response_model_by_alias=False)
async def read_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    project = await get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Access control
    if current_user.role == "creator" and project.creator_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    # Operators can see everything
    if current_user.role == "operator":
        return project
    
    # Buyers/Merchants might need to see it if it has public slots,
    # but for "Script Management" (S2), creator access is key.
         
    return project

@router.put("/{project_id}", response_model=Project, response_model_by_alias=False)
async def update_existing_project(
    project_id: str,
    project_update: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    project = await get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role != "creator" or project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    success = await update_project(db, project_id, project_update.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update project")
        
    return await get_project_by_id(db, project_id)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    project = await get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role != "creator" or project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    success = await delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    
    return None
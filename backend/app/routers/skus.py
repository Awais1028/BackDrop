from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import os
import shutil
import uuid

from ..database import get_db
from ..auth import get_current_user
from ..models import SKU, SKUCreate, User
from ..repository import create_sku, get_skus_by_merchant, get_sku_by_id, update_sku, delete_sku

router = APIRouter()

@router.get("/", response_model=List[SKU], response_model_by_alias=False)
async def read_skus(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "merchant":
        # In a real app, maybe admins/operators can see them too, but for now strict check
        raise HTTPException(status_code=403, detail="Only merchants can view their SKUs")
        
    return await get_skus_by_merchant(db, current_user.id)

@router.post("/upload-image")
async def upload_sku_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can upload SKU images")
    
    # Create upload directory if it doesn't exist
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the URL relative to the server root (assuming static files are served from /static)
        # In production this might be an S3 URL
        return {"url": f"http://localhost:8000/static/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

@router.post("/", response_model=SKU, response_model_by_alias=False)
async def create_new_sku(
    sku: SKUCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "merchant":
        raise HTTPException(status_code=403, detail="Only merchants can create SKUs")
        
    return await create_sku(db, sku, current_user.id)

@router.put("/{sku_id}", response_model=SKU, response_model_by_alias=False)
async def update_existing_sku(
    sku_id: str,
    sku_update: SKUCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    sku = await get_sku_by_id(db, sku_id)
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
        
    if current_user.role != "merchant" or sku.merchant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this SKU")
    
    success = await update_sku(db, sku_id, sku_update.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update SKU")
        
    return await get_sku_by_id(db, sku_id)

@router.delete("/{sku_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_sku(
    sku_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    sku = await get_sku_by_id(db, sku_id)
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
        
    if current_user.role != "merchant" or sku.merchant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this SKU")
    
    success = await delete_sku(db, sku_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete SKU")
    
    return None
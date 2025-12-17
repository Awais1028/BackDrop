from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from pydantic import BaseModel, EmailStr

from .database import get_db
from .models import User, UserCreate, Token, TokenData, UserUpdate
from .repository import create_user, get_user_by_email, verify_password, get_user_by_id, update_user, get_all_users
from typing import List

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_secure_random_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours for easier dev

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=User)
async def signup(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    db_user = await get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(db, user)

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Include role in the token claims for frontend convenience if needed
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    # Ensure _id is a string when returning
    if user.id is None and hasattr(user, '_id'):
         user.id = str(user._id)
    return user

@router.get("/users", response_model=List[User])
async def read_users(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.role != "operator":
        raise HTTPException(status_code=403, detail="Not authorized to view users")
    return await get_all_users(db)

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Prepare update data
    update_data = user_update.dict(exclude_unset=True)
    
    # Flatten merchant profile fields if necessary or store them in merchant_profile dict
    # The User model has merchant_profile: Optional[dict]
    # But UserUpdate has specific fields for validation.
    # Let's construct the merchant_profile dict if fields are present.
    
    if current_user.role == "merchant":
        merchant_profile = current_user.merchant_profile or {}
        if user_update.min_integration_fee is not None:
            merchant_profile["min_integration_fee"] = user_update.min_integration_fee
        if user_update.eligibility_rules is not None:
            merchant_profile["eligibility_rules"] = user_update.eligibility_rules
        if user_update.suitability_rules is not None:
            merchant_profile["suitability_rules"] = user_update.suitability_rules
            
        if merchant_profile:
            update_data["merchant_profile"] = merchant_profile
            
    # Remove flattened fields from top level update if they are meant for profile
    update_data.pop("min_integration_fee", None)
    update_data.pop("eligibility_rules", None)
    update_data.pop("suitability_rules", None)

    if not update_data:
        return current_user

    success = await update_user(db, current_user.id, update_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update user profile")
        
    return await get_user_by_id(db, current_user.id)

@router.get("/users/{user_id}", response_model=User)
async def read_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
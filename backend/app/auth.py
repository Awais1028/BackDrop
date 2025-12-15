from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from pydantic import BaseModel, EmailStr

from .database import get_db
from .models import User, UserCreate, Token
from .repository import create_user, get_user_by_email, verify_password

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_secure_random_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours for easier dev

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
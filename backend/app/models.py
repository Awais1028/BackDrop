from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    CREATOR = "creator"
    ADVERTISER = "advertiser"
    MERCHANT = "merchant"
    OPERATOR = "operator"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    merchant_profile: Optional[dict] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
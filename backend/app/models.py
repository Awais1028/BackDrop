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
    id: Optional[str] = Field(None, alias="_id")

class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")

class UserUpdate(BaseModel):
    name: Optional[str] = None
    merchant_profile: Optional[dict] = None
    # Allow updating these directly if we decide to flatten, but for now we'll stick to merchant_profile dict
    # or add specific fields if we want strict typing
    min_integration_fee: Optional[float] = None
    eligibility_rules: Optional[str] = None
    suitability_rules: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Project Models

class Demographics(BaseModel):
    ageStart: int
    ageEnd: int
    gender: str

class ProjectBase(BaseModel):
    title: str
    budget_target: float
    production_window: str
    demographics: Demographics

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: Optional[str] = Field(None, alias="_id")
    creator_id: str
    doc_link: Optional[str] = None
    created_date: Optional[str] = None
    last_modified_date: Optional[str] = None

# Slot Models

class SlotModality(str, Enum):
    PRIVATE_AUCTION = "Private Auction"
    PG_RESERVATION = "PG/Reservation"

class SlotStatus(str, Enum):
    AVAILABLE = "Available"
    LOCKED = "Locked"
    COMPLETED = "Completed"

class SlotVisibility(str, Enum):
    PUBLIC = "Public"
    PRIVATE = "Private"

class SlotBase(BaseModel):
    scene_ref: str
    description: Optional[str] = None
    constraints: Optional[str] = None
    pricing_floor: float
    modality: SlotModality
    status: SlotStatus = SlotStatus.AVAILABLE
    visibility: SlotVisibility = SlotVisibility.PUBLIC

class SlotCreate(SlotBase):
    pass

class Slot(SlotBase):
    id: Optional[str] = Field(None, alias="_id")
    project_id: str
    creator_id: str
    created_date: Optional[str] = None
    last_modified_date: Optional[str] = None

# SKU Models

class SKUBase(BaseModel):
    title: str
    price: float
    margin: float
    tags: List[str] = []
    imageUrl: Optional[str] = None

class SKUCreate(SKUBase):
    pass

class SKU(SKUBase):
    id: Optional[str] = Field(None, alias="_id")
    merchant_id: str
    created_date: Optional[str] = None
    last_modified_date: Optional[str] = None

# Bid/Reservation Models

class BidObjective(str, Enum):
    REACH = "Reach"
    CONVERSIONS = "Conversions"

class PricingModel(str, Enum):
    FIXED = "Fixed"
    REV_SHARE = "Rev-Share"
    HYBRID = "Hybrid"

class BidStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    AWAITING_FINAL_APPROVAL = "AwaitingFinalApproval"
    DECLINED = "Declined"
    COMMITTED = "Committed"
    CANCELLED = "Cancelled"

class BidBase(BaseModel):
    slot_id: str
    objective: BidObjective
    pricing_model: PricingModel
    amount_terms: str
    flight_window: str

class BidCreate(BidBase):
    pass

class Comment(BaseModel):
    id: str
    author_id: str
    text: str
    timestamp: str

class Bid(BidBase):
    id: Optional[str] = Field(None, alias="_id")
    counterparty_id: str
    status: BidStatus = BidStatus.PENDING
    created_date: Optional[str] = None
    last_modified_date: Optional[str] = None
    comments: List[Comment] = []
    creator_final_approval: bool = False
    buyer_final_approval: bool = False
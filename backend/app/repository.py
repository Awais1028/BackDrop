from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import UserCreate, UserInDB, User, Project, ProjectCreate, Slot, SlotCreate, SKU, SKUCreate, Bid, BidCreate
from passlib.context import CryptContext
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str):
    user_doc = await db["users"].find_one({"email": email})
    if user_doc:
        # Convert _id to string manually to avoid Pydantic validation error with ObjectId
        user_doc["_id"] = str(user_doc["_id"])
        return UserInDB(**user_doc)
    return None

async def get_all_users(db: AsyncIOMotorDatabase) -> List[User]:
    users = []
    cursor = db["users"].find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        users.append(User(**doc))
    return users

async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[User]:
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user_doc:
            user_doc["_id"] = str(user_doc["_id"])
            return User(**user_doc)
    except:
        return None
    return None

async def update_user(db: AsyncIOMotorDatabase, user_id: str, user_data: dict) -> bool:
    try:
        # Convert _id to ObjectId if it's not already
        if "_id" in user_data:
            del user_data["_id"]
            
        result = await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user_data}
        )
        return result.modified_count > 0
    except:
        return False

async def create_user(db: AsyncIOMotorDatabase, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    # Create UserInDB instance to ensure correct structure
    user_in_db = UserInDB(
        **user.dict(exclude={"password"}),
        hashed_password=hashed_password
    )
    
    user_dict = user_in_db.dict()
    
    result = await db["users"].insert_one(user_dict)
    
    # Return User model (without hashed password)
    return User(
        **user.dict(exclude={"password"}),
        _id=str(result.inserted_id)
    )

async def create_project(db: AsyncIOMotorDatabase, project: ProjectCreate, creator_id: str, doc_link: Optional[str] = None):
    project_dict = project.dict()
    project_dict["creator_id"] = creator_id
    project_dict["created_date"] = datetime.utcnow().isoformat()
    project_dict["last_modified_date"] = datetime.utcnow().isoformat()
    
    if doc_link:
        project_dict["doc_link"] = doc_link
    
    result = await db["projects"].insert_one(project_dict)
    
    project_dict["_id"] = str(result.inserted_id)
    return Project(**project_dict)

async def get_projects_by_creator(db: AsyncIOMotorDatabase, creator_id: str) -> List[Project]:
    projects = []
    cursor = db["projects"].find({"creator_id": creator_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        projects.append(Project(**doc))
    return projects

async def get_all_projects(db: AsyncIOMotorDatabase) -> List[Project]:
    projects = []
    cursor = db["projects"].find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        projects.append(Project(**doc))
    return projects

async def get_project_by_id(db: AsyncIOMotorDatabase, project_id: str) -> Optional[Project]:
    try:
        doc = await db["projects"].find_one({"_id": ObjectId(project_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return Project(**doc)
    except:
        return None
    return None

async def update_project(db: AsyncIOMotorDatabase, project_id: str, project_data: dict) -> bool:
    try:
        project_data["last_modified_date"] = datetime.utcnow().isoformat()
        result = await db["projects"].update_one(
            {"_id": ObjectId(project_id)},
            {"$set": project_data}
        )
        return result.modified_count > 0
    except:
        return False

async def delete_project(db: AsyncIOMotorDatabase, project_id: str) -> bool:
    try:
        result = await db["projects"].delete_one({"_id": ObjectId(project_id)})
        # Also delete associated slots
        await db["slots"].delete_many({"project_id": project_id})
        return result.deleted_count > 0
    except:
        return False

async def create_slot(db: AsyncIOMotorDatabase, slot: SlotCreate, creator_id: str, project_id: str):
    slot_dict = slot.dict()
    slot_dict["creator_id"] = creator_id
    slot_dict["project_id"] = project_id
    slot_dict["created_date"] = datetime.utcnow().isoformat()
    slot_dict["last_modified_date"] = datetime.utcnow().isoformat()
    
    result = await db["slots"].insert_one(slot_dict)
    
    slot_dict["_id"] = str(result.inserted_id)
    return Slot(**slot_dict)

async def get_slots_by_project(db: AsyncIOMotorDatabase, project_id: str) -> List[Slot]:
    slots = []
    cursor = db["slots"].find({"project_id": project_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        slots.append(Slot(**doc))
    return slots

async def get_all_slots(db: AsyncIOMotorDatabase, filters: dict = {}) -> List[Slot]:
    slots = []
    cursor = db["slots"].find(filters)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        slots.append(Slot(**doc))
    return slots

async def get_slot_by_id(db: AsyncIOMotorDatabase, slot_id: str) -> Optional[Slot]:
    try:
        doc = await db["slots"].find_one({"_id": ObjectId(slot_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return Slot(**doc)
    except:
        return None
    return None

async def update_slot(db: AsyncIOMotorDatabase, slot_id: str, slot_data: dict) -> bool:
    try:
        slot_data["last_modified_date"] = datetime.utcnow().isoformat()
        result = await db["slots"].update_one(
            {"_id": ObjectId(slot_id)},
            {"$set": slot_data}
        )
        return result.modified_count > 0
    except:
        return False

async def delete_slot(db: AsyncIOMotorDatabase, slot_id: str) -> bool:
    try:
        result = await db["slots"].delete_one({"_id": ObjectId(slot_id)})
        return result.deleted_count > 0
    except:
        return False

async def create_sku(db: AsyncIOMotorDatabase, sku: SKUCreate, merchant_id: str):
    sku_dict = sku.dict()
    sku_dict["merchant_id"] = merchant_id
    sku_dict["created_date"] = datetime.utcnow().isoformat()
    sku_dict["last_modified_date"] = datetime.utcnow().isoformat()
    
    result = await db["skus"].insert_one(sku_dict)
    
    sku_dict["_id"] = str(result.inserted_id)
    return SKU(**sku_dict)

async def get_skus_by_merchant(db: AsyncIOMotorDatabase, merchant_id: str) -> List[SKU]:
    skus = []
    cursor = db["skus"].find({"merchant_id": merchant_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        skus.append(SKU(**doc))
    return skus

async def get_sku_by_id(db: AsyncIOMotorDatabase, sku_id: str) -> Optional[SKU]:
    try:
        doc = await db["skus"].find_one({"_id": ObjectId(sku_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return SKU(**doc)
    except:
        return None
    return None

async def update_sku(db: AsyncIOMotorDatabase, sku_id: str, sku_data: dict) -> bool:
    try:
        sku_data["last_modified_date"] = datetime.utcnow().isoformat()
        result = await db["skus"].update_one(
            {"_id": ObjectId(sku_id)},
            {"$set": sku_data}
        )
        return result.modified_count > 0
    except:
        return False

async def create_bid(db: AsyncIOMotorDatabase, bid: BidCreate, counterparty_id: str):
    bid_dict = bid.dict()
    bid_dict["counterparty_id"] = counterparty_id
    bid_dict["created_date"] = datetime.utcnow().isoformat()
    bid_dict["last_modified_date"] = datetime.utcnow().isoformat()
    
    result = await db["bids"].insert_one(bid_dict)
    
    bid_dict["_id"] = str(result.inserted_id)
    return Bid(**bid_dict)

async def get_all_bids(db: AsyncIOMotorDatabase) -> List[Bid]:
    bids = []
    cursor = db["bids"].find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        bids.append(Bid(**doc))
    return bids

async def get_bids_by_counterparty(db: AsyncIOMotorDatabase, counterparty_id: str) -> List[Bid]:
    bids = []
    cursor = db["bids"].find({"counterparty_id": counterparty_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        bids.append(Bid(**doc))
    return bids

async def get_bids_by_slot(db: AsyncIOMotorDatabase, slot_id: str) -> List[Bid]:
    bids = []
    cursor = db["bids"].find({"slot_id": slot_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        bids.append(Bid(**doc))
    return bids

async def get_bid_by_id(db: AsyncIOMotorDatabase, bid_id: str) -> Optional[Bid]:
    try:
        doc = await db["bids"].find_one({"_id": ObjectId(bid_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return Bid(**doc)
    except:
        return None
    return None

async def update_bid(db: AsyncIOMotorDatabase, bid_id: str, bid_data: dict) -> bool:
    try:
        bid_data["last_modified_date"] = datetime.utcnow().isoformat()
        result = await db["bids"].update_one(
            {"_id": ObjectId(bid_id)},
            {"$set": bid_data}
        )
        return result.modified_count > 0
    except:
        return False

async def delete_bid(db: AsyncIOMotorDatabase, bid_id: str) -> bool:
    try:
        result = await db["bids"].delete_one({"_id": ObjectId(bid_id)})
        return result.deleted_count > 0
    except:
        return False

async def delete_sku(db: AsyncIOMotorDatabase, sku_id: str) -> bool:
    try:
        result = await db["skus"].delete_one({"_id": ObjectId(sku_id)})
        return result.deleted_count > 0
    except:
        return False
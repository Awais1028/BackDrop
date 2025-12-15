from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import UserCreate, UserInDB, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str):
    user_doc = await db["users"].find_one({"email": email})
    if user_doc:
        return UserInDB(**user_doc)
    return None

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
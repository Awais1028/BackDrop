import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("MONGODB_URI not found in .env")
    exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def create_operator():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_database("backdrop_db")
    
    email = "awais@operator.com"
    password = "Admin123"
    role = "operator"
    
    existing_user = await db["users"].find_one({"email": email})
    if existing_user:
        print(f"User {email} already exists.")
        return

    hashed_password = get_password_hash(password)
    
    user_doc = {
        "email": email,
        "name": "Operator Awais",
        "role": role,
        "hashed_password": hashed_password,
        "merchant_profile": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db["users"].insert_one(user_doc)
    print(f"Operator user created with ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(create_operator())
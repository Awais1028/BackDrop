import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("MONGODB_URI not found in .env")
    exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def reset_password():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_database("backdrop_db")
    
    email = "awais@operator.com"
    password = "Admin123"
    
    hashed_password = get_password_hash(password)
    
    result = await db["users"].update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    if result.modified_count > 0:
        print(f"Password updated for {email}")
    else:
        print(f"User {email} not found or password already set (or match).")

if __name__ == "__main__":
    asyncio.run(reset_password())
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("MONGODB_URI not found in .env")
    exit(1)

async def list_users():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_database("backdrop_db")
    
    users = await db["users"].find().to_list(100)
    for user in users:
        print(f"Email: '{user.get('email')}', Role: '{user.get('role')}', ID: {user.get('_id')}")

if __name__ == "__main__":
    asyncio.run(list_users())
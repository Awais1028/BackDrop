import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in the environment variables")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.get_default_database()

async def get_db():
    return db
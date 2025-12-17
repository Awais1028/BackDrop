import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv("backend/.env")

MONGODB_URI = os.getenv("MONGODB_URI")

async def verify_connection():
    print(f"Connecting to MongoDB...")
    if not MONGODB_URI:
        print("Error: MONGODB_URI is not set.")
        return

    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        # Check connection
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        db = client.get_database("backdrop_db")
        collection = db["connection_test"]
        
        # Test Insert
        print("Testing Insert...")
        result = await collection.insert_one({"test": "data", "status": "active"})
        print(f"Inserted document with ID: {result.inserted_id}")
        
        # Test Find
        print("Testing Find...")
        doc = await collection.find_one({"_id": result.inserted_id})
        print(f"Found document: {doc}")
        
        # Test Delete
        print("Testing Delete...")
        delete_result = await collection.delete_one({"_id": result.inserted_id})
        print(f"Deleted count: {delete_result.deleted_count}")
        
        print("Database verification complete: SUCCESS")

    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_connection())
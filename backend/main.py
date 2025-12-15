from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import db
from app.auth import router as auth_router
import os

app = FastAPI()

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

# Mount static files
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def healthz():
    try:
        # Check database connection
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        
    return {"status": "ok", "database": db_status}
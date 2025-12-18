from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import db
from app.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.slots import router as slots_router
from app.routers.skus import router as skus_router
from app.routers.bids import router as bids_router
from app.routers.finance import router as finance_router
import os

app = FastAPI()

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(slots_router, prefix="/api/v1/slots", tags=["slots"])
app.include_router(skus_router, prefix="/api/v1/skus", tags=["skus"])
app.include_router(bids_router, prefix="/api/v1/bids", tags=["bids"])
app.include_router(finance_router, prefix="/api/v1/finance", tags=["finance"])

# Mount static files
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5137",
    "http://127.0.0.1:5137",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
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
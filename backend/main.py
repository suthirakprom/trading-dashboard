from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routers import journal

app = FastAPI(
    title="Trading Dashboard API",
    description="Backend API for Trading Dashboard with Supabase integration",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(journal.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Trading Dashboard API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "trading-dashboard-api",
        "supabase_configured": bool(os.getenv("SUPABASE_URL"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

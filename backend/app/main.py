from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import studio, shopper, tryon, wardrobe
from app.services.supabase_service import supabase
from app.config import settings

app = FastAPI(title="Virtual Fashion Platform API")

origins = [url.strip() for url in settings.frontend_url.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(studio.router, prefix="/api/studio", tags=["1. 3D Studio"])
app.include_router(shopper.router, prefix="/api/shopper", tags=["2. AI Shopper"])
app.include_router(tryon.router, prefix="/api/tryon", tags=["3. AR Try-On"])
app.include_router(wardrobe.router, prefix="/api/wardrobe", tags=["4. Digital Wardrobe"])

@app.get("/")
def root():
    return {"message": "Virtual Fashion API is running. Visit /docs to test endpoints."}

@app.get("/health")
def health():
    try:
        # Lightweight query to confirm Supabase is reachable
        supabase.table("catalog_items").select("id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
import json
import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.services.groq_service import ask_groq_json
from app.services.supabase_service import supabase, upload_asset

router = APIRouter()

class DailyOutfitRequest(BaseModel):
    occasion: str = "casual day out"
    latitude: float = 12.9716   # Default: Bengaluru
    longitude: float = 77.5946

WARDROBE_SYSTEM = """You are a personal wardrobe stylist. Given the user's closet items, current local weather, and occasion, suggest up to 3 outfit combinations using ONLY items from their closet.
Return ONLY valid JSON with key:
- outfits (array of objects, each with: title, item_ids (array of UUIDs), reason (string))"""

@router.get("/items")
def list_wardrobe():
    return supabase.table("wardrobe_items").select("*").order("created_at", desc=True).execute().data

@router.post("/items")
async def add_wardrobe_item(
    name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    fabric: str = Form(...),
    season: str = Form("all"),
    file: UploadFile = File(...),
):
    content = await file.read()
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    image_url = upload_asset(content, "wardrobe", ext, file.content_type or "image/png")

    res = supabase.table("wardrobe_items").insert({
        "name": name,
        "category": category,
        "color": color,
        "fabric": fabric,
        "season": season,
        "image_url": image_url,
    }).execute()
    return res.data[0]

@router.post("/daily-outfit")
async def daily_outfit(req: DailyOutfitRequest):
    closet = supabase.table("wardrobe_items").select("*").execute().data
    if not closet:
        raise HTTPException(status_code=400, detail="Upload at least 2 wardrobe items first")

    # Fetch live current weather from Open-Meteo (free, no API key)
    weather_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={req.latitude}&longitude={req.longitude}"
        f"&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        weather = (await client.get(weather_url)).json().get("current", {})

    plan = ask_groq_json(
        WARDROBE_SYSTEM,
        f"Occasion: {req.occasion}\nCurrent Weather: {json.dumps(weather)}\nCloset: {json.dumps(closet)}",
    )
    return {"weather": weather, "plan": plan}
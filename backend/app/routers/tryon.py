from fastapi import APIRouter
from pydantic import BaseModel
from app.services.groq_service import ask_groq_json
from app.services.supabase_service import supabase

router = APIRouter()

class FitAdviceRequest(BaseModel):
    garment_name: str
    user_question: str

FIT_SYSTEM = """You are an AI fashion fit advisor for a live AR try-on mirror.
Return ONLY valid JSON with keys:
- fit_verdict (string: short direct answer)
- styling_tips (array of 2 short actionable strings)"""

@router.get("/assets")
def list_tryon_assets():
    return supabase.table("tryon_assets").select("*").execute().data

@router.post("/fit-advice")
def get_fit_advice(req: FitAdviceRequest):
    return ask_groq_json(
        FIT_SYSTEM,
        f"Garment being tried on: {req.garment_name}. User asks: {req.user_question}",
    )
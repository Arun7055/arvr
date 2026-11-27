from fastapi import APIRouter
from pydantic import BaseModel
from app.services.groq_service import ask_groq_json
from app.services.supabase_service import supabase

router = APIRouter()

class CustomizeRequest(BaseModel):
    base_garment: str = "hoodie"
    user_prompt: str

STUDIO_SYSTEM = """You are a 3D PBR material designer for digital fashion.
Return ONLY valid JSON with these exact keys:
- color_hex (string, e.g. "#8A9A5B")
- roughness (float 0.0 to 1.0: 0.9 for matte cotton/linen, 0.3 for silk/leather)
- metalness (float 0.0 to 1.0: usually 0.0 to 0.15 for fabrics)
- fabric_preset (string: one of "cotton", "linen", "denim", "silk", "leather", "fleece")
- decal_text (string or null: short graphic text if requested by user)
- styling_note (string: 1 short sentence describing the finish)"""

@router.post("/customize")
def customize_garment(req: CustomizeRequest):
    pbr_config = ask_groq_json(
        STUDIO_SYSTEM,
        f"Base garment: {req.base_garment}. User request: {req.user_prompt}",
    )
    res = supabase.table("custom_designs").insert({
        "base_garment": req.base_garment,
        "user_prompt": req.user_prompt,
        "pbr_config": pbr_config,
    }).execute()
    return res.data[0]

@router.get("/designs")
def list_designs():
    return supabase.table("custom_designs").select("*").order("created_at", desc=True).limit(20).execute().data
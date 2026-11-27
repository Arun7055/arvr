import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.groq_service import ask_groq_json
from app.services.supabase_service import supabase

router = APIRouter()

class RecommendRequest(BaseModel):
    user_prompt: str
    budget_inr: int = 5000

SHOPPER_SYSTEM = """You are a smart shopping agent. Given a user's style request, budget (INR), and a JSON product catalog, pick a cohesive outfit (top/outerwear + bottom + footwear) whose combined price stays within budget.
Return ONLY valid JSON with these exact keys:
- selected_item_ids (array of UUID strings from the catalog)
- ai_reasoning (string: concise explanation of why these pieces work together)"""

@router.get("/catalog")
def get_catalog():
    return supabase.table("catalog_items").select("*").execute().data

@router.post("/recommend")
def recommend_outfit(req: RecommendRequest):
    catalog = supabase.table("catalog_items").select("*").execute().data
    if not catalog:
        raise HTTPException(status_code=400, detail="Catalog is empty")

    ai_res = ask_groq_json(
        SHOPPER_SYSTEM,
        f"Request: {req.user_prompt}\nMax Budget: ₹{req.budget_inr}\nCatalog: {json.dumps(catalog)}",
        smart=True,
    )

    selected_ids = ai_res.get("selected_item_ids", [])
    items = [item for item in catalog if item["id"] in selected_ids]
    total_price = sum(item["price_inr"] for item in items)

    saved = supabase.table("outfit_boards").insert({
        "user_prompt": req.user_prompt,
        "budget_inr": req.budget_inr,
        "selected_item_ids": [i["id"] for i in items],
        "ai_reasoning": ai_res.get("ai_reasoning", ""),
        "total_price_inr": total_price,
    }).execute().data[0]

    return {**saved, "items": items}
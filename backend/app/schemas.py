from pydantic import BaseModel
from typing import Optional

class GarmentSpec(BaseModel):
    garment_type: str
    fit: str
    fabric: str
    color_hex: str
    pattern: str
    action: str  # "texture_swap" | "full_regenerate"
    positive_prompt: str
    negative_prompt: str

class GenerateRequest(BaseModel):
    session_id: str
    user_prompt: str
    fabric_id: Optional[str] = None
    parent_id: Optional[str] = None
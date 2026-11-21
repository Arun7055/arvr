import json
from openai import OpenAI
from app.config import settings
from app.schemas import GarmentSpec

client = OpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are a virtual fashion design compiler.
Convert the user's clothing request into a strict JSON object with these exact keys:
- garment_type (string, e.g., "overshirt", "hoodie")
- fit (string, e.g., "relaxed", "tailored")
- fabric (string, e.g., "heavyweight linen", "raw selvedge denim")
- color_hex (string, e.g., "#556B2F")
- pattern (string, e.g., "solid", "plaid", "herringbone")
- action (string: "texture_swap" if only color/fabric changed, else "full_regenerate")
- positive_prompt (string: detailed flat-lay / UV-friendly diffusion prompt describing weave, texture, seams, studio lighting)
- negative_prompt (string: artifacts to avoid like warped seams, blurry weave, mannequin, watermark)
Return ONLY valid JSON."""

def compile_design_prompt(user_prompt: str, fabric_props: dict | None = None) -> GarmentSpec:
    context = f"User request: {user_prompt}"
    if fabric_props:
        context += f"\nReference digital fabric twin properties: {json.dumps(fabric_props)}"

    resp = client.chat.completions.create(
        model=settings.groq_fast_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        temperature=0.3,
    )
    data = json.loads(resp.choices[0].message.content)
    return GarmentSpec(**data)
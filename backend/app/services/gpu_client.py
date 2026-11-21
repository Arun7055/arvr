import base64
import httpx
from app.config import settings

async def call_colab_generate(prompt: str, negative_prompt: str, fabric_b64: str = "", control_b64: str = "") -> bytes | None:
    if not settings.gpu_worker_url:
        return None  # Mock mode when Colab is offline

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{settings.gpu_worker_url.rstrip('/')}/generate-garment",
            json={
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "fabric_image_b64": fabric_b64,
                "control_image_b64": control_b64,
            },
        )
        resp.raise_for_status()
        return base64.b64decode(resp.json()["image_b64"])
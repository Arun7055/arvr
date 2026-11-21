from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import GenerateRequest
from app.services.groq_service import compile_design_prompt
from app.services.supabase_service import supabase, upload_asset, save_generation, get_fabric
from app.services.gpu_client import call_colab_generate

app = FastAPI(title="Virtual Fashion Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/sessions")
def create_session(avatar_id: str | None = None):
    res = supabase.table("design_sessions").insert({"avatar_id": avatar_id}).execute()
    return res.data[0]

@app.post("/api/fabrics/upload")
async def upload_fabric(name: str, file: UploadFile = File(...)):
    content = await file.read()
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    url = upload_asset(content, "swatches", ext, file.content_type or "image/png")
    res = supabase.table("fabrics").insert({"name": name, "swatch_url": url}).execute()
    return res.data[0]

@app.post("/api/generate")
async def generate_design(req: GenerateRequest):
    fabric_props = None
    if req.fabric_id:
        fabric = get_fabric(req.fabric_id)
        if not fabric:
            raise HTTPException(status_code=404, detail="Fabric not found")
        fabric_props = fabric.get("vlm_properties")

    # 1. Compile prompt via Groq
    spec = compile_design_prompt(req.user_prompt, fabric_props)

    # 2. Call Colab GPU worker (or skip in mock mode)
    img_bytes = await call_colab_generate(spec.positive_prompt, spec.negative_prompt)
    texture_url = (
        upload_asset(img_bytes, "textures", "png", "image/png")
        if img_bytes
        else "https://placehold.co/1024x1024/png?text=Mock+UV+Texture"
    )

    # 3. Persist to Supabase
    record = save_generation({
        "session_id": req.session_id,
        "parent_id": req.parent_id,
        "user_prompt": req.user_prompt,
        "groq_spec": spec.model_dump(),
        "diffusion_prompt": spec.positive_prompt,
        "texture_url": texture_url,
    })
    return record
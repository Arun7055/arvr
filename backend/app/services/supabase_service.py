import uuid
from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

def upload_asset(file_bytes: bytes, folder: str, ext: str, content_type: str) -> str:
    path = f"{folder}/{uuid.uuid4()}.{ext}"
    supabase.storage.from_(settings.supabase_bucket).upload(
        file=file_bytes,
        path=path,
        file_options={"content-type": content_type, "upsert": "false"},
    )
    return supabase.storage.from_(settings.supabase_bucket).get_public_url(path)
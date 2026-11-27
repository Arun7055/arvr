import json
from openai import OpenAI
from app.config import settings

client = OpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

def ask_groq_json(system_prompt: str, user_prompt: str, smart: bool = False) -> dict:
    model = settings.groq_smart_model if smart else settings.groq_fast_model
    resp = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )
    return json.loads(resp.choices[0].message.content)
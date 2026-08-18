import json

import httpx

from app.ai.schemas import AINextQuestion
from app.core.config import settings


class HuggingFaceProvider:

    def __init__(self) -> None:
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.model = settings.HUGGINGFACE_MODEL

    def generate_next_question(
        self,
        prompt: str,
    ) -> AINextQuestion:

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        }

        response = httpx.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60.0,
        )

        response.raise_for_status()

        result = response.json()

        content = result["choices"][0]["message"]["content"]

        try:
            parsed_content = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "Hugging Face returned invalid JSON."
            ) from exc

        return AINextQuestion.model_validate(
            parsed_content
        )
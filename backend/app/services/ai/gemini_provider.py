import os
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.services.ai.base import StoryAnalysisProvider

class GeminiStoryProvider(StoryAnalysisProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or settings.GEMINI_API_KEY).strip()
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-flash-latest"

    async def analyze_page(self, page_number: int, source_text: str, scene_description: str) -> Dict[str, Any]:
        """
        Use Gemini to produce structured scene breakdown and emotional tone.
        Falls back to deterministic rule-based analysis if API key is not configured.
        """
        if not self.api_key:
            return {
                "page_number": page_number,
                "emotional_tone": "Warm and whimsical",
                "character_focus": "Child and unicorn interaction",
                "structured_scene": scene_description,
                "recommended_prompt_tags": "children's storybook illustration, soft lighting, vibrant pastel colors",
                "provider_used": "rule_based_fallback"
            }

        prompt = f"""
        You are an expert children's picture book editor.
        Analyze this page from 'The Girl and the Magical Unicorn':
        Page Number: {page_number}
        Story Text: "{source_text}"
        Scene Description: "{scene_description}"

        Return JSON with:
        - emotional_tone: string
        - character_focus: string
        - camera_framing: string (e.g. close-up, wide-shot, medium-shot)
        - lighting: string
        - recommended_prompt_tags: string
        """

        try:
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                    import json
                    parsed = json.loads(text_response)
                    parsed["provider_used"] = "gemini-1.5-flash"
                    return parsed
        except Exception as e:
            print(f"Gemini API call failed: {e}")

        return {
            "page_number": page_number,
            "emotional_tone": "Gentle fairytale wonder",
            "character_focus": "Young child protagonist",
            "structured_scene": scene_description,
            "recommended_prompt_tags": "storybook illustration, rich colors, soft focus",
            "provider_used": "rule_based_fallback"
        }

    async def expand_prompt(self, base_prompt: str, child_name: str, child_features: Optional[str] = None) -> str:
        """
        Inject personalization guidance into the prompt.
        """
        features_desc = child_features or "a cheerful young child with expressive eyes and a radiant smile"
        clean_base = (base_prompt or "")
        for tag in ["[Name]", "{name}", "[child_name]", "{child_name}"]:
            clean_base = clean_base.replace(tag, child_name)
        prompt = (
            f"Children's storybook illustration of {child_name}, {features_desc}, {clean_base}. "
            f"Soft editorial children's book art style, rich atmospheric depth, cinematic lighting, masterpiece, clean 3D digital storybook painting."
        )
        return prompt

gemini_provider = GeminiStoryProvider()

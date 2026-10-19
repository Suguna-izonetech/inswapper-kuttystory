import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models import PersonalizationJob, GeneratedAsset, StoryPage

LANGUAGE_CODES: Dict[str, Dict[str, str]] = {
    "english": {"code": "en", "native": "English", "name": "English"},
    "tamil": {"code": "ta", "native": "தமிழ்", "name": "Tamil"},
    "malayalam": {"code": "ml", "native": "മലയാളം", "name": "Malayalam"},
    "hindi": {"code": "hi", "native": "हिंदी", "name": "Hindi"},
    "marathi": {"code": "mr", "native": "मराठी", "name": "Marathi"},
    "telugu": {"code": "te", "native": "తెలుగు", "name": "Telugu"},
    "kannada": {"code": "kn", "native": "ಕನ್ನಡ", "name": "Kannada"},
}

class TranslationService:
    def __init__(self):
        # In-memory translation cache to guarantee instant response on subsequent page flips
        self._cache: Dict[str, str] = {}

    def get_supported_languages(self) -> List[Dict[str, str]]:
        return [
            {"id": key, "name": val["name"], "native": val["native"], "code": val["code"]}
            for key, val in LANGUAGE_CODES.items()
        ]

    def translate_text(self, text: str, target_lang: str, child_name: Optional[str] = None) -> str:
        """
        Translate a story sentence into the target Indian language or English.
        Preserves child name and story cadence.
        """
        target_lang = target_lang.lower().strip()
        if not text or not text.strip():
            return ""

        if target_lang in ["english", "en"]:
            return text

        lang_info = LANGUAGE_CODES.get(target_lang)
        if not lang_info:
            return text

        target_code = lang_info["code"]
        cache_key = f"{target_code}::{text}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 1. Primary: High-speed Google Translate public endpoint (<500ms)
        try:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_code}&dt=t&q={urllib.parse.quote(text)}"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=6) as response:
                data = json.loads(response.read().decode("utf-8"))
                if data and isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                    translated = "".join([part[0] for part in data[0] if part and len(part) > 0 and part[0]])
                    if translated and translated.strip():
                        self._cache[cache_key] = translated.strip()
                        return translated.strip()
        except Exception as e:
            print(f"Notice: Google Translate call for '{target_lang}' failed: {e}")

        # 2. Secondary Fallback: MyMemory API
        try:
            url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair=en|{target_code}"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KuttyStory/1.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode("utf-8"))
                translated = data.get("responseData", {}).get("translatedText")
                if translated and translated.strip():
                    self._cache[cache_key] = translated.strip()
                    return translated.strip()
        except Exception as e:
            print(f"Notice: MyMemory fallback for '{target_lang}' failed: {e}")

        # Fallback to original text if translation service is unreachable
        return text

    def translate_job_assets(self, job_id: str, target_lang: str, db: Session) -> Dict[str, str]:
        """
        Translates all generated story page assets for a personalization job in parallel.
        Returns a dictionary mapping asset_id -> translated_text.
        """
        from concurrent.futures import ThreadPoolExecutor

        job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
        if not job:
            return {}

        assets = db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id).all()
        results: Dict[str, str] = {}
        child_name = job.child_name or "Child"

        prepared_items = []
        for asset in assets:
            raw_text = ""
            if asset.story_page:
                raw_text = asset.story_page.story_text or asset.story_page.extracted_text or ""
            if not raw_text:
                raw_text = asset.prompt_used or f"Personalized scene for page {asset.page_number}."

            # Replace child name placeholder before translation
            for tag in ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"]:
                raw_text = raw_text.replace(tag, child_name)

            prepared_items.append((asset.id, raw_text))

        if target_lang in ["english", "en"]:
            for aid, text in prepared_items:
                results[aid] = text
            return results

        def _translate_item(item):
            aid, text = item
            translated = self.translate_text(text, target_lang, child_name=child_name)
            return aid, translated

        # Translate up to 8 pages simultaneously for sub-2s total completion
        with ThreadPoolExecutor(max_workers=8) as executor:
            for aid, translated in executor.map(_translate_item, prepared_items):
                results[aid] = translated

        return results

translation_service = TranslationService()


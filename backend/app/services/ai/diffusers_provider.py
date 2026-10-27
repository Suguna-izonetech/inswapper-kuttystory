import os
import time
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.services.ai.base import ImageGenerationProvider, GenerationResult, HardwareDiagnostic

class HuggingFaceDiffusersProvider(ImageGenerationProvider):
    def __init__(self, token: Optional[str] = None, model_name: Optional[str] = None):
        self.token = token or settings.HF_TOKEN
        self.model_name = model_name or settings.HF_MODEL_NAME
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_name}"

    def check_hardware(self) -> HardwareDiagnostic:
        """
        Assess development machine hardware suitability.
        Accurately reports whether a dedicated CUDA GPU is present.
        """
        try:
            import torch
            has_cuda = torch.cuda.is_available()
            if has_cuda:
                gpu_name = torch.cuda.get_device_name(0)
                vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                return HardwareDiagnostic(
                    has_gpu=True,
                    gpu_name=gpu_name,
                    cuda_version=torch.version.cuda,
                    vram_gb=round(vram, 2),
                    recommended_mode="local_diffusers",
                    notes="Local GPU acceleration is ready for Diffusers / IP-Adapter."
                )
        except Exception:
            pass

        return HardwareDiagnostic(
            has_gpu=False,
            gpu_name=None,
            cuda_version=None,
            vram_gb=0.0,
            recommended_mode="hosted_api",
            notes="No dedicated CUDA GPU detected on development machine. Local Diffusers inference on CPU is impractical (exceedingly slow). Recommended deployment: Hugging Face Hosted Inference API or dedicated endpoint."
        )

    async def generate_illustration(
        self,
        prompt: str,
        reference_image_path: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        seed: Optional[int] = None,
        width: int = 1024,
        height: int = 1024
    ) -> GenerationResult:
        """
        Generate image via Hugging Face Inference API.
        """
        if not self.token:
            raise ValueError(
                "Hugging Face API token (HF_TOKEN) is not configured in backend settings. "
                "Please configure HF_TOKEN in the admin dashboard or .env to enable live Hugging Face generation."
            )
        if not self.model_name:
            raise ValueError(
                "Hugging Face model name (HF_MODEL_NAME) is not configured in .env. "
                "Please configure HF_MODEL_NAME in backend .env to enable model inference."
            )

        start_time = time.time()
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": negative_prompt or "blurry, low quality, deformed, mutated, extra limbs, ugly, text, watermark",
                "width": width,
                "height": height,
                "guidance_scale": 7.5,
                "num_inference_steps": 30
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.api_url, headers=headers, json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"Hugging Face Inference API error ({response.status_code}): {response.text}")

            image_bytes = response.content
            duration = time.time() - start_time

            return GenerationResult(
                image_bytes=image_bytes,
                format="jpeg",
                provider="HuggingFace Diffusers (Hosted API)",
                model=self.model_name,
                prompt=prompt,
                generation_time_sec=round(duration, 2),
                cost_estimate_usd=0.005,  # Estimated serverless inference cost
                is_simulated=False,
                metadata={"seed": seed, "dimensions": f"{width}x{height}"}
            )

diffusers_provider = HuggingFaceDiffusersProvider()

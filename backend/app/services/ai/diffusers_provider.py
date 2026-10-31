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
        height: int = 1024,
        save_raw: bool = True,
        raw_name: Optional[str] = None,
        enhance_quality: bool = True
    ) -> GenerationResult:
        """
        Generate high-resolution storybook illustration via Hugging Face Inference API.
        Applies prompt sharpening, micro-contrast enhancement, and preserves the pristine
        original in storage/raw_generated/ before face swapping or downstream modifications.
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

        # Enhanced negative prompt targeting high sharpness, clear anatomy, and artifact reduction
        enhanced_neg = negative_prompt or (
            "blurry, soft focus, out of focus, low resolution, compression artifacts, "
            "jpeg artifacts, oversaturated, deformed, bad anatomy, poorly drawn face, "
            "poorly drawn hands, duplicate, watermark, signature, grainy, low quality"
        )

        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": enhanced_neg,
                "width": width,
                "height": height,
                "guidance_scale": 7.5,
                "num_inference_steps": 35
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.api_url, headers=headers, json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"Hugging Face Inference API error ({response.status_code}): {response.text}")

            image_bytes = response.content
            duration = time.time() - start_time

            # 1. Preserve original unenhanced AI image in storage/raw_generated/
            raw_key = None
            raw_local = None
            if save_raw or raw_name:
                try:
                    from app.services.storage import storage
                    save_name = raw_name or f"ai_gen_{int(time.time()*1000)}.jpg"
                    raw_key, raw_local = storage.save_raw_original(
                        data=image_bytes,
                        custom_name=save_name,
                        extension=".jpg",
                        save_local=True
                    )
                except Exception as e_raw:
                    print(f"Notice: Failed to save raw generated image to storage: {e_raw}")

            # 2. Quality & Sharpness Enhancement pass (LAB CLAHE & unsharp masking)
            processed_bytes = image_bytes
            if enhance_quality:
                try:
                    from app.services.ai.face_swap_service import face_swap_service
                    import cv2
                    import numpy as np

                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if img_bgr is not None:
                        enhanced_bgr = face_swap_service.enhance_image_quality(
                            image_bgr=img_bgr,
                            target_face_bbox=None,
                            sharpness=1.30,
                            contrast_clahe=True,
                            skin_bilateral=False
                        )
                        success, enc = cv2.imencode(".jpg", enhanced_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
                        if success:
                            processed_bytes = enc.tobytes()
                except Exception as e_enh:
                    print(f"Notice during diffusers post-generation enhancement: {e_enh}")

            return GenerationResult(
                image_bytes=processed_bytes,
                format="jpeg",
                provider="HuggingFace Diffusers (Hosted API)",
                model=self.model_name,
                prompt=prompt,
                generation_time_sec=round(duration, 2),
                cost_estimate_usd=0.005,
                is_simulated=False,
                metadata={
                    "seed": seed,
                    "dimensions": f"{width}x{height}",
                    "raw_original_path": raw_key,
                    "raw_original_local_path": str(raw_local) if raw_local else None,
                }
            )

diffusers_provider = HuggingFaceDiffusersProvider()

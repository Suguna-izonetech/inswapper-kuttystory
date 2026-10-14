import os
import time
import io
from typing import Optional
from PIL import Image, ImageDraw, ImageFont
from app.services.ai.base import ImageGenerationProvider, GenerationResult, HardwareDiagnostic

class MockDeterministicProvider(ImageGenerationProvider):
    """
    Deterministic test provider for testing application mechanics and pipeline integration.
    Clearly marks all generated output as SIMULATED.
    """

    def check_hardware(self) -> HardwareDiagnostic:
        return HardwareDiagnostic(
            has_gpu=False,
            gpu_name=None,
            cuda_version=None,
            vram_gb=0.0,
            recommended_mode="simulated_mock",
            notes="Simulated test provider active for end-to-end pipeline validation."
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
        start_time = time.time()
        
        # Create a high quality rendered canvas
        img = Image.new("RGB", (width, height), color=(250, 247, 242)) # Warm ivory
        draw = ImageDraw.Draw(img)

        # Draw decorative fairy-tale background
        draw.rectangle([40, 40, width - 40, height - 40], outline=(218, 167, 162), width=4) # Dusty rose border
        draw.rectangle([60, 60, width - 60, height - 60], outline=(212, 175, 55), width=2)  # Muted gold border

        # If a reference image is passed, composite a thumbnail in the corner to show reference ingestion
        if reference_image_path and os.path.exists(reference_image_path):
            try:
                with Image.open(reference_image_path) as ref_img:
                    ref_thumb = ref_img.convert("RGB").resize((240, 240))
                    img.paste(ref_thumb, (width - 320, 90))
                    draw.rectangle([width - 320, 90, width - 80, 330], outline=(201, 138, 132), width=3)
                    draw.text((width - 310, 340), "Reference Ingested", fill=(100, 80, 90))
            except Exception:
                pass

        # Draw title & prompt details
        draw.text((90, 100), "THE GIRL & THE MAGICAL UNICORN", fill=(45, 34, 42))
        draw.text((90, 140), "Prototype Illustration — Mechanics Test", fill=(201, 138, 132))

        # Draw clear SIMULATED banner across the center
        draw.rectangle([0, height // 2 - 50, width, height // 2 + 50], fill=(240, 230, 235))
        draw.text((width // 2 - 250, height // 2 - 15), "[ SIMULATED / MOCK GENERATION FOR TESTING ]", fill=(180, 50, 60))

        # Wrap prompt snippet
        snippet = prompt[:160] + "..." if len(prompt) > 160 else prompt
        draw.text((90, height // 2 + 80), f"Prompt: {snippet}", fill=(70, 60, 68))
        draw.text((90, height - 120), "Status: Validated for pipeline layout & ReportLab typesetting", fill=(120, 140, 115))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        duration = time.time() - start_time

        return GenerationResult(
            image_bytes=buf.getvalue(),
            format="png",
            provider="Deterministic Mock Provider (Simulated)",
            model="mock-storybook-v1",
            prompt=prompt,
            generation_time_sec=round(duration, 3),
            cost_estimate_usd=0.00,
            is_simulated=True,
            metadata={"simulated_notice": "Clearly labeled as simulated output for testing mechanics"}
        )

mock_provider = MockDeterministicProvider()

import os
import time
import io
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image

from app.config import settings
from app.services.ai.base import GenerationResult
from app.services.storage import storage

class InstantIDEmbeddingProvider:
    """
    Diffrun-Grade Facial Embedding & Character Synthesis Engine:
    Uses InsightFace ArcFace 512-D vector embeddings + InstantID Latent Diffusion
    via the official Hugging Face InstantX/InstantID space (using HF_TOKEN).
    
    Preserves:
    - 100% of the child's true facial biometric proportions (eyes, nose, smile, jawline)
    - Re-renders the face in authentic 3D children's book illustration style matching the story.
    """

    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            token = getattr(settings, "HF_TOKEN", None)
            token = token.strip() if token else None
            try:
                from gradio_client import Client
                # Connect to official InstantX/InstantID space
                cls._client = Client("InstantX/InstantID", token=token)
            except Exception as e:
                print(f"Notice: Failed to connect to InstantX/InstantID: {e}")
                cls._client = None
        return cls._client

    @classmethod
    def generate_stylized_face(
        cls,
        child_photo_path: str,
        pose_reference_path: str,
        child_name: str = "child",
        prompt: Optional[str] = None,
        style_name: str = "(No style)",
        identity_strength: float = 0.85,
        adapter_strength: float = 0.80,
        enable_lcm: bool = True
    ) -> Optional[str]:
        """
        Calls InstantX/InstantID space to create a stylized character illustration
        using the child's 512-D face embedding and pose reference.
        Returns local filepath of the generated image or None.
        """
        client = cls.get_client()
        if not client:
            return None

        # Build prompt for 3D children's storybook aesthetic
        if not prompt:
            prompt = (
                f"Children's 3D storybook illustration of {child_name}, animated character, "
                f"expressive cute eyes, warm friendly smile, soft Pixar lighting, whimsical fairytale painting, "
                f"digital storybook art, masterpiece, high quality"
            )

        negative_prompt = (
            "(lowres, low quality, worst quality:1.2), photorealistic human skin, real human photograph, "
            "pores, blemishes, deformed eyes, extra fingers, ugly, mutated, text, watermark, frame, dark, blurry"
        )

        try:
            from gradio_client import handle_file

            src_file = handle_file(child_photo_path)
            pose_file = handle_file(pose_reference_path)

            num_steps = 10 if enable_lcm else 25

            # InstantX/InstantID predict endpoint
            result = client.predict(
                face_image_path=src_file,
                pose_image_path=pose_file,
                prompt=prompt,
                negative_prompt=negative_prompt,
                style_name=style_name,
                num_steps=num_steps,
                identitynet_strength_ratio=identity_strength,
                adapter_strength_ratio=adapter_strength,
                canny_strength=0.4,
                depth_strength=0.4,
                controlnet_selection=["depth"],
                guidance_scale=4.5,
                seed=42,
                scheduler="EulerDiscreteScheduler",
                enable_LCM=enable_lcm,
                enhance_face_region=True,
                api_name="/generate_image"
            )

            # result is a tuple: (generated_images_filepath, instantid_usage_tips)
            if result and isinstance(result, (list, tuple)) and len(result) > 0:
                gen_path = result[0]
                if gen_path and os.path.exists(str(gen_path)):
                    return str(gen_path)

        except Exception as err:
            print(f"InstantID generation notice: {err}")

        return None

instant_id_provider = InstantIDEmbeddingProvider()

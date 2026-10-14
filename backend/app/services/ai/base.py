from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import time

@dataclass
class GenerationResult:
    image_bytes: bytes
    format: str  # "png", "jpeg"
    provider: str
    model: str
    prompt: str
    generation_time_sec: float
    cost_estimate_usd: float
    is_simulated: bool = False
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class HardwareDiagnostic:
    has_gpu: bool
    gpu_name: Optional[str]
    cuda_version: Optional[str]
    vram_gb: Optional[float]
    recommended_mode: str  # "hosted_api", "local_diffusers", "fallback"
    notes: str

class StoryAnalysisProvider(ABC):
    @abstractmethod
    async def analyze_page(self, page_number: int, source_text: str, scene_description: str) -> Dict[str, Any]:
        """Analyze page and return structured scene plan and prompt."""
        pass

    @abstractmethod
    async def expand_prompt(self, base_prompt: str, child_name: str, child_features: Optional[str] = None) -> str:
        """Expand prompt for image generation."""
        pass

class ImageGenerationProvider(ABC):
    @abstractmethod
    async def generate_illustration(
        self,
        prompt: str,
        reference_image_path: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        seed: Optional[int] = None,
        width: int = 1024,
        height: int = 1024
    ) -> GenerationResult:
        """Generate a single illustration."""
        pass

    @abstractmethod
    def check_hardware(self) -> HardwareDiagnostic:
        """Assess development machine hardware suitability."""
        pass

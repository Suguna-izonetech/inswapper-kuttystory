"""
InsightFace INSwapper-128 Production Face Swap Service
Provides high-fidelity, biometric identity preservation for children's storybooks.
Replaces external cloud face-swap spaces with local/GPU InsightFace models.
"""

import os
import io
import time
import asyncio
import logging
import threading
import warnings
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List, Union

import cv2
import numpy as np
from PIL import Image
from scipy.spatial import Delaunay

from app.config import settings, BACKEND_DIR, BASE_DIR

logger = logging.getLogger("faceswap")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [FaceSwap] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class FaceSwapError(Exception):
    """Base exception for all face swap service operations."""
    pass


class NoFaceDetectedError(FaceSwapError):
    """Raised when no face could be detected in either source or target image."""
    pass


class InvalidImageError(FaceSwapError):
    """Raised when input image data is corrupt, empty, or exceeds allowable dimensions."""
    pass


class ModelLoadError(FaceSwapError):
    """Raised when InsightFace models or INSwapper ONNX weights fail to load."""
    pass


class ModelInferenceError(FaceSwapError):
    """Raised when ONNX inference fails during face swapping."""
    pass


class InsightFaceSwapService:
    """
    Production-grade InsightFace INSwapper-128 Service.
    - Uses Buffalo_L for face detection, 5-point alignment, and ArcFace 512-D identity embeddings.
    - Uses INSwapper-128 ONNX for latent-guided neural face swapping with paste-back alpha feathering.
    - Thread-safe singleton with lazy model initialization and GPU/CPU provider configuration.
    - Non-blocking async execution via threadpool to protect FastAPI event loops.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(
        self,
        model_path: Optional[str] = None,
        execution_provider: Optional[str] = None,
        det_size: Tuple[int, int] = (640, 640),
        det_thresh: float = 0.30,
        max_image_dim: int = 4096
    ):
        if self._initialized:
            return

        self.configured_model_path = model_path or getattr(settings, "INSWAPPER_MODEL_PATH", "models/inswapper_128.onnx")
        self.execution_provider = execution_provider or getattr(settings, "FACE_SWAP_EXECUTION_PROVIDER", "CPUExecutionProvider")
        self.det_size = det_size
        self.det_thresh = det_thresh
        self.max_image_dim = max_image_dim

        self._app = None
        self._swapper = None
        self._gfpgan_session = None
        self._load_lock = threading.Lock()
        self._initialized = True
        logger.info(
            f"InsightFaceSwapService initialized (provider={self.execution_provider}, model_path={self.configured_model_path})"
        )

    def _resolve_model_path(self) -> Path:
        """Resolve the model path against backend and project roots."""
        p = Path(self.configured_model_path)
        if p.is_absolute() and p.is_file():
            return p

        # Check relative to backend dir, base dir, or working dir
        candidates = [
            Path(self.configured_model_path),
            settings.BACKEND_DIR / self.configured_model_path,
            settings.BASE_DIR / self.configured_model_path,
            Path.cwd() / self.configured_model_path,
            Path(__file__).resolve().parent.parent.parent.parent / "models" / "inswapper_128.onnx",
        ]
        for cand in candidates:
            if cand.is_file():
                return cand.resolve()

        raise ModelLoadError(
            f"INSwapper-128 ONNX model file not found at '{self.configured_model_path}'. "
            f"Please verify the model exists in the backend/models directory or configure INSWAPPER_MODEL_PATH in .env."
        )

    def _get_providers(self) -> List[str]:
        """Return provider priority list."""
        provider = self.execution_provider
        if provider == "CUDAExecutionProvider":
            return ["CUDAExecutionProvider", "CPUExecutionProvider"]
        return [provider]

    def _get_detector(self):
        """Lazily initialize the InsightFace FaceAnalysis detector."""
        if self._app is None:
            with self._load_lock:
                if self._app is None:
                    try:
                        from insightface.app import FaceAnalysis
                        providers = self._get_providers()
                        logger.info(f"Loading InsightFace FaceAnalysis (buffalo_l) with providers={providers}...")
                        app = FaceAnalysis(name="buffalo_l", providers=providers)
                        ctx_id = 0 if "CUDAExecutionProvider" in providers else -1
                        app.prepare(ctx_id=ctx_id, det_size=self.det_size, det_thresh=self.det_thresh)
                        self._app = app
                        logger.info("InsightFace FaceAnalysis detector ready.")
                    except Exception as e:
                        logger.error(f"Failed to initialize InsightFace FaceAnalysis detector: {e}")
                        raise ModelLoadError(f"InsightFace detector initialization failed: {e}") from e
        return self._app

    def _get_swapper(self):
        """Lazily initialize the INSwapper-128 ONNX model."""
        if self._swapper is None:
            with self._load_lock:
                if self._swapper is None:
                    model_file = self._resolve_model_path()
                    try:
                        import insightface.model_zoo as mz
                        providers = self._get_providers()
                        logger.info(f"Loading INSwapper-128 from '{model_file}' with providers={providers}...")
                        swapper = mz.get_model(str(model_file), providers=providers)
                        if swapper is None:
                            raise ModelLoadError(f"ModelRouter could not instantiate INSwapper from '{model_file}'")
                        self._swapper = swapper
                        logger.info(f"INSwapper-128 loaded successfully (input_shape={getattr(swapper, 'input_shape', 'unknown')}).")
                    except ModelLoadError:
                        raise
                    except Exception as e:
                        logger.error(f"Failed to initialize INSwapper model: {e}")
                        raise ModelLoadError(f"INSwapper model initialization failed: {e}") from e
        return self._swapper

    def _load_image(self, img_input: Union[np.ndarray, Image.Image, str, Path, bytes]) -> np.ndarray:
        """
        Convert any accepted image input into a verified, bounded OpenCV BGR uint8 ndarray.
        """
        img_bgr = None

        if isinstance(img_input, np.ndarray):
            if img_input.size == 0 or len(img_input.shape) < 2:
                raise InvalidImageError("Input image numpy array is empty or has invalid dimensions.")
            if len(img_input.shape) == 2:
                img_bgr = cv2.cvtColor(img_input, cv2.COLOR_GRAY2BGR)
            elif img_input.shape[2] == 4:
                img_bgr = cv2.cvtColor(img_input, cv2.COLOR_RGBA2BGR)
            elif img_input.shape[2] == 3:
                img_bgr = img_input.copy()
            else:
                raise InvalidImageError(f"Unsupported numpy image channels: {img_input.shape[2]}")

        elif isinstance(img_input, Image.Image):
            rgb = img_input.convert("RGB")
            img_bgr = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)

        elif isinstance(img_input, (str, Path)):
            fpath = str(img_input)
            if not os.path.exists(fpath):
                raise InvalidImageError(f"Image file does not exist: {fpath}")
            if os.path.getsize(fpath) == 0:
                raise InvalidImageError(f"Image file is empty: {fpath}")
            img_bgr = cv2.imread(fpath, cv2.IMREAD_COLOR)
            if img_bgr is None:
                # Attempt PIL fallback for obscure image encodings
                try:
                    with Image.open(fpath) as pil_img:
                        img_bgr = cv2.cvtColor(np.array(pil_img.convert("RGB")), cv2.COLOR_RGB2BGR)
                except Exception as e_pil:
                    raise InvalidImageError(f"Could not decode image at '{fpath}': {e_pil}") from e_pil

        elif isinstance(img_input, (bytes, bytearray)):
            if len(img_input) == 0:
                raise InvalidImageError("Image bytes buffer is empty.")
            nparr = np.frombuffer(img_input, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                try:
                    with Image.open(io.BytesIO(img_input)) as pil_img:
                        img_bgr = cv2.cvtColor(np.array(pil_img.convert("RGB")), cv2.COLOR_RGB2BGR)
                except Exception as e_pil:
                    raise InvalidImageError(f"Could not decode image bytes: {e_pil}") from e_pil
        else:
            raise InvalidImageError(f"Unsupported image input type: {type(img_input).__name__}")

        if img_bgr is None or img_bgr.size == 0:
            raise InvalidImageError("Failed to decode image input into a valid pixel matrix.")

        h, w = img_bgr.shape[:2]
        if h < 32 or w < 32:
            raise InvalidImageError(f"Image dimensions too small ({w}x{h}); minimum is 32x32.")
        if h > self.max_image_dim or w > self.max_image_dim:
            raise InvalidImageError(
                f"Image dimensions ({w}x{h}) exceed maximum allowable size ({self.max_image_dim}x{self.max_image_dim})."
            )

        return img_bgr

    def _detect_faces_yunet(
        self,
        img_bgr: np.ndarray,
        anchor: Optional[Dict[str, Any]] = None,
        min_score: float = 0.15
    ) -> List[Any]:
        """
        Secondary/fallback detector using YuNet deep learning model.
        Catches stylized cartoon / illustration faces where RetinaFace det_thresh misses them.
        Returns synthesized Face objects compatible with INSwapper.
        """
        from insightface.app.common import Face
        from app.services.ai.cartoon_fusion import cartoon_fusion_engine

        if not cartoon_fusion_engine.YUNET_MODEL_PATH.exists():
            return []

        h, w = img_bgr.shape[:2]
        candidates = []
        try:
            for threshold in [0.35, 0.20, min_score]:
                det = cv2.FaceDetectorYN_create(
                    str(cartoon_fusion_engine.YUNET_MODEL_PATH), "", (w, h), score_threshold=threshold
                )
                res = det.detect(img_bgr)
                if res[1] is not None and len(res[1]) > 0:
                    for f in res[1]:
                        bx, by, bw, bh = [float(v) for v in f[:4]]
                        score = float(f[14]) if len(f) > 14 else 0.5
                        area = bw * bh
                        # Exclude tiny false positive artifacts (< 0.5% canvas area)
                        if area < (w * h * 0.005):
                            continue
                        kps = np.array([
                            [f[4], f[5]],
                            [f[6], f[7]],
                            [f[8], f[9]],
                            [f[10], f[11]],
                            [f[12], f[13]]
                        ], dtype=np.float32)
                        synth_face = Face()
                        synth_face.bbox = np.array([bx, by, bx + bw, by + bh], dtype=np.float32)
                        synth_face.kps = kps
                        synth_face.det_score = score
                        candidates.append(synth_face)
                    if candidates:
                        break
        except Exception as e_yn:
            logger.warning(f"Notice during YuNet fallback detection: {e_yn}")

        # If anchor is provided, sort by distance to anchor
        if candidates and anchor and "cx" in anchor and "cy" in anchor:
            acx = float(anchor["cx"])
            acy = float(anchor["cy"])
            def dist_fn(fc):
                fcx = (fc.bbox[0] + fc.bbox[2]) / 2.0
                fcy = (fc.bbox[1] + fc.bbox[3]) / 2.0
                return ((fcx - acx)**2 + (fcy - acy)**2)**0.5
            candidates = sorted(candidates, key=dist_fn)

        return candidates

    def select_source_face(self, faces: List[Any], context_desc: str = "source") -> Any:
        """
        Selects the primary customer face. When multiple faces are present,
        selects the largest prominent face (by bounding box area) and logs a warning.
        """
        if not faces:
            raise NoFaceDetectedError(f"No face detected in {context_desc} image. Please provide a clear, front-facing portrait.")

        if len(faces) == 1:
            return faces[0]

        logger.warning(
            f"Multiple faces ({len(faces)}) detected in {context_desc} photo. Selecting largest prominent face by area."
        )
        faces_by_area = sorted(
            faces,
            key=lambda f: float((f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])),
            reverse=True
        )
        return faces_by_area[0]

    def select_target_face(
        self,
        faces: List[Any],
        anchor: Optional[Dict[str, Any]] = None,
        context_desc: str = "target"
    ) -> Any:
        """
        Selects the target character face to be swapped.
        If anchor coordinates (cx, cy) are provided (from storybook page annotations),
        matches the face whose center is closest to the anchor.
        Otherwise, selects the largest character face.
        """
        if not faces:
            raise NoFaceDetectedError(f"No face detected in {context_desc} image.")

        if anchor and "cx" in anchor and "cy" in anchor:
            acx = float(anchor["cx"])
            acy = float(anchor["cy"])

            def _distance_to_anchor(f):
                fcx = (float(f.bbox[0]) + float(f.bbox[2])) / 2.0
                fcy = (float(f.bbox[1]) + float(f.bbox[3])) / 2.0
                return ((fcx - acx) ** 2 + (fcy - acy) ** 2) ** 0.5

            sorted_faces = sorted(faces, key=_distance_to_anchor)
            selected = sorted_faces[0]
            chosen_cx = (selected.bbox[0] + selected.bbox[2]) / 2.0
            chosen_cy = (selected.bbox[1] + selected.bbox[3]) / 2.0
            dist = _distance_to_anchor(selected)
            logger.info(
                f"Selected target face at ({chosen_cx:.1f}, {chosen_cy:.1f}) matching anchor ({acx:.1f}, {acy:.1f}) [dist={dist:.1f}px]"
            )
            return selected

        # Fallback: choose largest face
        faces_by_area = sorted(
            faces,
            key=lambda f: float((f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])),
            reverse=True
        )
        return faces_by_area[0]

    def _get_gfpgan_session(self):
        """Lazily initialize ONNX GFPGAN session."""
        if self._gfpgan_session is None:
            with self._load_lock:
                if self._gfpgan_session is None:
                    candidates = [
                        Path(settings.BACKEND_DIR) / "models" / "GFPGANv1.4.onnx",
                        Path(__file__).resolve().parent / "GFPGANv1.4.onnx",
                        Path(settings.BASE_DIR) / "models" / "GFPGANv1.4.onnx",
                        Path("models/GFPGANv1.4.onnx"),
                    ]
                    for cand in candidates:
                        if cand.is_file():
                            try:
                                import onnxruntime as ort
                                opts = ort.SessionOptions()
                                opts.intra_op_num_threads = 4
                                providers = self._get_providers()
                                logger.info(f"Loading GFPGAN face restoration model from '{cand}'...")
                                self._gfpgan_session = ort.InferenceSession(str(cand), sess_options=opts, providers=providers)
                                logger.info("GFPGAN face restoration model ready.")
                                break
                            except Exception as e:
                                logger.warning(f"Failed to initialize GFPGAN from '{cand}': {e}")
        return self._gfpgan_session

    def restore_face_gfpgan(
        self,
        img_bgr: np.ndarray,
        target_face_bbox: Optional[Tuple[int, int, int, int]] = None,
        fidelity: float = 0.92
    ) -> np.ndarray:
        """
        Restores razor-sharp biometric facial details (eyes, eyelashes, iris, nose, lips)
        and eliminates 128px pixelation using the local GFPGAN v1.4 ONNX engine.
        """
        sess = self._get_gfpgan_session()
        if not sess or img_bgr is None or img_bgr.size == 0:
            return img_bgr

        try:
            h, w = img_bgr.shape[:2]

            # 1. Determine bounding box for face crop
            if target_face_bbox is not None:
                bx1, by1, bx2, by2 = target_face_bbox
                bw = bx2 - bx1
                bh = by2 - by1
                cx = bx1 + bw // 2
                cy = by1 + bh // 2
            else:
                detector = self._get_detector()
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=FutureWarning)
                    det_faces = detector.get(img_bgr)
                if not det_faces:
                    return img_bgr
                df = det_faces[0]
                bx1, by1, bx2, by2 = [int(v) for v in df.bbox[:4]]
                bw = bx2 - bx1
                bh = by2 - by1
                cx = bx1 + bw // 2
                cy = by1 + bh // 2

            size = int(max(bw, bh) * 1.6)
            x1 = max(0, cx - size // 2)
            y1 = max(0, cy - size // 2)
            x2 = min(w, x1 + size)
            y2 = min(h, y1 + size)

            crop = img_bgr[y1:y2, x1:x2]
            if crop.size == 0 or (x2 - x1) < 16 or (y2 - y1) < 16:
                return img_bgr

            # 2. Resample to 512x512 tensor
            crop_512 = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_LANCZOS4)
            crop_rgb = cv2.cvtColor(crop_512, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            crop_norm = (crop_rgb - 0.5) / 0.5
            inp = np.transpose(crop_norm, (2, 0, 1))[np.newaxis, ...].astype(np.float32)

            # 3. Neural inference
            out = sess.run(None, {"input": inp})[0]

            out_img = (np.transpose(out[0], (1, 2, 0)) * 0.5 + 0.5) * 255.0
            out_img = np.clip(out_img, 0, 255).astype(np.uint8)
            out_bgr = cv2.cvtColor(out_img, cv2.COLOR_RGB2BGR)

            # 4. Resize back to original target dimensions
            restored_crop = cv2.resize(out_bgr, (x2 - x1, y2 - y1), interpolation=cv2.INTER_LANCZOS4)

            # Blend with original crop based on fidelity
            if fidelity < 1.0:
                restored_crop = cv2.addWeighted(restored_crop, fidelity, crop, 1.0 - fidelity, 0)

            # 5. Elliptical feathered alpha mask for seamless integration
            mask = np.zeros((y2 - y1, x2 - x1), dtype=np.uint8)
            cv2.ellipse(
                mask,
                ((x2 - x1) // 2, (y2 - y1) // 2),
                (int((x2 - x1) * 0.45), int((y2 - y1) * 0.47)),
                0, 0, 360, 255, -1
            )
            mask_blurred = cv2.GaussianBlur(mask, (25, 25), 11).astype(np.float32) / 255.0
            mask_3d = np.repeat(mask_blurred[:, :, np.newaxis], 3, axis=2)

            blended_crop = (restored_crop * mask_3d + crop * (1.0 - mask_3d)).astype(np.uint8)

            result_bgr = img_bgr.copy()
            result_bgr[y1:y2, x1:x2] = blended_crop
            return result_bgr
        except Exception as e_gfpgan:
            logger.warning(f"Notice during GFPGAN neural face restoration: {e_gfpgan}")
            return img_bgr

    def enhance_image_quality(
        self,
        image_bgr: np.ndarray,
        target_face_bbox: Optional[Tuple[int, int, int, int]] = None,
        sharpness: float = 1.35,
        contrast_clahe: bool = True,
        skin_bilateral: bool = True
    ) -> np.ndarray:
        """
        Multi-frequency detail enhancement and micro-contrast restoration:
        - LAB Color Space CLAHE on the Lightness channel (preserves artistic color palette & lighting).
        - Multi-scale unsharp masking for crisp eyes, lashes, lips, and facial contours.
        - Selective edge-preserving bilateral filtering to maintain smooth skin without losing sharp edges.
        """
        if image_bgr is None or image_bgr.size == 0:
            return image_bgr

        result = image_bgr.copy()

        # 1. LAB Lightness Channel Micro-Contrast (CLAHE)
        if contrast_clahe:
            try:
                lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
                cl = clahe.apply(l)
                # Blend 65% CLAHE with 35% original to maintain natural dynamic range
                blended_l = cv2.addWeighted(cl, 0.65, l, 0.35, 0)
                lab_enhanced = cv2.merge((blended_l, a, b))
                result = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)
            except Exception as e_clahe:
                logger.warning(f"Notice during LAB-CLAHE contrast enhancement: {e_clahe}")

        # 2. Multi-scale Unsharp Masking for fine features (eyes, eyebrows, iris, lips)
        if sharpness > 1.0:
            try:
                blur_fine = cv2.GaussianBlur(result, (0, 0), sigmaX=1.0, sigmaY=1.0)
                high_pass_fine = cv2.addWeighted(result, 1.0, blur_fine, -1.0, 0)

                blur_struct = cv2.GaussianBlur(result, (0, 0), sigmaX=2.5, sigmaY=2.5)
                high_pass_struct = cv2.addWeighted(result, 1.0, blur_struct, -1.0, 0)

                combined_detail = 0.70 * high_pass_fine.astype(np.float32) + 0.30 * high_pass_struct.astype(np.float32)

                noise_thresh = 2.0
                mask = np.abs(combined_detail) > noise_thresh
                clean_detail = np.where(mask, combined_detail, 0.0)

                gain = float(sharpness - 1.0)
                sharpened = np.clip(result.astype(np.float32) + gain * clean_detail, 0, 255).astype(np.uint8)
                result = sharpened
            except Exception as e_sharp:
                logger.warning(f"Notice during unsharp detail enhancement: {e_sharp}")

        # 3. Edge-Preserving Bilateral Smoothing on skin regions
        if skin_bilateral and target_face_bbox is not None:
            try:
                x1, y1, x2, y2 = target_face_bbox
                h, w = result.shape[:2]
                x1 = max(0, int(x1))
                y1 = max(0, int(y1))
                x2 = min(w, int(x2))
                y2 = min(h, int(y2))

                if (x2 - x1) > 16 and (y2 - y1) > 16:
                    face_roi = result[y1:y2, x1:x2]
                    smoothed_face = cv2.bilateralFilter(face_roi, d=5, sigmaColor=20, sigmaSpace=20)
                    face_blended = cv2.addWeighted(face_roi, 0.70, smoothed_face, 0.30, 0)
                    result[y1:y2, x1:x2] = face_blended
            except Exception as e_bilat:
                logger.warning(f"Notice during bilateral skin smoothing: {e_bilat}")

        return result

    def _build_anatomical_mask(
        self,
        lmk_106: np.ndarray,
        img_shape: Tuple[int, int],
        forehead_scale: float = 0.38
    ) -> Tuple[np.ndarray, np.ndarray, List[np.ndarray]]:
        """
        Builds an organic, anatomically accurate face mask from 106 facial landmarks:
        - Jawline/cheek contour: strictly ordered sequence from left temple (pt 1) around chin (pt 7) to right temple (pt 17).
        - Forehead arc: smooth curved arc connecting right temple back to left temple above eyebrows.
        - Bilateral Euclidean distance transform feathering for perfectly balanced, seamless transition on both sides.
        """
        h, w = img_shape[:2]

        jaw_indices = [
            1, 9, 10, 11, 12, 13, 14, 15, 16, 2, 3, 4, 5, 6, 7,
            8, 0, 24, 23, 22, 21, 20, 19, 18, 32, 31, 30, 29, 28, 27, 26, 25, 17
        ]
        jaw_pts = [lmk_106[i] for i in jaw_indices]

        chin = lmk_106[7]
        nose_bridge = lmk_106[74]
        up_vec = nose_bridge - chin
        up_len = float(np.linalg.norm(up_vec))
        up_unit = (up_vec / up_len) if up_len > 1e-3 else np.array([0.0, -1.0])

        face_height = float(np.linalg.norm(lmk_106[7] - (lmk_106[51] + lmk_106[105]) / 2.0))
        fh_height = face_height * forehead_scale

        r_temple = lmk_106[17]
        l_temple = lmk_106[1]
        r_brow_mid = lmk_106[105]
        r_brow_in = lmk_106[97]
        l_brow_in = lmk_106[46]
        l_brow_mid = lmk_106[51]

        r_fh_out = r_temple + up_unit * (fh_height * 0.35)
        r_fh_mid = r_brow_mid + up_unit * (fh_height * 0.75)
        center_fh = ((r_brow_in + l_brow_in) / 2.0) + up_unit * (fh_height * 0.90)
        l_fh_mid = l_brow_mid + up_unit * (fh_height * 0.75)
        l_fh_out = l_temple + up_unit * (fh_height * 0.35)

        forehead_pts = [r_fh_out, r_fh_mid, center_fh, l_fh_mid, l_fh_out]
        full_polygon = np.array(jaw_pts + forehead_pts, dtype=np.int32)

        bin_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(bin_mask, [full_polygon], 255)

        dist = cv2.distanceTransform(bin_mask, cv2.DIST_L2, 5)

        ys, xs = np.where(bin_mask > 0)
        if len(ys) == 0:
            return np.zeros((h, w), dtype=np.float32), full_polygon, forehead_pts

        face_span = max(float(ys.max() - ys.min()), float(xs.max() - xs.min()))
        feather_w = max(14.0, face_span * 0.11)

        alpha = np.clip(dist / feather_w, 0.0, 1.0)
        smooth_alpha = alpha * alpha * (3.0 - 2.0 * alpha)
        smooth_alpha = cv2.GaussianBlur(smooth_alpha, (15, 15), 4.5)
        smooth_alpha = np.clip(smooth_alpha, 0.0, 1.0)

        return smooth_alpha, full_polygon, forehead_pts

    def _piecewise_affine_warp(
        self,
        src_img: np.ndarray,
        src_pts: np.ndarray,
        dst_pts: np.ndarray,
        dst_shape: Tuple[int, int]
    ) -> np.ndarray:
        """
        Warps src_img to dst_shape using Delaunay triangulation between src_pts and dst_pts.
        Guarantees exact sub-pixel landmark registration across all facial features (eyes, nose, mouth, cheeks, temples, jawline).
        """
        h_dst, w_dst = dst_shape[:2]
        warped_img = np.zeros((h_dst, w_dst, 3), dtype=np.uint8)
        tri = Delaunay(dst_pts)

        for simplex in tri.simplices:
            t_src = src_pts[simplex].astype(np.float32)
            t_dst = dst_pts[simplex].astype(np.float32)

            r_dst = cv2.boundingRect(t_dst)
            r_src = cv2.boundingRect(t_src)
            dx, dy, dw, dh = r_dst
            sx, sy, sw, sh = r_src

            if dw <= 0 or dh <= 0 or sw <= 0 or sh <= 0:
                continue
            if dx + dw > w_dst or dy + dh > h_dst:
                continue
            if sx + sw > src_img.shape[1] or sy + sh > src_img.shape[0]:
                continue

            t_dst_rel = t_dst - np.array([dx, dy], dtype=np.float32)
            t_src_rel = t_src - np.array([sx, sy], dtype=np.float32)

            src_crop = src_img[sy:sy + sh, sx:sx + sw]
            if src_crop.size == 0:
                continue

            warp_mat = cv2.getAffineTransform(t_src_rel, t_dst_rel)
            warped_crop = cv2.warpAffine(
                src_crop, warp_mat, (dw, dh),
                flags=cv2.INTER_LANCZOS4,
                borderMode=cv2.BORDER_REFLECT_101
            )

            mask = np.zeros((dh, dw), dtype=np.uint8)
            cv2.fillConvexPoly(mask, np.int32(t_dst_rel), 255)

            mask_bool = mask > 0
            if not np.any(mask_bool):
                continue

            dst_roi = warped_img[dy:dy + dh, dx:dx + dw]
            dst_roi[mask_bool] = warped_crop[mask_bool]

        return warped_img

    def high_fidelity_paste_back(
        self,
        target_bgr: np.ndarray,
        target_face: Any,
        bgr_fake: np.ndarray,
        affine_matrix: np.ndarray,
        enable_hd: bool = True
    ) -> np.ndarray:
        """
        High-fidelity, landmark-guided facial composition:
        1. HD 512x512 ArcFace-aligned Neural Restoration (restores eyes, lashes, iris, skin texture).
        2. Piecewise Affine Warping via Delaunay Triangulation:
           Eliminates left-right alignment mismatches by mapping every landmark (eyes, nose, mouth,
           cheeks, temples, jawline) directly to the target character anatomy.
        3. Anatomical boundary mask following organic jawline contour (pts 0..32) and forehead arc
           with bilateral Euclidean distance transform feathering.
        4. Color & ambient lighting harmonization in perceptual LAB color space (75% target matching).
        5. High-frequency micro-texture injection to restore natural skin pores and specular highlights.
        6. Targeted eye clarity enhancement on pupil/iris landmarks for sparkling, realistic gaze.
        7. 100% of surrounding image (hair, hands, clothes, background) is completely untouched.
        """
        h, w = target_bgr.shape[:2]
        warped_fake = None
        smooth_mask = None

        has_landmarks_106 = hasattr(target_face, 'landmark_2d_106') and target_face.landmark_2d_106 is not None
        has_kps = hasattr(target_face, 'kps') and target_face.kps is not None

        # 1. High-Definition 512x512 Neural Restoration (ArcFace/FFHQ-aligned)
        hd_face_512 = None
        if enable_hd and has_kps:
            try:
                gfpgan_sess = self._get_gfpgan_session()
                if gfpgan_sess is not None:
                    from insightface.utils import face_align
                    bgr_fake_512 = cv2.resize(bgr_fake, (512, 512), interpolation=cv2.INTER_LANCZOS4)
                    rgb_512 = cv2.cvtColor(bgr_fake_512, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
                    norm_512 = (rgb_512 - 0.5) / 0.5
                    inp_tensor = np.transpose(norm_512, (2, 0, 1))[np.newaxis, ...].astype(np.float32)

                    out = gfpgan_sess.run(None, {'input': inp_tensor})[0]
                    restored_rgb = (np.transpose(out[0], (1, 2, 0)) * 0.5 + 0.5) * 255.0
                    restored_rgb = np.clip(restored_rgb, 0, 255).astype(np.uint8)
                    restored_bgr = cv2.cvtColor(restored_rgb, cv2.COLOR_RGB2BGR)

                    # Blend 70% HD neural clarity with 30% original fake to maintain exact child identity
                    hd_face_512 = cv2.addWeighted(restored_bgr, 0.70, bgr_fake_512, 0.30, 0)
            except Exception as e_hd:
                logger.warning(f"Notice during HD neural restoration ({e_hd}); falling back to standard warping")
                hd_face_512 = None

        # 2. Landmark-Guided Piecewise Affine Warping & Anatomical Masking
        if has_landmarks_106:
            try:
                from insightface.utils import face_align
                lmk_106 = target_face.landmark_2d_106
                smooth_mask, full_poly, forehead_pts = self._build_anatomical_mask(lmk_106, (h, w), forehead_scale=0.38)

                face_src_img = hd_face_512 if hd_face_512 is not None else cv2.resize(bgr_fake, (512, 512), interpolation=cv2.INTER_LANCZOS4)
                M_512 = face_align.estimate_norm(target_face.kps, 512)

                lmk_512 = face_align.trans_points(lmk_106, M_512)
                fh_512 = face_align.trans_points(np.array(forehead_pts, dtype=np.float32), M_512)

                # Outer bounding ROI anchor points to guarantee seamless triangle coverage
                bx1, by1, bx2, by2 = [int(v) for v in target_face.bbox[:4]]
                bw = bx2 - bx1
                bh = by2 - by1
                pad = int(max(bw, bh) * 0.35)
                rx1 = max(0, bx1 - pad)
                ry1 = max(0, by1 - pad)
                rx2 = min(w - 1, bx2 + pad)
                ry2 = min(h - 1, by2 + pad)

                roi_corners_dst = np.array([
                    [rx1, ry1], [rx2, ry1], [rx2, ry2], [rx1, ry2],
                    [(rx1+rx2)/2, ry1], [rx2, (ry1+ry2)/2], [(rx1+rx2)/2, ry2], [rx1, (ry1+ry2)/2]
                ], dtype=np.float32)

                roi_corners_512 = face_align.trans_points(roi_corners_dst, M_512)
                roi_corners_512[:, 0] = np.clip(roi_corners_512[:, 0], 0, 511)
                roi_corners_512[:, 1] = np.clip(roi_corners_512[:, 1], 0, 511)

                src_points = np.vstack([lmk_512, fh_512, roi_corners_512])
                dst_points = np.vstack([lmk_106, np.array(forehead_pts, dtype=np.float32), roi_corners_dst])

                warped_fake = self._piecewise_affine_warp(face_src_img, src_points, dst_points, (h, w))
            except Exception as e_pw:
                logger.warning(f"Notice during piecewise affine warping ({e_pw}); falling back to similarity transform")
                warped_fake = None

        # Fallback to similarity transform if Delaunay warping was not applicable
        if warped_fake is None:
            if hd_face_512 is not None and has_kps:
                from insightface.utils import face_align
                M_512 = face_align.estimate_norm(target_face.kps, 512)
                IM_512 = cv2.invertAffineTransform(M_512)
                warped_fake = cv2.warpAffine(hd_face_512, IM_512, (w, h), flags=cv2.INTER_LANCZOS4, borderValue=0.0)
            else:
                IM = cv2.invertAffineTransform(affine_matrix)
                warped_fake = cv2.warpAffine(bgr_fake, IM, (w, h), flags=cv2.INTER_LANCZOS4, borderValue=0.0)

        # Fallback mask if not already constructed
        if smooth_mask is None:
            poly_mask = np.zeros((h, w), dtype=np.float32)
            if hasattr(target_face, "bbox") and target_face.bbox is not None:
                bx1, by1, bx2, by2 = [int(v) for v in target_face.bbox[:4]]
                bw = max(16, bx2 - bx1)
                bh = max(16, by2 - by1)
                cx = bx1 + bw // 2
                cy = by1 + int(bh * 0.50)
                rx = int(bw * 0.46)
                ry = int(bh * 0.52)
                cv2.ellipse(
                    poly_mask,
                    (cx, cy),
                    (max(8, rx), max(8, ry)),
                    0, 0, 360, 1.0, -1
                )
            elif has_kps:
                kps = target_face.kps.astype(np.int32)
                hull = cv2.convexHull(kps)
                cv2.fillConvexPoly(poly_mask, hull, 1.0)
            ys, xs = np.where(poly_mask > 0.5)
            if len(ys) > 0:
                face_dim = max(ys.max() - ys.min(), xs.max() - xs.min())
                k_feather = max(11, (face_dim // 20) * 2 + 1)
                smooth_mask = cv2.GaussianBlur(poly_mask, (k_feather, k_feather), k_feather / 3.0)
            else:
                smooth_mask = poly_mask

        face_pixels = smooth_mask > 0.05
        if not np.any(face_pixels):
            return target_bgr

        # 3. Bright Storybook Filter Harmonization (in perceptual LAB color space)
        # Matches the original PDF template's radiant, high-key fairytale lighting and rosy peach skin
        lab_fake = cv2.cvtColor(warped_fake, cv2.COLOR_BGR2LAB).astype(np.float32)
        lab_tgt = cv2.cvtColor(target_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)

        # Smooth ambient lighting and blush field from target illustration
        tgt_ambient = cv2.GaussianBlur(lab_tgt, (35, 35), 12.0)

        for c in range(3):
            f_mean = np.mean(lab_fake[:, :, c][face_pixels])
            f_std = np.std(lab_fake[:, :, c][face_pixels]) + 1e-6
            t_mean = np.mean(lab_tgt[:, :, c][face_pixels])
            t_std = np.std(lab_tgt[:, :, c][face_pixels]) + 1e-6
            target_norm = ((lab_fake[:, :, c] - f_mean) / f_std) * t_std + t_mean

            if c == 0:
                # Luminance (L): 92% target matching + soft exposure lift (gamma 0.90)
                # Produces bright, radiant, luminous fairytale skin without clipping highlights
                l_harmonized = 0.92 * target_norm + 0.08 * lab_fake[:, :, 0]
                lab_fake[:, :, 0] = 255.0 * np.power(np.clip(l_harmonized / 255.0, 0.0, 1.0), 0.90)
            elif c == 1:
                # A channel (green-red): 88% target + 25% smooth ambient illustration blush
                a_harmonized = 0.88 * target_norm + 0.12 * lab_fake[:, :, 1]
                lab_fake[:, :, 1] = 0.75 * a_harmonized + 0.25 * tgt_ambient[:, :, 1]
            elif c == 2:
                # B channel (blue-yellow): 88% target + 25% warm golden fairytale lighting
                b_harmonized = 0.88 * target_norm + 0.12 * lab_fake[:, :, 2]
                lab_fake[:, :, 2] = 0.75 * b_harmonized + 0.25 * tgt_ambient[:, :, 2]

        lab_fake = np.clip(lab_fake, 0, 255).astype(np.uint8)
        harmonized_fake = cv2.cvtColor(lab_fake, cv2.COLOR_LAB2BGR)

        # 4. High-Frequency Micro-Texture Injection (restores authentic skin pores & canvas fidelity)
        blur_tgt = cv2.GaussianBlur(target_bgr, (5, 5), 1.0)
        high_freq = target_bgr.astype(np.float32) - blur_tgt.astype(np.float32)
        textured_fake = np.clip(harmonized_fake.astype(np.float32) + 0.35 * high_freq, 0, 255).astype(np.uint8)

        # 5. Targeted HD Quality Enhancement on pupil/iris landmarks
        if has_landmarks_106:
            lmk = target_face.landmark_2d_106
            left_eye = lmk[33:52].astype(np.int32)
            right_eye = lmk[87:106].astype(np.int32)

            eye_mask = np.zeros((h, w), dtype=np.float32)
            cv2.fillConvexPoly(eye_mask, cv2.convexHull(left_eye), 1.0)
            cv2.fillConvexPoly(eye_mask, cv2.convexHull(right_eye), 1.0)
            eye_mask_blurred = cv2.GaussianBlur(eye_mask, (15, 15), 4.0)[:, :, np.newaxis]

            # Crisp eye sharpening for sparkling pupil catchlights & lashes
            eye_blur = cv2.GaussianBlur(textured_fake, (0, 0), sigmaX=1.1, sigmaY=1.1)
            eye_sharp = cv2.addWeighted(textured_fake, 1.55, eye_blur, -0.55, 0)
            textured_fake = (eye_sharp * eye_mask_blurred + textured_fake * (1.0 - eye_mask_blurred)).astype(np.uint8)

        # 6. Smooth Feathered Perimeter Blending (100% of canvas outside face is untouched)
        mask_3d = smooth_mask[:, :, np.newaxis]
        final_composite = (textured_fake * mask_3d + target_bgr * (1.0 - mask_3d)).astype(np.uint8)
        return final_composite
    def swap_faces(
        self,
        target_image: Union[np.ndarray, Image.Image, str, Path, bytes],
        source_image: Union[np.ndarray, Image.Image, str, Path, bytes],
        anchor: Optional[Dict[str, Any]] = None,
        return_format: str = "pil",  # "pil", "bgr", "bytes"
        save_original: bool = False,
        original_name: Optional[str] = None,
        job_id: Optional[str] = None,
        enhance: Optional[bool] = None
    ) -> Union[Image.Image, np.ndarray, bytes]:
        """
        Synchronously performs face swap using INSwapper-128:
        1. Validates and loads source and target images.
        2. Detects facial landmarks and identity embeddings with FaceAnalysis.
        3. Identifies the intended target character face (via anchor or bounding area).
        4. Injects customer identity embedding into the target character canvas.
        5. Returns the composite in requested format.
        """
        target_bgr = self._load_image(target_image)
        source_bgr = self._load_image(source_image)

        if save_original or original_name:
            try:
                from app.services.storage import storage
                raw_name = original_name or (f"{job_id}/target_original.png" if job_id else f"raw_target_{int(time.time()*1000)}.png")
                storage.save_raw_original(target_bgr, custom_name=raw_name)
            except Exception as e_save_orig:
                logger.warning(f"Failed to save original target image to storage: {e_save_orig}")

        detector = self._get_detector()
        swapper = self._get_swapper()

        # Suppress upstream scikit-image FutureWarning from insightface face_align
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=FutureWarning)
            target_faces = detector.get(target_bgr)
            source_faces = detector.get(source_bgr)

        if not target_faces:
            logger.info("RetinaFace detected 0 faces on target; trying YuNet fallback detector...")
            target_faces = self._detect_faces_yunet(target_bgr, anchor=anchor)

        source_face = self.select_source_face(source_faces, context_desc="source child photo")
        target_face = self.select_target_face(target_faces, anchor=anchor, context_desc="target storybook illustration")

        should_enhance = enhance if enhance is not None else getattr(settings, "FACE_SWAP_ENHANCE", True)
        try:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=FutureWarning)
                # High-fidelity sub-pixel composition with landmark-guided micro-texture & clear eyes
                bgr_fake, M = swapper.get(target_bgr, target_face, source_face, paste_back=False)
                swapped_bgr = self.high_fidelity_paste_back(
                    target_bgr, target_face, bgr_fake, M, enable_hd=should_enhance
                )
        except Exception as e_hf:
            logger.warning(f"Notice during high-fidelity paste-back ({e_hf}); falling back to default paste-back")
            try:
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=FutureWarning)
                    swapped_bgr = swapper.get(target_bgr, target_face, source_face, paste_back=True)
            except Exception as e_inf:
                logger.error(f"INSwapper model inference failed: {e_inf}")
                raise ModelInferenceError(f"Face swap model inference error: {e_inf}") from e_inf

        if swapped_bgr is None or swapped_bgr.shape != target_bgr.shape:
            raise ModelInferenceError("INSwapper returned an invalid or empty image matrix.")

        if return_format == "bgr":
            return swapped_bgr
        elif return_format == "bytes":
            success, enc = cv2.imencode(".png", swapped_bgr)
            if not success:
                raise ModelInferenceError("Could not encode swapped image to PNG format.")
            return enc.tobytes()
        else:
            # Default "pil"
            rgb = cv2.cvtColor(swapped_bgr, cv2.COLOR_BGR2RGB)
            return Image.fromarray(rgb)

    async def swap_faces_async(
        self,
        target_image: Union[np.ndarray, Image.Image, str, Path, bytes],
        source_image: Union[np.ndarray, Image.Image, str, Path, bytes],
        anchor: Optional[Dict[str, Any]] = None,
        return_format: str = "pil",
        save_original: bool = False,
        original_name: Optional[str] = None,
        job_id: Optional[str] = None,
        enhance: Optional[bool] = None
    ) -> Union[Image.Image, np.ndarray, bytes]:
        """
        Asynchronous wrapper executing CPU/GPU-intensive inference in a worker thread.
        Guarantees FastAPI's async event loop is never blocked.
        """
        return await asyncio.to_thread(
            self.swap_faces,
            target_image=target_image,
            source_image=source_image,
            anchor=anchor,
            return_format=return_format,
            save_original=save_original,
            original_name=original_name,
            job_id=job_id,
            enhance=enhance
        )

    def get_status(self) -> Dict[str, Any]:
        """Returns service health, loaded models, and configuration metadata."""
        model_exists = False
        resolved_path = None
        try:
            resolved = self._resolve_model_path()
            model_exists = resolved.is_file()
            resolved_path = str(resolved)
        except Exception:
            pass

        return {
            "provider": "insightface",
            "model_path": self.configured_model_path,
            "resolved_model_path": resolved_path,
            "model_file_exists": model_exists,
            "execution_provider": self.execution_provider,
            "detector_loaded": self._app is not None,
            "swapper_loaded": self._swapper is not None,
            "gfpgan_loaded": self._gfpgan_session is not None,
            "det_size": self.det_size,
            "det_thresh": self.det_thresh,
        }

    def unload(self):
        """Releases model sessions for memory reclamation."""
        with self._load_lock:
            self._app = None
            self._swapper = None
            self._gfpgan_session = None
            logger.info("InsightFaceSwapService sessions unloaded.")


# Global singleton service instance
face_swap_service = InsightFaceSwapService()

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Any, List

YUNET_PATH = Path(__file__).parent / "face_detection_yunet.onnx"

def validate_child_photo_ai(img_bytes: bytes) -> Dict[str, Any]:
    """
    Validates a child photograph using OpenCV Deep Learning YuNet detector:
    - 1. Clear front-facing angle: checks nose position between eyes, interocular distance, yaw symmetry.
    - 2. Uncovered face & mouth: checks mouth landmark detection, lip vermilion contrast, and detects
         hands/fingers/objects covering the mouth or lower face.
    - 3. Sunglasses / eyewear detection.
    - 4. Distance / framing check.
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            "is_valid": False,
            "score": 0,
            "summary": "Could not decode uploaded image format.",
            "checks": []
        }

    h, w = img.shape[:2]

    # Initialize YuNet detector
    if not YUNET_PATH.exists():
        return {
            "is_valid": True,
            "score": 90,
            "summary": "Detector model not loaded; image accepted.",
            "checks": []
        }

    det = cv2.FaceDetectorYN_create(str(YUNET_PATH), "", (w, h), score_threshold=0.30)
    res = det.detect(img)

    if res[1] is None or len(res[1]) == 0:
        return {
            "is_valid": False,
            "score": 25,
            "is_front_facing": False,
            "has_uncovered_mouth": False,
            "has_sunglasses": False,
            "is_far_away": True,
            "summary": "No clear face detected in the photo. Please upload a clear front-facing portrait of your child.",
            "recommendations": [
                "Ensure your child is looking directly at the camera at eye level.",
                "Avoid side profiles or photos where the face is turned away."
            ],
            "checks": [
                {
                    "id": "front_facing",
                    "title": "Clear Front-Facing Portrait",
                    "description": "No front-facing face could be identified in the image.",
                    "status": "fail",
                    "tipRef": "Tip 1: Clear front-facing photo"
                },
                {
                    "id": "uncovered_face",
                    "title": "Uncovered Face & Mouth",
                    "description": "Facial features are obstructed or not visible.",
                    "status": "fail",
                    "tipRef": "Tip 2: No eating or covered face"
                },
                {
                    "id": "no_accessories",
                    "title": "No Heavy Accessories",
                    "description": "No eye accessories detected.",
                    "status": "pass",
                    "tipRef": "Tip 3: No accessories"
                },
                {
                    "id": "distance_framing",
                    "title": "Close-Up Head & Shoulders Framing",
                    "description": "Subject appears too far away or outside standard portrait frame.",
                    "status": "fail",
                    "tipRef": "Tip 4: No far away or side angle"
                }
            ]
        }

    # Select the largest face by bounding box area
    faces = sorted(res[1], key=lambda f: f[2] * f[3], reverse=True)
    f = faces[0]
    bx, by, bw, bh = [int(v) for v in f[:4]]
    conf = float(f[14]) if len(f) > 14 else 0.5

    re_x, re_y = float(f[4]), float(f[5])
    le_x, le_y = float(f[6]), float(f[7])
    nose_x, nose_y = float(f[8]), float(f[9])
    rm_x, rm_y = float(f[10]), float(f[11])
    lm_x, lm_y = float(f[12]), float(f[13])

    eye_dist = np.hypot(re_x - le_x, re_y - le_y)
    eye_dist_ratio = eye_dist / max(1, bw)

    # 1. FRONT-FACING EVALUATION
    min_eye_x = min(re_x, le_x)
    max_eye_x = max(re_x, le_x)
    # In a front-facing portrait, the nose must sit strictly between the two eyes
    is_nose_between = (min_eye_x - 6 <= nose_x <= max_eye_x + 6)

    # Horizontal yaw asymmetry: distance from nose to each eye
    d_re = abs(nose_x - re_x)
    d_le = abs(nose_x - le_x)
    yaw_symmetry = min(d_re, d_le) / max(0.1, max(d_re, d_le))

    # Face box aspect ratio (profiles tend to be narrower or tilted)
    face_aspect = bw / max(1, bh)

    is_side_profile = (not is_nose_between) or (eye_dist_ratio < 0.25) or (yaw_symmetry < 0.48)
    is_front_facing = not is_side_profile

    # 2. COVERED MOUTH & HAND/FINGER OBSTRUCTION EVALUATION
    mouth_dist = np.hypot(rm_x - lm_x, rm_y - lm_y)
    mouth_dist_ratio = mouth_dist / max(1, bw)
    mouth_cx = int((rm_x + lm_x) / 2)
    mouth_cy = int((rm_y + lm_y) / 2)

    # Crop lower face / mouth region
    m_h = int(bh * 0.28)
    m_w = int(bw * 0.45)
    my1 = max(0, mouth_cy - m_h // 2)
    my2 = min(h, mouth_cy + m_h // 2)
    mx1 = max(0, mouth_cx - m_w // 2)
    mx2 = min(w, mouth_cx + m_w // 2)

    mouth_covered = False
    mouth_cover_reason = ""

    # Flag if mouth width is too compressed (< 18% of face width)
    if mouth_dist_ratio < 0.17:
        mouth_covered = True
        mouth_cover_reason = "Mouth appears covered or obstructed by hand/object"

    if my2 > my1 and mx2 > mx1:
        mouth_crop = img[my1:my2, mx1:mx2]
        b_c, g_c, r_c = cv2.split(mouth_crop.astype(float))
        
        # Natural lips have distinct red contrast over green/blue
        strong_lip_pixels = np.sum((r_c - g_c > 22) & (r_c - b_c > 18) & (r_c > 75))
        total_m_pixels = mouth_crop.shape[0] * mouth_crop.shape[1]
        lip_ratio = strong_lip_pixels / max(1, total_m_pixels)

        # Check for vertical edge gradients (typical of fingers resting on face)
        gray_m = cv2.cvtColor(mouth_crop, cv2.COLOR_BGR2GRAY)
        sobel_v = cv2.Sobel(gray_m, cv2.CV_64F, 1, 0, ksize=3)
        v_edge_energy = float(np.mean(np.abs(sobel_v)))

        # Also check lower chin skin continuation (hand/arm reaching into face)
        lower_face_y2 = min(h, by + bh + int(bh * 0.25))
        lower_face_crop = img[by + int(bh * 0.6):lower_face_y2, max(0, bx - 20):min(w, bx + bw + 20)]
        b_lf, g_lf, r_lf = cv2.split(lower_face_crop.astype(float))
        skin_lower = (r_lf > 65) & (g_lf > 40) & (b_lf > 25) & (r_lf > g_lf) & ((r_lf - g_lf) > 10)
        skin_lower_ratio = np.sum(skin_lower) / max(1, lower_face_crop.shape[0] * lower_face_crop.shape[1])

        # If lips are missing (< 3.5% lip pixels) and fingers/edges or side hand are present:
        if lip_ratio < 0.035 and (v_edge_energy > 20.0 or is_side_profile):
            mouth_covered = True
            mouth_cover_reason = "Hand or fingers detected covering mouth/cheek"
        elif lip_ratio < 0.020:
            mouth_covered = True
            mouth_cover_reason = "Mouth appears covered or obstructed"

    has_uncovered_mouth = not mouth_covered

    # 3. SUNGLASSES EVALUATION
    # Eye crop
    ey1 = max(0, int(min(re_y, le_y) - bh * 0.12))
    ey2 = min(h, int(max(re_y, le_y) + bh * 0.12))
    ex1 = max(0, int(min(re_x, le_x) - bw * 0.12))
    ex2 = min(w, int(max(re_x, le_x) + bw * 0.12))
    
    has_sunglasses = False
    if ey2 > ey1 and ex2 > ex1:
        eye_crop = img[ey1:ey2, ex1:ex2]
        b_e, g_e, r_e = cv2.split(eye_crop.astype(float))
        total_eye_px = eye_crop.shape[0] * eye_crop.shape[1]
        
        # Green tint sunglasses
        green_tint = np.sum((g_e > r_e + 8) & (g_e > 65))
        # Blue/dark tint sunglasses
        blue_tint = np.sum((b_e > r_e + 12) & (b_e > 65))
        dark_lens = np.sum((r_e < 40) & (g_e < 40) & (b_e < 40))
        
        if (green_tint / total_eye_px > 0.06) or (blue_tint / total_eye_px > 0.07) or (dark_lens / total_eye_px > 0.35):
            has_sunglasses = True

    # 4. DISTANCE & FRAMING
    face_area = bw * bh
    total_area = w * h
    face_coverage = face_area / max(1, total_area)
    is_far_away = face_coverage < 0.07 or bw < 80 or bh < 90

    # Overall scoring and validation result
    score = 96
    recommendations: List[str] = []

    if is_side_profile:
        score -= 42
        recommendations.append("Child is turned sideways in profile. Please upload a photo looking directly at the camera.")

    if mouth_covered:
        score -= 38
        recommendations.append("Hand or fingers are covering the mouth or lower face. Please upload a photo with an uncovered, clear smile or natural expression.")

    if has_sunglasses:
        score -= 40
        recommendations.append("Sunglasses or tinted eyewear detected. Please upload an uncovered photo showing natural eyes.")

    if is_far_away:
        score -= 28
        recommendations.append("Child is too far from the camera. Please crop closer to the head and shoulders.")

    score = max(20, min(98, score))
    is_valid = is_front_facing and has_uncovered_mouth and (not has_sunglasses) and (not is_far_away)

    checks = [
        {
            "id": "front_facing",
            "title": "1. Front-Facing Angle",
            "description": "Child appears turned away or in side profile. Please face camera directly." if is_side_profile else "Front-facing portrait angle confirmed.",
            "status": "fail" if is_side_profile else "pass",
            "tipRef": "Tip 1: Clear front-facing photo"
        },
        {
            "id": "uncovered_face",
            "title": "2. Uncovered Face & Mouth",
            "description": mouth_cover_reason if mouth_covered else "No obstructions or covered areas detected on face.",
            "status": "fail" if mouth_covered else "pass",
            "tipRef": "Tip 2: No eating or covered face"
        },
        {
            "id": "no_accessories",
            "title": "3. No Heavy Accessories",
            "description": "Sunglasses or tinted glasses detected covering eyes." if has_sunglasses else "No sunglasses or eye obstructions detected.",
            "status": "fail" if has_sunglasses else "pass",
            "tipRef": "Tip 3: No accessories"
        },
        {
            "id": "distance_framing",
            "title": "4. Close-Up Framing",
            "description": "Child appears too far away in the background." if is_far_away else "Close-up head and shoulders framing confirmed.",
            "status": "fail" if is_far_away else "pass",
            "tipRef": "Tip 4: No far away or side angle"
        }
    ]

    summary = (
        "Photo verified! Meets all portrait guidelines and ready for storybook generation."
        if is_valid
        else "Photo needs attention: " + "; ".join(recommendations)
    )

    return {
        "is_valid": is_valid,
        "score": score,
        "dimensions": {"width": w, "height": h},
        "checks": checks,
        "summary": summary,
        "recommendations": recommendations,
        "diagnostics": {
            "has_sunglasses": has_sunglasses,
            "has_covered_mouth": mouth_covered,
            "is_side_angle": is_side_profile,
            "is_far_away": is_far_away,
            "eye_dist_ratio": round(eye_dist_ratio, 3),
            "is_nose_between_eyes": is_nose_between,
            "yaw_symmetry": round(yaw_symmetry, 3),
            "mouth_dist_ratio": round(mouth_dist_ratio, 3)
        }
    }

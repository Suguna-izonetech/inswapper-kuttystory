"""
Seed Stories CLI Script for Kutty Story Application.

Usage:
    python seed_stories.py
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.seed_stories import seed

if __name__ == "__main__":
    seed()

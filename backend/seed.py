"""
Master Database Seeder for Kutty Story Application.

Seeds admin accounts and story catalog in one command.

Usage:
    python seed.py
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.seed_admin import seed_admin_users
from app.seed_stories import seed as seed_stories


def seed_all():
    print("=" * 64)
    print("  Kutty Story Application — Master Database Seeder")
    print("=" * 64)
    print("\n[Step 1/2] Seeding Admin Accounts...")
    seed_admin_users()
    print("\n[Step 2/2] Seeding Story Templates...")
    seed_stories()
    print("\n" + "=" * 64)
    print("All seed operations completed successfully!")
    print("=" * 64)


if __name__ == "__main__":
    seed_all()

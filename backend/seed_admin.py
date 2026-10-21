"""
Admin Seed CLI Script for Kutty Story Application.

Usage:
    python seed_admin.py
    python seed_admin.py --list
    python seed_admin.py --email custom@admin.com --password Secret123 --name "Custom Admin"
    python seed_admin.py --no-reset
"""

import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.seed_admin import seed_admin_users, list_admin_users, main, DEFAULT_ADMINS

if __name__ == "__main__":
    main()

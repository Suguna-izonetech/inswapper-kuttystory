"""
Master Database Seeder for Kutty Story Application.

Seeds admin accounts and story catalog in one unified command.

Usage:
    python seed.py                  # Seeds both admin users and stories
    python seed.py --admin          # Seeds only admin accounts
    python seed.py --stories        # Seeds only stories catalog
    python seed.py --list           # Lists all existing admin users
    python seed.py --email user@example.com --password Secret --name "Name"
"""

import sys
import argparse
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.seed_admin import seed_admin_users, list_admin_users, main as admin_main
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


def main():
    parser = argparse.ArgumentParser(description="Kutty Story Database Seeder")
    parser.add_argument("--admin", action="store_true", help="Seed admin accounts only")
    parser.add_argument("--stories", action="store_true", help="Seed stories catalog only")
    parser.add_argument("--list", action="store_true", help="List all existing admin accounts")
    parser.add_argument("--email", type=str, help="Seed/update a custom admin email")
    parser.add_argument("--password", type=str, help="Password for custom admin")
    parser.add_argument("--name", type=str, default="Administrator", help="Full name for custom admin")
    parser.add_argument("--phone", type=str, default=None, help="Phone number for custom admin")
    parser.add_argument("--no-reset", action="store_true", help="Preserve existing passwords")

    args, unknown = parser.parse_known_args()

    if args.list:
        list_admin_users()
    elif args.email or args.password:
        admin_main()
    elif args.admin:
        print("\nSeeding Admin Accounts...")
        seed_admin_users(reset_passwords=not args.no_reset)
    elif args.stories:
        print("\nSeeding Story Templates...")
        seed_stories()
    else:
        seed_all()


if __name__ == "__main__":
    main()

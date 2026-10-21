"""
Admin User Seeding Module for Kutty Story Application.

Provides idempotent seeding and management of administrator accounts.
Can be imported directly into FastAPI startup hooks or executed as a standalone CLI script.
"""

import sys
import argparse
from pathlib import Path
from typing import List, Optional, Dict, Any

# Ensure backend root is in sys.path for direct script execution
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine, Base
from app.models import User
from app.routers.auth import hash_password, verify_password

# Default admin accounts configured for Kutty Story atelier
DEFAULT_ADMINS = [
    {
        "name": "Admin Master",
        "email": "admin@kuttystory.com",
        "password": "Admin@123",
        "phone": "+919876543210",
        "role": "admin",
    },
    {
        "name": "Suguna",
        "email": "suguna.izonetech@gmail.com",
        "password": "Suguna@123",
        "phone": "+919876543212",
        "role": "admin",
    },
]


def seed_admin_users(
    db=None,
    custom_user: Optional[Dict[str, str]] = None,
    reset_passwords: bool = True
) -> List[Dict[str, Any]]:
    """
    Idempotently seeds admin user accounts into the database.

    - If an admin account exists and reset_passwords is True (default),
      refreshes the password to match specified credentials.
    - If an admin account does not exist, creates it with role='admin'.

    Args:
        db: Optional existing SQLAlchemy Session. If None, a new session is managed.
        custom_user: Optional dict with 'name', 'email', 'password', 'phone' to seed a specific user.
        reset_passwords: If True, resets/updates password for existing matching email.

    Returns:
        List of dicts describing the outcome for each account.
    """
    close_session_on_finish = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_session_on_finish = True

    try:
        targets = [custom_user] if custom_user else DEFAULT_ADMINS
        results = []

        for admin_info in targets:
            clean_email = admin_info["email"].lower().strip()
            existing_user = db.query(User).filter(User.email == clean_email).first()

            if existing_user:
                # Ensure the user has the admin role
                existing_user.role = "admin"
                if admin_info.get("name"):
                    existing_user.name = admin_info["name"].strip()
                if admin_info.get("phone"):
                    existing_user.phone = admin_info["phone"].strip()

                if reset_passwords:
                    existing_user.hashed_password = hash_password(admin_info["password"])

                db.commit()
                db.refresh(existing_user)
                results.append({
                    "email": clean_email,
                    "action": "updated",
                    "id": existing_user.id,
                    "name": existing_user.name,
                    "role": existing_user.role,
                })
                print(f"[OK] Admin user updated: {clean_email} ({existing_user.name})")
            else:
                new_admin = User(
                    name=admin_info["name"].strip(),
                    email=clean_email,
                    phone=admin_info.get("phone", "").strip() if admin_info.get("phone") else None,
                    hashed_password=hash_password(admin_info["password"]),
                    role="admin"
                )
                db.add(new_admin)
                db.commit()
                db.refresh(new_admin)
                results.append({
                    "email": clean_email,
                    "action": "created",
                    "id": new_admin.id,
                    "name": new_admin.name,
                    "role": new_admin.role,
                })
                print(f"[OK] Admin user created: {clean_email} ({new_admin.name})")

        return results
    finally:
        if close_session_on_finish:
            db.close()


def list_admin_users(db=None) -> List[Dict[str, Any]]:
    """List all registered admin users currently in the database."""
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        admins = db.query(User).filter(User.role == "admin").all()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": u.role,
                "created_at": str(u.created_at) if u.created_at else None
            }
            for u in admins
        ]
    finally:
        if close_session:
            db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Seed or manage Kutty Story application admin login credentials."
    )
    parser.add_argument("--email", type=str, help="Admin login email address")
    parser.add_argument("--password", type=str, help="Admin login password")
    parser.add_argument("--name", type=str, default="Administrator", help="Admin display name")
    parser.add_argument("--phone", type=str, default=None, help="Admin phone number")
    parser.add_argument("--list", action="store_true", help="List all existing admin accounts")
    parser.add_argument(
        "--no-reset",
        action="store_true",
        help="Do not overwrite password if the admin account already exists"
    )

    args = parser.parse_args()

    print("=" * 64)
    print("  Kutty Story Application — Admin Account Seeder")
    print("=" * 64)

    if args.list:
        print("\nRegistered Admin Users in Database:")
        print("-" * 64)
        admins = list_admin_users()
        if not admins:
            print("No admin users found.")
        else:
            for idx, a in enumerate(admins, 1):
                print(f"{idx}. {a['name']} <{a['email']}> (Phone: {a['phone'] or 'N/A'}, ID: {a['id']})")
        print("-" * 64)
        return

    if args.email and args.password:
        custom = {
            "name": args.name,
            "email": args.email,
            "password": args.password,
            "phone": args.phone,
            "role": "admin"
        }
        print(f"Seeding custom admin user: {args.email} ...")
        seed_admin_users(custom_user=custom, reset_passwords=not args.no_reset)
    else:
        print("Seeding default application administrator accounts ...")
        seed_admin_users(reset_passwords=not args.no_reset)

    print("\n" + "=" * 64)
    print("Default Admin Login Credentials:")
    print("-" * 64)
    for idx, admin in enumerate(DEFAULT_ADMINS, 1):
        print(f" {idx}) Email:    {admin['email']}")
        print(f"    Password: {admin['password']}")
        print(f"    Name:     {admin['name']}")
        print(f"    Phone:    {admin['phone']}")
        print()
    print("-" * 64)
    print(" Admin Login URL: http://localhost:5173/admin_login")
    print("=" * 64)
    print("Done!\n")


if __name__ == "__main__":
    main()

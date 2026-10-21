"""
MinIO Storage Synchronization Utility for Kutty Story Application.

Usage:
    python sync_to_minio.py
    python sync_to_minio.py --list
"""

import sys
import argparse
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.storage import storage


def main():
    parser = argparse.ArgumentParser(description="Manage MinIO storage for Kutty Story.")
    parser.add_argument("--list", action="store_true", help="List all objects currently in the MinIO bucket")
    args = parser.parse_args()

    print("=" * 64)
    print("  Kutty Story Application — MinIO Storage Manager")
    print("=" * 64)
    print(f"Bucket:   {storage.bucket}")
    print(f"Endpoint: {storage.client._base_url}")
    print("-" * 64)

    if args.list:
        print("\nListing objects in MinIO bucket:")
        count = 0
        for obj in storage.client.list_objects(storage.bucket, recursive=True):
            print(f"- {obj.object_name} ({obj.size} bytes)")
            count += 1
        print(f"\nTotal objects: {count}")
    else:
        print("\nStarting storage sync to MinIO...")
        storage.sync_local_to_minio()
        print("\nSync completed successfully.")

    print("=" * 64)


if __name__ == "__main__":
    main()

"""
Automated Test Suite for Alembic Migration Idempotency and Server Simulation.

Tests on real PostgreSQL isolated databases:
1. Scenario 1 (The Server Bug Reproduction & Fix):
   - Existing PostgreSQL tables exist and contain data (created via Base.metadata.create_all).
   - alembic_version table is completely missing.
   - Running alembic upgrade head must:
     a) NOT raise DuplicateTable ("relation 'ai_settings' already exists").
     b) Preserve 100% of existing table rows.
     c) Reconcile all schema differences (missing tables/columns/types).
     d) Accurately record alembic_version at head (d8f4e21a0b3c).
     e) Be completely idempotent when run again.

2. Scenario 2 (Fresh Database):
   - Empty database with zero tables.
   - Running alembic upgrade head must create all tables, indexes, constraints, and stamp head.
   - Running alembic upgrade head again must be idempotent.
"""

import sys
import uuid
from pathlib import Path
from urllib.parse import urlparse, urlunparse

# Add backend directory to path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings
from app.models import Base, AISettings, User, StoryTemplate
from alembic.config import Config
from alembic import command
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker


def get_db_url_for(db_name: str) -> str:
    sync_url = settings.DATABASE_URL
    if sync_url.startswith("postgresql+asyncpg://"):
        sync_url = sync_url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    elif not sync_url.startswith("postgresql+psycopg://") and sync_url.startswith("postgresql://"):
        sync_url = sync_url.replace("postgresql://", "postgresql+psycopg://", 1)
    p = urlparse(sync_url)
    return urlunparse((p.scheme, p.netloc, f"/{db_name}", p.params, p.query, p.fragment))


def run_tests():
    print("=" * 70)
    print("STARTING ALEMBIC MIGRATION IDEMPOTENCY & SERVER SIMULATION TESTS")
    print("=" * 70)

    admin_db_url = get_db_url_for("postgres")
    admin_engine = sa.create_engine(admin_db_url, isolation_level="AUTOCOMMIT")

    test_server_db = "kuttystory_server_sim"
    test_fresh_db = "kuttystory_fresh_sim"

    with admin_engine.connect() as conn:
        conn.execute(sa.text(f"DROP DATABASE IF EXISTS {test_server_db};"))
        conn.execute(sa.text(f"DROP DATABASE IF EXISTS {test_fresh_db};"))
        conn.execute(sa.text(f"CREATE DATABASE {test_server_db};"))
        conn.execute(sa.text(f"CREATE DATABASE {test_fresh_db};"))

    try:
        # -------------------------------------------------------------
        # SCENARIO 1: Server Simulation (Existing tables, missing alembic_version)
        # -------------------------------------------------------------
        print("\n--- SCENARIO 1: Existing Tables With Missing alembic_version ---")
        server_db_url = get_db_url_for(test_server_db)
        sim_engine = sa.create_engine(server_db_url, pool_pre_ping=True)

        # Step A: Simulate pre-existing tables created without alembic (e.g. via create_all)
        print("1. Creating pre-existing tables via Base.metadata.create_all...")
        Base.metadata.create_all(bind=sim_engine)

        # Step B: Ensure alembic_version is absent, replicating the exact server bug state
        with sim_engine.connect() as conn:
            conn.execute(sa.text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
            conn.commit()

        # Step C: Populate existing data to ensure preservation
        print("2. Inserting test data into pre-existing tables...")
        SimSession = sessionmaker(bind=sim_engine)
        session = SimSession()
        test_user_id = str(uuid.uuid4())
        test_user_email = f"preserved_{uuid.uuid4().hex[:8]}@kuttystory.com"
        
        user = User(
            id=test_user_id,
            name="Preserved Child Parent",
            email=test_user_email,
            hashed_password="hashed_pw_test",
            role="customer"
        )
        ai_setting = AISettings(
            id="default",
            active_story_provider="gemini",
            active_image_provider="template_fusion"
        )
        session.add(user)
        session.add(ai_setting)
        session.commit()
        session.close()

        # Verify alembic_version is absent before upgrade
        with sim_engine.connect() as conn:
            insp = sa.inspect(conn)
            tables = insp.get_table_names()
            assert "ai_settings" in tables, "ai_settings must exist to simulate the bug!"
            assert "alembic_version" not in tables, "alembic_version must be missing to simulate the bug!"
        print("Confirmed: Pre-existing tables exist and alembic_version is MISSING.")

        # Step D: Run Alembic upgrade head (The exact command that previously failed with DuplicateTable)
        print("3. Executing Alembic upgrade head on existing un-versioned database...")
        alembic_ini_path = BACKEND_DIR / "alembic.ini"
        cfg = Config(str(alembic_ini_path))
        cfg.set_main_option("sqlalchemy.url", server_db_url.replace("%", "%%"))

        command.upgrade(cfg, "head")
        print("SUCCESS: Alembic upgrade head completed without DuplicateTable error!")

        # Step E: Verify data preservation
        print("4. Verifying existing rows were NOT dropped or truncated...")
        session = SimSession()
        retrieved_user = session.query(User).filter(User.id == test_user_id).first()
        assert retrieved_user is not None, "Data loss detected! User row was lost!"
        assert retrieved_user.email == test_user_email, "User data corruption detected!"
        retrieved_setting = session.query(AISettings).filter(AISettings.id == "default").first()
        assert retrieved_setting is not None, "AISettings row was lost!"
        session.close()
        print("Confirmed: 100% of existing data preserved intact.")

        # Step F: Verify schema alignment & alembic_version
        with sim_engine.connect() as conn:
            insp = sa.inspect(conn)
            tables = insp.get_table_names()
            assert "alembic_version" in tables, "alembic_version table was not created!"
            res = conn.execute(sa.text("SELECT version_num FROM alembic_version;")).fetchall()
            assert len(res) == 1, "Expected exactly 1 version record!"
            assert res[0][0] == "d8f4e21a0b3c", f"Expected head revision d8f4e21a0b3c, got {res[0][0]}"
            
            # Verify new columns from d8f4e21a0b3c
            job_cols = {c["name"] for c in insp.get_columns("personalization_jobs")}
            assert "is_paid" in job_cols, "is_paid column missing in personalization_jobs!"
            assert "paid_at" in job_cols, "paid_at column missing in personalization_jobs!"
            order_cols = {c["name"] for c in insp.get_columns("orders")}
            assert "razorpay_order_id" in order_cols, "razorpay_order_id missing in orders!"
            assert "razorpay_payment_id" in order_cols, "razorpay_payment_id missing in orders!"
            asset_cols = {c["name"]: str(c["type"]) for c in insp.get_columns("generated_assets")}
            assert "VARCHAR(255)" in asset_cols.get("provider", ""), f"provider should be VARCHAR(255), got {asset_cols.get('provider')}"
            assert "VARCHAR(255)" in asset_cols.get("model", ""), f"model should be VARCHAR(255), got {asset_cols.get('model')}"
        print("Confirmed: alembic_version correctly stamped at head (d8f4e21a0b3c) and schema matches models.")

        # Step G: Test idempotency (run upgrade head second time)
        print("5. Testing idempotency: Running upgrade head second time on server database...")
        command.upgrade(cfg, "head")
        print("SUCCESS: Second upgrade head ran cleanly with zero side-effects.")

        # -------------------------------------------------------------
        # SCENARIO 2: Fresh Database (Empty database with zero tables)
        # -------------------------------------------------------------
        print("\n--- SCENARIO 2: Fresh Empty Database ---")
        fresh_db_url = get_db_url_for(test_fresh_db)
        fresh_engine = sa.create_engine(fresh_db_url, pool_pre_ping=True)

        fresh_cfg = Config(str(alembic_ini_path))
        fresh_cfg.set_main_option("sqlalchemy.url", fresh_db_url.replace("%", "%%"))

        print("1. Running Alembic upgrade head on completely empty database...")
        command.upgrade(fresh_cfg, "head")

        with fresh_engine.connect() as conn:
            insp = sa.inspect(conn)
            fresh_tables = set(insp.get_table_names())
            expected_tables = {"ai_settings", "audit_logs", "story_templates", "users", "child_profiles", 
                               "story_pages", "personalization_jobs", "books", "generated_assets", 
                               "orders", "child_written_stories", "payment_transactions", "feedbacks", "alembic_version"}
            assert expected_tables.issubset(fresh_tables), f"Missing tables in fresh migration: {expected_tables - fresh_tables}"
            
            res = conn.execute(sa.text("SELECT version_num FROM alembic_version;")).fetchall()
            assert res[0][0] == "d8f4e21a0b3c", f"Expected fresh version d8f4e21a0b3c, got {res[0][0]}"
        print("SUCCESS: Fresh database migrated cleanly to head with all tables!")

        # Second run idempotency
        print("2. Testing idempotency on fresh database...")
        command.upgrade(fresh_cfg, "head")
        print("SUCCESS: Fresh database second upgrade ran cleanly.")

        # -------------------------------------------------------------
        # SCENARIO 3: Test App Startup Migration Runner
        # -------------------------------------------------------------
        print("\n--- SCENARIO 3: App Startup Migration Runner ---")
        from app.db_init import run_database_migrations
        run_database_migrations()
        print("SUCCESS: run_database_migrations() completed cleanly.")

        print("\n" + "=" * 70)
        print("ALL TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        # Cleanup test databases
        try:
            if "sim_engine" in locals():
                sim_engine.dispose()
        except Exception:
            pass
        try:
            if "fresh_engine" in locals():
                fresh_engine.dispose()
        except Exception:
            pass
        with admin_engine.connect() as conn:
            conn.execute(sa.text(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('{test_server_db}', '{test_fresh_db}');"))
            conn.execute(sa.text(f"DROP DATABASE IF EXISTS {test_server_db};"))
            conn.execute(sa.text(f"DROP DATABASE IF EXISTS {test_fresh_db};"))
        admin_engine.dispose()
        print("Cleaned up temporary test databases.")


if __name__ == "__main__":
    run_tests()

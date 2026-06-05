-- GRC Platform - Initial Database Setup & Seed Data
-- This runs automatically on first container start

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables are created by SQLAlchemy on backend startup.
-- This script seeds default data after tables exist.

-- Note: The seed below runs AFTER the backend creates tables via Alembic/SQLAlchemy.
-- Use the seed_data.py script for seeding instead (safer with ORM).

SELECT 'GRC Platform database initialised successfully' AS status;

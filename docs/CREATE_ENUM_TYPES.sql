-- Create ENUM types for Prisma schema
-- Run this in Neon Console SQL Editor after creating tables

-- Create UserRole enum
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create IncidentStatus enum
DO $$ BEGIN
  CREATE TYPE "IncidentStatus" AS ENUM ('RECEIVED', 'DISPATCHED', 'ON_WAY', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create IncidentSeverity enum
DO $$ BEGIN
  CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Verify enums were created
SELECT typname FROM pg_type WHERE typname IN ('UserRole', 'IncidentStatus', 'IncidentSeverity');

-- Update existing columns to use enums (if needed)
-- Note: This assumes your tables have TEXT columns that need to be converted
-- If you already have TEXT columns, you may need to alter them:
-- ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
-- ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus" USING "status"::"IncidentStatus";
-- ALTER TABLE "Incident" ALTER COLUMN "severity" TYPE "IncidentSeverity" USING "severity"::"IncidentSeverity";

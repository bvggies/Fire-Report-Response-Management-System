-- Create tables for Fire Report & Response Management System
-- Run this in Neon Console SQL Editor

-- Step 0: Create ENUM types (REQUIRED for Prisma)
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentStatus" AS ENUM ('RECEIVED', 'DISPATCHED', 'ON_WAY', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- 2. Create Incident table
CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT,
  "reporterName" TEXT,
  "reporterPhone" TEXT,
  "reporterEmail" TEXT,
  "location" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "description" TEXT NOT NULL,
  "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "IncidentStatus" NOT NULL DEFAULT 'RECEIVED',
  "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- Create index on reporterId
CREATE INDEX IF NOT EXISTS "Incident_reporterId_idx" ON "Incident"("reporterId");

-- Add foreign key constraint
ALTER TABLE "Incident" 
  DROP CONSTRAINT IF EXISTS "Incident_reporterId_fkey";
  
ALTER TABLE "Incident" 
  ADD CONSTRAINT "Incident_reporterId_fkey" 
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL;

-- 3. Create FireStation table
CREATE TABLE IF NOT EXISTS "FireStation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FireStation_pkey" PRIMARY KEY ("id")
);

-- 4. Create Personnel table
CREATE TABLE IF NOT EXISTS "Personnel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "badgeNumber" TEXT NOT NULL,
  "rank" TEXT NOT NULL,
  "fireStationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Personnel_email_key" ON "Personnel"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Personnel_badgeNumber_key" ON "Personnel"("badgeNumber");

-- Create index on fireStationId
CREATE INDEX IF NOT EXISTS "Personnel_fireStationId_idx" ON "Personnel"("fireStationId");

-- Add foreign key constraint
ALTER TABLE "Personnel" 
  DROP CONSTRAINT IF EXISTS "Personnel_fireStationId_fkey";
  
ALTER TABLE "Personnel" 
  ADD CONSTRAINT "Personnel_fireStationId_fkey" 
  FOREIGN KEY ("fireStationId") REFERENCES "FireStation"("id") ON DELETE CASCADE;

-- 5. Create Assignment table
CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "personnelId" TEXT,
  "userId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Assignment_incidentId_idx" ON "Assignment"("incidentId");
CREATE INDEX IF NOT EXISTS "Assignment_personnelId_idx" ON "Assignment"("personnelId");
CREATE INDEX IF NOT EXISTS "Assignment_userId_idx" ON "Assignment"("userId");

-- Add foreign key constraints
ALTER TABLE "Assignment" 
  DROP CONSTRAINT IF EXISTS "Assignment_incidentId_fkey";
  
ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_incidentId_fkey" 
  FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE;

ALTER TABLE "Assignment" 
  DROP CONSTRAINT IF EXISTS "Assignment_personnelId_fkey";
  
ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_personnelId_fkey" 
  FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE SET NULL;

ALTER TABLE "Assignment" 
  DROP CONSTRAINT IF EXISTS "Assignment_userId_fkey";
  
ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

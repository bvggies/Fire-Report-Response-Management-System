-- QUICK FIX: Create tables one by one (if the full script fails)
-- Copy and run each section separately in Neon SQL Editor

-- ============================================
-- STEP 1: Create User table
-- ============================================
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 2: Create Incident table
-- ============================================
CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reporterId" TEXT,
  "reporterName" TEXT,
  "reporterPhone" TEXT,
  "reporterEmail" TEXT,
  "location" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Incident_reporterId_idx" ON "Incident"("reporterId");

ALTER TABLE "Incident" 
  ADD CONSTRAINT "Incident_reporterId_fkey" 
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL;

-- ============================================
-- STEP 3: Create FireStation table
-- ============================================
CREATE TABLE IF NOT EXISTS "FireStation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 4: Create Personnel table
-- ============================================
CREATE TABLE IF NOT EXISTS "Personnel" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "badgeNumber" TEXT NOT NULL UNIQUE,
  "rank" TEXT NOT NULL,
  "fireStationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Personnel_fireStationId_idx" ON "Personnel"("fireStationId");

ALTER TABLE "Personnel" 
  ADD CONSTRAINT "Personnel_fireStationId_fkey" 
  FOREIGN KEY ("fireStationId") REFERENCES "FireStation"("id") ON DELETE CASCADE;

-- ============================================
-- STEP 5: Create Assignment table
-- ============================================
CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "incidentId" TEXT NOT NULL,
  "personnelId" TEXT,
  "userId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Assignment_incidentId_idx" ON "Assignment"("incidentId");
CREATE INDEX IF NOT EXISTS "Assignment_personnelId_idx" ON "Assignment"("personnelId");
CREATE INDEX IF NOT EXISTS "Assignment_userId_idx" ON "Assignment"("userId");

ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_incidentId_fkey" 
  FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE;

ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_personnelId_fkey" 
  FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE SET NULL;

ALTER TABLE "Assignment" 
  ADD CONSTRAINT "Assignment_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL;

-- ============================================
-- VERIFY: Check tables were created
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

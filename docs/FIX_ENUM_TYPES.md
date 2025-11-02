# 🔧 Fix: ENUM Types Don't Exist Error

## The Problem

Error: `type "public.UserRole" does not exist`

**Why:** Tables were created manually, but PostgreSQL ENUM types weren't created. Prisma expects ENUM types for certain fields.

## ✅ Solution: Create ENUM Types

### Step 1: Go to Neon Console

1. Go to [Neon Console](https://console.neon.tech)
2. Your project → **SQL Editor**

### Step 2: Run This SQL

Copy and paste this into the SQL Editor:

```sql
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
```

**Click Run** ✅

### Step 3: Update Table Columns (If Needed)

If your tables were created with TEXT columns instead of ENUM, convert them:

```sql
-- Update User table
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

-- Update Incident table
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus" USING "status"::"IncidentStatus";
ALTER TABLE "Incident" ALTER COLUMN "severity" TYPE "IncidentSeverity" USING "severity"::"IncidentSeverity";
```

**Click Run** ✅

### Step 4: Verify ENUMs Created

```sql
SELECT typname FROM pg_type 
WHERE typname IN ('UserRole', 'IncidentStatus', 'IncidentSeverity');
```

Should show 3 rows.

## ✅ After Creating ENUMs

1. **Registration should work** ✅
2. **All Prisma queries should work** ✅
3. **No more enum type errors** ✅

## 🎯 Quick Fix (Copy All at Once)

```sql
-- Create all ENUM types
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentStatus" AS ENUM ('RECEIVED', 'DISPATCHED', 'ON_WAY', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Update columns to use enums (if they're TEXT currently)
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus" USING "status"::"IncidentStatus";
ALTER TABLE "Incident" ALTER COLUMN "severity" TYPE "IncidentSeverity" USING "severity"::"IncidentSeverity";
```

Run this in Neon SQL Editor and registration will work!

---

**See also:** `CREATE_ENUM_TYPES.sql` for the complete script

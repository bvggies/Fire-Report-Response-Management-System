# 📋 Create Database Tables - Step by Step

## ⚠️ Important Notes

- Neon SQL Editor might auto-format queries
- **Run each CREATE TABLE statement separately** if the full script fails
- Use the files: `NEON_CREATE_TABLES.sql` (full script) or `NEON_QUICK_FIX.sql` (one by one)

## 🎯 Method 1: Run Full Script (Recommended)

1. **Open** `NEON_CREATE_TABLES.sql` file
2. **Copy the entire content**
3. **Paste in Neon SQL Editor**
4. **Click "Run"**
5. Should create all 5 tables

## 🎯 Method 2: Create One Table at a Time

If the full script gives errors, use `NEON_QUICK_FIX.sql`:

### Step 1: Create User Table
```sql
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
```

**Click Run** ✅

### Step 2: Create Incident Table
```sql
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
```

**Click Run** ✅

### Step 3: Create FireStation Table
```sql
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
```

**Click Run** ✅

### Step 4: Create Personnel Table
```sql
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
```

**Click Run** ✅

### Step 5: Create Assignment Table
```sql
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
```

**Click Run** ✅

## ✅ Verify Tables Created

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show:
- Assignment
- FireStation
- Incident
- Personnel
- User

## 🚀 After Creating Tables

1. **Test registration:**
   - Go to your Vercel URL `/register`
   - Create an account
   - Should work! ✅

2. **Test report submission:**
   - Go to `/report`
   - Submit a fire incident
   - Should work! ✅

## 🐛 Troubleshooting

**"relation already exists"**
→ Tables already created, that's fine!

**"syntax error"**
→ Try running tables one by one (Method 2)

**"permission denied"**
→ Check you're using the correct database/role

**Foreign key error**
→ Make sure User table is created before Incident

## 📝 Notes

- **Order matters:** Create User before Incident (foreign key)
- **TIMESTAMP vs TIMESTAMP(3):** Neon uses TIMESTAMP (without precision)
- **Run statements separately** if full script fails
- **Check for errors** after each step

---

**Quick reference files:**
- `NEON_CREATE_TABLES.sql` - Full script
- `NEON_QUICK_FIX.sql` - Step by step

# 🗄️ Push Database Schema - Manual Steps

Since you have the Vercel project linked and env vars pulled, here are options to push the schema:

## ✅ Option 1: Use Neon Console (Easiest)

1. **Go to [Neon Console](https://console.neon.tech)**
2. **Select your project**
3. **Go to SQL Editor**
4. **Run this SQL to create tables:**

```sql
-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Create Incident table
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
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),

  CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Incident_reporterId_idx" ON "Incident"("reporterId");

-- Create FireStation table
CREATE TABLE IF NOT EXISTS "FireStation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FireStation_pkey" PRIMARY KEY ("id")
);

-- Create Personnel table
CREATE TABLE IF NOT EXISTS "Personnel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "badgeNumber" TEXT NOT NULL,
  "rank" TEXT NOT NULL,
  "fireStationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Personnel_email_key" ON "Personnel"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Personnel_badgeNumber_key" ON "Personnel"("badgeNumber");
CREATE INDEX IF NOT EXISTS "Personnel_fireStationId_idx" ON "Personnel"("fireStationId");

-- Create Assignment table
CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "personnelId" TEXT,
  "userId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Assignment_incidentId_idx" ON "Assignment"("incidentId");
CREATE INDEX IF NOT EXISTS "Assignment_personnelId_idx" ON "Assignment"("personnelId");
CREATE INDEX IF NOT EXISTS "Assignment_userId_idx" ON "Assignment"("userId");

-- Add foreign keys
ALTER TABLE "Incident" ADD CONSTRAINT IF NOT EXISTS "Incident_reporterId_fkey" 
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Personnel" ADD CONSTRAINT IF NOT EXISTS "Personnel_fireStationId_fkey" 
  FOREIGN KEY ("fireStationId") REFERENCES "FireStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT IF NOT EXISTS "Assignment_incidentId_fkey" 
  FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT IF NOT EXISTS "Assignment_personnelId_fkey" 
  FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT IF NOT EXISTS "Assignment_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

5. **Click "Run"**
6. **Verify tables created** - You should see success messages

## ✅ Option 2: Use Prisma Studio (If Prisma Works)

```bash
# If npm install works
npm install
npx prisma db push

# Or use Prisma Studio to verify
npx prisma studio
```

## ✅ Option 3: Use Vercel Post-Deploy Hook

Create `vercel.json` with post-deploy hook (we'll add this):

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

But you still need to push schema once manually first.

## 🎯 Recommended: Use Option 1 (Neon Console)

It's the fastest and most reliable:
1. Copy the SQL above
2. Paste in Neon SQL Editor
3. Run it
4. Tables are created!

## ✅ After Creating Tables

1. **Test your Vercel app:**
   - Go to your Vercel URL
   - Try `/register` - should work now!
   - Try `/login` - should work!

2. **Create admin user** (optional):
   ```sql
   -- In Neon SQL Editor, after registering a user:
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```

## 🔍 Verify Tables Exist

In Neon SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show: Assignment, FireStation, Incident, Personnel, User

---

**After this, your Vercel app should work!** Try registering a user and it should succeed.

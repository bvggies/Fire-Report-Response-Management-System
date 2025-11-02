# 🔧 Sync Prisma Schema with Database

## Problem

Prisma can't find the `Incident` table even though it exists. This happens when tables are created manually but don't match Prisma's expectations.

## Solution: Use Prisma to Sync Schema

Since tables exist but Prisma doesn't recognize them, we need to sync Prisma with the database.

### Option 1: Use `prisma db push` (Recommended)

This will sync your Prisma schema with the existing database structure.

```bash
# Pull env vars from Vercel
vercel env pull .env.local

# Push schema (this will sync Prisma with existing tables)
npx prisma db push --accept-data-loss
```

**Note:** `--accept-data-loss` is needed because Prisma might want to modify the structure slightly.

### Option 2: Regenerate Prisma Client

Sometimes just regenerating the client helps:

```bash
# Generate Prisma Client with current schema
npx prisma generate
```

### Option 3: Use Prisma Migrate (If db push fails)

```bash
# Create a migration based on current schema
npx prisma migrate dev --name sync_with_manual_tables

# This will detect differences and create migration
```

## Quick Fix: Check Table Names Match

Prisma expects exact table names. Verify in Neon Console:

```sql
-- Check exact table names (case-sensitive!)
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Prisma expects:
- `"User"` (quoted, capital U)
- `"Incident"` (quoted, capital I)
- `"FireStation"` (quoted)
- `"Personnel"` (quoted)
- `"Assignment"` (quoted)

If your tables are lowercase or unquoted, that's the problem!

## Alternative: Drop and Recreate with Prisma

If syncing doesn't work, drop all tables and let Prisma create them:

```bash
# WARNING: This deletes all data!
# In Neon SQL Editor, run:
DROP TABLE IF EXISTS "Assignment" CASCADE;
DROP TABLE IF EXISTS "Personnel" CASCADE;
DROP TABLE IF EXISTS "Incident" CASCADE;
DROP TABLE IF EXISTS "FireStation" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

# Then push schema
npx prisma db push
```

## After Syncing

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Verify connection:**
   ```bash
   npm run db:test
   ```

3. **Test your app:**
   - Try analytics page
   - Should work now!

## Most Likely Issue

The manually created tables might have:
- Different column types
- Missing indexes
- Different enum values
- Case sensitivity issues

`prisma db push` will fix these automatically.

---

**Try `npx prisma db push --accept-data-loss` first!**

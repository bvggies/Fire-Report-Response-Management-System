# 🔧 Fix "Failed to submit report" on Vercel

## 🔍 Most Likely Causes

### 1. Database Tables Don't Exist (90% of cases)

**Symptom:** Error message mentions "schema" or "does not exist"

**Fix:** Push database schema to Neon

```bash
# Pull env vars
vercel env pull .env.local

# Push schema
npx prisma db push
```

**Or use Neon Console** (see PUSH_SCHEMA_MANUAL.md)

### 2. Database Connection Issue

**Symptom:** "Database connection failed" or "Can't reach database"

**Fix:**
1. Check Neon database is not paused
2. Verify DATABASE_URL in Vercel environment variables
3. Make sure connection string includes `?sslmode=require`

### 3. Validation Error

**Symptom:** Specific field error

**Fix:** Make sure required fields are filled:
- Location ✅
- Description ✅
- Severity (defaults to MEDIUM if not provided)

## 🧪 How to Diagnose

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Your Project → Deployments
3. Latest deployment → **Functions** tab
4. Try submitting a report
5. Check the logs for `/api/incidents` route
6. Look for the actual error message

### Step 2: Test Database Connection

**Check if Incident table exists:**

In Neon Console SQL Editor:
```sql
SELECT COUNT(*) FROM "Incident";
```

If error: Table doesn't exist → Need to push schema

### Step 3: Check Required Fields

The API requires:
- `location` (string)
- `description` (string)
- `severity` (optional, defaults to MEDIUM)

## 🔧 Quick Fixes

### Fix 1: Verify Database Tables

**In Neon Console:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show: `User`, `Incident`, `FireStation`, `Personnel`, `Assignment`

If missing → Run the SQL from `PUSH_SCHEMA_MANUAL.md`

### Fix 2: Check Environment Variables

In Vercel:
- Settings → Environment Variables
- Verify `DATABASE_URL` is set correctly
- Make sure it's added to **all environments**

### Fix 3: Test API Directly

```bash
# Using curl (replace with your Vercel URL)
curl -X POST https://your-app.vercel.app/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Test Location",
    "description": "Test description of fire incident",
    "severity": "MEDIUM"
  }'
```

## ✅ After Fixing

1. **Test submission:**
   - Go to `/report` on your Vercel app
   - Fill in the form
   - Submit
   - Should redirect to track page with ID

2. **Verify in database:**
   ```sql
   SELECT * FROM "Incident" ORDER BY "createdAt" DESC LIMIT 1;
   ```

## 📊 Error Messages Explained

**"Database schema not initialized"**
→ Tables don't exist. Push schema.

**"Database connection failed"**
→ Can't reach Neon. Check connection.

**"Location and description are required"**
→ Form validation. Fill required fields.

**"Internal server error"**
→ Check function logs for details.

## 🎯 Most Common Fix

**99% of the time:**

1. Tables don't exist → Push schema
2. Connection issue → Check DATABASE_URL

**Quick command:**
```bash
vercel env pull .env.local && npx prisma db push
```

Or use Neon Console to create tables (see PUSH_SCHEMA_MANUAL.md)

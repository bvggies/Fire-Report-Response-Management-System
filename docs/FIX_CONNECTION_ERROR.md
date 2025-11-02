# 🔧 Fix "Database connection error" on Vercel

Since tables exist, this is a **connection issue**, not a schema issue.

## 🔍 Diagnosis Steps

### Step 1: Check DATABASE_URL Format

**In Vercel Environment Variables:**
1. Go to Vercel → Settings → Environment Variables
2. Check `DATABASE_URL` value
3. **Must be exactly:**
   ```
   postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

**Common issues:**
- ❌ Missing `?sslmode=require` at the end
- ❌ Extra spaces or quotes
- ❌ Wrong password/username
- ❌ Using `DATABASE_URL_UNPOOLED` instead of `DATABASE_URL`

### Step 2: Check Neon Database Status

1. Go to [Neon Console](https://console.neon.tech)
2. Check if database shows "Active" (not paused)
3. **Free tier databases auto-pause** - first request after pause takes 2-3 seconds
4. Click on database to "wake it up"

### Step 3: Test Connection Directly

**In Neon Console SQL Editor:**
```sql
SELECT NOW();
```

If this works → Database is accessible
If this fails → Database connection issue

### Step 4: Check Vercel Function Logs

1. Vercel → Deployments → Latest → Functions
2. Try to register/login
3. Check the exact error in logs
4. Look for:
   - `P1001` - Can't reach database server
   - `P1000` - Authentication failed
   - Connection timeout
   - SSL error

## 🔧 Fixes

### Fix 1: Update DATABASE_URL Format

**Make sure it has:**
- ✅ `?sslmode=require` at the end
- ✅ No extra spaces
- ✅ No quotes around the value
- ✅ Using pooled connection (ends with `-pooler`)

**Correct format:**
```
postgresql://username:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
```

### Fix 2: Use Pooled Connection

Your connection string uses `-pooler` which is correct:
```
ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech
```

✅ This is good for Vercel (serverless)

### Fix 3: Verify in Vercel

1. **Go to Vercel → Settings → Environment Variables**
2. **Click on DATABASE_URL to edit**
3. **Verify it matches exactly:**
   ```
   postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Make sure:**
   - No quotes at start/end
   - Has `?sslmode=require`
   - All environments selected (Production, Preview, Development)
5. **Save**
6. **Redeploy** (or wait for auto-redeploy)

### Fix 4: Check Prisma Client Generation

The Prisma Client needs to be generated with the correct connection:

**In Vercel Build Logs, you should see:**
```
✔ Generated Prisma Client
```

If not, the build command should include `prisma generate`

### Fix 5: Neon Database Connection Settings

**In Neon Console:**
1. Go to your project
2. Click "Connection Details"
3. **Verify the connection string matches** what's in Vercel
4. Check if there are any connection limits or restrictions

## 🧪 Quick Test

**Test connection from Neon:**
```sql
-- In Neon SQL Editor
SELECT version();
```

If this works, database is fine → Issue is with Vercel connection

**Test from Vercel:**
Check function logs when trying to register - the error should show:
- Connection timeout → Database paused or network issue
- Authentication error → Wrong credentials
- SSL error → Missing `?sslmode=require`

## ✅ Most Likely Fix

**90% chance it's one of these:**

1. **DATABASE_URL missing `?sslmode=require`**
   → Add it to the end in Vercel env vars

2. **Database paused (Neon free tier)**
   → Wake it up in Neon console, wait a few seconds

3. **Wrong DATABASE_URL value**
   → Double-check it matches Neon exactly

4. **Not redeployed after env var change**
   → Add env var, then redeploy

## 🚀 Action Items

1. ✅ Verify DATABASE_URL in Vercel has `?sslmode=require`
2. ✅ Check Neon database is active (not paused)
3. ✅ Redeploy on Vercel after any env var changes
4. ✅ Check Vercel function logs for exact error code

## 📊 Check Build Logs

In Vercel deployment:
- Look for "Prisma Client generated" ✅
- Look for database connection errors ❌
- Check if DATABASE_URL is being loaded

---

**Next:** Check Vercel Function Logs and share the exact error message you see!

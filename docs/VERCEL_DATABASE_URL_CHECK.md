# 🔍 Verify DATABASE_URL in Vercel

## Critical Check: DATABASE_URL Format

Since tables exist but you're getting connection errors, the issue is likely the **connection string format** in Vercel.

## ✅ Correct Format

Your DATABASE_URL in Vercel **MUST be exactly:**

```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🔍 Step-by-Step Verification

### Step 1: Get Fresh Connection String from Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Your project → **Connection Details**
3. **Copy the connection string**
4. Make sure you're using the **"Pooled connection"** (not direct)

### Step 2: Verify in Vercel

1. Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. **Edit it** and verify:
   - ✅ Starts with `postgresql://`
   - ✅ Has your username and password
   - ✅ Hostname includes `-pooler` (for serverless/Vercel)
   - ✅ Database name: `neondb`
   - ✅ **Ends with `?sslmode=require`** ← CRITICAL!

### Step 3: Common Mistakes

❌ **Wrong:**
```
postgresql://user:pass@host/db
```
Missing `?sslmode=require`

❌ **Wrong:**
```
"postgresql://user:pass@host/db?sslmode=require"
```
Has quotes (don't include quotes in Vercel)

❌ **Wrong:**
```
postgresql://user:pass@host/db ?sslmode=require
```
Has space before `?`

✅ **Correct:**
```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Update and Redeploy

1. **Edit DATABASE_URL** in Vercel
2. **Make sure format is correct** (see above)
3. **Save**
4. **Redeploy** (or it will auto-redeploy)

### Step 5: Check Neon Database

**In Neon Console:**
1. Make sure database shows **"Active"**
2. If it says "Paused" or "Sleeping" → Click to wake it up
3. Wait 2-3 seconds for it to activate

## 🧪 Test After Update

1. **Wait for Vercel redeploy to finish**
2. **Try to register a user**
3. **Should work!**

## 🐛 If Still Fails

**Check Vercel Function Logs:**
1. Deployments → Latest → Functions
2. Look for `/api/auth/register` logs
3. Check for error codes:
   - `P1001` → Can't reach server (database paused or wrong host)
   - `P1000` → Auth failed (wrong password)
   - `SSL required` → Missing `?sslmode=require`

## ✅ Quick Fix Checklist

- [ ] DATABASE_URL copied fresh from Neon
- [ ] Uses **pooled connection** (has `-pooler` in hostname)
- [ ] Ends with `?sslmode=require` (no space before `?`)
- [ ] No quotes around the value in Vercel
- [ ] Added to all environments (Production, Preview, Development)
- [ ] Redeployed after updating
- [ ] Neon database is active (not paused)

---

**Most likely:** Missing `?sslmode=require` or database is paused. Check both!

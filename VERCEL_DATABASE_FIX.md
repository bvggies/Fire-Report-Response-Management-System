# 🔧 Fix "Database connection error" on Vercel

## ⚡ Quick Fix Steps

### Step 1: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. **Verify these 4 variables exist:**

   ✅ **DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   - Make sure `?sslmode=require` is at the end
   - Check for typos or extra spaces

   ✅ **NEXTAUTH_URL**
   ```
   https://your-actual-app.vercel.app
   ```
   - Must match your actual Vercel URL exactly

   ✅ **NEXTAUTH_SECRET**
   ```
   wO3UgWpcED/jI6+v/EYGG5uiIaE84Fft9x7og9+5FKs=
   ```

   ✅ **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
   ```
   AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44
   ```

### Step 2: Push Database Schema to Neon

**This is usually the main issue!** The database tables don't exist yet.

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma db push
```

**Option B: Using Neon Console**
1. Go to [Neon Console](https://console.neon.tech)
2. Open your project
3. Go to **SQL Editor**
4. Run Prisma schema manually (not recommended - use Option A)

### Step 3: Check Build Logs

1. Go to Vercel → Your Project
2. Click on **Deployments**
3. Click on the **latest deployment**
4. Check the **Build Logs** tab
5. Look for:
   - ✅ `Prisma Client generated` - Good!
   - ❌ `Error: Can't reach database server` - Connection issue
   - ❌ `Table does not exist` - Schema not pushed

### Step 4: Force Redeploy

After fixing environment variables or pushing schema:

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click the **three dots** on latest deployment
4. Click **Redeploy**

Or push an empty commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 🔍 Common Issues & Solutions

### Issue 1: "Table does not exist" or "relation does not exist"

**Solution:** Database schema not initialized
```bash
vercel env pull .env.local
npx prisma db push
```

### Issue 2: "Can't reach database server"

**Possible causes:**
- Neon database is paused (free tier auto-pauses)
- Wrong DATABASE_URL
- Network issue

**Solutions:**
1. Wake up Neon database:
   - Go to [Neon Console](https://console.neon.tech)
   - Open your project
   - Wait a few seconds for it to wake up

2. Verify DATABASE_URL:
   - Check it's exactly: `postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - No extra spaces or quotes
   - `?sslmode=require` must be at the end

### Issue 3: "Prisma Client not generated"

**Solution:** Build command should auto-generate it
- Check `package.json` has: `"build": "prisma generate && next build"`
- Check `postinstall` script: `"postinstall": "prisma generate"`

### Issue 4: Environment Variables Not Loading

**Solution:**
1. Make sure variables are set for **all environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

2. After adding variables, **redeploy**

3. Verify in build logs that DATABASE_URL is available

## 🧪 Test Database Connection from Vercel

### Method 1: Check Function Logs

1. Go to Vercel → Your Project
2. Click on a deployment
3. Go to **Functions** tab
4. Try to register/login
5. Check the logs for the API route
6. Look for specific error messages

### Method 2: Use Vercel CLI

```bash
# Pull env vars
vercel env pull .env.local

# Test connection locally with production DB
node -e "
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Connected to Neon!'))
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => prisma.\$disconnect());
"
```

## ✅ Verification Checklist

After fixing, verify:

- [ ] All 4 environment variables set in Vercel
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Build logs show "Prisma Client generated"
- [ ] No database errors in function logs
- [ ] Can register new user
- [ ] Can login with created user

## 🚀 Most Likely Fix

**99% of the time, it's this:**

```bash
# 1. Pull Vercel environment variables
vercel env pull .env.local

# 2. Push database schema to Neon
npx prisma db push

# 3. Verify it worked
npm run db:test  # (if running locally)

# 4. Redeploy on Vercel (or wait for auto-deploy)
```

The error "Database connection error" means Prisma can connect but the tables don't exist. Running `npx prisma db push` creates all the tables in Neon.

## 📞 Still Not Working?

1. **Check Vercel Function Logs:**
   - Vercel → Deployments → Functions
   - Try to register
   - See the exact error

2. **Check Neon Database:**
   - Go to Neon Console
   - Check if database is active
   - Try running a simple query in SQL Editor

3. **Verify Build:**
   - Check build logs show Prisma generate running
   - Check no build errors

4. **Test Connection String:**
   - Copy DATABASE_URL from Vercel
   - Try connecting via psql or Neon console

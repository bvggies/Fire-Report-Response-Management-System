# 🚀 START HERE - Deployment Guide

Your project is **ready to deploy**! Follow these steps in order.

## ✅ What's Ready

- ✅ Code is configured for Vercel + Neon + GitHub
- ✅ Google Maps API Key: `AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44`
- ✅ All build scripts configured
- ✅ Documentation prepared

## 📋 Deployment Steps (10 minutes)

### 1️⃣ Set Up Neon Database (2 min)

1. Go to **[neon.tech](https://neon.tech)** and create account
2. Click **"Create Project"**
3. Choose region closest to you
4. **Copy the connection string** (looks like `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`)
5. **SAVE IT** - you'll paste this into Vercel

### 2️⃣ Push to GitHub (1 min) ✅ DONE!

✅ **Code already pushed to GitHub!**  
✅ **Repository**: https://github.com/bvggies/Fire-Report-Response-Management-System  
✅ **50 files committed and pushed**

You can skip this step and move to Step 3!

### 3️⃣ Deploy to Vercel (5 min)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Select your GitHub repository
4. **Before clicking Deploy**, click **"Environment Variables"**
5. Add these 4 variables:

   **Variable 1: DATABASE_URL** ✅
   - Key: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 2: NEXTAUTH_URL**
   - Key: `NEXTAUTH_URL`
   - Value: `https://your-app-name.vercel.app`
   - Note: Update with actual URL after first deploy!
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 3: NEXTAUTH_SECRET** ✅
   - Key: `NEXTAUTH_SECRET`
   - Value: `wO3UgWpcED/jI6+v/EYGG5uiIaE84Fft9x7og9+5FKs=`
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 4: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY** ✅
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: `AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44`
   - Environments: ✓ Production ✓ Preview ✓ Development

6. Click **"Deploy"** 🚀
7. Wait 2-3 minutes for build to complete
8. **Copy your deployment URL** (e.g., `https://your-app.vercel.app`)

### 4️⃣ Update NEXTAUTH_URL (1 min)

1. Go back to Vercel → Your Project → Settings → Environment Variables
2. Edit `NEXTAUTH_URL`
3. Change value to your actual Vercel URL: `https://your-actual-app.vercel.app`
4. Save
5. This will trigger a redeploy automatically

### 5️⃣ Set Up Database Schema (1 min)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables to local file
vercel env pull .env.local

# Push database schema to Neon
npx prisma db push
```

You should see: `✅ Your database is now in sync with your Prisma schema`

### 6️⃣ Restrict Google Maps API Key (2 min)

1. Go to **[Google Cloud Console](https://console.cloud.google.com)**
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"**
   - Add: `https://your-app.vercel.app/*`
   - Add: `http://localhost:3000/*` (for local development)
5. Click **"Save"**

### 7️⃣ Create Admin User (1 min)

**Option 1: Use Seed Script (Recommended)**
```bash
# Pull environment variables first
vercel env pull .env.local

# Run seed script to create admin account
npm run db:seed
```

This creates:
- **Email:** `admin@fireresponse.com`
- **Password:** `Admin@123`
- **Role:** `SUPER_ADMIN`

**Option 2: Manual SQL (Alternative)**
1. Go to **[Neon Console](https://console.neon.tech)**
2. Click on your project → **SQL Editor**
3. Run this query (replace with your email):
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```

**⚠️ Important:** Change the default password after first login!

See [ADMIN_ACCOUNT.md](./ADMIN_ACCOUNT.md) for more details.

## ✅ Testing Checklist

After deployment, test these:

- [ ] Homepage loads
- [ ] Can report a fire incident
- [ ] GPS location works (click "Report Fire")
- [ ] Can track a report
- [ ] Can login/register
- [ ] Admin dashboard loads (after login)
- [ ] Map view works
- [ ] Analytics page loads
- [ ] Super admin panel accessible

## 🎉 Done!

Your Fire Report & Response Management System is now live!

**App URL:** `https://your-app.vercel.app`

## 🆘 Need Help?

- **Build failed?** Check build logs in Vercel dashboard
- **Database error?** Verify DATABASE_URL is correct
- **Maps not loading?** Check API key restrictions in Google Cloud
- **Can't login?** Verify NEXTAUTH_SECRET and NEXTAUTH_URL are correct

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

---

**Next:** Share your deployed URL and start reporting fires! 🔥

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

### 2️⃣ Push to GitHub (1 min)

```bash
# If you haven't done this yet:
git add .
git commit -m "Ready for deployment"
git push origin main
```

**OR** if you haven't created the GitHub repo yet:

```bash
# Initialize git (if needed)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy to Vercel (5 min)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Select your GitHub repository
4. **Before clicking Deploy**, click **"Environment Variables"**
5. Add these 4 variables:

   **Variable 1: DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: `[Paste your Neon connection string]`
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 2: NEXTAUTH_URL**
   - Key: `NEXTAUTH_URL`
   - Value: `https://your-app-name.vercel.app`
   - Note: Update with actual URL after first deploy!
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 3: NEXTAUTH_SECRET**
   - Key: `NEXTAUTH_SECRET`
   - Value: Generate one with:
     ```bash
     openssl rand -base64 32
     ```
   - Environments: ✓ Production ✓ Preview ✓ Development

   **Variable 4: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
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

1. Visit your deployed site: `https://your-app.vercel.app/register`
2. Create a new account with your email
3. Go to **[Neon Console](https://console.neon.tech)**
4. Click on your project → **SQL Editor**
5. Run this query (replace with your email):
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```
6. Refresh your app and log in - you should now have admin access!

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

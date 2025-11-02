# 🚀 Trigger Vercel Deployment

If Vercel isn't automatically building, use one of these methods:

## Method 1: Force Redeploy in Vercel Dashboard

1. Go to https://vercel.com
2. Select your project
3. Go to **Deployments** tab
4. Click **three dots** (⋯) on the latest deployment
5. Click **Redeploy**
6. Wait for build to complete

## Method 2: Push Empty Commit

```bash
git commit --allow-empty -m "trigger: Force Vercel rebuild with latest updates"
git push origin main
```

## Method 3: Check Vercel Auto-Deploy Settings

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Git**
3. Verify:
   - ✅ Auto-Deploy is enabled
   - ✅ Connected to correct GitHub repo
   - ✅ Branch is set to `main` (or your main branch)
   - ✅ Webhook is active

## Method 4: Manual Deployment

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → **Create Deployment**
3. Select branch: `main`
4. Click **Deploy**

## After Deployment

1. **Check Build Logs** for errors
2. **Update Database** with new `HomePageContent` table (see `docs/VERCEL_BUILD_FIX.md`)
3. **Test** the deployed site


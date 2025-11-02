# ✅ Neon Database Connected!

Your Neon database is ready! Here's your connection string:

```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🔐 Add to Vercel Environment Variables

### Step 1: Go to Vercel Project Settings

1. Open your Vercel project dashboard
2. Click on your project (or create new project if not done yet)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add DATABASE_URL

1. Click **"Add New"**
2. **Variable Name**: `DATABASE_URL`
3. **Value**: 
   ```
   postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Environments**: 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **"Save"**

## 📝 Complete Environment Variables Checklist

Make sure you have ALL 4 variables in Vercel:

### ✅ 1. DATABASE_URL
```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### ⏳ 2. NEXTAUTH_URL
After first deployment, update this to your actual Vercel URL:
```
https://your-app-name.vercel.app
```

### ✅ 3. NEXTAUTH_SECRET
Generated secret (copy this):
```
wO3UgWpcED/jI6+v/EYGG5uiIaE84Fft9x7og9+5FKs=
```

Or generate your own with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### ✅ 4. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44
```

## 🚀 After Adding Variables

1. **Save all environment variables**
2. If project already exists, click **"Redeploy"** or push a new commit
3. Wait for deployment to complete
4. Then run database setup (next section)

## 🗄️ Set Up Database Schema

After your first deployment succeeds:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables locally
vercel env pull .env.local

# Push database schema to Neon
npx prisma db push
```

**Expected output:**
```
✅ Your database is now in sync with your Prisma schema
```

## ✅ Next Steps

After database schema is set up:

1. **Create Admin User**
   - Visit: `https://your-vercel-url.vercel.app/register`
   - Register an account
   - Update role in Neon SQL Editor:
     ```sql
     UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
     ```

2. **Restrict Google Maps API Key**
   - Go to Google Cloud Console
   - Add your Vercel domain to allowed referrers

## 🎯 Current Status

- ✅ GitHub: Done
- ✅ Neon Database: Connected
- ⏳ Vercel Environment Variables: Add DATABASE_URL
- ⏳ Vercel Deployment: After variables added
- ⏳ Database Schema: After deployment
- ⏳ Final Setup: Create admin user

You're almost there! 🚀

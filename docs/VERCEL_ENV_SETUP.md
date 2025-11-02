# 🔧 Vercel Environment Variables Setup

## Quick Copy-Paste for Vercel

### Variable 1: DATABASE_URL ✅
```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Variable 2: NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
**Note:** Update this with your actual Vercel URL after first deployment

### Variable 3: NEXTAUTH_SECRET
Generate one now (choose one method):

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Linux/Mac/Windows (with OpenSSL):**
```bash
openssl rand -base64 32
```

**Or use this generated one** (ready to copy):
```
wO3UgWpcED/jI6+v/EYGG5uiIaE84Fft9x7og9+5FKs=
```

Copy the output and paste as the value.

### Variable 4: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44
```

## 📋 Step-by-Step in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Open your project (or create new one)

2. **Navigate to Environment Variables**
   - Click on your project
   - Go to **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add Each Variable**
   
   For each variable:
   - Click **"Add New"**
   - Enter the **Key** (variable name)
   - Paste the **Value**
   - Select all environments (Production, Preview, Development)
   - Click **"Save"**

4. **Verify All 4 Variables Are Added**
   - ✅ DATABASE_URL
   - ✅ NEXTAUTH_URL (update after deploy)
   - ✅ NEXTAUTH_SECRET
   - ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

5. **Deploy or Redeploy**
   - If new project: Click **"Deploy"**
   - If existing: Push a commit or click **"Redeploy"**

## 🔍 Verify Connection

After deployment, check build logs:
- Should see: "Prisma Client generated"
- Should see: "Build completed successfully"
- No database connection errors

## 🐛 Troubleshooting

**"Database connection failed"**
- Double-check DATABASE_URL is exactly as shown above
- Make sure `?sslmode=require` is at the end
- Verify Neon database is not paused (check Neon dashboard)

**"Prisma Client not generated"**
- Build should auto-generate it
- Check build logs for errors
- Can manually run: `npx prisma generate`

**"Environment variable not found"**
- Make sure variable name matches exactly (case-sensitive)
- Ensure it's added to all environments (Production, Preview, Development)
- Redeploy after adding variables

## ✅ Ready to Deploy!

Once all variables are added, your app will:
1. Connect to Neon database ✅
2. Authenticate users ✅
3. Load Google Maps ✅
4. Be fully functional! 🎉

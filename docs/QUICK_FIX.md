# ⚡ Quick Fix: "Internal Server Error" on Login/Register

## 🎯 Most Likely Causes (in order)

### 1. Database Not Set Up (90% of cases)

**Fix:**
```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npx prisma db push
```

### 2. Missing DATABASE_URL

**Local Development:**
```bash
# Create .env.local
echo 'DATABASE_URL="postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"' > .env.local
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env.local
echo 'NEXTAUTH_SECRET="wO3UgWpcED/jI6+v/EYGG5uiIaE84Fft9x7og9+5FKs="' >> .env.local

# Restart server
npm run dev
```

**Vercel:**
1. Go to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon connection string
3. Redeploy

### 3. Prisma Client Not Generated

**Fix:**
```bash
npm run db:generate
# Then restart your dev server
```

### 4. Neon Database Paused

Free tier Neon databases pause after inactivity.

**Fix:**
1. Go to [Neon Console](https://console.neon.tech)
2. Wake up your database (just open it)
3. Try again

## 🔍 How to Check What's Wrong

**Check browser console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Try to register/login
4. Look for error messages

**Check server logs:**
- Local: Check terminal where `npm run dev` runs
- Vercel: Check Functions logs in deployment

## ✅ Complete Reset (if nothing works)

```bash
# Stop server (Ctrl+C)

# Remove build artifacts
rm -rf .next node_modules/.cache

# Reinstall dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema
npx prisma db push

# Start server
npm run dev
```

## 🎯 Test Database Connection

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Connected!'))
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => prisma.\$disconnect());
"
```

If this fails → Database connection issue  
If this works → Check Prisma Client generation

## 📞 Still Stuck?

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed steps
2. Verify your `.env.local` file exists and has correct values
3. Make sure you restarted the dev server after adding env variables
4. Check that Neon database is not paused

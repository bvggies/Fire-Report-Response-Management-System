# 🔧 Troubleshooting Guide

## "Internal Server Error" on Login/Register

This error usually means a database connection issue. Follow these steps:

### Step 1: Check Environment Variables

**Local Development:**
1. Make sure you have a `.env.local` file in the project root
2. Verify `DATABASE_URL` is set:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. Check `NEXTAUTH_SECRET` is set
4. Restart your dev server after adding env variables

**Vercel Production:**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Verify all 4 variables are set:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Make sure they're added to all environments (Production, Preview, Development)
4. Redeploy after adding variables

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

Or:
```bash
npx prisma generate
```

### Step 3: Push Database Schema

**Local:**
```bash
npx prisma db push
```

**Production (after pulling env vars):**
```bash
vercel env pull .env.local
npx prisma db push
```

### Step 4: Test Database Connection

Create a test file `test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    const count = await prisma.user.count()
    console.log(`📊 Users in database: ${count}`)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
```

Run:
```bash
node test-db.js
```

### Step 5: Check Server Logs

**Local:**
Check your terminal where `npm run dev` is running

**Vercel:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on the latest deployment
5. Click "Functions" tab
6. Check for error logs

### Step 6: Common Issues & Solutions

#### Issue: "Prisma Client not generated"
**Solution:**
```bash
npm run db:generate
# Then restart server
```

#### Issue: "Can't reach database server"
**Solutions:**
- Check if Neon database is paused (free tier pauses after inactivity)
- Verify DATABASE_URL is correct (check for typos)
- Ensure `?sslmode=require` is at the end of connection string
- Check if your IP needs to be whitelisted (Neon usually allows all)

#### Issue: "Table does not exist"
**Solution:**
```bash
npx prisma db push
```

#### Issue: "Environment variable not found"
**Solution:**
- Make sure `.env.local` exists (local)
- Verify variables in Vercel (production)
- Restart dev server after adding variables

#### Issue: "bcrypt error"
**Solution:**
```bash
npm install bcryptjs @types/bcryptjs
```

### Step 7: Verify Database Schema

Check if tables exist:
```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

### Step 8: Manual Database Check

**Neon Console:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project
3. Go to "SQL Editor"
4. Run:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   
Should show: `User`, `Incident`, `FireStation`, `Personnel`, `Assignment`

## Still Having Issues?

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run db:generate
   ```

2. **Check Prisma version:**
   ```bash
   npx prisma --version
   ```
   Should be 5.x

3. **Verify Node version:**
   ```bash
   node --version
   ```
   Should be 18+ (for Vercel, use Node 18.x)

4. **Test connection string:**
   ```bash
   # Test PostgreSQL connection
   psql "your-database-url"
   ```

## Quick Fix Commands

```bash
# Complete reset (local)
rm -rf node_modules .next .env.local
npm install
cp .env.production.example .env.local
# Edit .env.local with your values
npm run db:generate
npx prisma db push
npm run dev
```

## Getting Better Error Messages

The code now shows more detailed errors in development mode. Check:
- Browser console (F12)
- Terminal/server logs
- Vercel function logs

If errors are still generic, the issue is likely:
1. Database connection
2. Missing Prisma Client
3. Wrong environment variables

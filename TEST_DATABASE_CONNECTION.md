# 🧪 Test Database Connection

Your DATABASE_URL looks correct! Let's test the actual connection.

## Quick Connection Test

### Option 1: Test in Neon Console (Verify Database Works)

```sql
SELECT NOW(), current_database(), version();
```

If this works → Database is fine, issue is with Prisma/Vercel connection

### Option 2: Test from Your Local Machine

```bash
# Make sure .env.local has DATABASE_URL
cd "d:\Fire Report & Response Management System"

# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return prisma.\$disconnect();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    console.error('Code:', e.code);
    process.exit(1);
  });
"
```

### Option 3: Check Vercel Function Logs

1. **Go to Vercel Dashboard**
2. **Your Project → Deployments**
3. **Latest deployment → Functions tab**
4. **Try to register/login**
5. **Check the exact error in logs**

Look for:
- `P1001` = Can't reach database server
- `P1000` = Authentication failed  
- Connection timeout
- SSL errors

## 🔧 Possible Fixes

### Fix 1: Check if Database is Paused

**Neon free tier auto-pauses after inactivity**

1. Go to [Neon Console](https://console.neon.tech)
2. Click on your project
3. If it shows "Paused" → Click to wake it up
4. Wait 2-3 seconds
5. Try again

### Fix 2: Use Direct Connection (Alternative)

If pooled connection fails, try direct connection:

**In Neon Console → Connection Details:**
- Use **"Direct connection"** (not pooled)
- Copy that connection string
- Update DATABASE_URL in Vercel

**Direct connection format:**
```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```
(Note: No `-pooler` in hostname)

### Fix 3: Check Connection Pool Limits

Neon free tier has connection limits. For serverless (Vercel), pooled connection is recommended.

### Fix 4: Verify DATABASE_URL is Loaded

**Add temporary logging** (remove after testing):

In `lib/prisma.ts`, add:
```typescript
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL format:', process.env.DATABASE_URL?.includes('?sslmode=require'))
```

Then check Vercel function logs to see if it's loaded.

## 📊 Diagnostic Checklist

- [ ] Database is active (not paused) in Neon
- [ ] DATABASE_URL format is correct (has `?sslmode=require`)
- [ ] Using pooled connection (`-pooler` in hostname)
- [ ] Environment variable saved in Vercel
- [ ] Redeployed after env var change
- [ ] Checked Vercel function logs for exact error

## 🎯 Next Steps

1. **Check Vercel Function Logs** for the exact error code
2. **Wake up Neon database** if paused
3. **Try direct connection** if pooled fails
4. **Share the exact error** from Vercel logs

---

**Most likely:** Database is paused or connection pool issue. Check Neon console first!

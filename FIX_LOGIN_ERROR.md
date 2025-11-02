# 🔧 Fix "Internal Server Error" on Login/Register

## ⚡ Quick Fix (Try This First)

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push database schema  
npx prisma db push

# 3. Test database connection
npm run db:test

# 4. Restart dev server
npm run dev
```

## 🔍 Diagnosis Steps

### Step 1: Test Database Connection

```bash
npm run db:test
```

This will tell you exactly what's wrong:
- ✅ If it works → Issue is with Prisma Client generation
- ❌ If it fails → Shows specific database error

### Step 2: Check Environment Variables

**Local (.env.local):**
```bash
cat .env.local
```

Should show:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

**Vercel:**
- Go to Vercel → Settings → Environment Variables
- Verify all 4 variables are set

### Step 3: Check Error Messages

**After the fix, error messages are now more detailed:**

- **"Database connection error"** → DATABASE_URL issue
- **"Email already exists"** → User already registered
- **"Invalid email or password"** → Wrong credentials
- Check browser console (F12) for detailed errors

## 🎯 Common Fixes

### Fix 1: Database Not Initialized

```bash
npm run db:generate
npx prisma db push
```

### Fix 2: Missing DATABASE_URL

**Local:**
```bash
# Create .env.local if it doesn't exist
echo 'DATABASE_URL="postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"' > .env.local
```

**Vercel:**
Add in Environment Variables section

### Fix 3: Prisma Client Not Generated

```bash
rm -rf node_modules/.prisma
npm run db:generate
```

### Fix 4: Neon Database Paused

1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project
3. Wait a few seconds for it to wake up
4. Try again

## 📊 What Changed

✅ **Better error messages** - Now shows specific errors in development
✅ **Database connection test** - `npm run db:test` to diagnose
✅ **Error handling** - Catches and reports database errors properly
✅ **Console logging** - Check browser/server console for details

## 🚀 After Fixing

1. **Test registration:**
   - Go to `/register`
   - Create an account
   - Should work now!

2. **Test login:**
   - Go to `/login`
   - Use credentials you just created
   - Should redirect to dashboard

3. **If still errors:**
   - Check browser console (F12)
   - Check server terminal/logs
   - Run `npm run db:test` again
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 Quick Reference

| Error | Solution |
|-------|----------|
| "Internal server error" | Run `npm run db:push` |
| "Database connection error" | Check DATABASE_URL |
| "Prisma Client not generated" | Run `npm run db:generate` |
| "Table does not exist" | Run `npx prisma db push` |
| "Can't reach database" | Wake up Neon database |

## ✅ Success Indicators

- `npm run db:test` shows ✅
- Registration creates user successfully
- Login redirects to dashboard
- No errors in console

---

**Still stuck?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed steps!

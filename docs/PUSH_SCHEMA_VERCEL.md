# 🗄️ Push Database Schema to Neon (Vercel Deployment)

## Quick Commands

```bash
# Step 1: Install Vercel CLI (if not installed)
npm i -g vercel

# Step 2: Login to Vercel
vercel login

# Step 3: Pull environment variables from Vercel
vercel env pull .env.local

# Step 4: Push database schema to Neon
npx prisma db push

# Step 5: Verify (optional)
npm run db:test
```

## What This Does

1. **Pulls env vars** - Gets your DATABASE_URL from Vercel
2. **Pushes schema** - Creates all tables in Neon database
3. **Creates tables:**
   - User
   - Incident  
   - FireStation
   - Personnel
   - Assignment

## Expected Output

```
✔ Generated Prisma Client

Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public"

✔ Your database is now in sync with your Prisma schema.
```

## After Success

✅ Your Vercel app should now work!
- Try registering a user
- Try logging in
- Should work without "Database connection error"

## Troubleshooting

**"Environment variable not found"**
- Make sure you ran `vercel env pull .env.local`
- Check `.env.local` file exists and has DATABASE_URL

**"Can't reach database server"**
- Wake up Neon database (open in Neon console)
- Check DATABASE_URL is correct

**"Already in sync"**
- That's good! Schema already pushed
- Try the app, should work now

## Next Steps After Schema Push

1. **Test registration:**
   - Visit your Vercel URL
   - Go to `/register`
   - Create an account

2. **Create admin user:**
   ```bash
   npm run db:seed
   ```
   Or manually via Neon SQL Editor:
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```

3. **Test login:**
   - Go to `/login`
   - Use your credentials
   - Should redirect to dashboard

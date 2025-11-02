# 🔧 Quick Guide: Create Admin Account

## Option 1: Use Seed Script (Recommended)

After database is set up, run:

```bash
npm run db:seed
```

This creates:
- Admin: `admin@fireresponse.com` / `Admin@123`
- Sample fire station
- Sample personnel

## Option 2: Manual SQL (Neon Console)

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Open **SQL Editor**
4. Run this (replace password hash):

```sql
-- Generate password hash first (use Node.js):
-- node -e "console.log(require('bcryptjs').hashSync('Admin@123', 10))"

INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@fireresponse.com',
  'System Administrator',
  '$2a$10$YOUR_HASHED_PASSWORD_HERE',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

## Option 3: Via Registration + Update (Easiest)

1. Register normally: `https://your-app.vercel.app/register`
2. Use your email
3. Then update role in Neon SQL:
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```

## Option 4: Prisma Studio

```bash
# Pull env vars first
vercel env pull .env.local

# Open Prisma Studio
npx prisma studio

# Then manually create user via UI
```

## ✅ Quick Command Reference

```bash
# Install dependencies (if tsx not installed)
npm install

# Seed database (creates admin account)
npm run db:seed

# Check if admin exists
npm run db:studio
```

## 🎯 Recommended Flow

1. **Deploy to Vercel** ✅
2. **Set up database schema**: `npx prisma db push`
3. **Run seed script**: `npm run db:seed`
4. **Login with admin credentials**
5. **Change password** (via UI or database)

---

**Default Admin:**  
Email: `admin@fireresponse.com`  
Password: `Admin@123`  
⚠️ **Change after first login!**

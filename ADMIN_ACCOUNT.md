# 👤 Sample Admin Account

A sample admin account has been created for easy access to the system.

## 🔑 Default Admin Credentials

**Email:** `admin@fireresponse.com`  
**Password:** `Admin@123`  
**Role:** `SUPER_ADMIN`

## ⚠️ Security Warning

**Change this password immediately after first login in production!**

These are default credentials for initial setup only.

## 🚀 How to Use

### Local Development

After setting up your database:

```bash
# Make sure your .env.local has DATABASE_URL
npm run db:push
npm run db:seed
```

### Production (Vercel + Neon)

After deploying to Vercel:

```bash
# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma db push

# Seed the database
npm run db:seed
```

Or manually via Neon SQL Editor:

```sql
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_001',
  'admin@fireresponse.com',
  'System Administrator',
  '$2a$10$...', -- You'll need to hash the password with bcrypt
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

## 📋 What Gets Created

The seed script creates:

1. **Admin User**
   - Email: `admin@fireresponse.com`
   - Role: `SUPER_ADMIN`
   - Full admin access to all features

2. **Sample Fire Station**
   - Name: "Central Fire Station"
   - Address: "123 Main Street, City, State 12345"
   - Capacity: 50

3. **Sample Personnel**
   - Name: "John Firefighter"
   - Badge: "FF-001"
   - Rank: "Captain"
   - Assigned to Central Fire Station

## 🔄 Running Seed Again

The seed script is safe to run multiple times:
- It checks if the admin user already exists
- Won't create duplicates
- Only creates if not present

## 🛠️ Customizing the Seed Script

Edit `prisma/seed.ts` to:
- Change admin email/password
- Add more sample data
- Create additional users/stations/personnel

## 🔐 Changing Admin Password

After logging in with the default password:

1. Log in as admin
2. Go to your profile settings (if implemented)
3. Or manually update via database:
   ```sql
   UPDATE "User" 
   SET password = '$2a$10$NEW_HASHED_PASSWORD' 
   WHERE email = 'admin@fireresponse.com';
   ```

## ✅ Verification

After seeding, verify the admin account:

1. Visit your app: `https://your-app.vercel.app/login`
2. Login with:
   - Email: `admin@fireresponse.com`
   - Password: `Admin@123`
3. You should have access to:
   - Admin Dashboard
   - Super Admin Panel
   - All management features

## 📝 Notes

- The seed script uses bcrypt to hash passwords securely
- Default password meets security requirements (uppercase, lowercase, number, special char)
- Email format should be valid (used for password resets if implemented)

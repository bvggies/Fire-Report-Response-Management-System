# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Maps API key (optional, for map features)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Initialize Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Create First Admin User** (optional)
   
   You can create a super admin user by running a seed script or manually through the registration page, then updating the role in the database.

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Creating a Super Admin User

After registering a user, you can manually update their role in the database:

```bash
npm run db:studio
```

Or use Prisma CLI to update the role:
```bash
npx prisma db execute --stdin
```

Then execute:
```sql
UPDATE User SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
```

## Features

### Public Features
- ✅ Report fire incidents
- ✅ Track incident reports
- ✅ Anonymous reporting option
- ✅ GPS location auto-detection
- ✅ Photo/video upload
- ✅ Emergency hotline quick access

### Admin Features
- ✅ Dashboard with all incidents
- ✅ Filter by status, severity, date
- ✅ Interactive map view
- ✅ Update incident status
- ✅ Incident detail view
- ✅ Analytics dashboard

### Super Admin Features
- ✅ User management
- ✅ Fire station management
- ✅ Personnel management
- ✅ Data export (Excel)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/             # Authentication pages
│   ├── api/                # API routes
│   ├── dashboard/          # Admin dashboard
│   ├── report/             # Report incident page
│   └── track/              # Track report page
├── components/             # React components
├── lib/                    # Utilities and helpers
├── prisma/                 # Database schema
└── types/                  # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Maps**: Google Maps API

## Troubleshooting

### Database Issues
If you encounter database errors, try:
```bash
npm run db:push -- --force-reset
```

### Google Maps Not Loading
Make sure you've added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your `.env` file and restarted the dev server.

### Authentication Issues
Ensure `NEXTAUTH_SECRET` is set and is a valid random string.

## Production Deployment

1. Update `DATABASE_URL` to use a production database (PostgreSQL recommended)
2. Set all environment variables in your hosting platform
3. Build the application:
   ```bash
   npm run build
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Notes

- The app uses SQLite by default for development. For production, use PostgreSQL or MySQL.
- File uploads currently use base64 encoding. For production, integrate with Cloudinary or AWS S3.
- Google Maps API requires billing to be enabled on your Google Cloud account.

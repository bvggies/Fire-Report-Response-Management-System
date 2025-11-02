# Deployment Guide for Vercel + Neon DB + GitHub

This guide will walk you through deploying the Fire Report & Response Management System to Vercel with Neon PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Neon account (sign up at [neon.tech](https://neon.tech))

## Step 1: Set Up Neon Database

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Your Database Connection String**
   - In your Neon dashboard, go to your project
   - Click on "Connection Details"
   - Copy the connection string (it should look like: `postgresql://user:password@host/dbname?sslmode=require`)
   - Save this for later

3. **Run Initial Migration (Optional)**
   ```bash
   # Set your DATABASE_URL
   export DATABASE_URL="your-neon-connection-string"
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npx prisma db push
   ```

## Step 2: Push Code to GitHub

1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `fire-report-system`)
   - Don't initialize with README
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select your repository

2. **Configure Environment Variables**
   
   In the Vercel project settings, add these environment variables:

   ```
   DATABASE_URL=your-neon-connection-string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-a-random-secret-here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name (optional)
   CLOUDINARY_API_KEY=your-cloudinary-api-key (optional)
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret (optional)
   ```

   **To generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Configure Build Settings**
   
   In Vercel project settings → Settings → General:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (Vercel auto-detects)
   - Install Command: `npm install`
   - Output Directory: `.next` (auto-detected)

4. **Add Build Step for Prisma**
   
   In Vercel project settings → Settings → Build & Development Settings:
   - Add a new build command:
     ```
     npm install && npx prisma generate && npm run build
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

## Step 4: Set Up Database Migrations

After first deployment, you need to run migrations:

1. **Option 1: Via Vercel CLI (Recommended)**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Option 2: Via Neon Dashboard**
   - Connect to your Neon database
   - Run the migration SQL manually (not recommended)

3. **Option 3: Add Post-Deploy Hook**
   
   Update `vercel.json` or use Vercel's Post-Deploy hook to run migrations automatically.

## Step 5: Post-Deployment Setup

1. **Create First Super Admin User**
   
   You can do this by:
   - Registering a user through the app
   - Then updating the role in Neon database:
     ```sql
     UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
     ```
   
   Or use Prisma Studio:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma studio
   ```

2. **Verify Deployment**
   - Visit your Vercel URL
   - Test the report form
   - Test login/register
   - Check admin dashboard

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL` | Your Vercel app URL | Yes | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes | Random 32+ character string |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes | `AIza...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No | For file uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No | For file uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No | For file uploads |

## Setting Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to:
   - Application restrictions: HTTP referrers
   - Website restrictions: Add your Vercel domain
6. Copy the API key and add it to Vercel environment variables

## Troubleshooting

### Build Fails on Vercel

**Error: "Prisma Client not generated"**
- Solution: Add `npx prisma generate` to build command

**Error: "Database connection failed"**
- Check DATABASE_URL is correctly set
- Ensure Neon database allows connections from Vercel IPs
- Check if database is paused (Neon free tier pauses after inactivity)

### Database Connection Issues

**Connection timeout**
- Neon free tier databases auto-pause after inactivity
- First request after pause may take a few seconds
- Consider upgrading to paid tier for always-on database

**SSL required error**
- Ensure connection string includes `?sslmode=require`
- Neon requires SSL connections

### Migration Issues

**Migrations not running**
- Add `npx prisma migrate deploy` to build command
- Or run manually after deployment via Vercel CLI

## Monitoring

- **Vercel Analytics**: Available in Vercel dashboard
- **Neon Metrics**: Check database performance in Neon dashboard
- **Error Tracking**: Consider adding Sentry or similar

## Auto-Deployments

Once set up, every push to your main branch will automatically:
1. Trigger a new Vercel deployment
2. Run Prisma generate
3. Build the Next.js app
4. Deploy to production

## Useful Commands

```bash
# View Vercel logs
vercel logs

# Run migrations locally
DATABASE_URL="your-neon-url" npx prisma migrate deploy

# Open Prisma Studio
DATABASE_URL="your-neon-url" npx prisma studio

# Check deployment status
vercel ls

# View environment variables
vercel env ls
```

## Support

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

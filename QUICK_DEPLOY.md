# 🚀 Quick Deploy Guide - Vercel + Neon + GitHub

Follow these steps to deploy your Fire Report System in under 10 minutes!

## Step 1: Set Up Neon Database (2 min)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Copy your connection string (starts with `postgresql://`)
4. **Save it** - you'll need it in Step 3

## Step 2: Push to GitHub (1 min)

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (5 min)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Configure Environment Variables** (click "Environment Variables"):

   Add these one by one:

   ```
   DATABASE_URL
   = postgresql://user:pass@host/db?sslmode=require
   (Paste your Neon connection string here)
   
   NEXTAUTH_URL
   = https://your-app-name.vercel.app
   (Vercel will show you the URL after first deploy)
   
   NEXTAUTH_SECRET
   = [Generate using: openssl rand -base64 32]
   
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   = AIzaSyAlZf-pquN6QfRWxSVEN8MVFYTDWMVq_44
   (Your key is saved in YOUR_API_KEY.md)
   ```

5. **Set Build Command** (Settings → General → Build & Development Settings):
   
   Build Command: `npm run build`
   
   Install Command: `npm install`

6. Click **"Deploy"** 🚀

## Step 4: Set Up Database Schema (1 min)

After first deployment, run:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables
vercel env pull .env.local

# Run database migrations
npx prisma migrate deploy
```

Or use Vercel's Post-Deploy hook (see DEPLOYMENT.md)

## Step 5: Create Admin User (1 min)

1. Visit your deployed site: `https://your-app.vercel.app/register`
2. Register a new account
3. Connect to your Neon database via their dashboard
4. Run this SQL:
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
   ```

## Step 6: Set Up Google Maps API (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/Select a project
3. Enable "Maps JavaScript API"
4. Create API Key
5. **Important**: Restrict the key:
   - Application restrictions: HTTP referrers
   - Add: `https://your-app.vercel.app/*`
   - Add: `http://localhost:3000/*` (for local dev)
6. Add the key to Vercel environment variables
7. Redeploy (Vercel does this automatically on env var changes)

## ✅ Done!

Your app should now be live! Visit your Vercel URL to test it.

## Troubleshooting

**"Database connection failed"**
- Check DATABASE_URL in Vercel environment variables
- Neon databases auto-pause - first request may be slow
- Ensure connection string includes `?sslmode=require`

**"Prisma Client not generated"**
- Check build logs in Vercel
- Ensure `postinstall` script runs (it's in package.json)

**"Maps not loading"**
- Check Google Maps API key is set
- Verify API restrictions allow your domain
- Check browser console for errors

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

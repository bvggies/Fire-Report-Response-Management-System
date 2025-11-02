# Environment Variables Template

Copy these to your Vercel project settings or `.env.local` for local development.

## Required Variables

### Database (Neon)
```
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```
**Where to get**: Neon dashboard → Your project → Connection Details

### NextAuth Configuration
```
NEXTAUTH_URL=https://your-app.vercel.app
```
**For local dev**: `http://localhost:3000`  
**For production**: Your Vercel deployment URL

```
NEXTAUTH_SECRET=your-random-secret-here
```
**Generate with**: `openssl rand -base64 32`

### Google Maps API
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
**Where to get**: 
1. Google Cloud Console → APIs & Services → Credentials
2. Create API Key
3. Enable "Maps JavaScript API"
4. Restrict to your domains

## Optional Variables

### Cloudinary (for file uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
**Where to get**: cloudinary.com → Dashboard → Account Details

## Setting Up in Vercel

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable above
4. Select environments (Production, Preview, Development)
5. Click "Save"

## Local Development Setup

1. Create `.env.local` in project root
2. Copy variables from above
3. Update values for local development:
   - `DATABASE_URL`: Your Neon connection string (same as production)
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `NEXTAUTH_SECRET`: Generate new one or reuse production
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Same as production

## Security Notes

⚠️ **Never commit** `.env.local` to git  
⚠️ **Never share** your `NEXTAUTH_SECRET` publicly  
⚠️ **Restrict** Google Maps API key to your domains  
⚠️ **Use different** secrets for dev/staging/production  

## Verification

After setting up, verify:

```bash
# Check if variables are loaded (local)
npm run dev
# Should start without errors

# Check Vercel deployment
# Build logs should not show "undefined" for any variable
```

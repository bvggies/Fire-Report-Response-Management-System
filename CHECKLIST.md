# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment

### Neon Database
- [ ] Created Neon account and project
- [ ] Copied database connection string
- [ ] Tested connection locally (optional)
- [ ] Noted that connection string includes `?sslmode=require`

### GitHub
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Main/master branch is up to date

### Google Maps API
- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Created API key
- [ ] API key restrictions configured (HTTP referrers)
- [ ] Added localhost:3000 to allowed referrers
- [ ] Will add Vercel domain after deployment

### Vercel Account
- [ ] Signed up/logged into Vercel
- [ ] Connected GitHub account

## Deployment Steps

### During Vercel Setup
- [ ] Imported GitHub repository
- [ ] Added environment variable: `DATABASE_URL` (Neon connection string)
- [ ] Added environment variable: `NEXTAUTH_URL` (https://your-app.vercel.app)
- [ ] Generated `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- [ ] Added environment variable: `NEXTAUTH_SECRET`
- [ ] Added environment variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] Set Build Command: `npm run build`
- [ ] Set Install Command: `npm install`
- [ ] Clicked "Deploy"

### Post-Deployment

#### Database Setup
- [ ] Build completed successfully
- [ ] Pulled environment variables locally: `vercel env pull .env.local`
- [ ] Ran: `npx prisma generate`
- [ ] Ran: `npx prisma db push`
- [ ] Verified tables created in Neon dashboard

#### Google Maps
- [ ] Updated Google Maps API key restrictions
- [ ] Added Vercel domain to allowed referrers
- [ ] Verified maps load on deployed site

#### Admin User
- [ ] Registered test user account
- [ ] Connected to Neon database
- [ ] Updated user role to SUPER_ADMIN via SQL:
  ```sql
  UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
  ```
- [ ] Tested admin login

#### Testing
- [ ] Homepage loads correctly
- [ ] Can submit fire report (test form)
- [ ] GPS location detection works
- [ ] Can track report with incident ID
- [ ] Login/Register works
- [ ] Admin dashboard accessible (after login)
- [ ] Map view loads
- [ ] Analytics page loads
- [ ] Super admin panel accessible

#### Final Checks
- [ ] Environment variables are set (not sensitive data in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Database is accessible from Vercel
- [ ] All features working as expected
- [ ] Error logs checked in Vercel dashboard

## Troubleshooting Checklist

If something isn't working:

### Database Issues
- [ ] Check DATABASE_URL is correct in Vercel
- [ ] Verify Neon database is not paused
- [ ] Check connection string format
- [ ] Ensure SSL is required (`?sslmode=require`)

### Build Issues
- [ ] Check build logs in Vercel
- [ ] Verify Prisma generate runs (check postinstall script)
- [ ] Ensure all dependencies are in package.json
- [ ] Check for TypeScript errors

### Authentication Issues
- [ ] Verify NEXTAUTH_SECRET is set
- [ ] Check NEXTAUTH_URL matches actual deployment URL
- [ ] Ensure cookies are enabled in browser

### Maps Not Loading
- [ ] Verify API key is set correctly
- [ ] Check API restrictions allow your domain
- [ ] Check browser console for errors
- [ ] Verify API key has billing enabled (if required)

### Environment Variables
- [ ] All required variables are set
- [ ] Variable names are correct (case-sensitive)
- [ ] No typos in values
- [ ] Redeployed after adding new variables

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor Vercel logs for errors
- [ ] Check Neon database metrics
- [ ] Test all major features
- [ ] Verify no unexpected downtime

### Ongoing
- [ ] Regular database backups (Neon handles this)
- [ ] Monitor API usage (Google Maps)
- [ ] Check error rates in Vercel
- [ ] Review user feedback

## Success Criteria

✅ All features work on production  
✅ No console errors  
✅ Database queries execute successfully  
✅ Authentication works  
✅ Maps display correctly  
✅ Admin can manage incidents  
✅ Reports can be submitted and tracked  

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

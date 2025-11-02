# ✅ Vercel Database Connection Checklist

## Quick Verification

### 1. DATABASE_URL Format Check

**Must be exactly this:**
```
postgresql://neondb_owner:npg_uvI9C5shTArk@ep-dawn-night-adoyawgj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Checklist:**
- [ ] Starts with `postgresql://`
- [ ] Has username: `neondb_owner`
- [ ] Has password: `npg_uvI9C5shTArk`
- [ ] Has `-pooler` in hostname (for serverless)
- [ ] Ends with `?sslmode=require`
- [ ] No extra spaces or quotes
- [ ] Database name: `neondb`

### 2. Vercel Environment Variables

**Settings:**
- [ ] Variable name: `DATABASE_URL` (exact, case-sensitive)
- [ ] Value matches the format above
- [ ] Added to: Production ✅ Preview ✅ Development ✅
- [ ] Redeployed after adding/updating

### 3. Neon Database Status

**In Neon Console:**
- [ ] Database shows "Active" (green indicator)
- [ ] Not paused (if paused, click to wake up)
- [ ] Connection string matches Vercel

### 4. Test Connection

**In Neon SQL Editor:**
```sql
SELECT NOW(), current_database();
```
- [ ] Runs successfully
- [ ] Returns timestamp

### 5. Vercel Build Logs

**Check deployment:**
- [ ] Shows "Prisma Client generated"
- [ ] No errors during build
- [ ] DATABASE_URL is available

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Missing `?sslmode=require` | Add to end of DATABASE_URL |
| Database paused | Wake up in Neon console |
| Wrong credentials | Copy fresh from Neon |
| Not redeployed | Redeploy after env var change |
| Connection timeout | Use pooled connection (with `-pooler`) |

## 🔍 Debug Steps

1. **Check exact error in Vercel logs**
2. **Verify DATABASE_URL format**
3. **Test connection in Neon**
4. **Redeploy Vercel**
5. **Check build succeeded**

---

**Share the exact error from Vercel function logs!**

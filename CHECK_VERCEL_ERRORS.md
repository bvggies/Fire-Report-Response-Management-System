# 🔍 Check Vercel Function Logs for Report Submission Error

## Step-by-Step Debugging

### Step 1: Check Vercel Function Logs

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project

2. **Open Deployments**
   - Click "Deployments" tab
   - Click on the **latest deployment**

3. **Check Functions Tab**
   - Click **"Functions"** tab
   - Look for `/api/incidents` function

4. **Trigger Error**
   - Open your Vercel app in another tab
   - Try to submit a report
   - Go back to Functions tab
   - Check the logs - you'll see the **exact error**

### Step 2: Common Errors You'll See

**Error: "relation \"Incident\" does not exist"**
→ **Fix:** Database tables not created
→ **Solution:** Create tables in Neon Console (see PUSH_SCHEMA_MANUAL.md)

**Error: "Can't reach database server"**
→ **Fix:** Database connection issue
→ **Solution:** Check DATABASE_URL, wake up Neon database

**Error: "P1001" or "P1000"**
→ **Fix:** Authentication or connection failed
→ **Solution:** Verify DATABASE_URL credentials

**Error: "P2011" - Null constraint violation**
→ **Fix:** Missing required field
→ **Solution:** Make sure location and description are filled

### Step 3: Quick Test - Verify Tables Exist

**In Neon Console SQL Editor:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- `User`
- `Incident`
- `FireStation`
- `Personnel`
- `Assignment`

**If missing → Create them** (see PUSH_SCHEMA_MANUAL.md)

### Step 4: Test API Directly

**Using Browser Console (on your Vercel site):**

1. Open DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('/api/incidents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'Test Location',
    description: 'Test fire incident description',
    severity: 'MEDIUM'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

This will show the exact error message!

## 🎯 Most Likely Fix

**99% chance:** Tables don't exist

**Quick fix in Neon Console:**
1. Go to [Neon Console](https://console.neon.tech)
2. SQL Editor
3. Run the SQL from `PUSH_SCHEMA_MANUAL.md`
4. Try submitting report again

## ✅ After Fixing

1. Tables created ✅
2. Try submitting report
3. Check browser console for any remaining errors
4. Should redirect to track page with ID

---

**Next:** Check Vercel Function Logs and share the exact error message you see!

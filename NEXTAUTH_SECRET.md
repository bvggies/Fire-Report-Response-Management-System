# 🔐 Generate NEXTAUTH_SECRET

You need a secure random secret for NextAuth. Here are options:

## Option 1: Use Online Generator (Easiest)

1. Go to: https://generate-secret.vercel.app/32
2. Copy the generated secret
3. Use it as your `NEXTAUTH_SECRET` value

## Option 2: Use Node.js (Recommended)

If you have Node.js installed:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Option 3: Use PowerShell (Windows)

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

## Option 4: Manual (Any OS with Node)

Create a temp file `generate-secret.js`:
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('base64'));
```

Then run:
```bash
node generate-secret.js
```

## ✅ Quick Reference

Once generated, add to Vercel as:
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `[your-generated-secret]`
- **Environments**: All (Production, Preview, Development)

## ⚠️ Important

- Keep this secret secure
- Don't commit it to GitHub
- Use different secrets for dev/staging/production (recommended)
- Minimum 32 characters recommended

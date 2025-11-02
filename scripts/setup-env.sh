#!/bin/bash

# Setup script for environment variables

echo "🔥 Fire Report & Response Management System - Environment Setup"
echo "================================================================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo "📝 Please provide the following information:"
echo ""

read -p "Neon Database URL (postgresql://...): " DATABASE_URL
read -p "Your Vercel App URL (e.g., https://your-app.vercel.app) or http://localhost:3000 for local: " NEXTAUTH_URL
read -p "Google Maps API Key: " GOOGLE_MAPS_API_KEY
read -p "Cloudinary Cloud Name (optional, press Enter to skip): " CLOUDINARY_CLOUD_NAME
read -p "Cloudinary API Key (optional, press Enter to skip): " CLOUDINARY_API_KEY
read -p "Cloudinary API Secret (optional, press Enter to skip): " CLOUDINARY_API_SECRET

# Create .env.local
cat > .env.local << EOF
# Database
DATABASE_URL="${DATABASE_URL}"

# NextAuth
NEXTAUTH_URL="${NEXTAUTH_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"

# Cloudinary (Optional)
${CLOUDINARY_CLOUD_NAME:+CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}"}
${CLOUDINARY_API_KEY:+CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}"}
${CLOUDINARY_API_SECRET:+CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}"}
EOF

echo ""
echo "✅ Environment variables saved to .env.local"
echo ""
echo "📦 Next steps:"
echo "   1. Run: npm run db:generate"
echo "   2. Run: npx prisma db push"
echo "   3. Run: npm run dev"
echo ""

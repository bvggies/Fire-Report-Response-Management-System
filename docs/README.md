# 🔥 Online Fire Report & Response Management System

A comprehensive web application for reporting fire incidents, managing responses, and tracking emergency situations.

## 🌟 Features

### User Features
- 🚨 Report fire incidents with location, description, and media
- 📍 Auto-fetch GPS location
- 📊 Track report status in real-time
- 📞 Emergency hotline quick access
- 👤 User accounts with login/register
- 🔒 Anonymous reporting option

### Admin Features
- 📋 Dashboard with all incident reports
- 🔍 Filter by region, severity, or date
- 🗺️ Interactive map with fire locations
- ✏️ Update incident status
- 👥 Assign responders
- 📈 Analytics and statistics

### Super Admin Features
- 👤 Manage users and departments
- 🏢 Manage fire stations and personnel
- 📄 Generate reports (PDF/Excel)

## 🚀 Quick Start

> **🚀 Ready to Deploy?** Start with **[START_HERE.md](./START_HERE.md)** - Complete deployment guide with your API key!

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fire-report-response-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.production.example .env.local
   # Edit .env.local with your values
   ```

4. **Set up database** (Neon PostgreSQL)
   - Create account at [neon.tech](https://neon.tech)
   - Get your connection string
   - Add to `.env.local` as `DATABASE_URL`

5. **Run migrations**
   ```bash
   npm run db:generate
   npx prisma db push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

### Deployment

🚀 **Quick Deploy** (10 minutes): See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

📚 **Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

✅ **Deployment Checklist**: See [CHECKLIST.md](./CHECKLIST.md)

Deploy to:
- ✅ Vercel (Hosting)
- ✅ Neon (PostgreSQL Database)
- ✅ GitHub (Version Control)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + PostgreSQL (Neon)
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Forms**: React Hook Form + Zod

## 📁 Project Structure

```
├── app/              # Next.js app directory
│   ├── (auth)/      # Authentication pages
│   ├── (user)/      # User-facing pages
│   ├── (admin)/     # Admin pages
│   └── api/         # API routes
├── components/       # React components
├── lib/             # Utilities and helpers
├── prisma/          # Database schema
└── public/          # Static assets
```

## 🔐 Environment Variables

Required environment variables:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret for JWT
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

See `.env.production.example` for full list.

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Local development setup
- [Deployment Guide](./DEPLOYMENT.md) - Vercel + Neon deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies for efficient fire incident management and emergency response.
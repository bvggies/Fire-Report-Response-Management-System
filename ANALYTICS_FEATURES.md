# 📊 Analytics & Statistics Features Guide

## Overview
The Fire Report & Response Management System includes comprehensive analytics and statistics features for both **Users** and **Admins**.

## 🎯 User Dashboard Analytics (`/dashboard/my-reports`)

### Statistics Cards (Always Visible)
When you visit "My Reports", you'll see:
1. **📊 Your Statistics & Analytics** section header (always visible)
2. **Statistics Cards:**
   - **Total Reports** - Count of all your submitted reports
   - **Active Reports** - Reports currently in progress
   - **Resolved Reports** - Completed reports
   - **Recent Reports (7 days)** - Reports submitted in the last week

### Charts Section
- **📈 Activity Charts** section header (always visible)
- **Reports Over Time** - Line chart showing your reporting trend
- **Reports by Severity** - Pie chart showing distribution by severity level

### Detailed Metrics
- **Average Resolution Time** - How long it typically takes for your reports to be resolved
- **Status Breakdown** - Count of reports by status (Received, Dispatched, In Progress, etc.)

## 🎯 Admin Dashboard Analytics (`/dashboard`)

### Statistics Cards (Always Visible)
When logged in as Admin/Super Admin, you'll see:
1. **📊 Dashboard Analytics & Statistics** section header (always visible)
2. **6 Key Metrics:**
   - **Total Incidents** - All incidents in the system
   - **Active** - Currently active incidents
   - **Resolved** - Completed incidents
   - **Total Users** - Registered users count
   - **Fire Stations** - Number of fire stations
   - **Resolution Rate** - Percentage of resolved incidents

### Trend Analysis & Charts
- **📈 Trend Analysis** section header (always visible)
- **Incidents Trend (6 Months)** - Line chart showing total vs resolved incidents
- **Incidents by Severity** - Pie chart showing severity distribution

### Performance Metrics
- **📋 Performance Metrics** section header (always visible)
- **Average Resolution Time** - System-wide average
- **Top Reporters** - Top 3 most active reporters with their email
- **Recent (24h)** - Incidents reported in the last 24 hours

## 🔍 How to View Analytics

### For Users:
1. Log in to your account
2. Navigate to **Dashboard** → **My Reports** (`/dashboard/my-reports`)
3. Scroll down to see your statistics and charts

### For Admins:
1. Log in as Admin or Super Admin
2. Go to **Dashboard** (`/dashboard`)
3. The analytics section appears immediately at the top

## 🎨 Visual Features
- **Gradient backgrounds** on statistics cards for better visibility
- **Color-coded metrics** (red for total, orange for active, green for resolved, etc.)
- **Interactive charts** powered by Recharts
- **Responsive design** - works on mobile, tablet, and desktop
- **Smooth animations** using Framer Motion

## 📱 Mobile Optimization
All analytics features are fully optimized for mobile devices:
- Statistics cards stack in a 2-column grid on mobile
- Charts are responsive and adjust to screen size
- Text sizes adapt for smaller screens
- Touch-friendly interface

## 🔧 API Endpoints

### User Analytics
- Endpoint: `/api/analytics/user?userId={userId}`
- Returns: Personal statistics for the logged-in user

### Admin Analytics
- Endpoint: `/api/analytics/admin`
- Returns: System-wide statistics and insights
- Requires: Admin or Super Admin role

## 🐛 Troubleshooting

If you don't see analytics:
1. **Check if you're logged in** - Analytics require authentication
2. **Check your role** - Admin analytics only show for Admin/Super Admin roles
3. **Wait for data** - If you haven't submitted reports yet, you'll see a helpful message
4. **Check browser console** - Look for any API errors
5. **Refresh the page** - Sometimes data needs to reload

## 📊 Data Refresh
- Statistics update automatically when you:
  - Submit a new report
  - Change incident status (for admins)
  - Refresh the page

## 🎯 Features Summary

### User Features:
✅ Personal statistics dashboard
✅ Reports trend chart
✅ Severity distribution chart
✅ Resolution time tracking
✅ Status breakdown

### Admin Features:
✅ System-wide statistics
✅ User count and activity metrics
✅ Fire station count
✅ Resolution rate tracking
✅ Top reporters leaderboard
✅ Monthly trends analysis
✅ Severity distribution analysis

---

**Note:** If statistics don't appear, check the browser console for errors or contact support.


import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's reports
    const totalReports = await prisma.incident.count({
      where: { reporterId: userId },
    })

    // Recent reports (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentReports = await prisma.incident.count({
      where: {
        reporterId: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    // Reports by status
    const byStatusRaw = await prisma.incident.groupBy({
      by: ['status'],
      where: { reporterId: userId },
      _count: {
        id: true,
      },
    })

    const byStatus = byStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))

    // Reports by severity
    const bySeverityRaw = await prisma.incident.groupBy({
      by: ['severity'],
      where: { reporterId: userId },
      _count: {
        id: true,
      },
    })

    const bySeverity = bySeverityRaw.map((item) => ({
      severity: item.severity,
      count: item._count.id,
    }))

    // Resolved reports
    const resolvedCount = await prisma.incident.count({
      where: {
        reporterId: userId,
        status: 'RESOLVED',
      },
    })

    // Active reports
    const activeCount = await prisma.incident.count({
      where: {
        reporterId: userId,
        status: {
          notIn: ['RESOLVED', 'FALSE_ALARM'],
        },
      },
    })

    // Reports by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyReports = await prisma.incident.findMany({
      where: {
        reporterId: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Group by month
    const monthlyData = monthlyReports.reduce((acc: Record<string, number>, incident) => {
      const month = new Date(incident.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    const monthlyChart = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }))

    // Average resolution time
    const resolvedIncidents = await prisma.incident.findMany({
      where: {
        reporterId: userId,
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    })

    const avgResolutionTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((acc, incident) => {
          if (incident.resolvedAt) {
            const diff = new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()
            return acc + diff
          }
          return acc
        }, 0) / resolvedIncidents.length
      : 0

    const avgResolutionHours = avgResolutionTime / (1000 * 60 * 60)

    return NextResponse.json({
      totalReports,
      recentReports,
      resolvedCount,
      activeCount,
      byStatus,
      bySeverity,
      monthlyChart,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
    })
  } catch (error: any) {
    console.error('Error fetching user analytics:', error)
    
    // Return empty/default stats instead of error to prevent UI failures
    return NextResponse.json({
      totalReports: 0,
      recentReports: 0,
      resolvedCount: 0,
      activeCount: 0,
      byStatus: [],
      bySeverity: [],
      monthlyChart: [],
      avgResolutionHours: 0,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}


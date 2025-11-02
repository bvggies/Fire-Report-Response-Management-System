import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Total statistics
    const totalIncidents = await prisma.incident.count()
    const totalUsers = await prisma.user.count()
    const totalPersonnel = await prisma.personnel.count()
    const totalStations = await prisma.fireStation.count()

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const recentIncidents = await prisma.incident.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    })

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    })

    // By status
    const byStatusRaw = await prisma.incident.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const byStatus = byStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))

    // By severity
    const bySeverityRaw = await prisma.incident.groupBy({
      by: ['severity'],
      _count: {
        id: true,
      },
    })

    const bySeverity = bySeverityRaw.map((item) => ({
      severity: item.severity,
      count: item._count.id,
    }))

    // By user role
    const byRoleRaw = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    })

    const byRole = byRoleRaw.map((item) => ({
      role: item.role,
      count: item._count.id,
    }))

    // Incidents by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyIncidents = await prisma.incident.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    })

    const monthlyData = monthlyIncidents.reduce((acc: Record<string, { total: number; resolved: number }>, incident) => {
      const month = new Date(incident.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!acc[month]) {
        acc[month] = { total: 0, resolved: 0 }
      }
      acc[month].total += 1
      if (incident.status === 'RESOLVED') {
        acc[month].resolved += 1
      }
      return acc
    }, {})

    const monthlyChart = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      resolved: data.resolved,
    }))

    // Top reporters
    const topReporters = await prisma.incident.groupBy({
      by: ['reporterId'],
      where: {
        reporterId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    const topReportersWithNames = await Promise.all(
      topReporters.map(async (reporter) => {
        const user = await prisma.user.findUnique({
          where: { id: reporter.reporterId! },
          select: { name: true, email: true },
        })
        return {
          reporterId: reporter.reporterId,
          name: user?.name || 'Anonymous',
          email: user?.email || 'N/A',
          count: reporter._count.id,
        }
      })
    )

    // Resolution rate
    const resolvedCount = await prisma.incident.count({
      where: {
        status: 'RESOLVED',
      },
    })

    const resolutionRate = totalIncidents > 0 
      ? Math.round((resolvedCount / totalIncidents) * 100) 
      : 0

    // Average resolution time
    const resolvedIncidents = await prisma.incident.findMany({
      where: {
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

    // Active vs Resolved trend
    const activeCount = await prisma.incident.count({
      where: {
        status: {
          notIn: ['RESOLVED', 'FALSE_ALARM'],
        },
      },
    })

    return NextResponse.json({
      totalIncidents,
      totalUsers,
      totalPersonnel,
      totalStations,
      recentIncidents,
      recentUsers,
      byStatus,
      bySeverity,
      byRole,
      monthlyChart,
      topReporters: topReportersWithNames,
      resolutionRate,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      activeCount,
      resolvedCount,
    })
  } catch (error) {
    console.error('Error fetching admin analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


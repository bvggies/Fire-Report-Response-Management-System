import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const total = await prisma.incident.count()

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const recent = await prisma.incident.count({
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

    return NextResponse.json({
      total,
      recent,
      byStatus,
      bySeverity,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

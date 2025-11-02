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

    // Test basic queries
    const testResults: any = {}

    // Test 1: Simple count
    try {
      testResults.totalIncidents = await prisma.incident.count()
    } catch (err: any) {
      testResults.totalIncidentsError = err.message
    }

    // Test 2: Find first few incidents
    try {
      const sampleIncidents = await prisma.incident.findMany({
        take: 5,
        select: {
          id: true,
          status: true,
          severity: true,
          createdAt: true,
        },
      })
      testResults.sampleIncidents = sampleIncidents
    } catch (err: any) {
      testResults.sampleIncidentsError = err.message
    }

    // Test 3: GroupBy status
    try {
      const statusGroup = await prisma.incident.groupBy({
        by: ['status'],
        _count: { id: true },
      })
      testResults.statusGroup = statusGroup
    } catch (err: any) {
      testResults.statusGroupError = err.message
    }

    // Test 4: GroupBy severity
    try {
      const severityGroup = await prisma.incident.groupBy({
        by: ['severity'],
        _count: { id: true },
      })
      testResults.severityGroup = severityGroup
    } catch (err: any) {
      testResults.severityGroupError = err.message
    }

    // Test 5: Database connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      testResults.databaseConnection = 'OK'
    } catch (err: any) {
      testResults.databaseConnectionError = err.message
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...testResults,
    })
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}


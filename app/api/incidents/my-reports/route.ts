import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Ensure user can only access their own reports
    if (userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const where: any = {
      reporterId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        location: true,
        description: true,
        status: true,
        severity: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
      },
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error('Error fetching user reports:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

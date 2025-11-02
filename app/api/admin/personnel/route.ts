import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const personnel = await prisma.personnel.findMany({
      include: {
        fireStation: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(personnel)
  } catch (error) {
    console.error('Error fetching personnel:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

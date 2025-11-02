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

// Create personnel
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, phone, badgeNumber, rank, fireStationId } = body

    // Validate required fields
    if (!name || !email || !phone || !badgeNumber || !rank || !fireStationId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingPersonnel = await prisma.personnel.findUnique({
      where: { email },
    })

    if (existingPersonnel) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      )
    }

    // Check if badge number already exists
    const existingBadge = await prisma.personnel.findUnique({
      where: { badgeNumber },
    })

    if (existingBadge) {
      return NextResponse.json(
        { message: 'Badge number already in use' },
        { status: 400 }
      )
    }

    const newPersonnel = await prisma.personnel.create({
      data: {
        name,
        email,
        phone,
        badgeNumber,
        rank,
        fireStationId,
      },
      include: {
        fireStation: true,
      },
    })

    return NextResponse.json(newPersonnel, { status: 201 })
  } catch (error: any) {
    console.error('Error creating personnel:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

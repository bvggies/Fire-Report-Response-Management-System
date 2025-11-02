import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Update station
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, address, latitude, longitude, phone, email, capacity } = body

    const updatedStation = await prisma.fireStation.update({
      where: { id: params.id },
      data: {
        name,
        address,
        latitude,
        longitude,
        phone,
        email,
        capacity,
      },
    })

    return NextResponse.json(updatedStation)
  } catch (error: any) {
    console.error('Error updating station:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete station
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.fireStation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Station deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting station:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


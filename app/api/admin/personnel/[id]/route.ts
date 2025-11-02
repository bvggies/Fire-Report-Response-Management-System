import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Update personnel
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
    const { name, email, phone, badgeNumber, rank, fireStationId } = body

    // Check if email is being changed and if it's already taken
    const existingPersonnel = await prisma.personnel.findUnique({
      where: { id: params.id },
    })

    if (email && email !== existingPersonnel?.email) {
      const emailTaken = await prisma.personnel.findUnique({
        where: { email },
      })
      if (emailTaken) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Check if badgeNumber is being changed and if it's already taken
    if (badgeNumber && badgeNumber !== existingPersonnel?.badgeNumber) {
      const badgeTaken = await prisma.personnel.findUnique({
        where: { badgeNumber },
      })
      if (badgeTaken) {
        return NextResponse.json(
          { message: 'Badge number already in use' },
          { status: 400 }
        )
      }
    }

    const updatedPersonnel = await prisma.personnel.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedPersonnel)
  } catch (error: any) {
    console.error('Error updating personnel:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete personnel
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

    await prisma.personnel.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Personnel deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting personnel:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


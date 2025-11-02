import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          include: {
            personnel: {
              include: {
                fireStation: true,
              },
            },
          },
        },
      },
    })

    if (!incident) {
      return NextResponse.json(
        { message: 'Incident not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(incident)
  } catch (error) {
    console.error('Error fetching incident:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    })

    return NextResponse.json(incident)
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

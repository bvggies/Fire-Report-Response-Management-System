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
  } catch (error: any) {
    console.error('Error fetching incident:', error)
    
    if (error?.message?.includes('does not exist') || error?.message?.includes('relation')) {
      return NextResponse.json(
        { 
          message: 'Database schema not initialized',
          details: 'Database tables do not exist'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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

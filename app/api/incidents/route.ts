import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      location,
      latitude,
      longitude,
      description,
      severity,
      reporterName,
      reporterPhone,
      reporterEmail,
      anonymous,
      photos,
      videos,
    } = body

    const session = await getServerSession(authOptions)

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        description,
        severity,
        photos: photos || [],
        videos: videos || [],
        reporterId: session?.user?.id && !anonymous ? session.user.id : null,
        reporterName: anonymous ? null : reporterName || null,
        reporterPhone: anonymous ? null : reporterPhone || null,
        reporterEmail: anonymous ? null : reporterEmail || null,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const region = searchParams.get('region')

    const where: any = {}
    if (status) where.status = status
    if (severity) where.severity = severity

    const incidents = await prisma.incident.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

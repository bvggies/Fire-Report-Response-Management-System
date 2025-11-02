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

    // Validate required fields
    if (!location || !description) {
      return NextResponse.json(
        { message: 'Location and description are required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        description,
        severity: severity || 'MEDIUM',
        photos: photos || [],
        videos: videos || [],
        reporterId: session?.user?.id && !anonymous ? session.user.id : null,
        reporterName: anonymous ? null : reporterName || null,
        reporterPhone: anonymous ? null : reporterPhone || null,
        reporterEmail: anonymous ? null : reporterEmail || null,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error: any) {
    console.error('Error creating incident:', error)
    
    // Provide more specific error messages
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { message: 'Invalid reference: Related record does not exist' },
        { status: 400 }
      )
    }
    
    if (error?.code === 'P2011') {
      return NextResponse.json(
        { message: 'Null constraint violation: Required field is missing' },
        { status: 400 }
      )
    }
    
    if (error?.message?.includes('does not exist') || error?.message?.includes('relation')) {
      return NextResponse.json(
        { 
          message: 'Database schema not initialized',
          details: process.env.NODE_ENV === 'development' ? 'Run: npx prisma db push' : 'Database tables do not exist. Please contact administrator.'
        },
        { status: 500 }
      )
    }
    
    if (error?.message?.includes('Can\'t reach database') || error?.message?.includes('P1001')) {
      return NextResponse.json(
        { 
          message: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Cannot connect to database server'
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

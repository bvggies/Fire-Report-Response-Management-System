import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Provide more specific error messages
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }
    
    if (error?.message?.includes('prisma') || error?.message?.includes('database') || error?.code?.startsWith('P1')) {
      const isConnectionError = error?.code === 'P1001' || error?.code === 'P1000' || 
                                error?.message?.includes("Can't reach") ||
                                error?.message?.includes('connection')
      
      return NextResponse.json(
        { 
          message: isConnectionError ? 'Database connection failed. Please check DATABASE_URL and ensure database is active.' : 'Database error',
          details: process.env.NODE_ENV === 'development' ? `${error.code}: ${error.message}` : 
                   (error.code === 'P1001' ? 'Database server unreachable' : 
                    error.code === 'P1000' ? 'Authentication failed' : undefined)
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

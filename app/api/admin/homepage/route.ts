import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get homepage content
export async function GET() {
  try {
    const contents = await prisma.homePageContent.findMany({
      orderBy: { key: 'asc' },
    })

    // Convert array to object for easier access
    const contentMap = contents.reduce((acc, item) => {
      acc[item.key] = item
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(contentMap)
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update homepage content
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
    const { key, title, content } = body

    if (!key || !content) {
      return NextResponse.json(
        { message: 'Key and content are required' },
        { status: 400 }
      )
    }

    // Upsert (create or update)
    const homepageContent = await prisma.homePageContent.upsert({
      where: { key },
      update: {
        title,
        content,
      },
      create: {
        key,
        title,
        content,
      },
    })

    return NextResponse.json(homepageContent)
  } catch (error: any) {
    console.error('Error saving homepage content:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


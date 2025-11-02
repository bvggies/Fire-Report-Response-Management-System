import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public endpoint to get homepage content
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
    // Return empty object if no content exists (graceful degradation)
    return NextResponse.json({})
  }
}


import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Fetch all data
    const [incidents, users, stations, personnel] = await Promise.all([
      prisma.incident.findMany({
        include: {
          reporter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.user.findMany(),
      prisma.fireStation.findMany(),
      prisma.personnel.findMany({
        include: {
          fireStation: true,
        },
      }),
    ])

    // Prepare data for Excel
    const incidentsData = incidents.map((incident) => ({
      'Incident ID': incident.id,
      'Location': incident.location,
      'Status': incident.status,
      'Severity': incident.severity,
      'Description': incident.description,
      'Reporter Name': incident.reporter?.name || incident.reporterName || 'Anonymous',
      'Reporter Email': incident.reporter?.email || incident.reporterEmail || 'N/A',
      'Created At': incident.createdAt.toISOString(),
      'Resolved At': incident.resolvedAt?.toISOString() || 'N/A',
    }))

    const usersData = users.map((user) => ({
      'User ID': user.id,
      'Name': user.name || 'N/A',
      'Email': user.email,
      'Phone': user.phone || 'N/A',
      'Role': user.role,
      'Created At': user.createdAt.toISOString(),
    }))

    const stationsData = stations.map((station) => ({
      'Station ID': station.id,
      'Name': station.name,
      'Address': station.address,
      'Latitude': station.latitude,
      'Longitude': station.longitude,
      'Phone': station.phone,
      'Email': station.email,
      'Capacity': station.capacity,
    }))

    const personnelData = personnel.map((person) => ({
      'Personnel ID': person.id,
      'Name': person.name,
      'Badge Number': person.badgeNumber,
      'Rank': person.rank,
      'Email': person.email,
      'Phone': person.phone,
      'Fire Station': person.fireStation.name,
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(incidentsData), 'Incidents')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(usersData), 'Users')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(stationsData), 'Fire Stations')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(personnelData), 'Personnel')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="fire-response-data-${new Date().toISOString()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

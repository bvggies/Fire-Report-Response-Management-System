import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample admin user
  const adminEmail = 'admin@fireresponse.com'
  const adminPassword = 'Admin@123' // Change this in production!
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail)
    return
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'System Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      phone: '+1234567890',
    },
  })

  console.log('✅ Created admin user:')
  console.log('   Email:', adminEmail)
  console.log('   Password: Admin@123')
  console.log('   Role: SUPER_ADMIN')
  console.log('')
  console.log('⚠️  IMPORTANT: Change the password after first login!')

  // Create sample fire station
  const sampleStation = await prisma.fireStation.create({
    data: {
      name: 'Central Fire Station',
      address: '123 Main Street, City, State 12345',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '+1-555-0100',
      email: 'station@fireresponse.com',
      capacity: 50,
    },
  })

  console.log('✅ Created sample fire station:', sampleStation.name)

  // Create sample personnel
  const samplePersonnel = await prisma.personnel.create({
    data: {
      name: 'John Firefighter',
      email: 'john.firefighter@fireresponse.com',
      phone: '+1-555-0101',
      badgeNumber: 'FF-001',
      rank: 'Captain',
      fireStationId: sampleStation.id,
    },
  })

  console.log('✅ Created sample personnel:', samplePersonnel.name)
  console.log('')
  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

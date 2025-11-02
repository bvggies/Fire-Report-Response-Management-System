// Quick database connection test
// Run: node scripts/test-db.js

const { PrismaClient } = require('@prisma/client')

// Try to load dotenv if available
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed, that's okay for Next.js projects
  console.log('💡 Note: Install dotenv for better env loading, or ensure .env.local exists\n')
}

const prisma = new PrismaClient({
  log: ['error'],
})

async function test() {
  console.log('🔍 Testing database connection...\n')
  
  // Check environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables!')
    console.log('💡 Make sure .env.local exists and has DATABASE_URL')
    process.exit(1)
  }
  
  console.log('✅ DATABASE_URL found')
  console.log(`   Connection: ${process.env.DATABASE_URL.substring(0, 30)}...\n`)

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!\n')
    
    // Test queries
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
    const incidentCount = await prisma.incident.count()
    console.log(`📊 Incidents in database: ${incidentCount}`)
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('\n📋 Tables in database:')
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`)
    })
    
    console.log('\n✅ All checks passed!')
    
  } catch (error) {
    console.error('\n❌ Database test failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Possible issues:')
      console.log('   1. Neon database might be paused (check Neon console)')
      console.log('   2. Connection string might be incorrect')
      console.log('   3. Network/firewall issue')
    } else if (error.message.includes('P1001')) {
      console.log('\n💡 Database server is unreachable')
      console.log('   Check if Neon database is running')
    } else if (error.message.includes('P1000')) {
      console.log('\n💡 Authentication failed')
      console.log('   Check your database credentials in DATABASE_URL')
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Database schema not initialized')
      console.log('   Run: npx prisma db push')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

test()

import prisma from './lib/prisma.js'

async function testDatabase() {
    console.log('🔍 Testing Database Connection...\n')

    try {
        // Test connection
        await prisma.$connect()
        console.log('✅ Database connected successfully!\n')

        // Count users
        const userCount = await prisma.user.count()
        console.log(`📊 Current users in database: ${userCount}\n`)

        // Fetch all users (without passwords)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        })

        if (users.length > 0) {
            console.log('👥 Users:')
            users.forEach(user => {
                console.log(`   - ${user.email} (ID: ${user.id})`)
            })
        } else {
            console.log('ℹ️  No users found. Create one by signing up!')
        }

        console.log('\n🎉 Database test completed successfully!\n')
    } catch (error) {
        console.error('❌ Database test failed:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

testDatabase()

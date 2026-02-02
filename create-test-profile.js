// Script to create a test client profile
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestProfile() {
    try {
        // Create a test profile for Mumbai user
        const profile = await prisma.clientProfile.create({
            data: {
                customerId: 'CUST_MUMBAI_001',
                accountId: 'ACC_MUMBAI_001',
                accountType: 'SAVINGS',
                accountAgeDays: 1850,
                accountCreatedAt: new Date('2019-01-15'),
                kycStatus: 'FULL_KYC',

                // Mumbai coordinates
                state: 'Maharashtra',
                city: 'Mumbai',
                latitude: 19.0760,  // Mumbai latitude
                longitude: 72.8777, // Mumbai longitude

                monthlyLimit: 100000,
                currentMonthSpend: 0,

                last30Transactions: []
            }
        })

        console.log('✅ Test profile created:', profile)
        console.log('\nProfile Details:')
        console.log('- Customer ID:', profile.customerId)
        console.log('- Location: Mumbai, Maharashtra')
        console.log('- Coordinates:', profile.latitude, profile.longitude)
        console.log('- Monthly Limit:', profile.monthlyLimit)

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('ℹ️  Profile already exists')
        } else {
            console.error('❌ Error:', error.message)
        }
    } finally {
        await prisma.$disconnect()
    }
}

createTestProfile()

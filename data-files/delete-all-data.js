// Script to delete all client profiles and fraud transactions
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllData() {
    console.log('🗑️  Deleting all data...\n')

    // Delete fraud transactions first
    const fraudResult = await prisma.fraudTransaction.deleteMany({})
    console.log(`✅ Deleted ${fraudResult.count} fraud transactions`)

    // Delete client profiles
    const profileResult = await prisma.clientProfile.deleteMany({})
    console.log(`✅ Deleted ${profileResult.count} client profiles`)

    console.log('\n✅ All data deleted successfully!')
}

deleteAllData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

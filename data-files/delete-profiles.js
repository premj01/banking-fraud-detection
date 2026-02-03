// Script to delete all client profiles
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteProfiles() {
    console.log('🗑️  Deleting all client profiles...\n')

    const result = await prisma.clientProfile.deleteMany({})

    console.log(`✅ Deleted ${result.count} profiles`)
}

deleteProfiles()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

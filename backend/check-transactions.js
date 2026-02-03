import prisma from './lib/prisma.js'

async function checkTransactions() {
    try {
        const count = await prisma.fraudTransaction.count()
        console.log(`Total transactions in DB: ${count}`)

        if (count > 0) {
            const recent = await prisma.fraudTransaction.findMany({
                orderBy: { transactionTimestamp: 'desc' },
                take: 5,
                select: {
                    transactionId: true,
                    transactionTimestamp: true,
                    amountValue: true,
                    senderUserName: true,
                    isFraud: true
                }
            })

            console.log('\nRecent 5 transactions:')
            recent.forEach(t => {
                console.log(`- ${t.transactionId} | ${t.senderUserName} | ₹${t.amountValue} | Fraud: ${t.isFraud}`)
            })
        } else {
            console.log('\n⚠️ No transactions found in database!')
            console.log('You need to seed data or send transactions via POST /api/transactions/detect')
        }

        await prisma.$disconnect()
    } catch (error) {
        console.error('Error:', error.message)
        await prisma.$disconnect()
        process.exit(1)
    }
}

checkTransactions()

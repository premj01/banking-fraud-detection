import prisma from '../lib/prisma.js'

export class FraudTransactionRepository {
    async create(data) {
        return await prisma.fraudTransaction.create({ data })
    }

    async findRecent(limit = 10) {
        return await prisma.fraudTransaction.findMany({
            orderBy: { transactionTimestamp: 'desc' },
            take: limit
        })
    }

    async findRecentByCustomerId(customerId, minutes) {
        const since = new Date(Date.now() - minutes * 60 * 1000)
        return await prisma.fraudTransaction.findMany({
            where: {
                senderCustomerId: customerId,
                transactionTimestamp: { gte: since }
            }
        })
    }
}

export default new FraudTransactionRepository()

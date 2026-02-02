import prisma from '../lib/prisma.js'

export class ClientProfileRepository {
    async findByCustomerId(customerId) {
        return await prisma.clientProfile.findUnique({
            where: { customerId }
        })
    }

    async updateMonthlySpend(customerId, amount) {
        return await prisma.clientProfile.update({
            where: { customerId },
            data: {
                currentMonthSpend: { increment: amount }
            }
        })
    }

    async updateFlaggedScore(customerId, scoreIncrement) {
        const profile = await this.findByCustomerId(customerId)
        if (!profile) return null

        const newScore = Math.min(profile.flaggedScore + scoreIncrement, 100) // Cap at 100

        return await prisma.clientProfile.update({
            where: { customerId },
            data: { flaggedScore: newScore }
        })
    }

    async updateLast30Transactions(customerId, newTransaction) {
        const profile = await this.findByCustomerId(customerId)
        if (!profile) return null

        let transactions = profile.last30Transactions || []
        transactions.push(newTransaction)

        if (transactions.length > 30) {
            transactions.shift() // Remove oldest
        }

        return await prisma.clientProfile.update({
            where: { customerId },
            data: { last30Transactions: transactions }
        })
    }
}

export default new ClientProfileRepository()

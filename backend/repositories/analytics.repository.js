import prisma from '../lib/prisma.js'

export class AnalyticsRepository {
    // Get today's date at midnight (UTC)
    getTodayStart() {
        const now = new Date()
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    }

    // Get start of current month
    getMonthStart() {
        const now = new Date()
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    }

    // Get start of 30 days ago
    get30DaysAgoStart() {
        const now = new Date()
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30))
    }

    // Today's transaction stats from FraudTransaction table
    async getTodayStats() {
        const todayStart = this.getTodayStart()
        const tomorrow = new Date(todayStart)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const result = await prisma.fraudTransaction.aggregate({
            where: {
                transactionTimestamp: {
                    gte: todayStart,
                    lt: tomorrow
                }
            },
            _count: { id: true },
            _sum: { amountValue: true },
            _avg: { riskScore: true }
        })

        const flaggedResult = await prisma.fraudTransaction.aggregate({
            where: {
                transactionTimestamp: { gte: todayStart, lt: tomorrow },
                isFraud: true
            },
            _count: { id: true },
            _sum: { amountValue: true }
        })

        return {
            totalTransactions: result._count.id || 0,
            totalAmount: result._sum.amountValue || 0,
            avgRiskScore: result._avg.riskScore || 0,
            flaggedTransactions: flaggedResult._count.id || 0,
            flaggedAmount: flaggedResult._sum.amountValue || 0
        }
    }

    // This month's stats
    async getMonthStats() {
        const monthStart = this.getMonthStart()

        const result = await prisma.fraudTransaction.aggregate({
            where: {
                transactionTimestamp: { gte: monthStart }
            },
            _count: { id: true },
            _sum: { amountValue: true }
        })

        const flaggedResult = await prisma.fraudTransaction.aggregate({
            where: {
                transactionTimestamp: { gte: monthStart },
                isFraud: true
            },
            _count: { id: true },
            _sum: { amountValue: true }
        })

        return {
            totalTransactions: result._count.id || 0,
            totalAmount: result._sum.amountValue || 0,
            flaggedTransactions: flaggedResult._count.id || 0,
            flaggedAmount: flaggedResult._sum.amountValue || 0
        }
    }

    // Last 30 days trend - daily breakdown
    async getLast30DaysTrend() {
        const startDate = this.get30DaysAgoStart()

        // Get all transactions in last 30 days
        const transactions = await prisma.fraudTransaction.findMany({
            where: {
                transactionTimestamp: { gte: startDate }
            },
            select: {
                transactionTimestamp: true,
                isFraud: true,
                amountValue: true
            }
        })

        // Group by date
        const dailyMap = new Map()

        // Initialize all 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            dailyMap.set(dateStr, { date: dateStr, total: 0, flagged: 0, amount: 0 })
        }

        // Aggregate
        transactions.forEach(txn => {
            const dateStr = txn.transactionTimestamp.toISOString().split('T')[0]
            if (dailyMap.has(dateStr)) {
                const day = dailyMap.get(dateStr)
                day.total++
                if (txn.isFraud) day.flagged++
                day.amount += txn.amountValue || 0
            }
        })

        return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    // Hourly volume for today
    async getHourlyVolume() {
        const todayStart = this.getTodayStart()
        const tomorrow = new Date(todayStart)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const transactions = await prisma.fraudTransaction.findMany({
            where: {
                transactionTimestamp: { gte: todayStart, lt: tomorrow }
            },
            select: {
                transactionTimestamp: true,
                isFraud: true,
                amountValue: true
            }
        })

        // Initialize 24 hours
        const hourlyVolume = Array(24).fill(0)
        const hourlyFraudCount = Array(24).fill(0)
        const hourlyAmount = Array(24).fill(0)

        transactions.forEach(txn => {
            const hour = txn.transactionTimestamp.getUTCHours()
            hourlyVolume[hour]++
            hourlyAmount[hour] += txn.amountValue || 0
            if (txn.isFraud) hourlyFraudCount[hour]++
        })

        return { hourlyVolume, hourlyFraudCount, hourlyAmount }
    }

    // Peak fraud hours (top 3 hours with most fraud)
    async getPeakFraudHours() {
        const { hourlyFraudCount } = await this.getHourlyVolume()

        const hourlyWithIndex = hourlyFraudCount.map((count, hour) => ({ hour, count }))
        hourlyWithIndex.sort((a, b) => b.count - a.count)

        return hourlyWithIndex.slice(0, 3).filter(h => h.count > 0).map(h => h.hour)
    }

    // Average risk score across all transactions
    async getAverageRiskScore() {
        const result = await prisma.fraudTransaction.aggregate({
            _avg: { riskScore: true }
        })
        return result._avg.riskScore || 0
    }

    // Total fraud cases in last 30 days
    async getFraudCasesLast30Days() {
        const startDate = this.get30DaysAgoStart()

        const result = await prisma.fraudTransaction.count({
            where: {
                transactionTimestamp: { gte: startDate },
                isFraud: true
            }
        })
        return result
    }

    // Upsert daily stats cache
    async upsertDailyStats(date, data) {
        const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

        return await prisma.dailyStats.upsert({
            where: { date: dateOnly },
            update: data,
            create: { date: dateOnly, ...data }
        })
    }

    // Get cached daily stats
    async getDailyStats(date) {
        const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

        return await prisma.dailyStats.findUnique({
            where: { date: dateOnly }
        })
    }

    // Get last 30 days cached stats
    async getLast30DaysStats() {
        const startDate = this.get30DaysAgoStart()

        return await prisma.dailyStats.findMany({
            where: { date: { gte: startDate } },
            orderBy: { date: 'asc' }
        })
    }
}

export default new AnalyticsRepository()

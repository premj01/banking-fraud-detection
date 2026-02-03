import analyticsRepository from '../repositories/analytics.repository.js'

export class AnalyticsService {

    // Get full dashboard summary
    async getDashboardSummary() {
        const [todayStats, monthStats, avgRiskScore, fraudCases30Days] = await Promise.all([
            analyticsRepository.getTodayStats(),
            analyticsRepository.getMonthStats(),
            analyticsRepository.getAverageRiskScore(),
            analyticsRepository.getFraudCasesLast30Days()
        ])

        // Calculate rates
        const fraudDetectionRate = todayStats.totalTransactions > 0
            ? ((todayStats.flaggedTransactions / todayStats.totalTransactions) * 100).toFixed(2)
            : 0

        // Losses prevented = flagged amount (money we stopped)
        const lossesPrevented = todayStats.flaggedAmount

        return {
            today: {
                totalTransactions: todayStats.totalTransactions,
                flaggedTransactions: todayStats.flaggedTransactions,
                openAlerts: todayStats.flaggedTransactions, // For now, flagged = open alerts
                fraudDetectionRate: parseFloat(fraudDetectionRate),
                avgRiskScore: parseFloat(todayStats.avgRiskScore.toFixed(2)),
                lossesPrevented: todayStats.flaggedAmount,
                totalAmount: todayStats.totalAmount
            },
            month: {
                totalTransactions: monthStats.totalTransactions,
                flaggedTransactions: monthStats.flaggedTransactions,
                totalAmount: monthStats.totalAmount,
                flaggedAmount: monthStats.flaggedAmount,
                lossesPrevented: monthStats.flaggedAmount
            },
            overall: {
                avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
                fraudCasesLast30Days: fraudCases30Days
            }
        }
    }

    // Get 30-day trends
    async getTrendData() {
        const trends = await analyticsRepository.getLast30DaysTrend()
        return {
            last30Days: trends,
            summary: {
                totalTransactions: trends.reduce((sum, d) => sum + d.total, 0),
                totalFlagged: trends.reduce((sum, d) => sum + d.flagged, 0),
                totalAmount: trends.reduce((sum, d) => sum + d.amount, 0)
            }
        }
    }

    // Get hourly analysis
    async getHourlyAnalysis() {
        const [hourlyData, peakHours] = await Promise.all([
            analyticsRepository.getHourlyVolume(),
            analyticsRepository.getPeakFraudHours()
        ])

        return {
            hourlyVolume: hourlyData.hourlyVolume,
            hourlyFraudCount: hourlyData.hourlyFraudCount,
            hourlyAmount: hourlyData.hourlyAmount,
            peakFraudHours: peakHours
        }
    }

    // Get all analytics in one call
    async getFullAnalytics() {
        const [summary, trends, hourly] = await Promise.all([
            this.getDashboardSummary(),
            this.getTrendData(),
            this.getHourlyAnalysis()
        ])

        return { summary, trends, hourly }
    }

    // Record a transaction for analytics (called after fraud detection)
    async recordTransaction(txnData, fraudResult) {
        // Update daily stats cache
        const today = new Date()
        const currentStats = await analyticsRepository.getDailyStats(today)

        const isFraud = fraudResult.is_fraud
        const amount = txnData.amount_value || 0
        const riskScore = fraudResult.risk_score || 0
        const hour = today.getUTCHours()

        if (currentStats) {
            // Update existing stats
            const newTotal = currentStats.totalTransactions + 1
            const newFlagged = currentStats.flaggedTransactions + (isFraud ? 1 : 0)
            const newTotalAmount = currentStats.totalAmount + amount
            const newFlaggedAmount = currentStats.flaggedAmount + (isFraud ? amount : 0)

            // Update running average
            const newAvgRiskScore = (currentStats.avgRiskScore * currentStats.totalTransactions + riskScore) / newTotal

            // Update hourly arrays
            const hourlyVolume = [...(currentStats.hourlyVolume || Array(24).fill(0))]
            const hourlyFraudCount = [...(currentStats.hourlyFraudCount || Array(24).fill(0))]
            hourlyVolume[hour] = (hourlyVolume[hour] || 0) + 1
            if (isFraud) hourlyFraudCount[hour] = (hourlyFraudCount[hour] || 0) + 1

            await analyticsRepository.upsertDailyStats(today, {
                totalTransactions: newTotal,
                flaggedTransactions: newFlagged,
                openAlerts: newFlagged,
                totalAmount: newTotalAmount,
                flaggedAmount: newFlaggedAmount,
                avgRiskScore: newAvgRiskScore,
                hourlyVolume,
                hourlyFraudCount
            })
        } else {
            // Create new daily stats
            const hourlyVolume = Array(24).fill(0)
            const hourlyFraudCount = Array(24).fill(0)
            hourlyVolume[hour] = 1
            if (isFraud) hourlyFraudCount[hour] = 1

            await analyticsRepository.upsertDailyStats(today, {
                totalTransactions: 1,
                flaggedTransactions: isFraud ? 1 : 0,
                openAlerts: isFraud ? 1 : 0,
                totalAmount: amount,
                flaggedAmount: isFraud ? amount : 0,
                avgRiskScore: riskScore,
                hourlyVolume,
                hourlyFraudCount
            })
        }
    }
}

export default new AnalyticsService()

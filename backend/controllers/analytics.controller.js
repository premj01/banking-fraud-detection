import analyticsService from '../services/analytics.service.js'

// GET /api/analytics/summary - Today's stats + month stats + rates
export const getSummary = async (req, res, next) => {
    try {
        const summary = await analyticsService.getDashboardSummary()

        res.json({
            success: true,
            data: summary
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/analytics/trends - 30-day transaction/fraud trend
export const getTrends = async (req, res, next) => {
    try {
        const trends = await analyticsService.getTrendData()

        res.json({
            success: true,
            data: trends
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/analytics/hourly - Today's hourly volume + peak fraud hours
export const getHourly = async (req, res, next) => {
    try {
        const hourly = await analyticsService.getHourlyAnalysis()

        res.json({
            success: true,
            data: hourly
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/analytics/full - All analytics combined
export const getFullAnalytics = async (req, res, next) => {
    try {
        const analytics = await analyticsService.getFullAnalytics()

        res.json({
            success: true,
            data: analytics
        })
    } catch (error) {
        next(error)
    }
}

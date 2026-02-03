import express from 'express'
import { getSummary, getTrends, getHourly, getFullAnalytics } from '../controllers/analytics.controller.js'

const router = express.Router()

// Summary: today's stats + month stats + detection rates
router.get('/summary', getSummary)

// Trends: 30-day daily breakdown
router.get('/trends', getTrends)

// Hourly: today's hourly volume + peak fraud hours
router.get('/hourly', getHourly)

// Full: all analytics combined
router.get('/full', getFullAnalytics)

export default router

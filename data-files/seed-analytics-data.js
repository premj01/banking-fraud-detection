/**
 * Seed Historical Analytics Data
 * 
 * Creates 30 days of simulated analytics data for the DailyStats table
 * to populate the analytics dashboard with realistic historical data.
 * 
 * Usage: node seed-analytics-data.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate realistic hourly distribution (more activity during business hours)
function generateHourlyVolume(avgDailyTotal) {
    // Weight by hour (higher during 9am-6pm IST = 3:30-12:30 UTC)
    const hourlyWeights = [
        0.01, 0.01, 0.02, 0.03, 0.05, 0.06, // 0-5 (night)
        0.07, 0.08, 0.08, 0.08, 0.07, 0.06, // 6-11 (morning)
        0.05, 0.05, 0.05, 0.04, 0.04, 0.04, // 12-17 (afternoon)
        0.03, 0.03, 0.02, 0.02, 0.01, 0.01  // 18-23 (evening)
    ]

    const total = hourlyWeights.reduce((s, w) => s + w, 0)
    return hourlyWeights.map(w => Math.round((w / total) * avgDailyTotal))
}

// Generate fraud distribution (more fraud attempts at odd hours)
function generateHourlyFraud(avgDailyFraud) {
    // Fraud peaks during unusual hours
    const fraudWeights = [
        0.06, 0.07, 0.08, 0.08, 0.06, 0.04, // 0-5 (fraud peak at night)
        0.03, 0.03, 0.02, 0.02, 0.03, 0.04, // 6-11
        0.04, 0.04, 0.05, 0.05, 0.05, 0.04, // 12-17
        0.04, 0.05, 0.06, 0.06, 0.05, 0.05  // 18-23 (fraud peak evening)
    ]

    const total = fraudWeights.reduce((s, w) => s + w, 0)
    return fraudWeights.map(w => Math.round((w / total) * avgDailyFraud))
}

async function seedAnalyticsData() {
    console.log('🌱 Seeding analytics data for last 30 days...\n')

    const today = new Date()
    const records = []

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        const date = new Date(today)
        date.setDate(date.getDate() - daysAgo)
        date.setUTCHours(0, 0, 0, 0)

        // Generate realistic daily stats with variation
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const baseTransactions = isWeekend ? 80 : 150
        const variance = 0.3 // 30% variance

        const totalTransactions = Math.round(baseTransactions * (1 + (Math.random() - 0.5) * variance))

        // Fraud rate between 15-35%
        const fraudRate = 0.15 + Math.random() * 0.2
        const flaggedTransactions = Math.round(totalTransactions * fraudRate)

        // Average amount per transaction: 5000-15000 INR
        const avgAmount = 5000 + Math.random() * 10000
        const totalAmount = totalTransactions * avgAmount
        const flaggedAmount = flaggedTransactions * avgAmount * (1.5 + Math.random()) // Fraud tends to be higher amounts

        // Risk score average: 25-55
        const avgRiskScore = 25 + Math.random() * 30

        // Generate hourly distributions
        const hourlyVolume = generateHourlyVolume(totalTransactions)
        const hourlyFraudCount = generateHourlyFraud(flaggedTransactions)

        records.push({
            date,
            totalTransactions,
            flaggedTransactions,
            openAlerts: Math.round(flaggedTransactions * 0.3), // 30% are still open
            totalAmount: Math.round(totalAmount),
            flaggedAmount: Math.round(flaggedAmount),
            avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
            hourlyVolume,
            hourlyFraudCount
        })
    }

    // Insert records
    let created = 0
    for (const record of records) {
        try {
            await prisma.dailyStats.upsert({
                where: { date: record.date },
                update: record,
                create: record
            })
            created++
            const dateStr = record.date.toISOString().split('T')[0]
            console.log(`✅ ${dateStr}: ${record.totalTransactions} txns, ${record.flaggedTransactions} flagged, ₹${(record.totalAmount / 100000).toFixed(1)}L total`)
        } catch (error) {
            console.error(`❌ Error for ${record.date}:`, error.message)
        }
    }

    console.log(`\n📊 Created ${created} daily stats records`)

    // Print summary
    const totalTxns = records.reduce((s, r) => s + r.totalTransactions, 0)
    const totalFlagged = records.reduce((s, r) => s + r.flaggedTransactions, 0)
    const totalAmt = records.reduce((s, r) => s + r.totalAmount, 0)

    console.log('\n📈 30-Day Summary:')
    console.log(`   Total Transactions: ${totalTxns}`)
    console.log(`   Flagged Transactions: ${totalFlagged}`)
    console.log(`   Fraud Rate: ${((totalFlagged / totalTxns) * 100).toFixed(1)}%`)
    console.log(`   Total Volume: ₹${(totalAmt / 10000000).toFixed(2)} Cr`)
}

seedAnalyticsData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

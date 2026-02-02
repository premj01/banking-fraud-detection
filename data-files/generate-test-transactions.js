// Script to generate 100 transaction records CSV from existing profiles
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Indian cities with coordinates (for geographic fraud)
const cities = [
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 }
]

const transactionTypes = ['TRANSFER', 'PAYMENT']
const deviceTypes = ['MOBILE', 'WEB']
const deviceOSs = ['Android', 'iOS', 'Windows']
const ipRisks = ['LOW', 'MEDIUM', 'HIGH']
const receiverTypes = ['PERSON', 'MERCHANT']
const merchantCategories = ['FOOD', 'ELECTRONICS', 'TRAVEL', 'HEALTH', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION']
const merchantRiskLevels = ['LOW', 'MEDIUM', 'HIGH']
const paymentMethods = ['UPI', 'CARD', 'NETBANKING']
const authorizationTypes = ['PIN', 'OTP', 'BIOMETRIC']
const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank']

function generateTransaction(profile, index, isFraud = false) {
    const baseDate = new Date('2024-02-03T10:00:00Z')
    const timestamp = new Date(baseDate.getTime() + index * 60000) // 1 minute apart

    let amount, txnCount1min, txnCount10min, amount24hr, currentLat, currentLon, ipRisk, merchantRisk

    if (isFraud) {
        // Fraud scenarios
        const fraudType = Math.random()
        if (fraudType < 0.33) {
            // Type 1: High amount fraud
            amount = Math.floor(Math.random() * 100000) + 100000 // 100k-200k
            txnCount1min = Math.floor(Math.random() * 2) + 1
            txnCount10min = Math.floor(Math.random() * 5) + 1
            amount24hr = amount + Math.floor(Math.random() * 50000)
            currentLat = profile.latitude
            currentLon = profile.longitude
            ipRisk = ['MEDIUM', 'HIGH'][Math.floor(Math.random() * 2)]
            merchantRisk = ['MEDIUM', 'HIGH'][Math.floor(Math.random() * 2)]
        } else if (fraudType < 0.66) {
            // Type 2: High velocity fraud
            amount = Math.floor(Math.random() * 20000) + 5000
            txnCount1min = Math.floor(Math.random() * 3) + 4 // 4-6
            txnCount10min = Math.floor(Math.random() * 5) + 11 // 11-15
            amount24hr = amount * 10
            currentLat = profile.latitude
            currentLon = profile.longitude
            ipRisk = 'MEDIUM'
            merchantRisk = 'MEDIUM'
        } else {
            // Type 3: Geographic fraud - pick a far city
            amount = Math.floor(Math.random() * 30000) + 10000
            txnCount1min = 1
            txnCount10min = Math.floor(Math.random() * 3) + 1
            amount24hr = amount + Math.floor(Math.random() * 20000)
            const farCity = cities[Math.floor(Math.random() * cities.length)]
            currentLat = farCity.lat
            currentLon = farCity.lon
            ipRisk = 'HIGH'
            merchantRisk = 'LOW'
        }
    } else {
        // Normal transaction - same location as profile
        amount = Math.floor(Math.random() * 15000) + 500 // 500-15500
        txnCount1min = Math.floor(Math.random() * 2) // 0-1
        txnCount10min = Math.floor(Math.random() * 4) + 1 // 1-4
        amount24hr = amount + Math.floor(Math.random() * 20000)
        currentLat = profile.latitude
        currentLon = profile.longitude
        ipRisk = 'LOW'
        merchantRisk = 'LOW'
    }

    return {
        transaction_id: `TXN_${Date.now()}_${index}`,
        transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        transaction_status: 'SUCCESS',
        transaction_timestamp: timestamp.toISOString(),
        amount_value: amount,
        amount_currency: 'INR',

        sender_customer_id: profile.customerId,
        sender_user_name: profile.userName,
        sender_account_id: profile.accountId,
        sender_account_type: profile.accountType,
        sender_kyc_status: profile.kycStatus,
        sender_account_age_days: profile.accountAgeDays,
        sender_state: profile.state,
        sender_city: profile.city,

        current_latitude: currentLat,
        current_longitude: currentLon,

        sender_txn_count_1min: txnCount1min,
        sender_txn_count_10min: txnCount10min,
        sender_amount_24hr: amount24hr,

        device_type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        device_os: deviceOSs[Math.floor(Math.random() * deviceOSs.length)],
        app_version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        ip_risk: ipRisk,

        receiver_type: receiverTypes[Math.floor(Math.random() * receiverTypes.length)],
        receiver_bank: banks[Math.floor(Math.random() * banks.length)],
        merchant_category: merchantCategories[Math.floor(Math.random() * merchantCategories.length)],
        merchant_risk_level: merchantRisk,

        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        authorization_type: authorizationTypes[Math.floor(Math.random() * authorizationTypes.length)]
    }
}

async function generateCSV() {
    console.log('📊 Generating 100 transaction records...\n')

    // Fetch all profiles
    const profiles = await prisma.clientProfile.findMany()

    if (profiles.length === 0) {
        console.error('❌ No client profiles found! Run seed-profiles-with-history.js first.')
        return
    }

    console.log(`✅ Found ${profiles.length} client profiles\n`)

    const transactions = []

    // Generate 85 normal transactions
    console.log('📝 Generating 85 normal transactions...')
    for (let i = 0; i < 85; i++) {
        const profile = profiles[i % profiles.length]
        transactions.push(generateTransaction(profile, i, false))
    }

    // Generate 15 fraud transactions
    console.log('📝 Generating 15 fraud transactions...')
    for (let i = 85; i < 100; i++) {
        const profile = profiles[i % profiles.length]
        transactions.push(generateTransaction(profile, i, true))
    }

    // Shuffle transactions
    console.log('🔀 Shuffling transactions...')
    transactions.sort(() => Math.random() - 0.5)

    // Create CSV
    const headers = Object.keys(transactions[0]).join(',')
    const rows = transactions.map(t => Object.values(t).join(','))
    const csv = [headers, ...rows].join('\n')

    // Save to Data Sample folder
    const outputPath = path.join(process.cwd(), '..', 'Data Sample', 'test_transactions.csv')
    fs.writeFileSync(outputPath, csv)

    console.log(`\n✅ Generated 100 transactions (85 normal, 15 fraud)`)
    console.log(`📁 Saved to: ${outputPath}`)

    console.log('\n📊 Transaction Distribution:')
    console.log('  - Normal: 85 (85%)')
    console.log('  - Fraud: 15 (15%)')
    console.log('    • High Amount: ~5')
    console.log('    • High Velocity: ~5')
    console.log('    • Geographic: ~5')

    console.log('\n📋 Sample transactions:')
    transactions.slice(0, 5).forEach(t => {
        console.log(`  - ${t.transaction_id}`)
        console.log(`    User: ${t.sender_user_name} (${t.sender_customer_id})`)
        console.log(`    Amount: ₹${t.amount_value} | Location: ${t.sender_city}`)
    })
}

generateCSV()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

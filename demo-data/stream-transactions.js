/**
 * Demo Transaction Generator + API Streamer
 * 
 * This script generates 150 random demo transactions based on valid user profiles
 * and streams them to the fraud detection API.
 * 
 * Usage:
 *   node stream-transactions.js           # Generate and stream transactions
 *   node stream-transactions.js --generate-only  # Only generate JSON file
 *   node stream-transactions.js --stream-only    # Only stream from existing file
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const API_URL = 'http://localhost:5000/api/transactions/detect'
const INTERVAL_MS = 100 // 2 seconds between requests
const TOTAL_TRANSACTIONS = 150

// Load user profiles
const profilesPath = path.join(__dirname, '../Data Sample/client_profiles_all_data.json')
const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'))

// Transaction types and scenarios
const TRANSACTION_TYPES = ['PAYMENT', 'TRANSFER', 'WITHDRAWAL', 'PURCHASE']
const PAYMENT_METHODS = ['UPI', 'NEFT', 'IMPS', 'CARD', 'WALLET']
const AUTHORIZATION_TYPES = ['PIN', 'OTP', 'BIOMETRIC', 'PASSWORD']
const DEVICE_TYPES = ['MOBILE', 'WEB', 'ATM', 'POS']
const DEVICE_OS = ['Android', 'iOS', 'Windows', 'MacOS']
const RECEIVER_TYPES = ['MERCHANT', 'INDIVIDUAL', 'BUSINESS', 'UTILITY']
const RECEIVER_BANKS = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Yes Bank']
const MERCHANT_CATEGORIES = ['FOOD', 'RETAIL', 'ENTERTAINMENT', 'TRAVEL', 'UTILITY', 'HEALTHCARE', 'EDUCATION']
const IP_RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH']
const MERCHANT_RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH']

// Different fraud scenarios
const FRAUD_SCENARIOS = {
    // High amount transactions (triggers static rules)
    HIGH_AMOUNT: {
        weight: 15,
        generate: (profile) => ({
            amount_value: randomInt(100001, 500000), // Exceeds MAX_SINGLE_TRANSACTION
            ip_risk: 'LOW',
            merchant_risk_level: 'LOW',
            sender_txn_count_1min: 1,
            sender_txn_count_10min: 2
        })
    },

    // High velocity (many transactions per minute)
    HIGH_VELOCITY: {
        weight: 15,
        generate: (profile) => ({
            amount_value: randomInt(5000, 25000),
            ip_risk: 'LOW',
            merchant_risk_level: 'LOW',
            sender_txn_count_1min: randomInt(4, 10), // Exceeds MAX_TRANSACTIONS_1MIN
            sender_txn_count_10min: randomInt(12, 20) // Exceeds MAX_TRANSACTIONS_10MIN
        })
    },

    // Geographic anomaly (different location)
    GEO_ANOMALY: {
        weight: 10,
        generate: (profile) => {
            // Generate coordinates far from profile location
            const offsetLat = randomFloat(5, 10) * (Math.random() > 0.5 ? 1 : -1)
            const offsetLng = randomFloat(5, 10) * (Math.random() > 0.5 ? 1 : -1)
            return {
                amount_value: randomInt(5000, 30000),
                current_latitude: profile.latitude + offsetLat,
                current_longitude: profile.longitude + offsetLng,
                ip_risk: 'MEDIUM',
                merchant_risk_level: 'LOW',
                sender_txn_count_1min: 1,
                sender_txn_count_10min: 2
            }
        }
    },

    // High 24hr amount
    HIGH_24HR_AMOUNT: {
        weight: 10,
        generate: (profile) => ({
            amount_value: randomInt(30000, 80000),
            sender_amount_24hr: randomInt(200001, 400000), // Exceeds MAX_AMOUNT_24HR
            ip_risk: 'LOW',
            merchant_risk_level: 'LOW',
            sender_txn_count_1min: 1,
            sender_txn_count_10min: 3
        })
    },

    // High risk IP
    HIGH_IP_RISK: {
        weight: 10,
        generate: (profile) => ({
            amount_value: randomInt(50001, 80000),
            ip_risk: 'HIGH',
            merchant_risk_level: 'MEDIUM',
            sender_txn_count_1min: randomInt(3, 5),
            sender_txn_count_10min: randomInt(5, 10)
        })
    },

    // High risk merchant
    HIGH_MERCHANT_RISK: {
        weight: 10,
        generate: (profile) => ({
            amount_value: randomInt(40000, 70000),
            ip_risk: 'MEDIUM',
            merchant_risk_level: 'HIGH',
            sender_txn_count_1min: 2,
            sender_txn_count_10min: 5
        })
    },

    // Normal legitimate transaction
    NORMAL: {
        weight: 30,
        generate: (profile) => ({
            amount_value: randomInt(500, 15000),
            ip_risk: 'LOW',
            merchant_risk_level: 'LOW',
            sender_txn_count_1min: 1,
            sender_txn_count_10min: randomInt(1, 4),
            sender_amount_24hr: randomInt(5000, 50000)
        })
    }
}

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function generateTransactionId(index) {
    const timestamp = Date.now()
    return `TXN_DEMO_${timestamp}_${String(index).padStart(4, '0')}`
}

function selectScenario() {
    const totalWeight = Object.values(FRAUD_SCENARIOS).reduce((sum, s) => sum + s.weight, 0)
    let random = Math.random() * totalWeight

    for (const [name, scenario] of Object.entries(FRAUD_SCENARIOS)) {
        random -= scenario.weight
        if (random <= 0) return name
    }
    return 'NORMAL'
}

function generateTransaction(index) {
    const profile = randomChoice(profiles)
    const scenarioName = selectScenario()
    const scenario = FRAUD_SCENARIOS[scenarioName]
    const scenarioData = scenario.generate(profile)

    const transaction = {
        transaction_id: generateTransactionId(index),
        transaction_type: randomChoice(TRANSACTION_TYPES),
        transaction_status: 'SUCCESS',
        transaction_timestamp: new Date().toISOString(),
        amount_value: scenarioData.amount_value || randomInt(1000, 20000),
        amount_currency: 'INR',

        // Sender info from profile
        sender_customer_id: profile.customer_id,
        sender_user_name: profile.user_name,
        sender_account_id: profile.account_id,
        sender_account_type: profile.account_type,
        sender_kyc_status: profile.kyc_status,
        sender_account_age_days: profile.account_age_days,
        sender_state: profile.state,
        sender_city: profile.city,
        current_latitude: scenarioData.current_latitude || profile.latitude,
        current_longitude: scenarioData.current_longitude || profile.longitude,
        sender_txn_count_1min: scenarioData.sender_txn_count_1min || 1,
        sender_txn_count_10min: scenarioData.sender_txn_count_10min || randomInt(1, 5),
        sender_amount_24hr: scenarioData.sender_amount_24hr || randomInt(10000, 100000),

        // Device info
        device_type: randomChoice(DEVICE_TYPES),
        device_os: randomChoice(DEVICE_OS),
        app_version: `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
        ip_risk: scenarioData.ip_risk || 'LOW',

        // Receiver info
        receiver_type: randomChoice(RECEIVER_TYPES),
        receiver_bank: randomChoice(RECEIVER_BANKS),
        merchant_category: randomChoice(MERCHANT_CATEGORIES),
        merchant_risk_level: scenarioData.merchant_risk_level || 'LOW',
        ...(() => {
            const receiverType = randomChoice(RECEIVER_TYPES);
            if (receiverType === 'INDIVIDUAL' || receiverType === 'BUSINESS') {
                // Pick a random receiver profile that isn't the sender
                const validReceivers = profiles.filter(p => p.customer_id !== profile.customer_id);
                const receiverProfile = randomChoice(validReceivers);
                return {
                    receiver_type: receiverType,
                    receiver_account_id: receiverProfile.account_id,
                    receiver_user_name: receiverProfile.user_name
                };
            } else {
                // Generate Merchant/Utility ID
                const merchId = `MERCH_${randomInt(1000, 9999)}`;
                return {
                    receiver_type: receiverType,
                    receiver_account_id: merchId,
                    receiver_user_name: `${randomChoice(MERCHANT_CATEGORIES)} Outlet ${randomInt(1, 100)}`
                };
            }
        })(),

        // Payment info
        payment_method: randomChoice(PAYMENT_METHODS),
        authorization_type: randomChoice(AUTHORIZATION_TYPES),

        // Metadata (for debugging)
        _scenario: scenarioName
    }

    return transaction
}

function generateAllTransactions() {
    console.log(`📝 Generating ${TOTAL_TRANSACTIONS} demo transactions...`)

    const transactions = []
    for (let i = 0; i < TOTAL_TRANSACTIONS; i++) {
        transactions.push(generateTransaction(i))
    }

    // Shuffle to randomize order
    transactions.sort(() => Math.random() - 0.5)

    // Count scenarios for stats
    const scenarioCounts = {}
    transactions.forEach(t => {
        scenarioCounts[t._scenario] = (scenarioCounts[t._scenario] || 0) + 1
    })

    console.log('\n📊 Transaction distribution:')
    Object.entries(scenarioCounts).forEach(([scenario, count]) => {
        console.log(`   ${scenario}: ${count} (${((count / TOTAL_TRANSACTIONS) * 100).toFixed(1)}%)`)
    })

    return transactions
}

async function streamTransactions(transactions) {
    console.log(`\n🚀 Starting to stream ${transactions.length} transactions to API...`)
    console.log(`   Interval: ${INTERVAL_MS}ms between requests`)
    console.log(`   Endpoint: ${API_URL}\n`)

    let successCount = 0
    let fraudCount = 0
    let errorCount = 0

    for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i]

        // Remove metadata before sending
        const { _scenario, ...cleanTxn } = txn

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanTxn)
            })

            const result = await response.json()

            if (result.success) {
                successCount++
                if (result.fraud?.is_fraud) {
                    fraudCount++
                    console.log(`[${i + 1}/${transactions.length}] ❌ FRAUD: ${txn.sender_user_name} - ₹${txn.amount_value} (${_scenario})`)
                } else {
                    console.log(`[${i + 1}/${transactions.length}] ✅ SAFE: ${txn.sender_user_name} - ₹${txn.amount_value} (${_scenario})`)
                }
            } else {
                errorCount++
                console.log(`[${i + 1}/${transactions.length}] ⚠️ ERROR: ${result.message?.slice(0, 50)}...`)
            }
        } catch (error) {
            errorCount++
            console.log(`[${i + 1}/${transactions.length}] ⚠️ ERROR: ${error.message}`)
        }

        // Wait before next request (except for last one)
        if (i < transactions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, INTERVAL_MS))
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📈 STREAMING COMPLETE')
    console.log('='.repeat(50))
    console.log(`   Total: ${transactions.length}`)
    console.log(`   Success: ${successCount}`)
    console.log(`   Fraud Detected: ${fraudCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Fraud Rate: ${((fraudCount / successCount) * 100).toFixed(1)}%`)
}

// Main
async function main() {
    const args = process.argv.slice(2)
    const generateOnly = args.includes('--generate-only')
    const streamOnly = args.includes('--stream-only')

    const outputPath = path.join(__dirname, 'demo-transactions.json')

    let transactions

    if (streamOnly) {
        // Load from file
        if (!fs.existsSync(outputPath)) {
            console.error('❌ No demo-transactions.json found. Run without --stream-only first.')
            process.exit(1)
        }
        transactions = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
        console.log(`📂 Loaded ${transactions.length} transactions from file`)
    } else {
        // Generate new transactions
        transactions = generateAllTransactions()

        // Save to file
        fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2))
        console.log(`\n💾 Saved to ${outputPath}`)
    }

    if (!generateOnly) {
        await streamTransactions(transactions)
    }
}

main().catch(console.error)

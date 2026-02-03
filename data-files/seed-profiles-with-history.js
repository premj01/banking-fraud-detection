// Script to seed 20 client profiles with 25 last transactions each
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Indian cities with coordinates
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
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { city: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
    { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
    { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
    { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
    { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
    { city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
    { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
    { city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
    { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 }
]

// Indian names
const firstNames = [
    'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Pooja',
    'Arjun', 'Kavita', 'Sanjay', 'Neha', 'Karan', 'Divya', 'Rohan', 'Meera',
    'Aditya', 'Riya', 'Nikhil', 'Shreya'
]

const lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Joshi',
    'Mehta', 'Nair', 'Rao', 'Iyer', 'Desai', 'Malhotra', 'Kapoor', 'Agarwal',
    'Chopra', 'Bose', 'Pillai', 'Menon'
]

const accountTypes = ['SAVINGS', 'CURRENT']
const kycStatuses = ['MIN_KYC', 'FULL_KYC']

// Generate 25 last transactions for a user
function generateLast25Transactions(customerId) {
    const transactions = []
    const now = new Date()

    for (let i = 0; i < 25; i++) {
        // Generate transactions going back in time (most recent first)
        const daysAgo = Math.floor(Math.random() * 60) // Random within last 60 days
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

        transactions.push({
            transaction_id: `TXN_HIST_${customerId}_${i + 1}`,
            amount: Math.floor(Math.random() * 15000) + 500, // 500-15500
            timestamp: timestamp.toISOString()
        })
    }

    // Sort by timestamp (oldest first, as they'll be added chronologically)
    return transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

async function seedProfiles() {
    console.log('🌱 Seeding 20 client profiles with 25 transactions each...\n')

    const profiles = []

    for (let i = 0; i < 20; i++) {
        const cityData = cities[i]
        const customerId = `CUST_IND_${String(i + 1).padStart(6, '0')}`
        const accountId = `ACC_IND_${String(i + 1).padStart(9, '0')}`
        const userName = `${firstNames[i]} ${lastNames[i]}`

        // Generate 25 last transactions
        const last25Transactions = generateLast25Transactions(customerId)

        // Calculate current month spend from last 25 transactions
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const currentMonthSpend = last25Transactions
            .filter(t => new Date(t.timestamp) >= thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0)

        try {
            const profile = await prisma.clientProfile.create({
                data: {
                    customerId,
                    accountId,
                    userName,
                    accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
                    accountAgeDays: Math.floor(Math.random() * 2000) + 365, // 1-6 years
                    accountCreatedAt: new Date(Date.now() - (Math.floor(Math.random() * 2000) + 365) * 24 * 60 * 60 * 1000),
                    kycStatus: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],

                    state: cityData.state,
                    city: cityData.city,
                    latitude: cityData.lat,
                    longitude: cityData.lon,

                    monthlyLimit: [50000, 100000, 200000, 500000][Math.floor(Math.random() * 4)],
                    currentMonthSpend: currentMonthSpend,
                    flaggedScore: 0, // Start with clean score

                    last30Transactions: last25Transactions // Store 25 transactions
                }
            })

            profiles.push(profile)
            console.log(`✅ Created: ${customerId} - ${userName} - ${cityData.city}, ${cityData.state}`)
            console.log(`   📊 25 transactions | Current spend: ₹${currentMonthSpend.toFixed(2)}`)

        } catch (error) {
            if (error.code === 'P2002') {
                console.log(`⚠️  Skipped: ${customerId} (already exists)`)
            } else {
                console.error(`❌ Error creating ${customerId}:`, error.message)
            }
        }
    }

    console.log(`\n✅ Successfully seeded ${profiles.length} client profiles!`)
    console.log('\nSample profiles:')
    profiles.slice(0, 5).forEach(p => {
        console.log(`  - ${p.customerId}: ${p.userName} - ${p.city}, ${p.state}`)
        console.log(`    Account: ${p.accountType}, KYC: ${p.kycStatus}`)
        console.log(`    Transactions: ${p.last30Transactions.length}, Spend: ₹${p.currentMonthSpend.toFixed(2)}`)
    })
}

seedProfiles()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

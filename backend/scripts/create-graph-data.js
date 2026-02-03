import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Graph Data Seeding...');

    // 1. Create a set of Users (Mock Profiles)
    const users = [
        { name: 'Cycle User A', accountId: 'ACC_CYC_A', email: 'cycle.a@test.com' },
        { name: 'Cycle User B', accountId: 'ACC_CYC_B', email: 'cycle.b@test.com' },
        { name: 'Cycle User C', accountId: 'ACC_CYC_C', email: 'cycle.c@test.com' },
        { name: 'Smurf Source', accountId: 'ACC_SMURF_SRC', email: 'smurf.src@test.com' },
        { name: 'Smurf Target', accountId: 'ACC_SMURF_TGT', email: 'smurf.tgt@test.com' }
    ];

    for (const u of users) {
        // Upsert ClientProfile
        await prisma.clientProfile.upsert({
            where: { accountId: u.accountId },
            update: {},
            create: {
                customerId: `CUST_${u.accountId}`,
                accountId: u.accountId,
                userName: u.name,
                accountType: 'SAVINGS',
                accountAgeDays: 100,
                accountCreatedAt: new Date(),
                kycStatus: 'VERIFIED',
                monthlyLimit: 50000,
                currentMonthSpend: 0
            }
        });
        console.log(`Created/Ensured User: ${u.name}`);
    }

    // 2. Create Cyclic Transactions (A -> B -> C -> A)
    // This simulates "Layering" to hide money trail
    const cycleTxns = [
        { from: 'ACC_CYC_A', to: 'ACC_CYC_B', amount: 5000, timeOffset: 0 },
        { from: 'ACC_CYC_B', to: 'ACC_CYC_C', amount: 4800, timeOffset: 5 }, // slightly less
        { from: 'ACC_CYC_C', to: 'ACC_CYC_A', amount: 4500, timeOffset: 10 } // loop back
    ];

    await createTransactions(cycleTxns, 'CYCLE');

    // 3. Create Smurfing (Fan-Out)
    // One source distributing to multiple accounts (Structuring)
    const fanOutTxns = [
        { from: 'ACC_SMURF_SRC', to: 'ACC_CYC_A', amount: 900, timeOffset: 0 },
        { from: 'ACC_SMURF_SRC', to: 'ACC_CYC_B', amount: 900, timeOffset: 1 },
        { from: 'ACC_SMURF_SRC', to: 'ACC_CYC_C', amount: 900, timeOffset: 2 }
    ];

    await createTransactions(fanOutTxns, 'FAN_OUT');

    console.log('✅ Graph Data Seeding Complete!');
}

async function createTransactions(txns, patternName) {
    const baseTime = new Date();

    for (const txn of txns) {
        const timestamp = new Date(baseTime.getTime() + txn.timeOffset * 60000); // add minutes

        // We need sender details to populate the flattened fraud_transactions table
        const sender = await prisma.clientProfile.findUnique({ where: { accountId: txn.from } });
        const receiver = await prisma.clientProfile.findUnique({ where: { accountId: txn.to } });

        await prisma.fraudTransaction.create({
            data: {
                transactionId: `TXN_${patternName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                transactionType: 'TRANSFER',
                transactionStatus: 'COMPLETED',
                transactionTimestamp: timestamp,
                amountValue: txn.amount,
                amountCurrency: 'INR',

                // Sender Details
                senderCustomerId: sender.customerId,
                senderUserName: sender.userName,
                senderAccountId: sender.accountId,
                senderAccountType: sender.accountType,

                // Receiver Details (NEW FIELDS)
                receiverAccountId: receiver.accountId,
                receiverUserName: receiver.userName,

                isFraud: false, // Initially false, our algorithm should flag it
                riskScore: 0
            }
        });
    }
    console.log(`Created ${txns.length} transactions for pattern: ${patternName}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

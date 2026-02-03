import { FRAUD_RULES } from '../config/fraud-rules.js'
import clientProfileRepository from '../repositories/client-profile.repository.js'
import fraudTransactionRepository from '../repositories/fraud-transaction.repository.js'
// import fraudClient from '../grpc/fraud-client.js' // Commented: Using REST API instead
import { calculateDistance } from '../utils/geo-calculator.js'

// ML Model REST API endpoint
const ML_API_URL = 'http://localhost:8000/score_dict'

export class FraudDetectionService {

    // STEP 3.1: Static Banking Rules
    async checkStaticRules(txnData) {
        const violations = []

        // Rule 1: Single transaction limit
        if (txnData.amount_value > FRAUD_RULES.MAX_SINGLE_TRANSACTION) {
            violations.push(`Amount ${txnData.amount_value} exceeds single transaction limit of ${FRAUD_RULES.MAX_SINGLE_TRANSACTION} INR`)
        }

        // Rule 2: Transaction velocity (1 minute)
        if (txnData.sender_txn_count_1min > FRAUD_RULES.MAX_TRANSACTIONS_1MIN) {
            violations.push(`Transaction count in 1 minute (${txnData.sender_txn_count_1min}) exceeds limit of ${FRAUD_RULES.MAX_TRANSACTIONS_1MIN}`)
        }

        // Rule 3: Transaction velocity (10 minutes)
        if (txnData.sender_txn_count_10min > FRAUD_RULES.MAX_TRANSACTIONS_10MIN) {
            violations.push(`Transaction count in 10 minutes (${txnData.sender_txn_count_10min}) exceeds limit of ${FRAUD_RULES.MAX_TRANSACTIONS_10MIN}`)
        }

        // Rule 4: 24-hour amount limit
        if (txnData.sender_amount_24hr > FRAUD_RULES.MAX_AMOUNT_24HR) {
            violations.push(`24-hour transaction amount (${txnData.sender_amount_24hr}) exceeds limit of ${FRAUD_RULES.MAX_AMOUNT_24HR} INR`)
        }

        if (violations.length > 0) {
            return {
                is_fraud: true,
                risk_score: 1.0,
                fraud_reason_unusual_amount: txnData.amount_value > FRAUD_RULES.MAX_SINGLE_TRANSACTION,
                fraud_reason_high_velocity: txnData.sender_txn_count_1min > FRAUD_RULES.MAX_TRANSACTIONS_1MIN,
                fraud_reason_geo_distance_anomaly: false,
                fraud_severity: 'HIGH',
                flag_color: 'RED',
                reason_of_fraud: violations.join('; ')
            }
        }

        return null // No fraud detected
    }

    // ============================================
    // STATISTICAL HELPER FUNCTIONS
    // ============================================

    // Calculate mean of an array
    calculateMean(values) {
        if (!values || values.length === 0) return 0
        return values.reduce((sum, val) => sum + val, 0) / values.length
    }

    // Calculate standard deviation
    calculateStdDev(values, mean) {
        if (!values || values.length < 2) return 0
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
        return Math.sqrt(avgSquaredDiff)
    }

    // Calculate Z-Score: How many standard deviations from mean
    calculateZScore(value, mean, stdDev) {
        if (stdDev === 0) return 0 // Avoid division by zero
        return (value - mean) / stdDev
    }

    // ============================================
    // BEHAVIORAL ANALYSIS ALGORITHMS
    // ============================================

    // Algorithm 1: Z-Score Anomaly Detection
    // Detects if current transaction amount is a statistical outlier
    detectAmountAnomaly(txnAmount, transactions) {
        if (!transactions || transactions.length < 5) {
            return { isAnomaly: false, zScore: 0, details: 'Insufficient data for analysis' }
        }

        const amounts = transactions.map(t => t.amount)
        const mean = this.calculateMean(amounts)
        const stdDev = this.calculateStdDev(amounts, mean)
        const zScore = this.calculateZScore(txnAmount, mean, stdDev)

        // Z-Score > 2 means amount is more than 2 standard deviations from mean
        // Z-Score > 3 is highly unusual (99.7% confidence)
        const isAnomaly = Math.abs(zScore) > 2
        const severity = Math.abs(zScore) > 3 ? 'HIGH' : (Math.abs(zScore) > 2 ? 'MEDIUM' : 'LOW')

        return {
            isAnomaly,
            zScore: Math.round(zScore * 100) / 100,
            mean: Math.round(mean * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
            severity,
            details: isAnomaly
                ? `Amount ₹${txnAmount} is ${Math.abs(zScore).toFixed(1)} std deviations from average ₹${mean.toFixed(0)}`
                : 'Amount is within normal range'
        }
    }

    // Algorithm 2: Repeated Pattern Detection
    // Detects if same/similar amounts appear suspiciously often (potential automation)
    detectRepeatedPatterns(txnAmount, transactions) {
        if (!transactions || transactions.length < 3) {
            return { isPattern: false, frequency: 0, details: 'Insufficient data' }
        }

        const amounts = transactions.map(t => t.amount)

        // Check for exact match patterns
        const exactMatches = amounts.filter(a => a === txnAmount).length

        // Check for similar amounts (within 5% tolerance)
        const tolerance = txnAmount * 0.05
        const similarMatches = amounts.filter(a => Math.abs(a - txnAmount) <= tolerance).length

        // Calculate pattern score
        const totalTxns = transactions.length
        const patternFrequency = similarMatches / totalTxns

        // Flag if same amount appears more than 30% of the time
        const isPattern = patternFrequency > 0.3 && similarMatches >= 3

        return {
            isPattern,
            exactMatches,
            similarMatches,
            frequency: Math.round(patternFrequency * 100),
            details: isPattern
                ? `Repeated amount pattern: ₹${txnAmount} appears ${similarMatches} times (${Math.round(patternFrequency * 100)}% of transactions)`
                : 'No suspicious patterns detected'
        }
    }

    // Algorithm 3: Spending Spike Detection
    // Compares recent spending velocity to historical average
    detectSpendingSpike(txnAmount, transactions) {
        if (!transactions || transactions.length < 10) {
            return { isSpike: false, spikeRatio: 0, details: 'Insufficient data' }
        }

        // Sort transactions by timestamp (newest first)
        const sorted = [...transactions].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        )

        // Split into recent (last 5 txns) vs historical (rest)
        const recentTxns = sorted.slice(0, 5)
        const historicalTxns = sorted.slice(5)

        if (historicalTxns.length < 5) {
            return { isSpike: false, spikeRatio: 0, details: 'Insufficient historical data' }
        }

        // Calculate average transaction amount for each period
        const recentAvg = this.calculateMean(recentTxns.map(t => t.amount))
        const historicalAvg = this.calculateMean(historicalTxns.map(t => t.amount))

        // Include current transaction in recent calculation
        const recentWithCurrent = (recentAvg * recentTxns.length + txnAmount) / (recentTxns.length + 1)

        // Calculate spike ratio
        const spikeRatio = historicalAvg > 0 ? recentWithCurrent / historicalAvg : 0

        // Flag if recent spending is more than 2x historical average
        const isSpike = spikeRatio > 2

        return {
            isSpike,
            spikeRatio: Math.round(spikeRatio * 100) / 100,
            recentAvg: Math.round(recentWithCurrent),
            historicalAvg: Math.round(historicalAvg),
            details: isSpike
                ? `Spending spike detected: Recent avg ₹${Math.round(recentWithCurrent)} is ${spikeRatio.toFixed(1)}x historical avg ₹${Math.round(historicalAvg)}`
                : 'Spending pattern is normal'
        }
    }

    // STEP 3.2: Behavioral Anomalies (using statistical analysis)
    async checkBehavioralAnomalies(txnData) {
        // Fetch sender profile
        const senderProfile = await clientProfileRepository.findByCustomerId(
            txnData.sender_customer_id
        )

        if (!senderProfile) {
            return { profile: null, fraud: null, analysis: null } // Skip if no profile
        }

        const violations = []
        let riskScore = 0
        let fraudReasons = {
            unusual_amount: false,
            geo_anomaly: false,
            high_velocity: false
        }

        // Analysis results for response
        const analysisResults = {
            amountAnomaly: null,
            repeatedPattern: null,
            spendingSpike: null,
            geoDistance: null,
            monthlyLimit: null
        }

        // Check 1: Monthly limit exceeded
        const projectedSpend = senderProfile.currentMonthSpend + txnData.amount_value
        if (projectedSpend > senderProfile.monthlyLimit) {
            violations.push(`Monthly limit exceeded: ₹${projectedSpend} > ₹${senderProfile.monthlyLimit}`)
            riskScore += 0.4
            fraudReasons.unusual_amount = true
            analysisResults.monthlyLimit = {
                exceeded: true,
                currentSpend: senderProfile.currentMonthSpend,
                projectedSpend,
                limit: senderProfile.monthlyLimit
            }
        }

        // Check 2: Statistical Amount Anomaly Detection (Z-Score)
        if (senderProfile.last30Transactions && senderProfile.last30Transactions.length >= 5) {
            const amountAnalysis = this.detectAmountAnomaly(
                txnData.amount_value,
                senderProfile.last30Transactions
            )
            analysisResults.amountAnomaly = amountAnalysis

            if (amountAnalysis.isAnomaly) {
                violations.push(amountAnalysis.details)
                riskScore += amountAnalysis.severity === 'HIGH' ? 0.4 : 0.25
                fraudReasons.unusual_amount = true
            }
        }

        // Check 3: Repeated Pattern Detection
        if (senderProfile.last30Transactions && senderProfile.last30Transactions.length >= 3) {
            const patternAnalysis = this.detectRepeatedPatterns(
                txnData.amount_value,
                senderProfile.last30Transactions
            )
            analysisResults.repeatedPattern = patternAnalysis

            if (patternAnalysis.isPattern) {
                violations.push(patternAnalysis.details)
                riskScore += 0.3
                fraudReasons.high_velocity = true // Patterns often indicate automation
            }
        }

        // Check 4: Spending Spike Detection
        if (senderProfile.last30Transactions && senderProfile.last30Transactions.length >= 10) {
            const spikeAnalysis = this.detectSpendingSpike(
                txnData.amount_value,
                senderProfile.last30Transactions
            )
            analysisResults.spendingSpike = spikeAnalysis

            if (spikeAnalysis.isSpike) {
                violations.push(spikeAnalysis.details)
                riskScore += 0.35
                fraudReasons.unusual_amount = true
            }
        }

        // Check 5: Geographic anomaly (only if coordinates are available)
        if (senderProfile.latitude && senderProfile.longitude &&
            txnData.current_latitude && txnData.current_longitude) {

            const distance = calculateDistance(
                senderProfile.latitude,
                senderProfile.longitude,
                txnData.current_latitude,
                txnData.current_longitude
            )

            analysisResults.geoDistance = {
                distance: Math.round(distance * 100) / 100,
                maxAllowed: FRAUD_RULES.MAX_GEO_DISTANCE_KM,
                profileLocation: { lat: senderProfile.latitude, lng: senderProfile.longitude },
                transactionLocation: { lat: txnData.current_latitude, lng: txnData.current_longitude }
            }

            if (distance > FRAUD_RULES.MAX_GEO_DISTANCE_KM) {
                violations.push(`Geographic distance ${distance.toFixed(2)}km exceeds limit of ${FRAUD_RULES.MAX_GEO_DISTANCE_KM}km`)
                riskScore += 0.3
                fraudReasons.geo_anomaly = true
            }
        }

        if (violations.length > 0) {
            return {
                profile: senderProfile,
                fraud: {
                    is_fraud: true,
                    risk_score: Math.min(riskScore, 1.0),
                    fraud_reason_unusual_amount: fraudReasons.unusual_amount,
                    fraud_reason_geo_distance_anomaly: fraudReasons.geo_anomaly,
                    fraud_reason_high_velocity: fraudReasons.high_velocity,
                    fraud_severity: riskScore >= 0.7 ? 'HIGH' : 'MEDIUM',
                    flag_color: 'RED',
                    reason_of_fraud: violations.join('; ')
                },
                analysis: analysisResults
            }
        }

        return { profile: senderProfile, fraud: null, analysis: analysisResults }
    }

    // STEP 4: Call ML Model via REST API - GRPC
    async callMLModel(txnData) {
        try {
            // Calculate Transaction_Amount_Deviation from profile history
            const profile = await clientProfileRepository.findByCustomerId(txnData.sender_customer_id)
            let amountDeviation = 0
            if (profile && profile.last30Transactions && profile.last30Transactions.length > 0) {
                const amounts = profile.last30Transactions.map(t => t.amount)
                const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length
                if (mean > 0) {
                    amountDeviation = ((txnData.amount_value - mean) / mean) * 100
                }
            }

            // Prepare request for ML model
            const timestamp = new Date(txnData.transaction_timestamp)
            const mlRequest = {
                transaction: {
                    amount: txnData.amount_value,
                    Transaction_Amount_Deviation: Math.round(amountDeviation),
                    Transaction_Frequency: txnData.sender_txn_count_10min || 1,
                    Days_Since_Last_Transaction: 1, // Default to 1 day
                    Date: timestamp.toISOString().split('T')[0],
                    Time: timestamp.toISOString().split('T')[1].split('.')[0],
                    Transaction_Status: txnData.transaction_status || 'Success',
                    Transaction_Type: txnData.payment_method || 'UPI',
                    Device_OS: txnData.device_os || 'Android',
                    Merchant_Category: txnData.merchant_category || 'Retail',
                    Merchant_Risk_Level: txnData.merchant_risk_level === 'HIGH' ? 4 :
                        txnData.merchant_risk_level === 'MEDIUM' ? 2 : 1
                }
            }

            console.log('📡 Calling ML API:', ML_API_URL)
            const response = await fetch(ML_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlRequest)
            })

            if (!response.ok) {
                throw new Error(`ML API returned ${response.status}`)
            }

            const mlResult = await response.json()
            console.log('🤖 ML Response:', mlResult)

            // Map ML response to our fraud result format
            const isFraud = mlResult.is_flagged || mlResult.ensemble_score > 0.5
            const riskScore = mlResult.ensemble_score || mlResult.confidence || 0

            // Determine severity and flag color from ML response
            const severity = mlResult.severity || (riskScore > 0.7 ? 'HIGH' : riskScore > 0.4 ? 'MEDIUM' : 'LOW')
            const flagColor = severity === 'HIGH' ? 'RED' : severity === 'MEDIUM' ? 'ORANGE' : 'GREEN'

            return {
                is_fraud: isFraud,
                risk_score: riskScore,
                fraud_reason_unusual_amount: mlResult.iso_score > 0.5,
                fraud_reason_geo_distance_anomaly: false,
                fraud_reason_high_velocity: mlResult.rf_proba > 0.5,
                fraud_severity: severity,
                flag_color: flagColor,
                reason_of_fraud: isFraud
                    ? `ML Detection: ${mlResult.recommended_action || 'Flagged by model'} (Score: ${(riskScore * 100).toFixed(1)}%)`
                    : 'Transaction approved by ML model',
                // Include raw ML scores for analysis
                ml_scores: {
                    iso_score: mlResult.iso_score,
                    rf_proba: mlResult.rf_proba,
                    xgb_proba: mlResult.xgb_proba,
                    ensemble_score: mlResult.ensemble_score,
                    confidence: mlResult.confidence
                }
            }
        } catch (error) {
            console.error('❌ ML API call failed:', error.message)
            // Fallback: No fraud detected
            return {
                is_fraud: false,
                risk_score: 0.0,
                fraud_reason_unusual_amount: false,
                fraud_reason_geo_distance_anomaly: false,
                fraud_reason_high_velocity: false,
                fraud_severity: 'LOW',
                flag_color: 'GREEN',
                reason_of_fraud: 'ML model unavailable - transaction approved'
            }
        }
    }

    // Main detection flow - returns full result with all data
    async detectFraud(txnData) {
        let senderProfile = null
        let analysisResults = null

        // STEP 3.1: Check static rules
        const staticFraud = await this.checkStaticRules(txnData)
        if (staticFraud) {
            await this.logFraudTransaction(txnData, staticFraud)
            // Increment flagged score for fraud
            await this.updateFlaggedScore(txnData.sender_customer_id, staticFraud.risk_score)

            // Fetch profile for response even though we detected fraud via static rules
            senderProfile = await clientProfileRepository.findByCustomerId(txnData.sender_customer_id)

            return {
                fraudResult: staticFraud,
                profile: senderProfile,
                analysis: null,
                detectionMethod: 'STATIC_RULES'
            }
        }

        // STEP 3.2: Check behavioral anomalies
        const behavioralResult = await this.checkBehavioralAnomalies(txnData)
        senderProfile = behavioralResult.profile
        analysisResults = behavioralResult.analysis

        if (behavioralResult.fraud) {
            await this.logFraudTransaction(txnData, behavioralResult.fraud)
            // Increment flagged score for fraud
            await this.updateFlaggedScore(txnData.sender_customer_id, behavioralResult.fraud.risk_score)

            return {
                fraudResult: behavioralResult.fraud,
                profile: senderProfile,
                analysis: analysisResults,
                detectionMethod: 'BEHAVIORAL_ANALYSIS'
            }
        }

        // STEP 4: Call ML model
        const mlFraud = await this.callMLModel(txnData)
        await this.logFraudTransaction(txnData, mlFraud)

        // Update user profile based on fraud result
        if (mlFraud.is_fraud) {
            // Increment flagged score for fraud
            await this.updateFlaggedScore(txnData.sender_customer_id, mlFraud.risk_score)
        } else if (senderProfile) {
            // Update monthly spend and transactions for non-fraud
            await clientProfileRepository.updateMonthlySpend(
                txnData.sender_customer_id,
                txnData.amount_value
            )

            await clientProfileRepository.updateLast30Transactions(
                txnData.sender_customer_id,
                {
                    transaction_id: txnData.transaction_id,
                    amount: txnData.amount_value,
                    timestamp: txnData.transaction_timestamp
                }
            )
        }

        return {
            fraudResult: mlFraud,
            profile: senderProfile,
            analysis: analysisResults,
            detectionMethod: 'ML_MODEL'
        }
    }

    // Update flagged score based on fraud severity
    async updateFlaggedScore(customerId, riskScore) {
        // Calculate score increment based on risk score
        // High risk (0.7-1.0) = +10 points
        // Medium risk (0.4-0.7) = +5 points
        // Low risk (0-0.4) = +2 points
        let scoreIncrement = 0

        if (riskScore >= 0.7) {
            scoreIncrement = 10
        } else if (riskScore >= 0.4) {
            scoreIncrement = 5
        } else {
            scoreIncrement = 2
        }

        await clientProfileRepository.updateFlaggedScore(customerId, scoreIncrement)
    }

    // Log transaction to database
    async logFraudTransaction(txnData, fraudResult) {
        return await fraudTransactionRepository.create({
            transactionId: txnData.transaction_id,
            transactionType: txnData.transaction_type,
            transactionStatus: txnData.transaction_status,
            transactionTimestamp: new Date(txnData.transaction_timestamp),
            amountValue: txnData.amount_value,
            amountCurrency: txnData.amount_currency,
            senderCustomerId: txnData.sender_customer_id,
            senderUserName: txnData.sender_user_name,
            senderAccountId: txnData.sender_account_id,
            senderAccountType: txnData.sender_account_type,
            senderKycStatus: txnData.sender_kyc_status,
            senderAccountAgeDays: txnData.sender_account_age_days,
            senderState: txnData.sender_state,
            senderCity: txnData.sender_city,
            currentLatitude: txnData.current_latitude,
            currentLongitude: txnData.current_longitude,
            senderTxnCount1min: txnData.sender_txn_count_1min,
            senderTxnCount10min: txnData.sender_txn_count_10min,
            senderAmount24hr: txnData.sender_amount_24hr,
            deviceType: txnData.device_type,
            deviceOs: txnData.device_os,
            appVersion: txnData.app_version,
            ipRisk: txnData.ip_risk,
            receiverType: txnData.receiver_type,
            receiverBank: txnData.receiver_bank,
            merchantCategory: txnData.merchant_category,
            merchantRiskLevel: txnData.merchant_risk_level,
            paymentMethod: txnData.payment_method,
            authorizationType: txnData.authorization_type,
            isFraud: fraudResult.is_fraud,
            riskScore: fraudResult.risk_score,
            fraudReasonUnusualAmount: fraudResult.fraud_reason_unusual_amount,
            fraudReasonGeoDistanceAnomaly: fraudResult.fraud_reason_geo_distance_anomaly,
            fraudReasonHighVelocity: fraudResult.fraud_reason_high_velocity,
            fraudSeverity: fraudResult.fraud_severity,
            flagColor: fraudResult.flag_color,
            reasonOfFraud: fraudResult.reason_of_fraud
        })
    }
}

export default new FraudDetectionService()

import fraudDetectionService from '../services/fraud-detection.service.js'
import fraudTransactionRepository from '../repositories/fraud-transaction.repository.js'
import clientProfileRepository from '../repositories/client-profile.repository.js'
import analyticsService from '../services/analytics.service.js'

export const detectFraud = async (req, res, next) => {
    try {
        const txnData = req.body

        // Detect fraud - now returns full result with profile and analysis
        const result = await fraudDetectionService.detectFraud(txnData)

        const { fraudResult, profile, analysis, detectionMethod } = result

        // Build comprehensive response for socket emission
        const fullResponse = {
            // Transaction Info
            transaction: {
                transaction_id: txnData.transaction_id,
                transaction_type: txnData.transaction_type,
                transaction_status: txnData.transaction_status,
                transaction_timestamp: txnData.transaction_timestamp,
                amount_value: txnData.amount_value,
                amount_currency: txnData.amount_currency,
                payment_method: txnData.payment_method,
                authorization_type: txnData.authorization_type
            },

            // Sender Info
            sender: {
                customer_id: txnData.sender_customer_id,
                user_name: txnData.sender_user_name,
                account_id: txnData.sender_account_id,
                account_type: txnData.sender_account_type,
                kyc_status: txnData.sender_kyc_status,
                account_age_days: txnData.sender_account_age_days,
                state: txnData.sender_state,
                city: txnData.sender_city,
                current_latitude: txnData.current_latitude,
                current_longitude: txnData.current_longitude,
                txn_count_1min: txnData.sender_txn_count_1min,
                txn_count_10min: txnData.sender_txn_count_10min,
                amount_24hr: txnData.sender_amount_24hr
            },

            // Device Info
            device: {
                device_type: txnData.device_type,
                device_os: txnData.device_os,
                app_version: txnData.app_version,
                ip_risk: txnData.ip_risk
            },

            // Receiver/Merchant Info
            receiver: {
                receiver_type: txnData.receiver_type,
                receiver_bank: txnData.receiver_bank,
                merchant_category: txnData.merchant_category,
                merchant_risk_level: txnData.merchant_risk_level
            },

            // Fraud Detection Result
            fraud: {
                is_fraud: fraudResult.is_fraud,
                risk_score: fraudResult.risk_score,
                fraud_severity: fraudResult.fraud_severity,
                flag_color: fraudResult.flag_color,
                reason_of_fraud: fraudResult.reason_of_fraud,
                detection_method: detectionMethod,
                reasons: {
                    unusual_amount: fraudResult.fraud_reason_unusual_amount,
                    geo_distance_anomaly: fraudResult.fraud_reason_geo_distance_anomaly,
                    high_velocity: fraudResult.fraud_reason_high_velocity
                }
            },

            // User Profile from Database
            profile: profile ? {
                customer_id: profile.customerId,
                account_id: profile.accountId,
                user_name: profile.userName,
                account_type: profile.accountType,
                account_age_days: profile.accountAgeDays,
                kyc_status: profile.kycStatus,
                state: profile.state,
                city: profile.city,
                latitude: profile.latitude,
                longitude: profile.longitude,
                monthly_limit: profile.monthlyLimit,
                current_month_spend: profile.currentMonthSpend,
                flagged_score: profile.flaggedScore,
                transaction_history_count: profile.last30Transactions?.length || 0
            } : null,

            // Statistical Analysis Results
            analysis: analysis ? {
                amount_anomaly: analysis.amountAnomaly,
                repeated_pattern: analysis.repeatedPattern,
                spending_spike: analysis.spendingSpike,
                geo_distance: analysis.geoDistance,
                monthly_limit: analysis.monthlyLimit
            } : null,

            // Metadata
            metadata: {
                processed_at: new Date().toISOString(),
                detection_method: detectionMethod
            }
        }

        // Broadcast full data via WebSocket
        const io = req.app.get('io')
        io.emit('real-time-stream', fullResponse)

        // Record transaction for analytics (fire and forget)
        analyticsService.recordTransaction(txnData, fraudResult).catch(err => {
            console.error('Analytics recording error:', err.message)
        })

        // Also send API response with full data
        res.json({
            success: true,
            ...fullResponse
        })
    } catch (error) {
        next(error)
    }
}

// Helper function to format DB record to socket format
const formatTransactionForFrontend = async (record) => {
    // Fetch profile for this customer
    let profile = null
    try {
        profile = await clientProfileRepository.findByCustomerId(record.senderCustomerId)
    } catch (e) {
        // Profile fetch failed, continue without it
    }

    return {
        transaction: {
            transaction_id: record.transactionId,
            transaction_type: record.transactionType,
            transaction_status: record.transactionStatus,
            transaction_timestamp: record.transactionTimestamp,
            amount_value: record.amountValue,
            amount_currency: record.amountCurrency,
            payment_method: record.paymentMethod,
            authorization_type: record.authorizationType
        },
        sender: {
            customer_id: record.senderCustomerId,
            user_name: record.senderUserName,
            account_id: record.senderAccountId,
            account_type: record.senderAccountType,
            kyc_status: record.senderKycStatus,
            account_age_days: record.senderAccountAgeDays,
            state: record.senderState,
            city: record.senderCity,
            current_latitude: record.currentLatitude,
            current_longitude: record.currentLongitude,
            txn_count_1min: record.senderTxnCount1min,
            txn_count_10min: record.senderTxnCount10min,
            amount_24hr: record.senderAmount24hr
        },
        device: {
            device_type: record.deviceType,
            device_os: record.deviceOs,
            app_version: record.appVersion,
            ip_risk: record.ipRisk
        },
        receiver: {
            receiver_type: record.receiverType,
            receiver_bank: record.receiverBank,
            merchant_category: record.merchantCategory,
            merchant_risk_level: record.merchantRiskLevel
        },
        fraud: {
            is_fraud: record.isFraud,
            risk_score: record.riskScore,
            fraud_severity: record.fraudSeverity,
            flag_color: record.flagColor,
            reason_of_fraud: record.reasonOfFraud,
            detection_method: 'HISTORICAL',
            reasons: {
                unusual_amount: record.fraudReasonUnusualAmount,
                geo_distance_anomaly: record.fraudReasonGeoDistanceAnomaly,
                high_velocity: record.fraudReasonHighVelocity
            }
        },
        profile: profile ? {
            customer_id: profile.customerId,
            account_id: profile.accountId,
            user_name: profile.userName,
            account_type: profile.accountType,
            account_age_days: profile.accountAgeDays,
            kyc_status: profile.kycStatus,
            state: profile.state,
            city: profile.city,
            latitude: profile.latitude,
            longitude: profile.longitude,
            monthly_limit: profile.monthlyLimit,
            current_month_spend: profile.currentMonthSpend,
            flagged_score: profile.flaggedScore,
            transaction_history_count: profile.last30Transactions?.length || 0
        } : null,
        analysis: null, // Historical records don't have live analysis
        metadata: {
            processed_at: record.createdAt,
            detection_method: 'HISTORICAL'
        }
    }
}

// GET /api/transactions/recent - Fetch last 10 transactions for initial load
export const getRecentTransactions = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const records = await fraudTransactionRepository.findRecent(limit)

        // Format each record to match socket emission format
        const formatted = await Promise.all(
            records.map(record => formatTransactionForFrontend(record))
        )

        res.json({
            success: true,
            count: formatted.length,
            transactions: formatted
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/transactions/user/:customerId - Fetch transactions for a specific user
export const getUserTransactions = async (req, res, next) => {
    try {
        const { customerId } = req.params
        const limit = parseInt(req.query.limit) || 25

        const records = await fraudTransactionRepository.findByCustomerId(customerId, limit)

        // Format each record to match socket emission format
        const formatted = await Promise.all(
            records.map(record => formatTransactionForFrontend(record))
        )

        res.json({
            success: true,
            count: formatted.length,
            customer_id: customerId,
            transactions: formatted
        })
    } catch (error) {
        next(error)
    }
}

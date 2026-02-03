/**
 * API Service for communicating with the backend
 */

// Use relative URL to leverage Vite's proxy, or fall back to direct URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch recent transactions from the backend
 * @param {number} limit - Number of transactions to fetch (default: 20)
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function fetchRecentTransactions(limit = 20) {
    const response = await fetch(`${API_BASE_URL}/api/transactions/recent?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions');
    }

    // Transform backend format to frontend format
    return data.transactions.map(transformTransaction);
}

/**
 * Fetch transactions for a specific user
 * @param {string} customerId - Customer ID to fetch transactions for
 * @param {number} limit - Number of transactions to fetch (default: 25)
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function fetchUserTransactions(customerId, limit = 25) {
    const response = await fetch(`${API_BASE_URL}/api/transactions/user/${customerId}?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch user transactions: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user transactions');
    }

    // Transform backend format to frontend format
    return data.transactions.map(transformTransaction);
}

/**
 * Transform backend transaction format to frontend format
 * @param {Object} backendTxn - Transaction from backend API
 * @returns {Object} Transformed transaction for frontend
 */
export function transformTransaction(backendTxn) {
    const { transaction, sender, device, receiver, fraud, profile, metadata } = backendTxn;

    // Map transaction type to frontend format
    const typeMap = {
        'PAYMENT': 'card',
        'TRANSFER': 'transfer',
        'WITHDRAWAL': 'withdrawal',
        'PURCHASE': 'online_purchase',
        'CARD': 'card',
    };

    // Determine status based on fraud detection
    let status = 'approved';
    if (fraud?.is_fraud) {
        status = fraud.fraud_severity === 'HIGH' || fraud.fraud_severity === 'CRITICAL'
            ? 'declined'
            : 'flagged';
    }

    // Get merchant name or sender name for display
    const merchantName = receiver?.receiver_type === 'MERCHANT'
        ? receiver.merchant_category
        : sender?.user_name || 'Unknown';

    return {
        transaction_id: transaction?.transaction_id || 'N/A',
        user_id: sender?.customer_id || profile?.customer_id || 'N/A',
        amount: transaction?.amount_value || 0,
        currency: transaction?.amount_currency || 'INR',
        transaction_type: typeMap[transaction?.transaction_type?.toUpperCase()] || 'transfer',
        merchant_id: receiver?.receiver_bank || 'N/A',
        merchant_name: merchantName,
        merchant_category: receiver?.merchant_category || 'General',
        timestamp: transaction?.transaction_timestamp || new Date().toISOString(),
        location: {
            country: 'India',
            state: sender?.state || 'Unknown',
            city: sender?.city || 'Unknown',
            latitude: sender?.current_latitude || 0,
            longitude: sender?.current_longitude || 0,
        },
        device: {
            device_id: 'N/A',
            device_type: device?.device_type?.toLowerCase() || 'mobile',
            os: device?.device_os || 'Unknown',
            ip_address: 'N/A',
        },
        status,
        risk_score: fraud?.risk_score || 0,
        rule_hits: fraud?.is_fraud ? [fraud.reason_of_fraud] : [],
        // Keep original data for detailed view
        _original: backendTxn,
    };
}

/**
 * Fetch hourly analytics data
 * @returns {Promise<Object>} Hourly analytics data
 */
export async function fetchHourlyAnalytics() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/hourly`);

    if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics');
    }

    return {
        hourlyVolume: transformHourlyVolume(data.data.hourlyVolume),
        peakFraudHours: data.data.peakFraudHours || []
    };
}

/**
 * Fetch analytics summary
 * @returns {Promise<Object>} Analytics summary data
 */
export async function fetchAnalyticsSummary() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/summary`);

    if (!response.ok) {
        throw new Error(`Failed to fetch analytics summary: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics summary');
    }

    return data.data;
}

/**
 * Fetch analytics trends
 * @returns {Promise<Object>} Analytics trends data
 */
export async function fetchAnalyticsTrends() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/trends`);

    if (!response.ok) {
        throw new Error(`Failed to fetch analytics trends: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics trends');
    }

    return data.data;
}

/**
 * Fetch full analytics data
 * @returns {Promise<Object>} Full analytics data containing summary, trends, and hourly
 */
export async function fetchAnalyticsFull() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/full`);

    if (!response.ok) {
        throw new Error(`Failed to fetch full analytics: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch full analytics');
    }

    return {
        summary: data.data.summary,
        trends: data.data.trends,
        hourly: {
            hourlyVolume: transformHourlyVolume(data.data.hourly.hourlyVolume),
            peakFraudHours: data.data.hourly.peakFraudHours || []
        }
    };
}

/**
 * Transform hourly volume array to chart data
 * @param {Array} volumes - Array of 24 hourly volumes
 * @returns {Array} Chart data with time labels
 */
function transformHourlyVolume(volumes) {
    if (!volumes || !Array.isArray(volumes)) return [];

    // Assuming the API returns volumes for hours 0-23 of the current day
    // Or it might be the last 24 hours. The mock data generator used "last 24 hours".
    // Let's assume the API returns [00:00, 01:00, ... 23:00] for simplicity based on the doc example

    return volumes.map((value, index) => {
        const hour = index.toString().padStart(2, '0');
        return {
            time: `${hour}:00`,
            value: value
        };
    });
}

export default {
    fetchRecentTransactions,
    fetchUserTransactions,
    fetchHourlyAnalytics,
    fetchAnalyticsSummary,
    fetchAnalyticsTrends,
    fetchAnalyticsFull,
    transformTransaction,
};

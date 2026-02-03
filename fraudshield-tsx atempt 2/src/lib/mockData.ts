import {
  Transaction,
  UserProfile,
  FraudAlert,
  Investigator,
  DashboardStats,
  GeoHeatmapData,
  ModelPerformance,
  RulePerformance,
  TransactionType,
  TransactionStatus,
  AlertSeverity,
  AlertStatus,
  DeviceType,
} from '@/types/fraud';

// Helper functions
const randomId = (prefix: string) => `${prefix}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Location data
const locations = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
  { city: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.385, lng: 78.4867 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 },
];

const merchants = [
  { id: 'MRC001', name: 'Amazon India', category: 'E-commerce' },
  { id: 'MRC002', name: 'Flipkart', category: 'E-commerce' },
  { id: 'MRC003', name: 'Swiggy', category: 'Food Delivery' },
  { id: 'MRC004', name: 'Zomato', category: 'Food Delivery' },
  { id: 'MRC005', name: 'BigBasket', category: 'Groceries' },
  { id: 'MRC006', name: 'Myntra', category: 'Fashion' },
  { id: 'MRC007', name: 'BookMyShow', category: 'Entertainment' },
  { id: 'MRC008', name: 'MakeMyTrip', category: 'Travel' },
  { id: 'MRC009', name: 'PhonePe Merchant', category: 'Payments' },
  { id: 'MRC010', name: 'Paytm Mall', category: 'E-commerce' },
  { id: 'MRC011', name: 'IRCTC', category: 'Travel' },
  { id: 'MRC012', name: 'Reliance Digital', category: 'Electronics' },
];

const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Neha', 'Arjun', 'Kavya', 'Raj', 'Ananya', 'Sanjay', 'Meera'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Gupta', 'Joshi', 'Verma', 'Mehta', 'Kapoor', 'Rao'];

const alertTypes = [
  'High Amount Spike',
  'Unusual Location',
  'Velocity Breach',
  'New Device + High Amount',
  'Threshold Evasion',
  'Night Transaction',
  'Account Takeover Signal',
  'Impossible Travel',
  'Merchant Category Anomaly',
  'Failed Transaction Pattern',
];

const ruleDescriptions = [
  'Transaction amount exceeds 3x historical average',
  'First transaction from this geographic region',
  'Multiple transactions within 5-minute window',
  'High-value transaction from unregistered device',
  'Amount just below ₹50,000 reporting threshold',
  'Transaction between 1 AM - 5 AM local time',
  'Login from new device after password change',
  'Two transactions 500km apart within 1 hour',
  'First-time transaction in this merchant category',
  '3+ failed transactions in last 24 hours',
];

const operatingSystems = ['Android 13', 'Android 14', 'iOS 17', 'iOS 16', 'Windows 11', 'macOS Sonoma'];
const browsers = ['Chrome 120', 'Safari 17', 'Firefox 121', 'Edge 120'];

// Generate transaction
export const generateTransaction = (overrides?: Partial<Transaction>): Transaction => {
  const loc = randomElement(locations);
  const merchant = randomElement(merchants);
  const riskScore = randomFloat(0, 1);
  const isHighRisk = riskScore > 0.7;
  const isMediumRisk = riskScore > 0.4;

  const status: TransactionStatus = isHighRisk 
    ? (Math.random() > 0.3 ? 'flagged' : 'declined')
    : (Math.random() > 0.05 ? 'approved' : 'flagged');

  const deviceType = randomElement<DeviceType>(['mobile', 'web', 'tablet']);
  
  return {
    transaction_id: randomId('TXN'),
    user_id: randomId('USR'),
    amount: isHighRisk ? randomBetween(50000, 500000) : randomBetween(100, 50000),
    currency: 'INR',
    transaction_type: randomElement<TransactionType>(['transfer', 'card', 'withdrawal', 'online_purchase']),
    merchant_id: merchant.id,
    merchant_name: merchant.name,
    merchant_category: merchant.category,
    timestamp: new Date(Date.now() - randomBetween(0, 7 * 24 * 60 * 60 * 1000)).toISOString(),
    location: {
      country: loc.country,
      state: loc.state,
      city: loc.city,
      latitude: loc.lat + randomFloat(-0.1, 0.1),
      longitude: loc.lng + randomFloat(-0.1, 0.1),
    },
    device: {
      device_id: randomId('DEV'),
      device_type: deviceType,
      os: randomElement(operatingSystems),
      ip_address: `${randomBetween(1, 255)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(1, 255)}`,
      browser: deviceType === 'web' ? randomElement(browsers) : undefined,
    },
    status,
    risk_score: riskScore,
    rule_hits: isHighRisk || isMediumRisk 
      ? Array.from({ length: randomBetween(1, 3) }, () => randomElement(ruleDescriptions))
      : [],
    ...overrides,
  };
};

// Generate user profile
export const generateUserProfile = (userId?: string): UserProfile => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const flaggedCount = randomBetween(0, 10);
  const totalTxns = randomBetween(50, 500);
  
  return {
    user_id: userId || randomId('USR'),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `+91 ${randomBetween(70000, 99999)}${randomBetween(10000, 99999)}`,
    account_age_days: randomBetween(30, 1500),
    avg_transaction_amount: randomBetween(1000, 25000),
    daily_transaction_count: randomBetween(1, 10),
    known_devices: randomBetween(1, 5),
    usual_locations: Array.from({ length: randomBetween(1, 3) }, () => randomElement(locations).city),
    last_login: new Date(Date.now() - randomBetween(0, 48 * 60 * 60 * 1000)).toISOString(),
    risk_level: flaggedCount > 5 ? 'High' : flaggedCount > 2 ? 'Medium' : 'Low',
    total_transactions: totalTxns,
    flagged_transactions: flaggedCount,
    account_status: flaggedCount > 8 ? 'Under Review' : 'Active',
  };
};

// Generate fraud alert
export const generateFraudAlert = (overrides?: Partial<FraudAlert>): FraudAlert => {
  const alertType = randomElement(alertTypes);
  const severity: AlertSeverity = randomElement(['Critical', 'High', 'Medium', 'Low']);
  const status: AlertStatus = randomElement(['Open', 'Under Review', 'Closed', 'Escalated']);
  
  return {
    alert_id: randomId('ALT'),
    transaction_id: randomId('TXN'),
    user_id: randomId('USR'),
    alert_type: alertType,
    severity,
    status,
    assigned_to: status !== 'Open' ? randomId('INV') : null,
    assigned_name: status !== 'Open' ? `${randomElement(firstNames)} ${randomElement(lastNames)}` : undefined,
    created_at: new Date(Date.now() - randomBetween(0, 7 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: status !== 'Open' ? new Date(Date.now() - randomBetween(0, 24 * 60 * 60 * 1000)).toISOString() : undefined,
    description: `${alertType} detected for transaction`,
    rule_triggers: Array.from({ length: randomBetween(1, 3) }, () => randomElement(ruleDescriptions)),
    amount: randomBetween(10000, 500000),
    resolution: status === 'Closed' ? randomElement(['Confirmed Fraud', 'False Positive', 'User Verified']) : undefined,
    ...overrides,
  };
};

// Generate investigator
export const generateInvestigator = (): Investigator => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const openCases = randomBetween(5, 30);
  
  return {
    id: randomId('INV'),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fraudops.com`,
    role: randomElement<'Fraud Analyst' | 'Investigator'>(['Fraud Analyst', 'Investigator']),
    open_cases: openCases,
    closed_cases: randomBetween(50, 200),
    avg_resolution_time: randomFloat(2, 48),
    workload: openCases > 25 ? 'Critical' : openCases > 18 ? 'High' : openCases > 10 ? 'Medium' : 'Low',
  };
};

// Generate dashboard stats
export const generateDashboardStats = (): DashboardStats => ({
  total_transactions: randomBetween(150000, 250000),
  transactions_today: randomBetween(8000, 15000),
  flagged_transactions: randomBetween(200, 500),
  fraud_detection_rate: randomFloat(94, 99),
  false_positive_rate: randomFloat(1, 5),
  losses_prevented: randomBetween(5000000, 15000000),
  actual_losses: randomBetween(100000, 500000),
  open_alerts: randomBetween(50, 150),
  avg_resolution_time: randomFloat(4, 12),
});

// Generate geo heatmap data
export const generateGeoHeatmapData = (): GeoHeatmapData[] => 
  locations.map(loc => ({
    city: loc.city,
    state: loc.state,
    country: loc.country,
    latitude: loc.lat,
    longitude: loc.lng,
    fraud_count: randomBetween(10, 200),
    total_transactions: randomBetween(5000, 50000),
    risk_score: randomFloat(0.1, 0.9),
  }));

// Generate model performance data for last 30 days
export const generateModelPerformance = (): ModelPerformance[] => {
  const data: ModelPerformance[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      accuracy: randomFloat(92, 98),
      precision: randomFloat(88, 96),
      recall: randomFloat(85, 95),
      f1_score: randomFloat(87, 95),
      false_positive_rate: randomFloat(2, 8),
      detection_rate: randomFloat(90, 98),
    });
  }
  return data;
};

// Generate rule performance
export const generateRulePerformance = (): RulePerformance[] => [
  { rule_name: 'High Amount Threshold', triggers: randomBetween(500, 1000), true_positives: randomBetween(300, 600), false_positives: randomBetween(50, 150), effectiveness: randomFloat(60, 85) },
  { rule_name: 'Velocity Check', triggers: randomBetween(300, 700), true_positives: randomBetween(200, 500), false_positives: randomBetween(30, 100), effectiveness: randomFloat(65, 90) },
  { rule_name: 'Geographic Anomaly', triggers: randomBetween(200, 500), true_positives: randomBetween(150, 350), false_positives: randomBetween(20, 80), effectiveness: randomFloat(70, 92) },
  { rule_name: 'Device Fingerprint', triggers: randomBetween(400, 800), true_positives: randomBetween(300, 600), false_positives: randomBetween(40, 120), effectiveness: randomFloat(68, 88) },
  { rule_name: 'Time-based Pattern', triggers: randomBetween(150, 400), true_positives: randomBetween(100, 280), false_positives: randomBetween(15, 60), effectiveness: randomFloat(72, 94) },
  { rule_name: 'Account Age Check', triggers: randomBetween(250, 550), true_positives: randomBetween(180, 400), false_positives: randomBetween(25, 90), effectiveness: randomFloat(66, 86) },
];

// Generate batch data
export const generateTransactions = (count: number): Transaction[] => 
  Array.from({ length: count }, () => generateTransaction());

export const generateFraudAlerts = (count: number): FraudAlert[] => 
  Array.from({ length: count }, () => generateFraudAlert());

export const generateInvestigators = (count: number): Investigator[] => 
  Array.from({ length: count }, () => generateInvestigator());

// Generate time series data
export const generateTimeSeriesData = (days: number, baseValue: number, variance: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, baseValue + randomBetween(-variance, variance)),
    });
  }
  return data;
};

// Generate hourly data for today
export const generateHourlyData = (baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - i, 0, 0, 0);
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, baseValue + randomBetween(-variance, variance)),
    });
  }
  return data;
};

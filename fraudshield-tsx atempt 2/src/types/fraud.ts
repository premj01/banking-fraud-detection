// Core data types for Fraud Monitoring Dashboard

export type TransactionType = 'transfer' | 'card' | 'withdrawal' | 'online_purchase';
export type TransactionStatus = 'approved' | 'declined' | 'flagged';
export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Open' | 'Under Review' | 'Closed' | 'Escalated';
export type UserRole = 'Admin' | 'Fraud Analyst' | 'Investigator';
export type DeviceType = 'mobile' | 'web' | 'tablet';

export interface Location {
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Device {
  device_id: string;
  device_type: DeviceType;
  os: string;
  ip_address: string;
  browser?: string;
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
  timestamp: string;
  location: Location;
  device: Device;
  status: TransactionStatus;
  risk_score: number;
  rule_hits?: string[];
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  account_age_days: number;
  avg_transaction_amount: number;
  daily_transaction_count: number;
  known_devices: number;
  usual_locations: string[];
  last_login: string;
  risk_level: 'Low' | 'Medium' | 'High';
  total_transactions: number;
  flagged_transactions: number;
  account_status: 'Active' | 'Suspended' | 'Under Review';
}

export interface FraudAlert {
  alert_id: string;
  transaction_id: string;
  user_id: string;
  alert_type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  assigned_to: string | null;
  assigned_name?: string;
  created_at: string;
  updated_at?: string;
  description: string;
  rule_triggers: string[];
  amount: number;
  resolution?: string;
}

export interface Investigator {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  open_cases: number;
  closed_cases: number;
  avg_resolution_time: number; // in hours
  workload: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DashboardStats {
  total_transactions: number;
  transactions_today: number;
  flagged_transactions: number;
  fraud_detection_rate: number;
  false_positive_rate: number;
  losses_prevented: number;
  actual_losses: number;
  open_alerts: number;
  avg_resolution_time: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GeoHeatmapData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  fraud_count: number;
  total_transactions: number;
  risk_score: number;
}

export interface ModelPerformance {
  date: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  detection_rate: number;
}

export interface RulePerformance {
  rule_name: string;
  triggers: number;
  true_positives: number;
  false_positives: number;
  effectiveness: number;
}

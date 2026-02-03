#!/usr/bin/env python3
"""
Fraud Detection Testing Script
Reads transactions from CSV and tests them one by one
"""

import csv
import json
import requests
import time
from datetime import datetime

# API Configuration
API_URL = "http://localhost:5000/api/transactions/detect"
CSV_FILE = "test_transactions.csv"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}🔍 Fraud Detection Testing System{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")

def print_transaction_info(txn_data, index, total):
    print(f"\n{Colors.BOLD}Transaction {index}/{total}:{Colors.RESET}")
    print(f"  ID: {txn_data['transaction_id']}")
    print(f"  Customer: {txn_data['sender_customer_id']}")
    print(f"  Name: {txn_data['sender_user_name']}")
    print(f"  Amount: ₹{txn_data['amount_value']}")
    print(f"  Location: {txn_data['sender_city']}, {txn_data['sender_state']}")
    print(f"  Type: {txn_data['transaction_type']}")

def print_result(result):
    is_fraud = result.get('is_fraud', False)
    risk_score = result.get('risk_score', 0)
    flag_color = result.get('flag_color', 'GREEN')
    reason = result.get('reason_of_fraud', 'N/A')
    
    if is_fraud:
        print(f"\n  {Colors.RED}{Colors.BOLD}🚨 FRAUD DETECTED!{Colors.RESET}")
        print(f"  {Colors.RED}Flag: {flag_color}{Colors.RESET}")
        print(f"  {Colors.RED}Risk Score: {risk_score:.2f}{Colors.RESET}")
        print(f"  {Colors.RED}Severity: {result.get('fraud_severity', 'N/A')}{Colors.RESET}")
        print(f"  {Colors.RED}Reason: {reason}{Colors.RESET}")
    else:
        print(f"\n  {Colors.GREEN}{Colors.BOLD}✅ APPROVED{Colors.RESET}")
        print(f"  {Colors.GREEN}Flag: {flag_color}{Colors.RESET}")
        print(f"  {Colors.GREEN}Risk Score: {risk_score:.2f}{Colors.RESET}")

def test_transaction(txn_data, index, total):
    """Test a single transaction"""
    print_transaction_info(txn_data, index, total)
    
    try:
        # Make API call
        response = requests.post(API_URL, json=txn_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_result(result)
            return result
        else:
            print(f"\n  {Colors.RED}❌ Error: {response.status_code}{Colors.RESET}")
            print(f"  {Colors.RED}{response.text}{Colors.RESET}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"\n  {Colors.RED}❌ Connection Error: Backend server not running?{Colors.RESET}")
        return None
    except requests.exceptions.Timeout:
        print(f"\n  {Colors.RED}❌ Timeout: Request took too long{Colors.RESET}")
        return None
    except Exception as e:
        print(f"\n  {Colors.RED}❌ Error: {str(e)}{Colors.RESET}")
        return None

def read_csv_transactions(filename):
    """Read transactions from CSV file"""
    transactions = []
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert numeric fields
                txn = {
                    'transaction_id': row['transaction_id'],
                    'transaction_type': row['transaction_type'],
                    'transaction_status': row['transaction_status'],
                    'transaction_timestamp': row['transaction_timestamp'],
                    'amount_value': float(row['amount_value']),
                    'amount_currency': row['amount_currency'],
                    
                    'sender_customer_id': row['sender_customer_id'],
                    'sender_user_name': row['sender_user_name'],
                    'sender_account_id': row['sender_account_id'],
                    'sender_account_type': row['sender_account_type'],
                    'sender_kyc_status': row['sender_kyc_status'],
                    'sender_account_age_days': int(row['sender_account_age_days']),
                    'sender_state': row['sender_state'],
                    'sender_city': row['sender_city'],
                    
                    'current_latitude': float(row['current_latitude']),
                    'current_longitude': float(row['current_longitude']),
                    
                    'sender_txn_count_1min': int(row['sender_txn_count_1min']),
                    'sender_txn_count_10min': int(row['sender_txn_count_10min']),
                    'sender_amount_24hr': float(row['sender_amount_24hr']),
                    
                    'device_type': row['device_type'],
                    'device_os': row['device_os'],
                    'app_version': row['app_version'],
                    'ip_risk': row['ip_risk'],
                    
                    'receiver_type': row['receiver_type'],
                    'receiver_bank': row['receiver_bank'],
                    'merchant_category': row['merchant_category'],
                    'merchant_risk_level': row['merchant_risk_level'],
                    
                    'payment_method': row['payment_method'],
                    'authorization_type': row['authorization_type']
                }
                transactions.append(txn)
        
        return transactions
    except FileNotFoundError:
        print(f"{Colors.RED}❌ Error: {filename} not found!{Colors.RESET}")
        print(f"{Colors.YELLOW}Run generate-transactions-csv.js first to create the CSV file.{Colors.RESET}")
        return []
    except Exception as e:
        print(f"{Colors.RED}❌ Error reading CSV: {str(e)}{Colors.RESET}")
        return []

def print_summary(results):
    """Print summary statistics"""
    total = len(results)
    fraud_count = sum(1 for r in results if r and r.get('is_fraud'))
    approved_count = total - fraud_count
    
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}📊 Summary{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    print(f"  Total Transactions: {total}")
    print(f"  {Colors.GREEN}✅ Approved: {approved_count} ({approved_count/total*100:.1f}%){Colors.RESET}")
    print(f"  {Colors.RED}🚨 Fraud Detected: {fraud_count} ({fraud_count/total*100:.1f}%){Colors.RESET}")
    
    # Fraud reasons breakdown
    if fraud_count > 0:
        unusual_amount = sum(1 for r in results if r and r.get('fraud_reason_unusual_amount'))
        geo_anomaly = sum(1 for r in results if r and r.get('fraud_reason_geo_distance_anomaly'))
        high_velocity = sum(1 for r in results if r and r.get('fraud_reason_high_velocity'))
        
        print(f"\n  {Colors.YELLOW}Fraud Reasons:{Colors.RESET}")
        print(f"    - Unusual Amount: {unusual_amount}")
        print(f"    - Geographic Anomaly: {geo_anomaly}")
        print(f"    - High Velocity: {high_velocity}")

def main():
    print_header()
    
    # Read transactions from CSV
    print(f"{Colors.YELLOW}📂 Reading transactions from {CSV_FILE}...{Colors.RESET}")
    transactions = read_csv_transactions(CSV_FILE)
    
    if not transactions:
        print(f"\n{Colors.RED}❌ No transactions to test!{Colors.RESET}")
        return
    
    print(f"{Colors.GREEN}✅ Loaded {len(transactions)} transactions{Colors.RESET}")
    
    # Ask for confirmation
    print(f"\n{Colors.YELLOW}Press ENTER to start testing (or Ctrl+C to cancel)...{Colors.RESET}")
    input()
    
    # Test each transaction
    results = []
    start_time = time.time()
    
    for i, txn in enumerate(transactions, 1):
        result = test_transaction(txn, i, len(transactions))
        results.append(result)
        
        # Small delay between requests
        time.sleep(0.1)
        
        # Ask to continue after each transaction
        if i < len(transactions):
            print(f"\n{Colors.YELLOW}Press ENTER for next transaction (or Ctrl+C to stop)...{Colors.RESET}")
            try:
                input()
            except KeyboardInterrupt:
                print(f"\n\n{Colors.YELLOW}⚠️  Testing stopped by user{Colors.RESET}")
                break
    
    # Print summary
    elapsed_time = time.time() - start_time
    print_summary(results)
    
    print(f"\n  ⏱️  Total Time: {elapsed_time:.2f} seconds")
    print(f"  ⚡ Avg Time per Transaction: {elapsed_time/len(results):.2f} seconds")
    
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.GREEN}✅ Testing Complete!{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠️  Testing interrupted by user{Colors.RESET}\n")
    except Exception as e:
        print(f"\n{Colors.RED}❌ Unexpected error: {str(e)}{Colors.RESET}\n")

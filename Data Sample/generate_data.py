import pandas as pd
import random
from datetime import datetime, timedelta
import uuid

# Indian cities and states
INDIAN_LOCATIONS = [
    ("Mumbai", "Maharashtra"), ("Delhi", "Delhi"), ("Bangalore", "Karnataka"),
    ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"), ("Kolkata", "West Bengal"),
    ("Pune", "Maharashtra"), ("Ahmedabad", "Gujarat"), ("Jaipur", "Rajasthan"),
    ("Lucknow", "Uttar Pradesh"), ("Surat", "Gujarat"), ("Kanpur", "Uttar Pradesh")
]

BANKS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Canara", "Union", "IDBI"]

def generate_transaction(is_fraud):
    """Generate a single transaction record"""
    city, state = random.choice(INDIAN_LOCATIONS)
    
    if is_fraud:
        # Fraud transaction
        return {
            "transaction_id": str(uuid.uuid4()),
            "transaction_type": random.randint(0, 1),
            "transaction_status": 1,
            "transaction_timestamp": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat() + "Z",
            "amount_value": random.randint(50000, 200000),
            "amount_currency": "INR",
            "sender_customer_id": f"CUST{random.randint(10000, 99999)}",
            "sender_account_id": f"ACC{random.randint(100000000, 999999999)}",
            "sender_account_type": random.randint(0, 1),
            "sender_kyc_status": random.randint(0, 1),
            "sender_account_age_days": random.randint(10, 500),
            "device_type": random.randint(0, 1),
            "device_os": random.randint(0, 2),
            "app_version": f"{random.randint(1, 5)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
            "ip_risk": random.randint(1, 2),  # MEDIUM or HIGH
            "sender_state": state,
            "sender_city": city,
            "receiver_type": random.randint(0, 1),
            "receiver_bank": random.choice(BANKS),
            "merchant_category": random.randint(0, 7),
            "merchant_risk_level": random.randint(1, 2),  # MEDIUM or HIGH
            "payment_method": random.randint(0, 2),
            "authorization_type": random.randint(0, 2),
            "sender_txn_count_1min": random.randint(5, 15),
            "sender_txn_count_10min": random.randint(15, 50),
            "sender_amount_24hr": random.randint(100000, 500000),
            "is_fraud": 1,
            "risk_score": round(random.uniform(0.65, 0.99), 3),
            "fraud_reason_unusual_amount": random.choice([0, 1]),
            "fraud_reason_geo_distance_anomaly": random.choice([0, 1]),
            "fraud_reason_high_velocity": random.choice([0, 1]),
            "fraud_severity": random.randint(1, 2),  # MEDIUM or HIGH
            "flag_color": 1  # RED
        }
    else:
        # Normal transaction
        return {
            "transaction_id": str(uuid.uuid4()),
            "transaction_type": random.randint(0, 1),
            "transaction_status": 1,
            "transaction_timestamp": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat() + "Z",
            "amount_value": random.randint(50, 15000),
            "amount_currency": "INR",
            "sender_customer_id": f"CUST{random.randint(10000, 99999)}",
            "sender_account_id": f"ACC{random.randint(100000000, 999999999)}",
            "sender_account_type": random.randint(0, 1),
            "sender_kyc_status": random.randint(0, 1),
            "sender_account_age_days": random.randint(30, 2000),
            "device_type": random.randint(0, 1),
            "device_os": random.randint(0, 2),
            "app_version": f"{random.randint(1, 5)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
            "ip_risk": random.choice([0, 0, 0, 1]),  # Mostly LOW, occasionally MEDIUM
            "sender_state": state,
            "sender_city": city,
            "receiver_type": random.randint(0, 1),
            "receiver_bank": random.choice(BANKS),
            "merchant_category": random.randint(0, 7),
            "merchant_risk_level": random.choice([0, 0, 0, 1]),  # Mostly LOW
            "payment_method": random.randint(0, 2),
            "authorization_type": random.randint(0, 2),
            "sender_txn_count_1min": random.randint(0, 2),
            "sender_txn_count_10min": random.randint(0, 5),
            "sender_amount_24hr": random.randint(100, 30000),
            "is_fraud": 0,
            "risk_score": round(random.uniform(0.0, 0.35), 3),
            "fraud_reason_unusual_amount": 0,
            "fraud_reason_geo_distance_anomaly": 0,
            "fraud_reason_high_velocity": 0,
            "fraud_severity": 0,  # LOW
            "flag_color": 0  # GREEN
        }

# Generate 300 records: 85% non-fraud, 15% fraud
total_records = 300
fraud_count = int(total_records * 0.15)  # 45 fraud transactions
non_fraud_count = total_records - fraud_count  # 255 non-fraud transactions

print(f"Generating {non_fraud_count} non-fraud and {fraud_count} fraud transactions...")

transactions = []

# Generate non-fraud transactions
for _ in range(non_fraud_count):
    transactions.append(generate_transaction(is_fraud=False))

# Generate fraud transactions
for _ in range(fraud_count):
    transactions.append(generate_transaction(is_fraud=True))

# Shuffle to mix fraud and non-fraud
random.shuffle(transactions)

# Create DataFrame
df = pd.DataFrame(transactions)

# Save to CSV
df.to_csv("fraud_transactions.csv", index=False)
print(f"✅ Generated fraud_transactions.csv with {len(df)} records")
print(f"   - Non-fraud: {len(df[df['is_fraud'] == 0])} ({len(df[df['is_fraud'] == 0])/len(df)*100:.1f}%)")
print(f"   - Fraud: {len(df[df['is_fraud'] == 1])} ({len(df[df['is_fraud'] == 1])/len(df)*100:.1f}%)")

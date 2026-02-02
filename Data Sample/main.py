PROMPT = """
You are a fraud transaction data generator.

Generate realistic Indian digital payment transactions.

CRITICAL RULES:
- Output ONLY valid JSON
- Output must be a JSON ARRAY
- No explanations, no markdown
- Each object must strictly follow the schema

SCHEMA:
{
  "transaction_id": string,
  "transaction_type": 0=TRANSFER | 1=PAYMENT,
  "transaction_status": 1=SUCCESS,
  "transaction_timestamp": ISO-8601 UTC string,

  "amount_value": number,
  "amount_currency": "INR",

  "sender_customer_id": string,
  "sender_account_id": string,
  "sender_account_type": 0=SAVINGS | 1=CURRENT,
  "sender_kyc_status": 0=MIN_KYC | 1=FULL_KYC,
  "sender_account_age_days": number,

  "device_type": 0=MOBILE | 1=WEB,
  "device_os": 0=Android | 1=iOS | 2=Windows,
  "app_version": string,
  "ip_risk": 0=LOW | 1=MEDIUM | 2=HIGH,

  "sender_state": string,
  "sender_city": string,

  "receiver_type": 0=PERSON | 1=MERCHANT,
  "receiver_bank": string,
  "merchant_category": 0=FOOD | 1=ELECTRONICS | 2=TRAVEL | 3=HEALTH | 4=UTILITIES | 5=ENTERTAINMENT | 6=SHOPPING | 7=EDUCATION,
  "merchant_risk_level": 0=LOW | 1=MEDIUM | 2=HIGH,

  "payment_method": 0=UPI | 1=CARD | 2=NETBANKING,
  "authorization_type": 0=PIN | 1=OTP | 2=BIOMETRIC,

  "sender_txn_count_1min": number,
  "sender_txn_count_10min": number,
  "sender_amount_24hr": number,

  "is_fraud": 0=false | 1=true,
  "risk_score": number,

  "fraud_reason_unusual_amount": 0=false | 1=true,
  "fraud_reason_geo_distance_anomaly": 0=false | 1=true,
  "fraud_reason_high_velocity": 0=false | 1=true,
  "fraud_severity": 0=LOW | 1=MEDIUM | 2=HIGH,
  "flag_color": 0=GREEN | 1=RED
}

FRAUD DISTRIBUTION:
- Generate approximately 85-90% NON-FRAUD transactions (is_fraud = false)
- Generate approximately 10-15% FRAUD transactions (is_fraud = true)
- Most transactions should be normal, everyday payments

NON-FRAUD TRANSACTION RULES (85-90% of data):
- is_fraud = 0
- amount_value: typically 50 to 15000 (normal daily transactions)
- sender_txn_count_1min: 0 to 2
- sender_txn_count_10min: 0 to 5
- risk_score: 0.0 to 0.35
- ALL fraud_reason_* MUST be 0
- fraud_severity MUST be 0 (LOW)
- flag_color MUST be 0 (GREEN)
- ip_risk: mostly 0 (LOW), occasionally 1 (MEDIUM)
- merchant_risk_level: mostly 0 (LOW), occasionally 1 (MEDIUM)

FRAUD TRANSACTION RULES (10-15% of data):
- is_fraud = 1
- amount_value > 50000 OR unusual patterns
- sender_txn_count_1min >= 5 OR sender_txn_count_10min >= 15
- risk_score: 0.65 to 1.0
- At least ONE fraud_reason_* must be 1
- fraud_severity: 1 (MEDIUM) or 2 (HIGH)
- flag_color MUST be 1 (RED)
- ip_risk: 1 (MEDIUM) or 2 (HIGH)

Generate EXACTLY 40 records.
Make it realistic - most people don't commit fraud every transaction!
"""
from google import genai
from google.genai import types
import json
import pandas as pd
from tqdm import tqdm
import os
import time

# ---------------- CONFIG ----------------
API_KEYS = [
    "AIzaSyCuPYoZ_hnQCZwHrtbLk1GnnVyWX2Yth4g",
    "AIzaSyBQjWszXXjzUcMjPMv5BusPI9Cxli8e9PM",
    "AIzaSyBouJHHwVUKqOFQr9YloZg3d8g81JiP5Fw",
    "AIzaSyBf1GpuH66XamiMhSq3quVIwS-am1uIZss"
]
current_key_index = 0

def get_client():
    """Rotate through API keys"""
    global current_key_index
    client = genai.Client(api_key=API_KEYS[current_key_index])
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    return client

MODEL_NAME = "models/gemini-2.5-flash"
TARGET_ROWS = 1000
BATCH_SIZE = 40
DELAY_BETWEEN_REQUESTS = 3  # Reduced delay since we're rotating keys
BATCH_SIZE = 10

CSV_COLUMNS = [
    "transaction_id","transaction_type","transaction_status","transaction_timestamp",
    "amount_value","amount_currency",
    "sender_customer_id","sender_account_id","sender_account_type","sender_kyc_status",
    "sender_account_age_days",
    "device_type","device_os","app_version","ip_risk",
    "sender_state","sender_city",
    "receiver_type","receiver_bank","merchant_category","merchant_risk_level",
    "payment_method","authorization_type",
    "sender_txn_count_1min","sender_txn_count_10min","sender_amount_24hr",
    "is_fraud","risk_score",
    "fraud_reason_unusual_amount","fraud_reason_geo_distance_anomaly",
    "fraud_reason_high_velocity","fraud_severity","flag_color"
]

all_rows = []
failed_batches = 0
max_retries = 2

for i in tqdm(range(TARGET_ROWS // BATCH_SIZE)):
    retry_count = 0
    batch_success = False
    
    while retry_count <= max_retries and not batch_success:
        try:
            client = get_client()  # Get next API key
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=PROMPT,
                config=types.GenerateContentConfig(
                    temperature=0.9,
                    top_p=0.95,
                    max_output_tokens=8192
                )
            )

            raw_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if raw_text.startswith("```"):
                lines = raw_text.split("\n")
                raw_text = "\n".join(lines[1:-1]) if len(lines) > 2 else raw_text
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()

            try:
                batch = json.loads(raw_text)
                all_rows.extend(batch)
                
                # Save to CSV after each successful batch
                df = pd.DataFrame(all_rows)
                df = df[CSV_COLUMNS]
                df.to_csv("fraud_transactions.csv", index=False)
                print(f"✅ Batch {i+1} saved - Total rows: {len(df)}")
                batch_success = True
                
            except json.JSONDecodeError as e:
                # Try to salvage partial JSON by finding complete objects
                try:
                    # Find the last complete object before the error
                    last_complete = raw_text.rfind("},")
                    if last_complete > 0:
                        partial = raw_text[:last_complete+1] + "]"
                        batch = json.loads(partial)
                        all_rows.extend(batch)
                        print(f"⚠️ Partial batch recovered - Added {len(batch)} rows")
                        
                        # Save partial progress
                        df = pd.DataFrame(all_rows)
                        df = df[CSV_COLUMNS]
                        df.to_csv("fraud_transactions.csv", index=False)
                        batch_success = True
                    else:
                        raise e
                except:
                    if retry_count < max_retries:
                        retry_count += 1
                        print(f"⚠️ Retry {retry_count}/{max_retries} for batch {i+1}")
                        time.sleep(3)  # Wait before retry
                    else:
                        print(f"⚠️ Batch {i+1} failed after {max_retries} retries")
                        failed_batches += 1
                        batch_success = True  # Move on
                        
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"⚠️ Rate limit on key {current_key_index}, rotating...")
                time.sleep(2)
                retry_count += 1
            else:
                print(f"⚠️ API Error: {str(e)[:100]}")
                retry_count += 1
                time.sleep(3)
            
            if retry_count > max_retries:
                failed_batches += 1
                batch_success = True
    
    # Add small delay between batches
    if batch_success and i < (TARGET_ROWS // BATCH_SIZE) - 1:
        time.sleep(DELAY_BETWEEN_REQUESTS)

print(f"✅ Complete! Final CSV has {len(all_rows)} rows")
print(f"Failed batches: {failed_batches}/{TARGET_ROWS // BATCH_SIZE}")

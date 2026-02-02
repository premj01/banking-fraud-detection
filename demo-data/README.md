# Demo Data Generator & Streamer

Generate and stream demo transactions to the fraud detection API for demonstration purposes.

## Usage

```bash
cd demo-data

# Generate 150 transactions AND stream to API
npm run stream

# Only generate JSON file (no streaming)
npm run generate

# Stream from existing file only
npm run stream-only
```

## Transaction Distribution

The generator creates a mix of fraud and legitimate transactions:

| Scenario | Weight | Description |
|----------|--------|-------------|
| HIGH_AMOUNT | 15% | Exceeds single transaction limit (₹100,000+) |
| HIGH_VELOCITY | 15% | Too many transactions per minute |
| GEO_ANOMALY | 10% | Transaction far from registered location |
| HIGH_24HR_AMOUNT | 10% | Exceeds 24-hour spending limit |
| HIGH_IP_RISK | 10% | High-risk IP address |
| HIGH_MERCHANT_RISK | 10% | High-risk merchant category |
| NORMAL | 30% | Legitimate transaction |

~70% of transactions are designed to trigger fraud detection.

## Output

- `demo-transactions.json` - Generated transactions (150 records)
- Console shows real-time streaming results

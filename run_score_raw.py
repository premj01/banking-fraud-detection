import json
import urllib.request

payload = {
    'transaction': {
        'DateTime': '2026-02-03T12:34:00',
        'amount': -50,
        'Transaction_Amount_Deviation': 100,
        'Transaction_Frequency': 1,
        'Days_Since_Last_Transaction': 10,
        'Transaction_Status': 'Completed',
        'Transaction_Type': 'Purchase',
        'Payment_Gateway': 'PG1',
        'Device_OS': 'Android',
        'Merchant_Category': 'Retail',
        'Transaction_Channel': 'Online'
    }
}

data = json.dumps(payload).encode()
req = urllib.request.Request('http://127.0.0.1:8000/score_raw', data=data, headers={'Content-Type': 'application/json'})
print('INPUT:', json.dumps(payload))
resp = urllib.request.urlopen(req).read().decode()
print('OUTPUT:', resp)

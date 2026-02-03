# Fraud Detection System - Local Setup

This project trains and runs fraud-detection models on `Copy of Sample_DATA.csv`.

Prerequisites
- Python 3.8+

Create and activate a virtual environment (PowerShell):

```powershell
cd "c:\Users\ringa\OneDrive\Desktop\project\new\fraud_detection_system"
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

Train models (saves artifacts to `models/`):

```powershell
python -c "import sys; sys.stdout.reconfigure(encoding='utf-8')" ; python train_models.py
```

Run demo that shows one legitimate and one fraudulent transaction:

```powershell
python -c "import sys; sys.stdout.reconfigure(encoding='utf-8')" ; python show_txn_inputs.py
```

Other demo scripts:
- `predict_example.py` — train + apply models to 3 example transactions
- `predict_mixed_examples.py` — analyze mixed legit/suspicious examples

Notes
- Model artifacts are saved to `models/` as `isolation_forest.pkl`, `random_forest.pkl`, `xgboost.pkl`, and `scaler.pkl`.
- If you run into Pandas ``ChainedAssignmentWarning``, it is harmless for this demo; to silence warnings set `pd.options.mode.chained_assignment = None` in scripts.

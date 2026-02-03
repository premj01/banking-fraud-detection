from model_service import ModelService

ms = ModelService()
print('ModelService loaded OK')
raw = {'DateTime':'2026-02-03T12:34:00','amount':-50,'Transaction_Amount_Deviation':100,'Transaction_Frequency':1,'Days_Since_Last_Transaction':10,'Transaction_Status':'Completed','Transaction_Type':'Purchase','Payment_Gateway':'PG1','Device_OS':'Android','Merchant_Category':'Retail','Transaction_Channel':'Online'}
features = ms.features_from_dict(raw)
print('Features length:', len(features))
print(features)
print('Scoring...')
print(ms.score_features(features))

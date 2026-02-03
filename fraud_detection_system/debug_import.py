import traceback
try:
    import app
    print('Imported app successfully')
except Exception:
    traceback.print_exc()

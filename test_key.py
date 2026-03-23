import os
from dotenv import load_dotenv

load_dotenv()
private_key = os.getenv('FIREBASE_PRIVATE_KEY', '')

print('Original ENV value:')
print(repr(private_key))

private_key = private_key.replace('\\n', '\n')
private_key = private_key.strip().strip('"').strip("'").strip()

print('\nProcessed ENV value:')
print(repr(private_key))

print('\nDoes it start with -----BEGIN PRIVATE KEY----- ?')
print(private_key.startswith('-----BEGIN PRIVATE KEY-----'))

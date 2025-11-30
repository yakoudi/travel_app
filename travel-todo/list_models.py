import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("[ERROR] API Key not found in .env")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print(f"[SUCCESS] Found {len(models)} models:")
        for m in models:
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(f" - {m['name']}")
    else:
        print(f"[ERROR] Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"[EXCEPTION] {e}")


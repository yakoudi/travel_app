import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:10]}..." if api_key else "Pas de clé")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Dis bonjour en une phrase")
    print(f"✅ SUCCESS: {response.text}")
except Exception as e:
    print(f"❌ ERREUR: {e}")

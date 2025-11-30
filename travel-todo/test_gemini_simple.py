"""Test simple de l'API Gemini"""
import os
import requests
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

print(f"🔑 Clé API chargée: {api_key[:10]}..." if api_key else "❌ Pas de clé API")

if api_key:
    # Test simple de l'API
    api_url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"
    
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{"text": "Dis bonjour en une phrase"}]
        }]
    }
    
    try:
        response = requests.post(
            f"{api_url}?key={api_key}",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            print(f"✅ Gemini fonctionne! Réponse: {text}")
        else:
            print(f"❌ Erreur API: {response.status_code}")
            print(f"Détails: {response.text}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
else:
    print("❌ Configurez GEMINI_API_KEY dans le fichier .env")

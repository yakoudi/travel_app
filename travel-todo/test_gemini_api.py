"""
Script de test pour vérifier que l'intégration Gemini fonctionne
via l'API REST directe (sans dépendance de version de librairie)
"""

import os
import sys
import django
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.gemini_intelligence import GeminiChatbot

def test_gemini_integration():
    print("[TEST] Test de l'integration Gemini via REST API\n")
    
    try:
        # Initialiser le chatbot
        print("[1] Initialisation du chatbot Gemini...")
        bot = GeminiChatbot()
        print("    Chatbot initialise avec succes!\n")
        
        # Test 1: Message simple
        print("[2] Test d'un message simple...")
        test_message = "Bonjour"
        print(f"    Message: '{test_message}'")
        
        analysis = bot.analyze_message(test_message)
        print(f"    Intent detecte: {analysis.get('intent')}")
        print(f"    Reponse: {analysis.get('response')}")
        print(f"    Confiance: {analysis.get('confidence')}\n")
        
        # Test 2: Recherche d'hôtel
        print("[3] Test d'une recherche d'hotel...")
        test_message = "Je cherche un hotel a Paris"
        print(f"    Message: '{test_message}'")
        
        analysis = bot.analyze_message(test_message)
        print(f"    Intent detecte: {analysis.get('intent')}")
        print(f"    Entites: {analysis.get('entities')}")
        print(f"    Reponse: {analysis.get('response')}\n")
        
        # Test 3: Question sur le nom
        print("[4] Test d'une question sur le nom...")
        test_message = "Comment tu t'appelles ?"
        print(f"    Message: '{test_message}'")
        
        analysis = bot.analyze_message(test_message)
        print(f"    Intent detecte: {analysis.get('intent')}")
        print(f"    Reponse: {analysis.get('response')}\n")
        
        print("[SUCCESS] Tous les tests sont passes avec succes!")
        
    except ValueError as e:
        print(f"[ERROR] Erreur de configuration: {e}")
        print("\nVerifiez que votre cle API Gemini est correctement configuree dans .env")
        
    except Exception as e:
        print(f"[ERROR] Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini_integration()

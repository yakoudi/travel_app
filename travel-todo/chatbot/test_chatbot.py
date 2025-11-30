
import os
import django
import sys

# Ajouter le dossier parent au path pour pouvoir importer les modules du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.bot_intelligence import ChatbotBrain

def test_brain():
    print("Initialisation du cerveau...")
    brain = ChatbotBrain()
    
    if brain.gemini:
        print("✅ Gemini est activé dans le cerveau")
    else:
        print("❌ Gemini n'est pas activé")
        
    message = "Je cherche un hôtel à Paris pour moins de 200 euros"
    print(f"\nTest analyse message: '{message}'")
    
    analysis = brain.analyze_message(message)
    print(f"Résultat analyse: {analysis}")
    
    if analysis['intent'] == 'search_hotel':
        print("✅ Intent détecté correctement")
    else:
        print(f"⚠️ Intent inattendu: {analysis['intent']}")

if __name__ == "__main__":
    test_brain()

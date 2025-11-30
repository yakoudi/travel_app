"""
Script de test rapide pour vérifier la réponse du chatbot aux questions sur son nom
"""

import os
import sys
import django

# Configurer Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.bot_intelligence import ChatbotBrain

def test_name_questions():
    """Teste différentes variations de questions sur le nom"""
    
    brain = ChatbotBrain()
    
    test_messages = [
        "c'estq uoi ton nom",  # Avec faute de frappe (comme dans votre exemple)
        "c'est quoi ton nom",  # Sans faute
        "comment tu t'appelles",
        "qui es-tu",
        "quel est ton nom",
        "tu es qui",
    ]
    
    print("=" * 60)
    print("🧪 TEST DES QUESTIONS SUR LE NOM DU BOT")
    print("=" * 60)
    print()
    
    for i, message in enumerate(test_messages, 1):
        print(f"Test {i}: \"{message}\"")
        print("-" * 60)
        
        # Analyser le message
        analysis = brain.analyze_message(message)
        
        print(f"Intent détecté: {analysis['intent']}")
        print(f"Confiance: {analysis['confidence']}")
        
        # Générer la réponse
        response = brain.generate_response(
            intent=analysis['intent'],
            entities=analysis.get('entities', {}),
            recommendations=[],
            user_message=message
        )
        
        print(f"Réponse: {response}")
        print()
        print()

if __name__ == "__main__":
    test_name_questions()

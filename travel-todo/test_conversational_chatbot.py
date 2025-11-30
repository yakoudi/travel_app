"""
Script de test pour le chatbot conversationnel
Teste la nouvelle capacité de conversation naturelle avec Gemini
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.bot_intelligence import ChatbotBrain

def test_chatbot():
    """Test du chatbot conversationnel"""
    
    print("=" * 60)
    print("🤖 TEST DU CHATBOT CONVERSATIONNEL")
    print("=" * 60)
    print()
    
    brain = ChatbotBrain()
    
    # Test 1: Salutation
    print("📝 Test 1: Salutation")
    message1 = "Bonjour!"
    print(f"Utilisateur: {message1}")
    analysis1 = brain.analyze_message(message1)
    response1 = brain.generate_response(
        analysis1['intent'],
        analysis1['entities'],
        [],
        user_message=message1
    )
    print(f"Bot: {response1}")
    print()
    
    # Test 2: Question générale
    print("📝 Test 2: Question générale sur le voyage")
    message2 = "Quel est le meilleur moment pour visiter Paris?"
    print(f"Utilisateur: {message2}")
    analysis2 = brain.analyze_message(message2)
    response2 = brain.generate_response(
        analysis2['intent'],
        analysis2['entities'],
        [],
        user_message=message2
    )
    print(f"Bot: {response2}")
    print()
    
    # Test 3: Recherche d'hôtel
    print("📝 Test 3: Recherche d'hôtel")
    message3 = "Je cherche un hôtel pas cher à Paris"
    print(f"Utilisateur: {message3}")
    analysis3 = brain.analyze_message(message3)
    print(f"Intent détecté: {analysis3['intent']}")
    print(f"Entités: {analysis3['entities']}")
    recommendations3 = brain.get_recommendations(
        analysis3['intent'],
        analysis3['entities'],
        limit=3,
        search_web=True
    )
    print(f"Recommandations trouvées: {len(recommendations3)}")
    response3 = brain.generate_response(
        analysis3['intent'],
        analysis3['entities'],
        recommendations3,
        user_message=message3
    )
    print(f"Bot: {response3}")
    print()
    
    # Test 4: Conversation avec contexte
    print("📝 Test 4: Conversation avec contexte")
    message4 = "Et pour Rome?"
    print(f"Utilisateur: {message4}")
    conversation_history = [
        {'sender': 'user', 'message': message3},
        {'sender': 'bot', 'message': response3}
    ]
    analysis4 = brain.analyze_message(message4)
    recommendations4 = brain.get_recommendations(
        analysis4['intent'],
        analysis4['entities'],
        limit=3,
        search_web=True
    )
    response4 = brain.generate_response(
        analysis4['intent'],
        analysis4['entities'],
        recommendations4,
        user_message=message4,
        conversation_history=conversation_history
    )
    print(f"Bot: {response4}")
    print()
    
    print("=" * 60)
    print("✅ Tests terminés!")
    print("=" * 60)

if __name__ == "__main__":
    test_chatbot()

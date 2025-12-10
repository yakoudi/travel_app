"""
Tests pour vérifier le changement d'API du chatbot
Testez OpenAI, Gemini ou toute autre API
"""

import os
import sys
from pathlib import Path

# Ajouter le chemin du projet Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / 'travel-todo'))

# Configuration Django minimale
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from chatbot.bot_intelligence import ChatbotBrain


def test_api_connection():
    """Test 1 : Vérifier la connexion à l'API"""
    print("\n" + "="*60)
    print("TEST 1 : Connexion à l'API")
    print("="*60)
    
    try:
        brain = ChatbotBrain()
        
        # Vérifier si l'engine AI est initialisé
        if hasattr(brain, 'ai_engine') and brain.ai_engine:
            print("✅ Engine AI initialisé (OpenAI ou autre)")
            return True
        elif hasattr(brain, 'gemini') and brain.gemini:
            print("✅ Gemini AI initialisé")
            return True
        else:
            print("⚠️  Aucune API AI détectée (mode fallback)")
            return False
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False


def test_message_analysis():
    """Test 2 : Analyser un message simple"""
    print("\n" + "="*60)
    print("TEST 2 : Analyse de message")
    print("="*60)
    
    try:
        brain = ChatbotBrain()
        test_messages = [
            "Bonjour",
            "Je cherche un hôtel à Paris",
            "Vol pas cher pour Tunis",
            "Circuit 5 jours en France"
        ]
        
        for msg in test_messages:
            print(f"\n📝 Message : '{msg}'")
            result = brain.analyze_message(msg)
            print(f"   Intent : {result.get('intent')}")
            print(f"   Entities : {result.get('entities')}")
            print(f"   Confidence : {result.get('confidence')}")
        
        print("\n✅ Analyse de messages réussie")
        return True
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False


def test_recommendations():
    """Test 3 : Obtenir des recommandations"""
    print("\n" + "="*60)
    print("TEST 3 : Recommandations")
    print("="*60)
    
    try:
        brain = ChatbotBrain()
        
        # Test recommandations hôtels
        print("\n🏨 Test : Recommandations d'hôtels")
        recs = brain.get_recommendations(
            intent='search_hotel',
            entities={'destination': 'Paris', 'budget': 200},
            limit=3,
            search_web=False  # Désactiver le web pour ce test
        )
        print(f"   Trouvé : {len(recs)} recommandations")
        
        # Test recommandations vols
        print("\n✈️  Test : Recommandations de vols")
        recs = brain.get_recommendations(
            intent='search_flight',
            entities={'destination': 'Tunis'},
            limit=3,
            search_web=False
        )
        print(f"   Trouvé : {len(recs)} recommandations")
        
        print("\n✅ Recommandations réussies")
        return True
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False


def test_response_generation():
    """Test 4 : Générer des réponses"""
    print("\n" + "="*60)
    print("TEST 4 : Génération de réponses")
    print("="*60)
    
    try:
        brain = ChatbotBrain()
        
        # Test réponse simple
        print("\n💬 Test : Réponse de salutation")
        response = brain.generate_response(
            intent='greeting',
            entities={},
            recommendations=[],
            user_message="Bonjour"
        )
        print(f"   Réponse : {response[:100]}...")
        
        # Test réponse avec recommandations
        print("\n💬 Test : Réponse avec recommandations")
        response = brain.generate_response(
            intent='search_hotel',
            entities={'destination': 'Paris'},
            recommendations=[{'name': 'Hotel Test', 'price': 150}],
            user_message="Je cherche un hôtel à Paris"
        )
        print(f"   Réponse : {response[:100]}...")
        
        print("\n✅ Génération de réponses réussie")
        return True
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False


def test_conversational_flow():
    """Test 5 : Conversation complète"""
    print("\n" + "="*60)
    print("TEST 5 : Flux conversationnel complet")
    print("="*60)
    
    try:
        brain = ChatbotBrain()
        
        conversation = [
            "Bonjour",
            "Je cherche un hôtel pas cher à Paris",
            "Avec piscine si possible",
            "Merci beaucoup"
        ]
        
        history = []
        
        for i, msg in enumerate(conversation, 1):
            print(f"\n👤 User [{i}] : {msg}")
            
            # Analyser
            analysis = brain.analyze_message(msg)
            
            # Obtenir recommandations si nécessaire
            recs = []
            if analysis['intent'] in ['search_hotel', 'search_flight', 'search_package']:
                recs = brain.get_recommendations(
                    analysis['intent'],
                    analysis['entities'],
                    limit=2,
                    search_web=False
                )
            
            # Générer réponse
            response = brain.generate_response(
                analysis['intent'],
                analysis['entities'],
                recs,
                user_message=msg,
                conversation_history=history
            )
            
            print(f"🤖 Bot [{i}] : {response[:150]}...")
            
            # Ajouter à l'historique
            history.append({'sender': 'user', 'message': msg})
            history.append({'sender': 'bot', 'message': response})
        
        print("\n✅ Flux conversationnel réussi")
        return True
    except Exception as e:
        print(f"❌ Erreur : {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_key_configuration():
    """Test 6 : Vérifier la configuration de la clé API"""
    print("\n" + "="*60)
    print("TEST 6 : Configuration de la clé API")
    print("="*60)
    
    try:
        # Vérifier les variables d'environnement
        openai_key = os.getenv('OPENAI_API_KEY')
        gemini_key = os.getenv('GEMINI_API_KEY')
        
        print("\n🔑 Clés API détectées :")
        
        if openai_key and openai_key != 'your-openai-api-key-here':
            masked = openai_key[:7] + "..." + openai_key[-4:]
            print(f"   ✅ OPENAI_API_KEY : {masked}")
        else:
            print(f"   ❌ OPENAI_API_KEY : Non configurée")
        
        if gemini_key and gemini_key != 'your-gemini-api-key-here':
            masked = gemini_key[:4] + "..." + gemini_key[-4:]
            print(f"   ✅ GEMINI_API_KEY : {masked}")
        else:
            print(f"   ⚠️  GEMINI_API_KEY : Non configurée")
        
        print("\n✅ Vérification de configuration terminée")
        return True
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False


def run_all_tests():
    """Exécuter tous les tests"""
    print("\n" + "🧪 "*30)
    print("TESTS DU CHATBOT - CHANGEMENT D'API")
    print("🧪 "*30)
    
    tests = [
        ("Configuration API", test_api_key_configuration),
        ("Connexion API", test_api_connection),
        ("Analyse de messages", test_message_analysis),
        ("Recommandations", test_recommendations),
        ("Génération de réponses", test_response_generation),
        ("Flux conversationnel", test_conversational_flow),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Erreur critique dans {test_name}: {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "="*60)
    print("RÉSUMÉ DES TESTS")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n📊 Score : {passed}/{total} tests réussis")
    
    if passed == total:
        print("\n🎉 Tous les tests sont passés ! Votre API est bien configurée.")
    elif passed > total / 2:
        print("\n⚠️  Certains tests ont échoué. Vérifiez la configuration.")
    else:
        print("\n❌ Plusieurs tests ont échoué. Vérifiez votre configuration API.")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    run_all_tests()

"""
Script pour tester l'API chatbot et voir les erreurs exactes
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.views import ChatbotViewSet
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

# Créer une requête de test
factory = APIRequestFactory()
request = factory.post('/api/chatbot/send_message/', {
    'message': 'Bonjour'
}, format='json')

# Créer le viewset
viewset = ChatbotViewSet()
viewset.request = Request(request)

try:
    response = viewset.send_message(Request(request))
    print(f"✅ SUCCESS: {response.status_code}")
    print(f"Data: {response.data}")
except Exception as e:
    print(f"❌ ERREUR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()


import os
import django
from django.test import RequestFactory
import sys
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.views import ChatbotViewSet
from chatbot.models import ChatConversation

def test_api_response():
    factory = RequestFactory()
    view = ChatbotViewSet.as_view({'post': 'send_message'})
    
    data = {
        'message': 'Test message'
    }
    
    request = factory.post('/api/chatbot/send_message/', data, content_type='application/json')
    
    # Mock the brain to avoid API calls
    # We can't easily mock the brain without patching, but we can just let it run if we have API key
    # Or we can just check the structure of the response even if it fails later?
    # No, we need it to return success.
    
    # Let's just run it. If it fails due to API key, we might not get the response we want.
    # But the user has the API key set up (hopefully).
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response Data Keys:", response.data.keys())
            user_msg = response.data.get('user_message', {})
            bot_msg = response.data.get('bot_message', {})
            
            print(f"User Message Sender: {user_msg.get('sender')}")
            print(f"Bot Message Sender: {bot_msg.get('sender')}")
            
            if user_msg.get('sender') == 'user':
                print("✅ TEST PASSED: user_message has sender='user'")
            else:
                print("❌ TEST FAILED: user_message missing sender='user'")
                
            if bot_msg.get('sender') == 'bot':
                print("✅ TEST PASSED: bot_message has sender='bot'")
            else:
                print("❌ TEST FAILED: bot_message missing sender='bot'")
        else:
            print("Error response:", response.data)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_api_response()

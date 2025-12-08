
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chatbot.bot_intelligence import ChatbotBrain

def test_error():
    print("Testing message: 'hotel tunis hamamet de budget 200D'")
    try:
        brain = ChatbotBrain()
        message = "hotel tunis hamamet de budget 200D"
        
        print("1. Analyzing message...")
        analysis = brain.analyze_message(message)
        print(f"Analysis result: {analysis}")
        
        print("2. Getting recommendations...")
        recommendations = brain.get_recommendations(
            analysis['intent'], 
            analysis['entities'],
            limit=3
        )
        print(f"Recommendations found: {len(recommendations)}")
        
        print("3. Generating response...")
        response = brain.generate_response(
            analysis['intent'],
            analysis['entities'],
            recommendations,
            user_message=message
        )
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"\n❌ CAUGHT EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_error()

"""
Intelligence du chatbot avec Google Gemini AI
Améliore la compréhension du langage naturel et génère des réponses intelligentes
Utilise le SDK officiel google-generativeai
"""

import os
import json
from django.conf import settings

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("⚠️ google-generativeai non installé")


class GeminiChatbot:
    """Chatbot intelligent utilisant le SDK officiel Gemini"""
    
    def __init__(self):
        # Configurer l'API Gemini
        self.api_key = os.getenv('GEMINI_API_KEY', getattr(settings, 'GEMINI_API_KEY', None))
        
        # Debug: Afficher si la clé est chargée
        if self.api_key:
            masked_key = self.api_key[:4] + "..." + self.api_key[-4:] if len(self.api_key) > 8 else "INVALID"
            print(f"[DEBUG] API Key chargée: {masked_key}")
        else:
            print("[DEBUG] API Key NON chargée")

        if not self.api_key or self.api_key == 'your-gemini-api-key-here':
            print("[WARNING] Clé API Gemini manquante ou invalide")
            self.api_key = None
            self.model = None
        else:
            # Configurer le SDK
            if GENAI_AVAILABLE:
                try:
                    genai.configure(api_key=self.api_key)
                    self.model = genai.GenerativeModel('gemini-2.5-flash')
                    print("✅ Gemini SDK configuré avec succès!")
                except Exception as e:
                    print(f"❌ Erreur configuration Gemini: {e}")
                    self.model = None
            else:
                self.model = None
        
        # Contexte du chatbot
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage intelligent et conversationnel pour TravelTodo.

Ton rôle:
- Avoir une conversation naturelle et chaleureuse
- Aider avec les hôtels, vols et circuits
- Comprendre les besoins implicites
- Être tolérant aux fautes de frappe
- PARLER LA LANGUE DE L'UTILISATEUR (Français, Arabe, Anglais)
- Si l'utilisateur parle en Arabe (ou Darija), réponds en Arabe.
- Si l'utilisateur parle en Français, réponds en Français.

Format de réponse attendu (JSON) pour l'analyse:
{
    "intent": "search_hotel|search_flight|search_package|greeting|help|thanks|general_question|language_switch|unknown",
    "entities": {
        "destination": "ville/pays",
        "budget": nombre (TND),
        "stars": nombre (1-5),
        "dates": "dates",
        "travelers": nombre
    },
    "response": "réponse conversationnelle",
    "confidence": 0.0-1.0
}
"""
    
    def _call_gemini(self, prompt_text):
        """Appel au SDK Gemini"""
        if not self.model:
            return None
            
        try:
            response = self.model.generate_content(prompt_text)
            return response.text
        except Exception as e:
            print(f"Erreur appel Gemini: {e}")
            return None

    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message utilisateur"""
        try:
            # Construire le prompt
            prompt = f"{self.system_context}\n\n"
            
            if conversation_history:
                prompt += "Historique:\n"
                for msg in conversation_history[-3:]:
                    sender = "Utilisateur" if msg.get('sender') == 'user' else "Assistant"
                    prompt += f"{sender}: {msg.get('message')}\n"
            
            prompt += f"\nMessage utilisateur: {user_message}\n"
            prompt += "Analyse ce message et réponds UNIQUEMENT avec le JSON demandé."
            
            # Appel SDK
            response_text = self._call_gemini(prompt)
            
            if response_text:
                return self._parse_gemini_response(response_text)
            
            raise Exception("Pas de réponse de l'API")
            
        except Exception as e:
            print(f"Erreur Gemini: {e}")
            return self._fallback_analysis(user_message)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        try:
            prompt = f"""
Tu es TravelTodo Assistant. Réponds de manière naturelle, chaleureuse et utile.
IMPORTANT: Réponds TOUJOURS dans la même langue que l'utilisateur (Français, Arabe, ou Anglais).
Ne donne PAS de JSON, juste du texte brut.
Sois concis (2-3 phrases).

Message utilisateur: {user_message}
"""
            response_text = self._call_gemini(prompt)
            
            if response_text:
                return response_text.strip()
                
            return None
            
        except Exception as e:
            print(f"Erreur génération réponse: {e}")
            return None

    def _parse_gemini_response(self, response_text):
        """Parse la réponse JSON"""
        try:
            cleaned = response_text.strip()
            # Nettoyage basique du markdown
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            
            analysis = json.loads(cleaned.strip())
            
            return {
                'intent': analysis.get('intent', 'unknown'),
                'entities': analysis.get('entities', {}),
                'response': analysis.get('response', ''),
                'confidence': float(analysis.get('confidence', 0.5))
            }
        except Exception:
            return {
                'intent': 'unknown',
                'entities': {},
                'response': response_text[:200], # Utiliser le texte brut comme réponse
                'confidence': 0.5
            }

    def _fallback_analysis(self, user_message):
        """Fallback simple"""
        msg = user_message.lower()
        if any(w in msg for w in ['bonjour', 'salut', 'alut', 'slt', 'hello', 'coucou']):
            return {'intent': 'greeting', 'response': 'Bonjour ! Où souhaitez-vous partir ?', 'entities': {}, 'confidence': 1.0}
        return {'intent': 'unknown', 'response': 'Je peux vous aider à trouver des hôtels ou des vols.', 'entities': {}, 'confidence': 0.5}

    def generate_response_with_recommendations(self, intent, entities, recommendations):
        """Génère une réponse avec recommandations"""
        try:
            count = len(recommendations)
            prompt = f"""
Tu es un assistant de voyage.
L'utilisateur a cherché: {intent}
Résultats trouvés: {count}

Génère une phrase courte et engageante pour présenter ces résultats.
"""
            response = self._call_gemini(prompt)
            if response: return response.strip()
            return f"J'ai trouvé {count} résultats pour vous !"
        except:
            return f"Voici {len(recommendations)} résultats correspondants."

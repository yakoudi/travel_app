"""
Intelligence du chatbot avec Google Gemini AI
Améliore la compréhension du langage naturel et génère des réponses intelligentes
"""

import os
import json
import requests
from django.conf import settings


class GeminiChatbot:
    """Chatbot intelligent utilisant l'API Gemini de Google via REST"""
    
    def __init__(self):
        # Configurer l'API Gemini
        self.api_key = os.getenv('GEMINI_API_KEY', getattr(settings, 'GEMINI_API_KEY', None))
        
        # Debug: Afficher si la clé est chargée (sans afficher la clé elle-même)
        if self.api_key:
            masked_key = self.api_key[:4] + "..." + self.api_key[-4:] if len(self.api_key) > 8 else "INVALID"
            print(f"[DEBUG] API Key chargee: {masked_key}")
        else:
            print("[DEBUG] API Key NON chargee")

        if not self.api_key or self.api_key == 'your-gemini-api-key-here':
            print("[WARNING] Cle API Gemini manquante ou invalide")
            self.api_key = None
            
        # URL de l'API Gemini (Model: gemini-2.0-flash pour la rapidité et performance)
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

        
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
    
    def _call_gemini_api(self, prompt_text):
        """Appel direct à l'API REST de Gemini"""
        if not self.api_key:
            raise ValueError("Clé API manquante")

        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 800,
            }
        }
        
        try:
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extraire le texte de la réponse
            if 'candidates' in result and result['candidates']:
                return result['candidates'][0]['content']['parts'][0]['text']
            return None
            
        except Exception as e:
            print(f"Erreur appel API Gemini: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Détail erreur: {e.response.text}")
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
            
            # Appel API
            response_text = self._call_gemini_api(prompt)
            
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
            response_text = self._call_gemini_api(prompt)
            
            if response_text:
                return response_text.strip()
                
            return "Je suis là pour vous aider avec vos voyages ! Que recherchez-vous ?"
            
        except Exception as e:
            print(f"Erreur génération réponse: {e}")
            return "Désolé, j'ai eu un petit problème technique. Comment puis-je vous aider ?"

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
            response = self._call_gemini_api(prompt)
            if response: return response.strip()
            return f"J'ai trouvé {count} résultats pour vous !"
        except:
            return f"Voici {len(recommendations)} résultats correspondants."

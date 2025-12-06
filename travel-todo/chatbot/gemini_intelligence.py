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
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-live:generateContent"

        
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
    
    def generate_conversational_response(self, user_message, conversation_history=None, context_entities=None):
        """Génère une réponse conversationnelle avec mémoire de la conversation"""
        try:
            # Construire le prompt avec l'historique complet
            prompt = f"""
Tu es TravelTodo Assistant, un assistant de voyage intelligent.
IMPORTANT: 
- Réponds TOUJOURS dans la même langue que l'utilisateur (Français, Arabe, ou Anglais)
- Tu DOIS te souvenir de la conversation précédente
- Si l'utilisateur dit "oui", "donner", "montre", etc., c'est qu'il veut voir les résultats de sa demande précédente
- Utilise le contexte de la conversation pour comprendre ce que l'utilisateur veut vraiment

"""
            
            # Ajouter l'historique de conversation
            if conversation_history and len(conversation_history) > 0:
                prompt += "\n=== HISTORIQUE DE LA CONVERSATION ===\n"
                for msg in conversation_history[-6:]:  # Derniers 6 messages
                    sender = "Utilisateur" if msg.get('sender') == 'user' else "Assistant"
                    prompt += f"{sender}: {msg.get('message')}\n"
                prompt += "\n"
            
            # Ajouter le contexte extrait (budget, destination, etc.)
            if context_entities:
                prompt += "=== CONTEXTE DE LA RECHERCHE ===\n"
                if context_entities.get('budget'):
                    prompt += f"Budget mentionné: {context_entities['budget']} TND\n"
                if context_entities.get('destination'):
                    dest = context_entities['destination']
                    if isinstance(dest, dict):
                        prompt += f"Destination mentionnée: {dest.get('name')}\n"
                    else:
                        prompt += f"Destination mentionnée: {dest}\n"
                if context_entities.get('intent'):
                    intent_map = {
                        'search_hotel': 'recherche d\'hôtels',
                        'search_flight': 'recherche de vols',
                        'search_package': 'recherche de circuits'
                    }
                    prompt += f"Type de recherche: {intent_map.get(context_entities['intent'], context_entities['intent'])}\n"
                prompt += "\n"
            
            prompt += f"""
Message actuel de l'utilisateur: {user_message}

INSTRUCTIONS:
- Si l'utilisateur dit juste "oui", "donner", "montre", "voir", etc., c'est qu'il veut voir les résultats de sa recherche précédente
- Utilise le contexte pour comprendre ce qu'il cherche vraiment
- Sois naturel, chaleureux et utile
- Ne donne PAS de JSON, juste du texte brut
- Sois concis (2-3 phrases maximum)

Réponds maintenant:
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

    def generate_response_with_recommendations(self, intent, entities, recommendations, conversation_history=None):
        """Génère une réponse avec recommandations en utilisant l'historique"""
        try:
            count = len(recommendations)
            
            # Construire le prompt avec contexte
            prompt = f"""
Tu es TravelTodo Assistant, un assistant de voyage intelligent.
IMPORTANT: Réponds TOUJOURS dans la même langue que l'utilisateur.

"""
            
            # Ajouter l'historique si disponible
            if conversation_history and len(conversation_history) > 0:
                prompt += "\n=== HISTORIQUE DE LA CONVERSATION ===\n"
                for msg in conversation_history[-4:]:  # Derniers 4 messages
                    sender = "Utilisateur" if msg.get('sender') == 'user' else "Assistant"
                    prompt += f"{sender}: {msg.get('message')}\n"
                prompt += "\n"
            
            # Ajouter les détails de la recherche
            prompt += f"""
L'utilisateur a cherché: {intent}
Résultats trouvés: {count}
"""
            
            if entities.get('budget'):
                prompt += f"Budget: {entities['budget']} TND\n"
            if entities.get('destination'):
                dest = entities['destination']
                if isinstance(dest, dict):
                    prompt += f"Destination: {dest.get('name')}\n"
                else:
                    prompt += f"Destination: {dest}\n"
            
            prompt += """
Génère une phrase courte et engageante (2-3 phrases max) pour présenter ces résultats.
Sois naturel et chaleureux.
"""
            
            response = self._call_gemini_api(prompt)
            if response: 
                return response.strip()
            return f"J'ai trouvé {count} résultats pour vous !"
        except Exception as e:
            print(f"Erreur génération réponse avec recs: {e}")
            return f"Voici {len(recommendations)} résultats correspondants."

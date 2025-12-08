"""
Intelligence du chatbot avec OpenAI GPT
Alternative à Gemini AI
"""

import os
import json
import requests
from django.conf import settings


class OpenAIChatbot:
    """Chatbot intelligent utilisant l'API OpenAI"""
    
    def __init__(self):
        # Récupérer la clé API depuis les variables d'environnement
        self.api_key = os.getenv('OPENAI_API_KEY', getattr(settings, 'OPENAI_API_KEY', None))
        
        # Debug: Afficher si la clé est chargée (sans afficher la clé elle-même)
        if self.api_key:
            masked_key = self.api_key[:7] + "..." + self.api_key[-4:] if len(self.api_key) > 11 else "INVALID"
            print(f"[DEBUG] OpenAI API Key chargée: {masked_key}")
        else:
            print("[DEBUG] OpenAI API Key NON chargée")

        if not self.api_key or self.api_key == 'your-openai-api-key-here':
            print("[WARNING] Clé API OpenAI manquante ou invalide")
            self.api_key = None
            
        # URL de l'API OpenAI
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
        # Contexte du chatbot
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage intelligent et conversationnel pour TravelTodo.

Ton rôle:
- Avoir une conversation naturelle et chaleureuse
- Aider avec les hôtels, vols et circuits
- Comprendre les besoins implicites
- Être tolérant aux fautes de frappe

Format de réponse attendu (JSON) pour l'analyse:
{
    "intent": "search_hotel|search_flight|search_package|greeting|help|thanks|general_question|unknown",
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
    
    def _call_openai_api(self, prompt_text, system_message=None):
        """Appel direct à l'API REST d'OpenAI"""
        if not self.api_key:
            raise ValueError("Clé API OpenAI manquante")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        else:
            messages.append({"role": "system", "content": self.system_context})
        
        messages.append({"role": "user", "content": prompt_text})
        
        data = {
            "model": "gpt-3.5-turbo",  # Utilisez "gpt-4" pour de meilleurs résultats (plus cher)
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=data,
                timeout=15
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extraire le texte de la réponse
            if 'choices' in result and result['choices']:
                return result['choices'][0]['message']['content']
            return None
            
        except Exception as e:
            print(f"Erreur appel API OpenAI: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Détail erreur: {e.response.text}")
            return None

    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message utilisateur"""
        try:
            # Construire le prompt
            prompt = ""
            
            if conversation_history:
                prompt += "Historique:\n"
                for msg in conversation_history[-3:]:
                    sender = "Utilisateur" if msg.get('sender') == 'user' else "Assistant"
                    prompt += f"{sender}: {msg.get('message')}\n"
            
            prompt += f"\nMessage utilisateur: {user_message}\n"
            prompt += "Analyse ce message et réponds UNIQUEMENT avec le JSON demandé."
            
            # Appel API
            response_text = self._call_openai_api(prompt)
            
            if response_text:
                return self._parse_openai_response(response_text)
            
            raise Exception("Pas de réponse de l'API")
            
        except Exception as e:
            print(f"Erreur OpenAI: {e}")
            return self._fallback_analysis(user_message)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        try:
            system_msg = """
Tu es TravelTodo Assistant. Réponds de manière naturelle, chaleureuse et utile.
Ne donne PAS de JSON, juste du texte brut.
Sois concis (2-3 phrases).
"""
            prompt = f"Message utilisateur: {user_message}"
            
            response_text = self._call_openai_api(prompt, system_message=system_msg)
            
            if response_text:
                return response_text.strip()
                
            return "Je suis là pour vous aider avec vos voyages ! Que recherchez-vous ?"
            
        except Exception as e:
            print(f"Erreur génération réponse: {e}")
            return "Désolé, j'ai eu un petit problème technique. Comment puis-je vous aider ?"

    def _parse_openai_response(self, response_text):
        """Parse la réponse JSON d'OpenAI"""
        try:
            cleaned = response_text.strip()
            # Nettoyage basique du markdown
            if cleaned.startswith('```json'):
                cleaned = cleaned[7:]
            if cleaned.startswith('```'):
                cleaned = cleaned[3:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            
            analysis = json.loads(cleaned.strip())
            
            return {
                'intent': analysis.get('intent', 'unknown'),
                'entities': analysis.get('entities', {}),
                'response': analysis.get('response', ''),
                'confidence': float(analysis.get('confidence', 0.5))
            }
        except Exception as e:
            print(f"Erreur parsing JSON: {e}")
            # Si le parsing échoue, utiliser le texte brut comme réponse
            return {
                'intent': 'unknown',
                'entities': {},
                'response': response_text[:200],
                'confidence': 0.5
            }

    def _fallback_analysis(self, user_message):
        """Fallback simple si l'API échoue"""
        msg = user_message.lower()
        
        if any(w in msg for w in ['bonjour', 'salut', 'hello', 'bonsoir']):
            return {
                'intent': 'greeting',
                'response': 'Bonjour ! Où souhaitez-vous partir ?',
                'entities': {},
                'confidence': 1.0
            }
        
        if any(w in msg for w in ['merci', 'thank']):
            return {
                'intent': 'thanks',
                'response': 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.',
                'entities': {},
                'confidence': 1.0
            }
        
        if any(w in msg for w in ['hotel', 'hôtel', 'chambre']):
            return {
                'intent': 'search_hotel',
                'response': 'Je cherche des hôtels pour vous...',
                'entities': {},
                'confidence': 0.7
            }
        
        if any(w in msg for w in ['vol', 'avion', 'billet']):
            return {
                'intent': 'search_flight',
                'response': 'Je cherche des vols pour vous...',
                'entities': {},
                'confidence': 0.7
            }
        
        return {
            'intent': 'unknown',
            'response': 'Je peux vous aider à trouver des hôtels, des vols ou des circuits. Que recherchez-vous ?',
            'entities': {},
            'confidence': 0.5
        }

    def generate_response_with_recommendations(self, intent, entities, recommendations):
        """Génère une réponse avec recommandations"""
        try:
            count = len(recommendations)
            
            system_msg = "Tu es un assistant de voyage. Génère une phrase courte et engageante."
            
            prompt = f"""
L'utilisateur a cherché: {intent}
Nombre de résultats trouvés: {count}

Génère une phrase courte (1-2 phrases) pour présenter ces résultats de manière engageante.
"""
            response = self._call_openai_api(prompt, system_message=system_msg)
            
            if response:
                return response.strip()
            
            return f"J'ai trouvé {count} résultats pour vous ! 🎉"
            
        except Exception as e:
            print(f"Erreur génération avec recommandations: {e}")
            return f"Voici {len(recommendations)} résultats correspondants."

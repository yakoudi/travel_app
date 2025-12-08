"""
Exemples d'intégrations avec différentes APIs de chatbot
Utilisez ces templates pour intégrer facilement d'autres APIs
"""

# ============================================================================
# EXEMPLE 1 : ANTHROPIC CLAUDE
# ============================================================================

class ClaudeChatbot:
    """Chatbot utilisant Anthropic Claude"""
    
    def __init__(self):
        import anthropic
        import os
        
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.client = anthropic.Anthropic(api_key=self.api_key)
        
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage intelligent.
Aide les utilisateurs à trouver des hôtels, vols et circuits.
"""
    
    def _call_claude_api(self, prompt_text):
        """Appel à l'API Claude"""
        message = self.client.messages.create(
            model="claude-3-sonnet-20240229",  # ou claude-3-opus-20240229
            max_tokens=1024,
            system=self.system_context,
            messages=[
                {"role": "user", "content": prompt_text}
            ]
        )
        return message.content[0].text
    
    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message"""
        prompt = f"""
Analyse ce message et réponds avec un JSON:
{{"intent": "...", "entities": {{}}, "confidence": 0.0-1.0}}

Message: {user_message}
"""
        response = self._call_claude_api(prompt)
        return self._parse_response(response)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        return self._call_claude_api(f"Réponds naturellement: {user_message}")
    
    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        import json
        try:
            cleaned = response_text.strip()
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except:
            return {'intent': 'unknown', 'entities': {}, 'confidence': 0.5}


# ============================================================================
# EXEMPLE 2 : MISTRAL AI
# ============================================================================

class MistralChatbot:
    """Chatbot utilisant Mistral AI"""
    
    def __init__(self):
        from mistralai.client import MistralClient
        import os
        
        self.api_key = os.getenv('MISTRAL_API_KEY')
        self.client = MistralClient(api_key=self.api_key)
        
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage en français.
"""
    
    def _call_mistral_api(self, prompt_text):
        """Appel à l'API Mistral"""
        messages = [
            {"role": "system", "content": self.system_context},
            {"role": "user", "content": prompt_text}
        ]
        
        response = self.client.chat(
            model="mistral-large-latest",  # ou mistral-medium
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    
    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message"""
        prompt = f"""
Analyse ce message et réponds avec un JSON:
{{"intent": "search_hotel|search_flight|...", "entities": {{}}, "confidence": 0.0-1.0}}

Message: {user_message}
"""
        response = self._call_mistral_api(prompt)
        return self._parse_response(response)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        return self._call_mistral_api(f"Réponds de manière chaleureuse: {user_message}")
    
    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        import json
        try:
            cleaned = response_text.strip()
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except:
            return {'intent': 'unknown', 'entities': {}, 'confidence': 0.5}


# ============================================================================
# EXEMPLE 3 : COHERE
# ============================================================================

class CohereChatbot:
    """Chatbot utilisant Cohere"""
    
    def __init__(self):
        import cohere
        import os
        
        self.api_key = os.getenv('COHERE_API_KEY')
        self.client = cohere.Client(self.api_key)
        
        self.system_context = """
Tu es TravelTodo Assistant, spécialisé dans les voyages.
"""
    
    def _call_cohere_api(self, prompt_text):
        """Appel à l'API Cohere"""
        response = self.client.chat(
            message=prompt_text,
            model="command-r-plus",  # ou command-r
            temperature=0.7,
            max_tokens=800,
            preamble=self.system_context
        )
        
        return response.text
    
    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message"""
        prompt = f"""
Analyse: {user_message}
Réponds avec: {{"intent": "...", "entities": {{}}, "confidence": 0.0-1.0}}
"""
        response = self._call_cohere_api(prompt)
        return self._parse_response(response)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        return self._call_cohere_api(user_message)
    
    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        import json
        try:
            cleaned = response_text.strip()
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except:
            return {'intent': 'unknown', 'entities': {}, 'confidence': 0.5}


# ============================================================================
# EXEMPLE 4 : HUGGING FACE (GRATUIT)
# ============================================================================

class HuggingFaceChatbot:
    """Chatbot utilisant Hugging Face (gratuit, local)"""
    
    def __init__(self):
        from transformers import pipeline
        
        # Charger un modèle de conversation
        self.generator = pipeline(
            'text-generation',
            model='mistralai/Mistral-7B-Instruct-v0.1',
            device_map='auto'  # Utilise GPU si disponible
        )
        
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage.
"""
    
    def _call_hf_model(self, prompt_text):
        """Appel au modèle Hugging Face"""
        full_prompt = f"{self.system_context}\n\nUser: {prompt_text}\nAssistant:"
        
        result = self.generator(
            full_prompt,
            max_length=500,
            num_return_sequences=1,
            temperature=0.7,
            do_sample=True
        )
        
        return result[0]['generated_text'].split("Assistant:")[-1].strip()
    
    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message"""
        prompt = f"""
Analyse ce message et réponds avec un JSON:
{{"intent": "...", "entities": {{}}, "confidence": 0.0-1.0}}

Message: {user_message}
"""
        response = self._call_hf_model(prompt)
        return self._parse_response(response)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        return self._call_hf_model(user_message)
    
    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        import json
        try:
            cleaned = response_text.strip()
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except:
            return {'intent': 'unknown', 'entities': {}, 'confidence': 0.5}


# ============================================================================
# EXEMPLE 5 : OLLAMA (LOCAL, GRATUIT)
# ============================================================================

class OllamaChatbot:
    """Chatbot utilisant Ollama (modèles locaux)"""
    
    def __init__(self):
        import requests
        
        self.api_url = "http://localhost:11434/api/generate"
        self.model = "llama2"  # ou mistral, codellama, etc.
        
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage.
"""
    
    def _call_ollama_api(self, prompt_text):
        """Appel à l'API Ollama locale"""
        import requests
        
        data = {
            "model": self.model,
            "prompt": f"{self.system_context}\n\n{prompt_text}",
            "stream": False
        }
        
        response = requests.post(self.api_url, json=data)
        return response.json()['response']
    
    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message"""
        prompt = f"""
Analyse ce message et réponds avec un JSON:
{{"intent": "...", "entities": {{}}, "confidence": 0.0-1.0}}

Message: {user_message}
"""
        response = self._call_ollama_api(prompt)
        return self._parse_response(response)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        return self._call_ollama_api(f"Réponds naturellement: {user_message}")
    
    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        import json
        try:
            cleaned = response_text.strip()
            if cleaned.startswith('```json'): cleaned = cleaned[7:]
            if cleaned.startswith('```'): cleaned = cleaned[3:]
            if cleaned.endswith('```'): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except:
            return {'intent': 'unknown', 'entities': {}, 'confidence': 0.5}


# ============================================================================
# GUIDE D'INSTALLATION
# ============================================================================

"""
INSTALLATION DES DÉPENDANCES :

# OpenAI
pip install openai

# Anthropic Claude
pip install anthropic

# Mistral AI
pip install mistralai

# Cohere
pip install cohere

# Hugging Face
pip install transformers torch

# Ollama (installer d'abord Ollama Desktop)
# Télécharger depuis: https://ollama.ai/
# Puis: ollama pull llama2

CONFIGURATION DES CLÉS API (.env) :

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
COHERE_API_KEY=...

UTILISATION :

1. Copiez la classe de votre choix dans un nouveau fichier
   Ex: chatbot/claude_intelligence.py

2. Modifiez bot_intelligence.py :
   from .claude_intelligence import ClaudeChatbot
   self.ai_engine = ClaudeChatbot()

3. Testez !
"""


# ============================================================================
# COMPARAISON DES APIS
# ============================================================================

"""
┌──────────────┬──────────┬─────────┬─────────┬──────────┬────────────┐
│ API          │ Gratuit  │ Vitesse │ Qualité │ Français │ Prix/1M    │
├──────────────┼──────────┼─────────┼─────────┼──────────┼────────────┤
│ OpenAI GPT-4 │ ❌       │ ⚡⚡     │ ⭐⭐⭐⭐⭐ │ ✅       │ $30        │
│ GPT-3.5      │ ❌       │ ⚡⚡⚡    │ ⭐⭐⭐⭐  │ ✅       │ $0.50      │
│ Claude 3     │ ❌       │ ⚡⚡⚡    │ ⭐⭐⭐⭐⭐ │ ✅       │ $3         │
│ Mistral      │ ❌       │ ⚡⚡⚡    │ ⭐⭐⭐⭐  │ ✅✅     │ $2         │
│ Cohere       │ ❌       │ ⚡⚡⚡    │ ⭐⭐⭐   │ ✅       │ $1         │
│ Gemini 2.0   │ ✅*      │ ⚡⚡⚡    │ ⭐⭐⭐⭐  │ ✅       │ Gratuit*   │
│ HuggingFace  │ ✅       │ ⚡      │ ⭐⭐⭐   │ ✅       │ Gratuit    │
│ Ollama       │ ✅       │ ⚡⚡     │ ⭐⭐⭐   │ ✅       │ Gratuit    │
└──────────────┴──────────┴─────────┴─────────┴──────────┴────────────┘

* Gratuit avec quotas limités

RECOMMANDATIONS :

🏆 Meilleure qualité : GPT-4 ou Claude 3
💰 Meilleur prix : Gemini 2.0 Flash (gratuit) ou Mistral
⚡ Plus rapide : GPT-3.5-turbo ou Gemini 2.0
🇫🇷 Meilleur français : Mistral AI
💻 Local/Gratuit : Ollama ou Hugging Face
"""

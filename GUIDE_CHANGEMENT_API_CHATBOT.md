# 🤖 Guide : Changer l'API du Chatbot

## 📋 Table des matières
1. [Comprendre l'architecture actuelle](#architecture-actuelle)
2. [Étapes pour changer l'API](#étapes-changement)
3. [Exemples d'APIs alternatives](#apis-alternatives)
4. [Configuration et tests](#configuration-tests)

---

## 🏗️ Architecture Actuelle {#architecture-actuelle}

Votre chatbot utilise actuellement **Google Gemini AI** avec l'architecture suivante :

```
┌─────────────────┐
│  Frontend       │
│  (Chatbot.jsx)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Django API     │
│  (views.py)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bot Brain      │
│ (bot_intelligence.py)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini AI      │
│ (gemini_intelligence.py)
└─────────────────┘
```

### Fichiers concernés :
- **`chatbot/views.py`** : Point d'entrée API (endpoints REST)
- **`chatbot/bot_intelligence.py`** : Logique métier du chatbot
- **`chatbot/gemini_intelligence.py`** : Intégration avec Gemini AI
- **`frontend/travelbook/src/components/Chatbot.jsx`** : Interface utilisateur

---

## 🔄 Étapes pour Changer l'API {#étapes-changement}

### **Étape 1 : Choisir votre nouvelle API**

Voici quelques alternatives populaires :

| API | Avantages | Inconvénients |
|-----|-----------|---------------|
| **OpenAI (GPT-4)** | Très performant, documentation excellente | Payant, quota limité |
| **Anthropic Claude** | Excellent pour conversations longues | Payant |
| **Mistral AI** | Français, performant, moins cher | Moins connu |
| **Hugging Face** | Gratuit, open-source | Nécessite hébergement |
| **Cohere** | Bon rapport qualité/prix | Moins de fonctionnalités |

---

### **Étape 2 : Créer un nouveau fichier d'intelligence**

Créez un fichier pour votre nouvelle API (exemple avec OpenAI) :

**Fichier : `chatbot/openai_intelligence.py`**

```python
"""
Intelligence du chatbot avec OpenAI GPT
"""

import os
import json
import requests
from django.conf import settings


class OpenAIChatbot:
    """Chatbot intelligent utilisant l'API OpenAI"""
    
    def __init__(self):
        # Récupérer la clé API
        self.api_key = os.getenv('OPENAI_API_KEY', getattr(settings, 'OPENAI_API_KEY', None))
        
        if not self.api_key:
            print("[WARNING] Clé API OpenAI manquante")
            self.api_key = None
            
        # URL de l'API OpenAI
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
        # Contexte du chatbot
        self.system_context = """
Tu es TravelTodo Assistant, un assistant de voyage intelligent.

Ton rôle:
- Aider avec les hôtels, vols et circuits
- Comprendre les besoins des utilisateurs
- Être chaleureux et professionnel

Format de réponse (JSON):
{
    "intent": "search_hotel|search_flight|search_package|greeting|help|thanks|unknown",
    "entities": {
        "destination": "ville/pays",
        "budget": nombre,
        "stars": nombre (1-5)
    },
    "response": "réponse conversationnelle",
    "confidence": 0.0-1.0
}
"""
    
    def _call_openai_api(self, prompt_text):
        """Appel à l'API OpenAI"""
        if not self.api_key:
            raise ValueError("Clé API manquante")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": "gpt-4",  # ou "gpt-3.5-turbo" pour moins cher
            "messages": [
                {"role": "system", "content": self.system_context},
                {"role": "user", "content": prompt_text}
            ],
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=data,
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extraire le texte de la réponse
            if 'choices' in result and result['choices']:
                return result['choices'][0]['message']['content']
            return None
            
        except Exception as e:
            print(f"Erreur appel API OpenAI: {e}")
            return None

    def analyze_message(self, user_message, conversation_history=None):
        """Analyse un message utilisateur"""
        try:
            # Construire le prompt
            prompt = f"Message utilisateur: {user_message}\n"
            prompt += "Analyse ce message et réponds avec le JSON demandé."
            
            # Appel API
            response_text = self._call_openai_api(prompt)
            
            if response_text:
                return self._parse_response(response_text)
            
            raise Exception("Pas de réponse de l'API")
            
        except Exception as e:
            print(f"Erreur OpenAI: {e}")
            return self._fallback_analysis(user_message)
    
    def generate_conversational_response(self, user_message, conversation_history=None):
        """Génère une réponse conversationnelle"""
        try:
            prompt = f"""
Réponds de manière naturelle et chaleureuse.
Message utilisateur: {user_message}
"""
            response_text = self._call_openai_api(prompt)
            
            if response_text:
                return response_text.strip()
                
            return "Je suis là pour vous aider ! Que recherchez-vous ?"
            
        except Exception as e:
            print(f"Erreur génération réponse: {e}")
            return "Comment puis-je vous aider ?"

    def _parse_response(self, response_text):
        """Parse la réponse JSON"""
        try:
            cleaned = response_text.strip()
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
                'response': response_text[:200],
                'confidence': 0.5
            }

    def _fallback_analysis(self, user_message):
        """Fallback simple"""
        msg = user_message.lower()
        if any(w in msg for w in ['bonjour', 'salut']):
            return {
                'intent': 'greeting',
                'response': 'Bonjour ! Où souhaitez-vous partir ?',
                'entities': {},
                'confidence': 1.0
            }
        return {
            'intent': 'unknown',
            'response': 'Je peux vous aider à trouver des hôtels ou des vols.',
            'entities': {},
            'confidence': 0.5
        }

    def generate_response_with_recommendations(self, intent, entities, recommendations):
        """Génère une réponse avec recommandations"""
        try:
            count = len(recommendations)
            prompt = f"""
L'utilisateur a cherché: {intent}
Résultats trouvés: {count}

Génère une phrase courte et engageante pour présenter ces résultats.
"""
            response = self._call_openai_api(prompt)
            if response:
                return response.strip()
            return f"J'ai trouvé {count} résultats pour vous !"
        except:
            return f"Voici {len(recommendations)} résultats correspondants."
```

---

### **Étape 3 : Modifier `bot_intelligence.py`**

Modifiez l'import dans le fichier `chatbot/bot_intelligence.py` :

**Avant :**
```python
# Import de l'intelligence Gemini
try:
    from .gemini_intelligence import GeminiChatbot
    GEMINI_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Gemini non disponible: {e}")
    GEMINI_AVAILABLE = False
```

**Après :**
```python
# Import de l'intelligence OpenAI (ou autre)
try:
    from .openai_intelligence import OpenAIChatbot  # ← Changement ici
    AI_AVAILABLE = True
except Exception as e:
    print(f"⚠️ OpenAI non disponible: {e}")
    AI_AVAILABLE = False
```

Puis modifiez l'initialisation dans la classe `ChatbotBrain` :

**Avant :**
```python
def __init__(self):
    # Initialiser Gemini si disponible
    self.gemini = None
    if GEMINI_AVAILABLE:
        try:
            self.gemini = GeminiChatbot()
            print("✅ Gemini AI activé!")
        except Exception as e:
            print(f"⚠️ Impossible d'initialiser Gemini: {e}")
            self.gemini = None
```

**Après :**
```python
def __init__(self):
    # Initialiser OpenAI si disponible
    self.ai_engine = None  # ← Renommer pour être générique
    if AI_AVAILABLE:
        try:
            self.ai_engine = OpenAIChatbot()  # ← Changement ici
            print("✅ OpenAI activé!")
        except Exception as e:
            print(f"⚠️ Impossible d'initialiser OpenAI: {e}")
            self.ai_engine = None
```

Ensuite, remplacez toutes les références à `self.gemini` par `self.ai_engine` :

**Exemple :**
```python
# Avant
if self.gemini:
    try:
        analysis = self.gemini.analyze_message(message)

# Après
if self.ai_engine:
    try:
        analysis = self.ai_engine.analyze_message(message)
```

---

### **Étape 4 : Configurer les variables d'environnement**

Créez ou modifiez le fichier `.env` à la racine du projet :

```bash
# Ancienne configuration (Gemini)
# GEMINI_API_KEY=votre-ancienne-clé

# Nouvelle configuration (OpenAI)
OPENAI_API_KEY=sk-votre-clé-openai-ici
```

**Pour obtenir une clé API OpenAI :**
1. Allez sur https://platform.openai.com/
2. Créez un compte
3. Allez dans "API Keys"
4. Créez une nouvelle clé
5. Copiez-la dans votre `.env`

---

### **Étape 5 : Mettre à jour `settings.py`**

Dans `travel-todo/travel_todo/settings.py`, ajoutez :

```python
# Configuration API Chatbot
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')

# Ou pour garder la compatibilité avec Gemini
# GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your-gemini-api-key-here')
```

---

### **Étape 6 : Installer les dépendances**

Si nécessaire, installez les bibliothèques requises :

```bash
pip install openai  # Pour OpenAI
# ou
pip install anthropic  # Pour Claude
# ou
pip install mistralai  # Pour Mistral
```

Mettez à jour `requirements.txt` :
```bash
pip freeze > requirements.txt
```

---

### **Étape 7 : Tester le chatbot**

1. **Redémarrez le serveur Django :**
```bash
python manage.py runserver
```

2. **Testez via l'interface frontend** ou **via curl** :

```bash
curl -X POST http://localhost:8000/api/chatbot/send_message/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Je cherche un hôtel à Paris"
  }'
```

3. **Vérifiez les logs** pour voir si l'API est bien appelée :
```
✅ OpenAI activé!
```

---

## 🔌 APIs Alternatives {#apis-alternatives}

### **Option 1 : OpenAI GPT**

**Fichier :** `openai_intelligence.py` (voir exemple ci-dessus)

**Avantages :**
- Très performant
- Documentation excellente
- Supporte GPT-4 et GPT-3.5-turbo

**Configuration :**
```python
OPENAI_API_KEY=sk-...
```

---

### **Option 2 : Anthropic Claude**

**Fichier :** `claude_intelligence.py`

```python
import anthropic

class ClaudeChatbot:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
    
    def _call_claude_api(self, prompt_text):
        message = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt_text}
            ]
        )
        return message.content[0].text
```

**Configuration :**
```bash
pip install anthropic
```

---

### **Option 3 : Mistral AI**

**Fichier :** `mistral_intelligence.py`

```python
from mistralai.client import MistralClient

class MistralChatbot:
    def __init__(self):
        self.client = MistralClient(
            api_key=os.getenv('MISTRAL_API_KEY')
        )
    
    def _call_mistral_api(self, prompt_text):
        response = self.client.chat(
            model="mistral-large-latest",
            messages=[
                {"role": "user", "content": prompt_text}
            ]
        )
        return response.choices[0].message.content
```

**Configuration :**
```bash
pip install mistralai
```

---

### **Option 4 : Hugging Face (Gratuit)**

**Fichier :** `huggingface_intelligence.py`

```python
from transformers import pipeline

class HuggingFaceChatbot:
    def __init__(self):
        self.generator = pipeline(
            'text-generation',
            model='mistralai/Mistral-7B-Instruct-v0.1'
        )
    
    def _call_hf_api(self, prompt_text):
        result = self.generator(
            prompt_text,
            max_length=500,
            num_return_sequences=1
        )
        return result[0]['generated_text']
```

**Configuration :**
```bash
pip install transformers torch
```

---

## ✅ Configuration et Tests {#configuration-tests}

### **Checklist de migration**

- [ ] Créer le nouveau fichier d'intelligence (ex: `openai_intelligence.py`)
- [ ] Modifier les imports dans `bot_intelligence.py`
- [ ] Renommer `self.gemini` en `self.ai_engine`
- [ ] Mettre à jour toutes les références
- [ ] Ajouter la clé API dans `.env`
- [ ] Mettre à jour `settings.py`
- [ ] Installer les dépendances
- [ ] Tester avec le serveur Django
- [ ] Vérifier les logs
- [ ] Tester via l'interface frontend

---

### **Tests unitaires**

Créez un fichier de test : `chatbot/test_new_api.py`

```python
from django.test import TestCase
from .openai_intelligence import OpenAIChatbot

class OpenAIChatbotTest(TestCase):
    def setUp(self):
        self.chatbot = OpenAIChatbot()
    
    def test_analyze_message(self):
        result = self.chatbot.analyze_message("Je cherche un hôtel à Paris")
        self.assertIn('intent', result)
        self.assertIn('entities', result)
        print(f"✅ Test réussi: {result}")

    def test_conversational_response(self):
        response = self.chatbot.generate_conversational_response("Bonjour")
        self.assertIsInstance(response, str)
        self.assertTrue(len(response) > 0)
        print(f"✅ Réponse: {response}")
```

**Lancer les tests :**
```bash
python manage.py test chatbot.test_new_api
```

---

### **Debugging**

Si vous rencontrez des problèmes :

1. **Vérifier la clé API :**
```python
import os
print(os.getenv('OPENAI_API_KEY'))
```

2. **Activer les logs détaillés :**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

3. **Tester l'API directement :**
```python
from chatbot.openai_intelligence import OpenAIChatbot
bot = OpenAIChatbot()
result = bot.analyze_message("test")
print(result)
```

---

## 🎯 Résumé

Pour changer l'API du chatbot :

1. **Créer** un nouveau fichier d'intelligence (ex: `openai_intelligence.py`)
2. **Modifier** les imports dans `bot_intelligence.py`
3. **Configurer** la clé API dans `.env`
4. **Tester** le chatbot
5. **Déployer** les changements

**Temps estimé :** 30-60 minutes

---

## 📚 Ressources

- [Documentation OpenAI](https://platform.openai.com/docs)
- [Documentation Anthropic Claude](https://docs.anthropic.com)
- [Documentation Mistral AI](https://docs.mistral.ai)
- [Hugging Face Models](https://huggingface.co/models)

---

**Créé le :** 2025-12-08  
**Auteur :** TravelTodo Team  
**Version :** 1.0

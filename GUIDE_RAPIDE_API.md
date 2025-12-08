# 🚀 Guide Rapide : Changement d'API Chatbot

## ⚡ Version Express (5 minutes)

### Option 1 : Migration Automatique (Recommandé)

```powershell
# Exécutez simplement ce script
.\migrate-chatbot-api.ps1
```

Le script fait tout automatiquement :
- ✅ Crée une sauvegarde
- ✅ Modifie les fichiers
- ✅ Configure la clé API
- ✅ Installe les dépendances

---

### Option 2 : Migration Manuelle

#### Étape 1 : Obtenir une clé API

**OpenAI :**
1. Allez sur https://platform.openai.com/
2. Créez un compte
3. API Keys → Create new secret key
4. Copiez la clé (format: `sk-...`)

**Autres alternatives :**
- **Anthropic Claude :** https://console.anthropic.com/
- **Mistral AI :** https://console.mistral.ai/
- **Cohere :** https://dashboard.cohere.ai/

---

#### Étape 2 : Configurer la clé

Éditez `.env` :
```bash
OPENAI_API_KEY=sk-votre-clé-ici
```

---

#### Étape 3 : Modifier le code

Dans `travel-todo/chatbot/bot_intelligence.py`, ligne 14-19 :

**Avant :**
```python
from .gemini_intelligence import GeminiChatbot
GEMINI_AVAILABLE = True
```

**Après :**
```python
from .openai_intelligence import OpenAIChatbot
OPENAI_AVAILABLE = True
```

Ligne 26-34 :

**Avant :**
```python
self.gemini = None
if GEMINI_AVAILABLE:
    self.gemini = GeminiChatbot()
```

**Après :**
```python
self.ai_engine = None
if OPENAI_AVAILABLE:
    self.ai_engine = OpenAIChatbot()
```

**Remplacer partout :**
- `self.gemini` → `self.ai_engine`
- `GEMINI_AVAILABLE` → `OPENAI_AVAILABLE`

---

#### Étape 4 : Installer les dépendances

```bash
pip install openai
```

---

#### Étape 5 : Tester

```bash
python manage.py runserver
```

Testez via l'interface ou curl :
```bash
curl -X POST http://localhost:8000/api/chatbot/send_message/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour"}'
```

---

## 📊 Comparaison des APIs

| API | Prix (1M tokens) | Vitesse | Qualité | Gratuit |
|-----|------------------|---------|---------|---------|
| **OpenAI GPT-3.5** | $0.50 | ⚡⚡⚡ | ⭐⭐⭐⭐ | ❌ |
| **OpenAI GPT-4** | $30.00 | ⚡⚡ | ⭐⭐⭐⭐⭐ | ❌ |
| **Claude 3 Sonnet** | $3.00 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ❌ |
| **Mistral Large** | $2.00 | ⚡⚡⚡ | ⭐⭐⭐⭐ | ❌ |
| **Gemini 2.0 Flash** | Gratuit* | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ |
| **Hugging Face** | Gratuit | ⚡ | ⭐⭐⭐ | ✅ |

*Gratuit jusqu'à un certain quota

---

## 🔧 Fichiers à Modifier

### Fichiers principaux :
1. **`chatbot/bot_intelligence.py`** - Logique principale
2. **`.env`** - Configuration de la clé API
3. **`requirements.txt`** - Dépendances Python

### Fichiers à créer :
1. **`chatbot/openai_intelligence.py`** - Nouvelle intégration API (déjà créé ✅)

### Fichiers à ne PAS modifier :
- `chatbot/views.py` - Pas besoin de changement
- `chatbot/models.py` - Pas besoin de changement
- Frontend - Pas besoin de changement

---

## 🐛 Dépannage Rapide

### Erreur : "Clé API manquante"
```bash
# Vérifiez que la clé est bien dans .env
cat .env | grep OPENAI_API_KEY

# Redémarrez le serveur
python manage.py runserver
```

### Erreur : "Module 'openai' not found"
```bash
pip install openai
```

### Erreur : "Invalid API key"
- Vérifiez que la clé commence par `sk-`
- Vérifiez qu'elle n'a pas d'espaces
- Créez une nouvelle clé sur https://platform.openai.com/

### Le chatbot ne répond pas
```python
# Testez directement dans Python
python manage.py shell

>>> from chatbot.openai_intelligence import OpenAIChatbot
>>> bot = OpenAIChatbot()
>>> result = bot.analyze_message("Bonjour")
>>> print(result)
```

---

## 📝 Checklist de Migration

- [ ] Obtenir une clé API
- [ ] Créer/modifier `.env`
- [ ] Modifier `bot_intelligence.py`
- [ ] Installer les dépendances (`pip install openai`)
- [ ] Redémarrer le serveur
- [ ] Tester le chatbot
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Tester plusieurs messages
- [ ] Vérifier les recommandations
- [ ] Déployer en production

---

## 🎯 Commandes Utiles

```bash
# Tester l'API directement
python -c "from chatbot.openai_intelligence import OpenAIChatbot; bot = OpenAIChatbot(); print(bot.analyze_message('test'))"

# Voir les logs en temps réel
python manage.py runserver --verbosity 2

# Créer une sauvegarde
cp travel-todo/chatbot/bot_intelligence.py travel-todo/chatbot/bot_intelligence.py.backup

# Restaurer la sauvegarde
cp travel-todo/chatbot/bot_intelligence.py.backup travel-todo/chatbot/bot_intelligence.py
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **`GUIDE_CHANGEMENT_API_CHATBOT.md`** - Guide complet avec exemples
- **`chatbot/openai_intelligence.py`** - Code source commenté

---

## 🆘 Support

En cas de problème :
1. Consultez la section Dépannage ci-dessus
2. Vérifiez les logs du serveur Django
3. Testez l'API directement (voir commandes utiles)
4. Restaurez la sauvegarde si nécessaire

---

**Temps estimé :** 5-10 minutes  
**Niveau :** Débutant à Intermédiaire  
**Dernière mise à jour :** 2025-12-08

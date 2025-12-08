# 🤖 Guide : كيفاش تبدل API متع الـ Chatbot

## 📋 فهرس

1. [شنوة عندك توا](#architecture-actuelle)
2. [الخطوات باش تبدل الـ API](#etapes)
3. [APIs البديلة](#apis-alternatives)
4. [كيفاش تتأكد أنو خدم مليح](#tests)

---

## 🏗️ شنوة عندك توا {#architecture-actuelle}

الـ chatbot متاعك يستعمل **Google Gemini AI** توا.

```
Frontend (Chatbot.jsx)
    ↓
Django API (views.py)
    ↓
Bot Brain (bot_intelligence.py)
    ↓
Gemini AI (gemini_intelligence.py) ← توا
```

---

## 🔄 الخطوات باش تبدل الـ API {#etapes}

### طريقة 1️⃣ : أوتوماتيك (أسهل حاجة)

```powershell
# شغل هذا السكريبت وكل شيء يتعمل أوتوماتيك
.\migrate-chatbot-api.ps1
```

**الوقت اللازم:** 5 دقايق

---

### طريقة 2️⃣ : يدوي (Manual)

#### خطوة 1: جيب API Key

**OpenAI:**
1. روح لـ https://platform.openai.com/
2. اعمل compte
3. API Keys → Create new secret key
4. انسخ الـ key (تبدا بـ `sk-...`)

**بدائل أخرى:**
- **Claude:** https://console.anthropic.com/
- **Mistral AI:** https://console.mistral.ai/
- **Gemini:** https://makersuite.google.com/

---

#### خطوة 2: حط الـ API Key في `.env`

```bash
# افتح ملف .env وزيد هذا السطر
OPENAI_API_KEY=sk-votre-clé-ici
```

---

#### خطوة 3: بدل الكود في `bot_intelligence.py`

**السطر 14-15:**

قبل:
```python
from .gemini_intelligence import GeminiChatbot
GEMINI_AVAILABLE = True
```

بعد:
```python
from .openai_intelligence import OpenAIChatbot
OPENAI_AVAILABLE = True
```

**السطر 27-31:**

قبل:
```python
self.gemini = None
if GEMINI_AVAILABLE:
    self.gemini = GeminiChatbot()
```

بعد:
```python
self.ai_engine = None
if OPENAI_AVAILABLE:
    self.ai_engine = OpenAIChatbot()
```

**بدل في كل مكان:**
- `self.gemini` → `self.ai_engine`
- `GEMINI_AVAILABLE` → `OPENAI_AVAILABLE`

---

#### خطوة 4: نصب الـ dependencies

```bash
pip install openai
```

---

#### خطوة 5: تست

```bash
# شغل الـ serveur
python manage.py runserver

# تست بـ curl
curl -X POST http://localhost:8000/api/chatbot/send_message/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour"}'
```

---

## 🔌 APIs البديلة {#apis-alternatives}

### مقارنة:

| API | مجاني؟ | سريع؟ | جودة | بالفرنسية؟ | السعر/1M |
|-----|--------|-------|------|------------|----------|
| **OpenAI GPT-4** | ❌ | ⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | $30 |
| **GPT-3.5** | ❌ | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ | $0.50 |
| **Claude 3** | ❌ | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | $3 |
| **Mistral AI** | ❌ | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅✅ | $2 |
| **Gemini 2.0** | ✅* | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ | مجاني* |
| **Hugging Face** | ✅ | ⚡ | ⭐⭐⭐ | ✅ | مجاني |

*مجاني مع حدود

### توصيات:

- 🏆 **أحسن جودة:** GPT-4 أو Claude 3
- 💰 **أرخص:** Gemini 2.0 (مجاني) أو Mistral
- ⚡ **أسرع:** GPT-3.5-turbo أو Gemini 2.0
- 🇫🇷 **أحسن بالفرنسية:** Mistral AI
- 💻 **محلي/مجاني:** Ollama أو Hugging Face

---

## ✅ Checklist {#tests}

### قبل التبديل
- [ ] اقرا الـ guide الكامل
- [ ] اختار الـ API اللي تحب
- [ ] جيب API key
- [ ] اعمل backup للكود

### وقت التبديل
- [ ] حط الـ API key في `.env`
- [ ] بدل `bot_intelligence.py`
- [ ] نصب الـ dependencies
- [ ] تأكد ماكش أخطاء

### بعد التبديل
- [ ] شغل الـ serveur
- [ ] شغل الـ tests
- [ ] تست يدوي
- [ ] شوف الـ logs
- [ ] تست رسائل مختلفة
- [ ] تأكد من الـ recommendations

---

## 🐛 مشاكل شائعة

### ❌ "Clé API manquante"

**الحل:**
```bash
# تأكد من .env
cat .env | grep OPENAI_API_KEY

# شغل الـ serveur من جديد
python manage.py runserver
```

### ❌ "Module not found"

**الحل:**
```bash
pip install openai
```

### ❌ "Invalid API key"

**الحل:**
- تأكد أنو الـ key تبدا بـ `sk-`
- ماكش فراغات قبل أو بعد
- اعمل key جديدة

---

## 📂 الملفات اللي تنشأت

| ملف | شنوة فيه | فايدتو |
|-----|----------|---------|
| `GUIDE_CHANGEMENT_API_CHATBOT.md` | Guide كامل بالتفصيل | Documentation كاملة |
| `GUIDE_RAPIDE_API.md` | Guide سريع | مرجع سريع |
| `openai_intelligence.py` | كود OpenAI | جاهز للاستعمال |
| `migrate-chatbot-api.ps1` | سكريبت أوتوماتيك | يبدل كل شيء |
| `test_chatbot_api_change.py` | Tests | يتأكد أنو خدم |
| `RESUME_CHANGEMENT_API.md` | ملخص | نظرة عامة |
| `api_examples.py` | أمثلة APIs أخرى | Templates |

---

## 🚀 الخطوات الجاية

1. **تست** برسائل مختلفة
2. **حسن** الـ paramètres (temperature, max_tokens)
3. **راقب** التكلفة
4. **وثق** الـ configurations متاعك
5. **Deploy** في production

---

## 💡 نصائح

### باش توفر في الفلوس:
- استعمل GPT-3.5-turbo بدل GPT-4
- حدد max_tokens بـ 500-800
- Gemini 2.0 Flash مجاني (مع حدود)

### باش تحسن الجودة:
- GPT-4 أو Claude 3 للأجوبة الأحسن
- اضبط temperature على 0.7
- تست prompts مختلفة

### باش تزيد السرعة:
- GPT-3.5-turbo هو الأسرع
- Gemini 2.0 Flash سريع برشا زادة
- استعمل timeouts مناسبة (10-15s)

---

## 🎯 ملخص في 3 نقاط

1. **انشئ** الملف `openai_intelligence.py` (منشأ ✅)
2. **بدل** `bot_intelligence.py` (Gemini → OpenAI)
3. **تست** بـ `test_chatbot_api_change.py`

**هذا الكل!** 🎉

---

## 📚 موارد

### Documentation
- [Guide كامل](GUIDE_CHANGEMENT_API_CHATBOT.md)
- [Guide سريع](GUIDE_RAPIDE_API.md)
- [كود OpenAI](travel-todo/chatbot/openai_intelligence.py)

### APIs
- [OpenAI](https://platform.openai.com/)
- [Claude](https://console.anthropic.com/)
- [Mistral](https://console.mistral.ai/)
- [Gemini](https://makersuite.google.com/)

### أدوات
- [سكريبت التبديل](migrate-chatbot-api.ps1)
- [Tests](test_chatbot_api_change.py)

---

## 🆘 مساعدة

إذا عندك مشكل:
1. شوف قسم المشاكل الشائعة فوق
2. تأكد من الـ logs
3. تست الـ API مباشرة
4. ارجع للـ backup إذا لزم

---

**تاريخ الإنشاء:** 2025-12-08  
**الوقت المتوقع:** 5-15 دقيقة  
**المستوى:** مبتدئ  
**الدعم:** شوف الـ guides المفصلة

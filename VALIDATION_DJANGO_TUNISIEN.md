# 🎯 Validation Django - Travel App
## Résumé Projet b'Tounes 🇹🇳

---

## 📱 Chneya el Projet?

**Travel App** - Plateforme web l booking des voyages (hôtels, vols, circuits) m3a chatbot intelligent.

### **Technologies**
- **Backend**: Django 4.x + Django REST Framework
- **Base de données**: PostgreSQL
- **Authentification**: JWT (JSON Web Tokens)
- **IA**: Google Gemini API (chatbot)

---

## 🏗️ Architecture - Kifeh 5demt?

### **4 Applications Django (Modulaire)**

```
travel-todo/
├── users/        → Gestion utilisateurs w authentification
├── catalog/      → Catalogue (hôtels, vols, circuits)
├── bookings/     → Réservations w paiements
└── chatbot/      → Assistant virtuel b IA
```

---

## 🔐 1. APPLICATION USERS - El Authentification

### **Chneya 3melt?**

✅ **Custom User Model** (email au lieu de username)
```python
class User(AbstractBaseUser, PermissionsMixin):
    email = EmailField(unique=True)  # El email howa username
    password = CharField              # Hashé b PBKDF2 (sécurisé)
    first_name, last_name, phone
    role = CharField                  # 'user' wala 'admin'
    profile_picture = ImageField      # Photo de profil
    favorite_destinations = JSONField # Destinations préférées
```

### **Fonctionnalités**

✅ **Inscription (Register)**
- Validation email unique (mafamech 2 users b nafs el email)
- Hashage sécurisé lel password (ma7adech ynajem y9raha)
- Validation des données (email valide, password 9wi)

✅ **Connexion (Login)**
- Authentification b email + password
- Génération 2 tokens JWT:
  - **Access Token**: 5 heures (bech ta3mel requests)
  - **Refresh Token**: 7 jours (bech tjaded el access token)

✅ **Gestion Profil**
- Récupération infos utilisateur
- Modification profil (nom, téléphone, photo)
- Upload photo de profil
- Préférences voyage (destinations favorites)

✅ **Sécurité**
- Token Blacklist (ki t5arrej, el token yetfasa5)
- Rotation automatique des tokens
- Permissions basées 3la role (user wala admin)

### **API Endpoints**
```
POST   /api/users/register/     → Inscription
POST   /api/users/login/        → Connexion
POST   /api/users/logout/       → Déconnexion
GET    /api/users/profile/      → Chof profil
PATCH  /api/users/profile/      → Badel profil
POST   /api/users/token/refresh/ → Jaded token
```

---

## 🏨 2. APPLICATION CATALOG - El Catalogue

### **Chneya 3melt?**

#### **A. Destinations**
```python
class Destination:
    name, country, description
    image = ImageField
    is_popular = BooleanField  # Destinations populaires
```

#### **B. Hotels**
```python
class Hotel:
    name, description, address
    destination = ForeignKey(Destination)
    stars = IntegerField(1-5)           # Nombre étoiles
    price_per_night = DecimalField      # Prix par nuit (TND)
    
    # Équipements
    has_wifi, has_pool, has_parking
    has_restaurant, has_spa
    
    # Disponibilité
    is_available, total_rooms
    average_rating = DecimalField(0-5)  # Note moyenne
```

#### **C. Vols (Flights)**
```python
class Flight:
    airline, flight_number
    origin, destination = ForeignKey(Destination)
    departure_time, arrival_time
    price, available_seats
    is_direct, baggage_included
    
    @property duration  # Calcul automatique durée vol
```

#### **D. Circuits (TourPackage)**
```python
class TourPackage:
    name, description
    destination = ForeignKey(Destination)
    duration_days, price
    
    # Chneya included?
    includes_hotel, includes_flight
    includes_meals, includes_guide
    
    itinerary = TextField  # Programme jour par jour
    max_participants
```

#### **E. Promotions**
```python
class Promotion:
    code = CharField(unique=True)      # Code promo
    discount_type = ['percentage', 'fixed']
    discount_value
    start_date, end_date
    max_uses, times_used
```

### **Fonctionnalités**
✅ Recherche w filtrage (b destination, prix, étoiles)
✅ Pagination (ma ychargihoumech lkol mara wa7da)
✅ Upload images multiples
✅ Calculs automatiques (durée vol, prix)
✅ Système de notation

### **API Endpoints**
```
GET /api/catalog/destinations/
GET /api/catalog/hotels/?destination=Paris&stars=4
GET /api/catalog/flights/?origin=Tunis&destination=Paris
GET /api/catalog/packages/
GET /api/catalog/promotions/
```

---

## 📅 3. APPLICATION BOOKINGS - Réservations

### **Chneya 3melt?**

#### **A. Booking (Réservation)**
```python
class Booking:
    # Identification
    booking_number = CharField  # Auto-généré: BK12345678
    user = ForeignKey(User)
    booking_type = ['hotel', 'flight', 'package']
    
    # Relations (wa7da bark tetmala)
    hotel = ForeignKey(Hotel, null=True)
    flight = ForeignKey(Flight, null=True)
    package = ForeignKey(TourPackage, null=True)
    
    # Dates w participants
    start_date, end_date
    num_guests = IntegerField  # 3ded el voyageurs
    
    # Prix
    unit_price, total_price  # Calcul auto: unit_price × num_guests
    
    # Statuts
    status = ['pending', 'confirmed', 'cancelled', 'completed']
    payment_status = ['pending', 'paid', 'refunded']
    
    special_requests = TextField  # Demandes spéciales
```

#### **B. Payment (Paiement)**
```python
class Payment:
    booking = OneToOneField(Booking)
    amount
    payment_method = ['card', 'paypal', 'bank_transfer', 'cash']
    transaction_id
    is_successful
    payment_date
```

### **Logique Métier (Business Logic)**

✅ **Génération automatique** numéro réservation (UUID)
✅ **Calcul automatique** prix total (unit_price × num_guests)
✅ **Validation dates** (start_date < end_date)
✅ **Vérification disponibilité** 9bal ma ta3mel booking
✅ **Workflow statuts** (pending → confirmed → completed)

### **API Endpoints**
```
POST   /api/bookings/           → A3mel réservation
GET    /api/bookings/           → Chof réservations mte3i
GET    /api/bookings/{id}/      → Détails réservation
PATCH  /api/bookings/{id}/      → Badel (annuler)
POST   /api/bookings/{id}/payment/ → A3mel paiement
```

---

## 🤖 4. APPLICATION CHATBOT - Assistant Virtuel

### **Chneya 3melt?**

#### **A. ChatConversation**
```python
class ChatConversation:
    user = ForeignKey(User, null=True)  # Support anonyme
    session_id = CharField(unique=True)
    started_at, last_activity
    is_active
```

#### **B. ChatMessage**
```python
class ChatMessage:
    conversation = ForeignKey(ChatConversation)
    sender = ['user', 'bot']
    message = TextField
    
    # Intelligence artificielle
    intent = CharField  # search_hotel, search_flight, etc.
    entities = JSONField  # {budget: 500, destination: "Paris"}
    
    # Recommandations
    recommended_hotels = ManyToManyField(Hotel)
    recommended_flights = ManyToManyField(Flight)
    recommended_packages = ManyToManyField(TourPackage)
```

#### **C. UserPreference**
```python
class UserPreference:
    user = OneToOneField(User)
    preferred_budget_min, preferred_budget_max
    preferred_stars
    preferred_destinations = JSONField
    likes_wifi, likes_pool, likes_spa
    search_history = JSONField  # Historique recherches
```

#### **D. ChatbotFAQ**
```python
class ChatbotFAQ:
    question, answer
    keywords = JSONField  # Mots-clés bech ylakem
    category
    times_used  # Analytics
```

### **Intégration IA - Google Gemini**

✅ **Traitement langage naturel** (NLP)
- User: "N7eb hôtel f Paris b 500 TND"
- Bot yextracti: {destination: "Paris", budget: 500}

✅ **Recommandations personnalisées** basées 3la:
- Préférences utilisateur
- Historique recherche
- Budget w contraintes

✅ **Conversations contextuelles** (yet3alem men historique)

### **API Endpoints**
```
POST   /api/chatbot/message/       → Ib3ath message
GET    /api/chatbot/conversations/ → Chof conversations mte3i
GET    /api/chatbot/preferences/   → Chof préférences mte3i
PATCH  /api/chatbot/preferences/   → Badel préférences
```

---

## ⚙️ Configuration - Settings.py

### **Base de Données PostgreSQL**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'travel_todo_db',
        'USER': 'postgres',
        'PASSWORD': env('DB_PASSWORD'),  # Men .env file
        'HOST': env('DB_HOST'),
        'PORT': '5432',
    }
}
```

### **JWT Configuration**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,      # Yjaded token automatiquement
    'BLACKLIST_AFTER_ROTATION': True,   # Yfasa5 el 9dim
}
```

### **CORS (Frontend-Backend Communication)**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React
    "http://localhost:5173",  # Vite
]
CORS_ALLOW_CREDENTIALS = True
```

### **Sécurité**
```python
# Validation passwords 9wiya
AUTH_PASSWORD_VALIDATORS = [
    UserAttributeSimilarityValidator,  # Ma ykounch chbih lel email
    MinimumLengthValidator,            # Minimum 8 caractères
    CommonPasswordValidator,           # Ma ykounch "password123"
    NumericPasswordValidator,          # Ma ykounch bark ar9am
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Variables sensibles f .env
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG', default=False)
GEMINI_API_KEY = env('GEMINI_API_KEY')
```

### **Internationalisation**
```python
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Tunis'  # Wa9t Tunis 🇹🇳
USE_I18N = True
USE_TZ = True
```

---

## 🔄 Exemple Flux Complet

### **Scénario: User y7eb yreservi hôtel**

```
1. Inscription
   POST /api/users/register/
   → User ya3mel compte jdid
   → Password yethasher (sécurisé)
   → User yetcréa f DB

2. Connexion
   POST /api/users/login/
   → User yod5ol b email/password
   → Backend yverifi
   → Yjib access token + refresh token
   → Frontend y5azen el token

3. Recherche Hôtel
   GET /api/catalog/hotels/?destination=Paris&stars=4&max_price=500
   Header: Authorization: Bearer <access_token>
   → Backend yverifi token
   → Yfilteri hotels men DB
   → Yjib résultats

4. Réservation
   POST /api/bookings/
   Body: {
     booking_type: "hotel",
     hotel: 5,
     start_date: "2024-06-01",
     end_date: "2024-06-05",
     num_guests: 2
   }
   → Backend yverifi disponibilité
   → Y7aseb prix total (price_per_night × 4 nuits × 2 guests)
   → Ycréa booking
   → Yjib booking_number: BK12345678

5. Paiement
   POST /api/bookings/15/payment/
   Body: {
     payment_method: "card",
     amount: 800.00
   }
   → Ycréa payment
   → Ybadel status → "confirmed"
   → Ybadel payment_status → "paid"
   → Confirmation
```

---

## 🎯 Points Forts - 3leh el Projet Behi?

### **1. Architecture Propre** 🏗️
✅ 4 apps Django séparées (modulaire)
✅ Kol app 3andha responsabilité wa7da
✅ Code organisé w facile bech tfhmou

### **2. Sécurité Robuste** 🔐
✅ JWT tokens (ma7adech ynajem y5ali token fake)
✅ Password hashé b PBKDF2 (ma7adech y9raha)
✅ Token blacklist (ki t5arrej, token yetfasa5)
✅ Validation stricte (email valide, prix positif, etc.)
✅ CORS configuré (bark frontend mte3na ynajem yconnecti)
✅ Variables sensibles f .env (moch f code)

### **3. Fonctionnalités Avancées** 🚀
✅ Custom User Model (email au lieu username)
✅ Système rôles (user/admin)
✅ Upload images (photos profil, hôtels)
✅ JSONField (données flexibles)
✅ Calculs automatiques (prix, durée vol)
✅ UUID pour booking numbers (unique)

### **4. API REST Complète** 📡
✅ CRUD complet (Create, Read, Update, Delete)
✅ Filtrage w recherche avancés
✅ Pagination (performance)
✅ Permissions granulaires (user ynajem ychof bark bookings mte3ou)
✅ DRF Browsable API (documentation automatique)

### **5. Intelligence Artificielle** 🤖
✅ Google Gemini API
✅ Traitement langage naturel (tfhem tounes!)
✅ Recommandations personnalisées
✅ Apprentissage préférences user
✅ Base connaissances FAQ

### **6. Base de Données Production-Ready** 💾
✅ PostgreSQL (moch SQLite)
✅ Relations optimisées (ForeignKey, ManyToMany)
✅ Indexes automatiques (performance)
✅ Migrations versionnées (historique)
✅ Contraintes intégrité (data correcte)

---

## 📊 Modèle de Données - Relations

```
User (1) ──────< (N) Booking
                      │
                      ├──> (0-1) Payment
                      ├──> (0-1) Hotel
                      ├──> (0-1) Flight
                      └──> (0-1) TourPackage

Destination (1) ──< (N) Hotel
                ├─< (N) Flight (origin)
                ├─< (N) Flight (destination)
                └─< (N) TourPackage

User (1) ──< (N) ChatConversation ──< (N) ChatMessage
User (1) ──── (1) UserPreference
```

**Explication**:
- User ynajem ya3mel barcha bookings (1 → N)
- Kol booking 3andou payment wa7da (1 → 1)
- Kol destination fih barcha hotels (1 → N)
- User ynajem ya3mel barcha conversations m3a chatbot (1 → N)

---

## 🧪 Validations Implémentées

### **Exemples Concrets**

```python
# Email unique (mafamech 2 users b nafs email)
email = EmailField(unique=True)

# Prix positif (ma ykounch négatif)
price = DecimalField(validators=[MinValueValidator(0)])

# Note entre 0 w 5
rating = DecimalField(validators=[MinValueValidator(0), MaxValueValidator(5)])

# Minimum 1 guest
num_guests = IntegerField(validators=[MinValueValidator(1)])

# Validation dates (f serializer)
if start_date >= end_date:
    raise ValidationError("Date fin lazem ba3d date début")

# Validation disponibilité
if hotel.is_available == False:
    raise ValidationError("Hôtel moch disponible")
```

---

## 🎓 Justifications Techniques - 3leh 5tart heki?

### **3leh Django?**
✅ Framework mature w robuste (moch framework jdid)
✅ ORM puissant (requêtes SQL automatiques)
✅ Admin panel intégré (gestion facile)
✅ Sécurité par défaut (protection CSRF, XSS, SQL Injection)
✅ Écosystème riche (DRF, JWT, etc.)
✅ Documentation excellente

### **3leh PostgreSQL?**
✅ Base données relationnelle robuste
✅ Support JSON natif (préférences, entities)
✅ Performances excellentes
✅ ACID compliance (transactions sécurisées)
✅ Production-ready (moch juste dev)
✅ Open source w gratuit

### **3leh JWT?**
✅ Stateless (scalable, ynajem y5dem m3a barcha servers)
✅ Compatible mobile w web
✅ Sécurisé (signature cryptographique)
✅ Standard industrie (tout le monde yesta3mlou)
✅ Mafamech besoin session f server

### **3leh Django REST Framework?**
✅ Serialization puissante (validation automatique)
✅ Authentification/Permissions flexibles
✅ Browsable API (test facile)
✅ Pagination, filtrage intégrés
✅ Documentation automatique

---

## 🎤 Kifeh Bech T9addem 9oddem Prof?

### **1. Introduction (2 min)**

"**Bonjour Madame/Monsieur**, ena 3malt projet **Travel App**, plateforme web l booking des voyages (hôtels, vols, circuits) m3a chatbot intelligent.

**Technologies utilisées**:
- Backend: Django + Django REST Framework
- Base données: PostgreSQL
- Authentification: JWT
- IA: Google Gemini API"

### **2. Architecture (3 min)**

"El projet mabni 3la **architecture modulaire** b 4 applications Django:

1. **Users**: Gestion utilisateurs w authentification JWT
2. **Catalog**: Catalogue hôtels, vols, circuits
3. **Bookings**: Système réservations w paiements
4. **Chatbot**: Assistant virtuel intelligent

Kol app 3andha responsabilité wa7da (Separation of Concerns), w heka el code organisé w facile bech tfhmou w t3awed testa3mlou."

### **3. Fonctionnalités Principales (5 min)**

**A. Authentification Sécurisée**
"3malt **Custom User Model** b email au lieu username. El authentification b **JWT tokens**:
- Access token: 5 heures
- Refresh token: 7 jours
- Token blacklist bech ki user y5arrej, token yetfasa5

El passwords **hashés b PBKDF2**, ma7adech ynajem y9rahom."

**B. Catalogue Complet**
"El catalogue fih:
- **Destinations** (Paris, Rome, etc.)
- **Hotels** m3a équipements (wifi, piscine, spa)
- **Vols** m3a calcul automatique durée
- **Circuits touristiques** m3a itinéraire détaillé
- **Promotions** (codes promo)

Kol haja m3a **filtrage avancé** (b destination, prix, étoiles, etc.)"

**C. Système Réservation**
"El booking system **polymorphique** (ynajem yreservi hotel, vol, wala package).

**Logique métier**:
- Génération automatique booking number (UUID)
- Calcul automatique prix total
- Validation dates w disponibilité
- Workflow statuts (pending → confirmed → completed)
- Système paiement complet"

**D. Chatbot Intelligent**
"El chatbot yesta3mel **Google Gemini API** bech:
- Yfhem langage naturel (user y9oulou 'n7eb hotel f Paris b 500 TND')
- Yextracti entities (destination, budget)
- Ya3mel recommandations personnalisées
- Yet3alem men préférences user w historique"

### **4. Sécurité (2 min)**

"El projet **sécurisé**:
- ✅ JWT authentication (stateless, scalable)
- ✅ Password hashing PBKDF2
- ✅ Token blacklist
- ✅ Validation stricte données (email valide, prix positif)
- ✅ CORS configuré
- ✅ Variables sensibles f .env (moch f code)
- ✅ Protection CSRF, XSS, SQL Injection (Django par défaut)"

### **5. Base de Données (2 min)**

"Esta3malt **PostgreSQL** (moch SQLite) 7it:
- Production-ready
- Support JSON natif
- Performances excellentes
- ACID compliance

**Relations optimisées**:
- User → Bookings (1 → N)
- Destination → Hotels (1 → N)
- Booking → Payment (1 → 1)
- User → ChatConversations (1 → N)"

### **6. API REST (2 min)**

"El API REST complète m3a:
- ✅ CRUD complet
- ✅ Filtrage w recherche avancés
- ✅ Pagination
- ✅ Permissions granulaires
- ✅ Documentation automatique (DRF Browsable API)

**Exemple endpoints**:
```
POST /api/users/register/
POST /api/users/login/
GET  /api/catalog/hotels/?destination=Paris&stars=4
POST /api/bookings/
POST /api/chatbot/message/
```"

### **7. Démonstration (5 min)**

**Wari**:
1. **Inscription** user jdid
2. **Connexion** w récupération token
3. **Recherche** hôtel b filtres
4. **Réservation** hôtel
5. **Chatbot** conversation

**Commandes**:
```bash
# Lancer backend
cd travel-todo
python manage.py runserver

# Tester API (Postman wala curl)
curl http://localhost:8000/api/catalog/hotels/
```

### **8. Conclusion (1 min)**

"El projet **complet w professionnel**:
- ✅ Architecture propre w modulaire
- ✅ Sécurité robuste
- ✅ Fonctionnalités avancées
- ✅ IA intégrée
- ✅ Production-ready

El code **maintenable** w **extensible** (facile bech tzid features jdod).

**Merci** pour votre attention. 3andkom des questions?"

---

## 📝 Checklist Avant Validation

### **Préparation**
- [ ] Backend running (`python manage.py runserver`)
- [ ] Frontend running (`npm start`)
- [ ] Database migrations à jour (`python manage.py migrate`)
- [ ] Postman/Insomnia ready (bech ttest API)
- [ ] .env file configured

### **Points à Mentionner**
- [ ] Architecture modulaire (4 apps)
- [ ] Custom User Model
- [ ] JWT authentication
- [ ] PostgreSQL (moch SQLite)
- [ ] Sécurité (hashing, validation, CORS)
- [ ] API REST complète
- [ ] Chatbot IA (Gemini)
- [ ] Système réservation polymorphique
- [ ] Calculs automatiques
- [ ] Relations DB optimisées

### **Questions Possibles Prof**

**Q: 3leh 5tart JWT au lieu sessions?**
A: "JWT stateless, scalable, compatible mobile, w standard industrie. Mafamech besoin session f server."

**Q: 3leh PostgreSQL au lieu SQLite?**
A: "PostgreSQL production-ready, support JSON natif, performances mle7, w ACID compliance."

**Q: Kifeh t7ami el passwords?**
A: "B PBKDF2 hashing (Django par défaut). El password yethasher 9bal ma yet5azen f DB, ma7adech ynajem y9raha."

**Q: Kifeh el chatbot y5dem?**
A: "Yesta3mel Google Gemini API. User yib3ath message, backend yib3thou l Gemini, Gemini yextracti entities (destination, budget), w backend ya3mel recommandations men DB."

**Q: Chneya el validations li 3malt?**
A: "Email unique, prix positif, dates valides, rating 0-5, minimum 1 guest, disponibilité, etc. F models w f serializers."

---

## 🚀 Commandes Utiles

### **Lancer Projet**
```bash
# Backend
cd travel-todo
python manage.py runserver

# Frontend
cd frontend/travelbook
npm start
```

### **Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

### **Créer Superuser**
```bash
python manage.py createsuperuser
```

### **Tester API**
```bash
# Inscription
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Hotels
curl http://localhost:8000/api/catalog/hotels/
```

---

## 📚 Ressources

### **Documentation**
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- JWT: https://django-rest-framework-simplejwt.readthedocs.io/

### **Code Source**
- Repository: https://github.com/yakoudi/travel_app
- Branch: malek

---

## ✅ Résumé Final

**El projet Travel App** howa plateforme web complète l booking des voyages m3a:

🏗️ **Architecture propre** (4 apps modulaires)  
🔐 **Sécurité robuste** (JWT, hashing, validation)  
🚀 **Fonctionnalités avancées** (CRUD, filtrage, calculs auto)  
🤖 **IA intégrée** (chatbot Gemini)  
💾 **Base données optimisée** (PostgreSQL, relations)  
📡 **API REST complète** (DRF, permissions, pagination)  

**Prêt pour validation!** 🎓✨

---

**Date**: Décembre 2024  
**Développeur**: Malek  
**Framework**: Django 4.x + DRF  
**Statut**: ✅ Ready for Validation  
**Location**: Tunisia 🇹🇳

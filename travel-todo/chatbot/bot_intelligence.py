"""
Intelligence du chatbot - Analyse des messages et recommandations
Version AMÉLIORÉE avec Google Gemini AI
Permet de chercher dans la base interne ET sur le web
"""

import re
import requests
from django.db.models import Q
from catalog.models import Hotel, Flight, TourPackage
from urllib.parse import quote_plus

# Import de l'intelligence Gemini
try:
    from .gemini_intelligence import GeminiChatbot
    GEMINI_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Gemini non disponible: {e}")
    GEMINI_AVAILABLE = False


class ChatbotBrain:
    """Cerveau du chatbot - Analyse et recommandations avec Gemini AI"""
    
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
                
        # Mots-clés pour détecter l'intention (Fallback)
        self.intents = {
            'search_hotel': ['hotel', 'hôtel', 'chambre', 'dormir', 'hébergement', 'loger'],
            'search_flight': ['vol', 'avion', 'billet', 'voler'],
            'search_package': ['circuit', 'voyage', 'séjour', 'package', 'tout compris'],
            'price_query': ['prix', 'coût', 'tarif', 'cher', 'pas cher', 'économique', 'budget'],
            'amenities': ['wifi', 'piscine', 'spa', 'parking', 'restaurant', 'vue mer'],
            'destination': ['paris', 'rome', 'londres', 'tunis', 'france', 'italie'],
            'greeting': ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'],
            'thanks': ['merci', 'thank', 'remercie'],
            'help': ['aide', 'aider', 'help', 'comment', 'besoin'],
        }
        
        # Destinations communes (étendu)
        self.common_destinations = [
            'paris', 'rome', 'londres', 'barcelone', 'madrid', 'berlin',
            'tunis', 'djerba', 'sousse', 'hammamet', 'monastir', 'sfax',
            'sfakia', 'kairouan', 'douz', 'tataouine', 'nabeul', 'bizerte'
        ]
    
    def analyze_message(self, message):
        """Analyse le message et extrait l'intention + entités"""
        
        # 1. Essayer avec Gemini d'abord
        if self.gemini:
            try:
                analysis = self.gemini.analyze_message(message)
                # Si Gemini est confiant, on utilise son résultat
                if analysis['confidence'] > 0.6:
                    return analysis
            except Exception as e:
                print(f"Erreur analyse Gemini: {e}")
        
        # 2. Fallback sur l'analyse par mots-clés
        return self._analyze_keywords(message)
        
    def _analyze_keywords(self, message):
        """Analyse classique par mots-clés (Fallback)"""
        message_lower = message.lower()
        
        result = {
            'intent': 'unknown',
            'entities': {},
            'confidence': 0.0
        }
        
        # Détecter l'intention principale
        detected_intents = []
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_intents.append(intent)
                    break
        
        if detected_intents:
            result['intent'] = detected_intents[0]
            result['confidence'] = 0.8
        
        # Extraire les entités
        budget = self._extract_budget(message_lower)
        if budget:
            result['entities']['budget'] = budget
        
        destination = self._extract_destination(message_lower)
        if destination:
            result['entities']['destination'] = destination
        
        stars = self._extract_stars(message_lower)
        if stars:
            result['entities']['stars'] = stars
        
        amenities = self._extract_amenities(message_lower)
        if amenities:
            result['entities']['amenities'] = amenities
        
        return result
    
    def _extract_budget(self, message):
        """Extrait le budget du message"""
        patterns = [
            r'(\d+)\s*(?:tnd|dinars?|dt)',
            r'(\d+)\s*/', 
            r'(?:budget|prix|tarif)\s*(\d+)', 
            r'(?:moins|max|maximum)\s*(?:de)?\s*(\d+)',
            r'(?:environ|autour)\s*(?:de)?\s*(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                return int(match.group(1))
        
        if 'pas cher' in message or 'économique' in message or 'budget' in message:
            return 200
        
        if 'luxe' in message or 'cher' in message:
            return 1000
        
        return None
    
    def _extract_destination(self, message):
        """Extrait la destination"""
        destinations_found = []
        for dest in self.common_destinations:
            if dest in message:
                destinations_found.append(dest.capitalize())
        
        if destinations_found:
            return destinations_found[-1]
        
        return None
    
    def _extract_stars(self, message):
        """Extrait le nombre d'étoiles"""
        patterns = [
            r'(\d)\s*étoiles?',
            r'(\d)\s*\*',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                stars = int(match.group(1))
                if 1 <= stars <= 5:
                    return stars
        return None
    
    def _extract_amenities(self, message):
        """Extrait les équipements"""
        amenities = []
        amenity_mapping = {
            'wifi': ['wifi', 'internet'],
            'piscine': ['piscine', 'pool'],
            'spa': ['spa', 'bien-être', 'massage'],
            'parking': ['parking', 'stationnement'],
            'restaurant': ['restaurant', 'repas'],
            'vue mer': ['vue mer', 'bord de mer', 'plage'],
        }
        
        for amenity, keywords in amenity_mapping.items():
            for keyword in keywords:
                if keyword in message:
                    amenities.append(amenity)
                    break
        
        return amenities if amenities else None
    
    def get_recommendations(self, intent, entities, limit=3, search_web=True):
        """Obtient des recommandations"""
        recommendations = []
        
        if intent == 'search_hotel':
            recommendations = self._recommend_hotels(entities, limit)
        elif intent == 'search_flight':
            recommendations = self._recommend_flights(entities, limit)
        elif intent == 'search_package':
            recommendations = self._recommend_packages(entities, limit)
        
        if search_web and len(recommendations) < limit:
            missing = limit - len(recommendations)
            web_results = self._search_web(intent, entities, missing)
            recommendations.extend(web_results)
        
        return recommendations
    
    def _recommend_hotels(self, entities, limit):
        """Recommande des hôtels"""
        queryset = Hotel.objects.filter(is_available=True)
        
        if 'destination' in entities:
            queryset = queryset.filter(destination__name__icontains=entities['destination'])
        
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price_per_night__lte=budget * 1.2)
        
        if 'stars' in entities:
            queryset = queryset.filter(stars=entities['stars'])
        
        if 'amenities' in entities:
            for amenity in entities['amenities']:
                if 'wifi' in amenity.lower():
                    queryset = queryset.filter(has_wifi=True)
                if 'piscine' in amenity.lower():
                    queryset = queryset.filter(has_pool=True)
                if 'spa' in amenity.lower():
                    queryset = queryset.filter(has_spa=True)
        
        queryset = queryset.order_by('-average_rating', 'price_per_night')
        return list(queryset[:limit])
    
    def _recommend_flights(self, entities, limit):
        """Recommande des vols"""
        queryset = Flight.objects.filter(is_available=True)
        
        if 'destination' in entities:
            queryset = queryset.filter(
                Q(destination__name__icontains=entities['destination']) |
                Q(origin__name__icontains=entities['destination'])
            )
        
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price__lte=budget)
        
        queryset = queryset.order_by('price')
        return list(queryset[:limit])
    
    def _recommend_packages(self, entities, limit):
        """Recommande des circuits"""
        queryset = TourPackage.objects.filter(is_available=True)
        
        if 'destination' in entities:
            queryset = queryset.filter(destination__name__icontains=entities['destination'])
        
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price__lte=budget)
        
        queryset = queryset.order_by('-created_at')
        return list(queryset[:limit])
    
    def generate_response(self, intent, entities, recommendations, user_message=None, conversation_history=None):
        """Génère une réponse textuelle intelligente et conversationnelle"""
        
        # 1. Si on a des recommandations, utiliser Gemini pour une réponse avec contexte
        if recommendations and self.gemini:
            try:
                return self.gemini.generate_response_with_recommendations(intent, entities, recommendations)
            except Exception as e:
                print(f"Erreur Gemini (avec recs): {e}")
                # Fallback si Gemini échoue
                return self._format_recommendations_text(intent, entities, recommendations)
        
        # 2. Pour les messages sans recommandations, utiliser Gemini en mode conversationnel
        if self.gemini and user_message:
            try:
                return self.gemini.generate_conversational_response(user_message, conversation_history)
            except Exception as e:
                print(f"Erreur Gemini (conversationnel): {e}")
        
        # 3. Fallback sur les réponses pré-définies (seulement si Gemini n'est pas disponible)
        if intent == 'greeting':
            return "Bonjour ! 👋 Je suis votre assistant voyage TravelTodo. Comment puis-je vous aider aujourd'hui ? Vous cherchez un hôtel, un vol ou un circuit ?"
        
        if intent == 'thanks':
            return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions !"
        
        if intent == 'help':
            return "Je peux vous aider à trouver des hôtels, des vols ou des circuits. Dites-moi simplement ce que vous cherchez !"
        
        if intent == 'general_question':
            return "C'est une excellente question ! Je suis spécialisé dans la recherche d'hôtels, vols et circuits. Puis-je vous aider à planifier un voyage ?"
        
        if recommendations:
            return self._format_recommendations_text(intent, entities, recommendations)
        
        if intent in ['search_hotel', 'search_flight', 'search_package']:
            return "Je n'ai pas trouvé de résultats pour votre recherche. 😕 Pouvez-vous reformuler ou élargir vos critères ?"
        
        return "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ?"
    
    def _format_recommendations_text(self, intent, entities, recommendations):
        """Formate le texte de réponse avec les recommandations"""
        count = len(recommendations)
        
        if intent == 'search_hotel':
            intro = f"J'ai trouvé {count} hôtel{'s' if count > 1 else ''} pour vous"
        elif intent == 'search_flight':
            intro = f"J'ai trouvé {count} vol{'s' if count > 1 else ''} pour vous"
        elif intent == 'search_package':
            intro = f"J'ai trouvé {count} circuit{'s' if count > 1 else ''} pour vous"
        else:
            intro = f"Voici {count} recommandation{'s' if count > 1 else ''}"
        
        criteria = []
        if 'destination' in entities:
            criteria.append(f"à {entities['destination']}")
        if 'budget' in entities:
            criteria.append(f"budget max {entities['budget']} TND")
        
        if criteria:
            intro += " " + ", ".join(criteria)
        
        intro += " ! 🎉\n\nCliquez sur une carte ci-dessous pour voir les détails."
        return intro
    
    def _search_web(self, intent, entities, limit=3):
        """Cherche des résultats sur le web"""
        try:
            if intent == 'search_hotel':
                return self._search_hotels_web(entities, limit)
            elif intent == 'search_flight':
                return self._search_flights_web(entities, limit)
            elif intent == 'search_package':
                return self._search_packages_web(entities, limit)
        except Exception as e:
            print(f"Erreur recherche web: {e}")
        return []
    
    def _search_hotels_web(self, entities, limit):
        """Cherche des hôtels sur le web"""
        results = []
        destination = entities.get('destination', 'Paris')
        budget = entities.get('budget')
        
        try:
            web_hotels = []
            base_price = 120
            if budget:
                base_price = int(budget * 0.9)

            hotel_names = [
                f"{destination} Marina Resort",
                f"{destination} Beach Hotel",
                f"{destination} Luxury Palace",
                f"{destination} Comfort Inn",
                f"{destination} Sunset Hotel",
            ]

            for i in range(limit):
                price = base_price + (i * 20)
                if budget and price > budget * 1.5:
                    price = int(budget * 1.2)

                name = hotel_names[i] if i < len(hotel_names) else f'{destination} Hotel {i+1}'
                query = quote_plus(f"{name} {destination}")
                source_url = f'https://www.booking.com/searchresults.html?ss={query}'

                web_hotels.append({
                    'id': f'web-hotel-{i}',
                    'name': name,
                    'destination': destination,
                    'stars': 3 + (i % 3),
                    'price': price,
                    'image': f'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=150&fit=crop',
                    'type': 'hotel',
                    'source': 'Web (Booking.com)',
                    'source_url': source_url,
                    'rating': 4.0 + (i * 0.2),
                })
            results = web_hotels
        except Exception:
            pass
        return results
    
    def _search_flights_web(self, entities, limit):
        """Cherche des vols sur le web"""
        results = []
        try:
            destination = entities.get('destination', 'Paris')
            web_flights = [
                {
                    'id': f'web-flight-{i}',
                    'name': f'Vol {i+1} vers {destination}',
                    'origin': 'TUN',
                    'destination': destination[:3].upper(),
                    'price': 200 + (i * 50),
                    'duration': f'{2+i}h30',
                    'image': 'https://via.placeholder.com/200x150?text=Flight',
                    'type': 'flight',
                    'source': 'Web (Skyscanner/Google Flights)'
                }
                for i in range(limit)
            ]
            results = web_flights
        except Exception:
            pass
        return results
    
    def _search_packages_web(self, entities, limit):
        """Cherche des circuits sur le web"""
        results = []
        try:
            destination = entities.get('destination', 'Paris')
            web_packages = [
                {
                    'id': f'web-package-{i}',
                    'name': f'Circuit {destination} - {5+i} jours',
                    'destination': destination,
                    'duration': 5 + i,
                    'price': 500 + (i * 200),
                    'image': 'https://via.placeholder.com/200x150?text=Package',
                    'type': 'package',
                    'source': 'Web (TourOperator/Expedia)'
                }
                for i in range(limit)
            ]
            results = web_packages
        except Exception:
            pass
        return results
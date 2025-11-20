"""
Intelligence du chatbot - Analyse des messages et recommandations
Version SIMPLE sans ML complexe (compréhensible pour étudiants)
"""

import re
from django.db.models import Q
from catalog.models import Hotel, Flight, TourPackage


class ChatbotBrain:
    """Cerveau du chatbot - Analyse et recommandations"""
    
    def __init__(self):
        # Mots-clés pour détecter l'intention
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
        
        # Destinations communes
        self.common_destinations = [
            'paris', 'rome', 'londres', 'barcelone', 'madrid', 'berlin',
            'tunis', 'djerba', 'sousse', 'hammamet'
        ]
    
    def analyze_message(self, message):
        """Analyse le message et extrait l'intention + entités"""
        message_lower = message.lower()
        
        result = {
            'intent': 'unknown',
            'entities': {},
            'confidence': 0.0
        }
        
        # 1. Détecter l'intention principale
        detected_intents = []
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_intents.append(intent)
                    break
        
        if detected_intents:
            result['intent'] = detected_intents[0]
            result['confidence'] = 0.8
        
        # 2. Extraire les entités (budget, destination, etc.)
        
        # Budget
        budget = self._extract_budget(message_lower)
        if budget:
            result['entities']['budget'] = budget
        
        # Destination
        destination = self._extract_destination(message_lower)
        if destination:
            result['entities']['destination'] = destination
        
        # Nombre d'étoiles
        stars = self._extract_stars(message_lower)
        if stars:
            result['entities']['stars'] = stars
        
        # Équipements
        amenities = self._extract_amenities(message_lower)
        if amenities:
            result['entities']['amenities'] = amenities
        
        return result
    
    def _extract_budget(self, message):
        """Extrait le budget du message"""
        # Chercher des nombres suivis de "tnd", "dinars", "euros"
        patterns = [
            r'(\d+)\s*(?:tnd|dinars?|dt)',
            r'(?:moins|max|maximum)\s*(?:de)?\s*(\d+)',
            r'(?:environ|autour)\s*(?:de)?\s*(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                return int(match.group(1))
        
        # Détection de fourchettes
        if 'pas cher' in message or 'économique' in message or 'budget' in message:
            return 200  # Budget par défaut "pas cher"
        
        if 'luxe' in message or 'cher' in message:
            return 1000  # Budget "luxe"
        
        return None
    
    def _extract_destination(self, message):
        """Extrait la destination"""
        for dest in self.common_destinations:
            if dest in message:
                return dest.capitalize()
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
        """Extrait les équipements souhaités"""
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
    
    def get_recommendations(self, intent, entities, limit=3):
        """Obtient des recommandations basées sur l'intention et les entités"""
        
        if intent == 'search_hotel':
            return self._recommend_hotels(entities, limit)
        
        elif intent == 'search_flight':
            return self._recommend_flights(entities, limit)
        
        elif intent == 'search_package':
            return self._recommend_packages(entities, limit)
        
        return []
    
    def _recommend_hotels(self, entities, limit):
        """Recommande des hôtels"""
        queryset = Hotel.objects.filter(is_available=True)
        
        # Filtrer par destination
        if 'destination' in entities:
            queryset = queryset.filter(
                destination__name__icontains=entities['destination']
            )
        
        # Filtrer par budget
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price_per_night__lte=budget * 1.2)  # +20% de marge
        
        # Filtrer par étoiles
        if 'stars' in entities:
            queryset = queryset.filter(stars=entities['stars'])
        
        # Filtrer par équipements
        if 'amenities' in entities:
            for amenity in entities['amenities']:
                if 'wifi' in amenity.lower():
                    queryset = queryset.filter(has_wifi=True)
                if 'piscine' in amenity.lower():
                    queryset = queryset.filter(has_pool=True)
                if 'spa' in amenity.lower():
                    queryset = queryset.filter(has_spa=True)
        
        # Trier par note
        queryset = queryset.order_by('-average_rating', 'price_per_night')
        
        return list(queryset[:limit])
    
    def _recommend_flights(self, entities, limit):
        """Recommande des vols"""
        queryset = Flight.objects.filter(is_available=True)
        
        # Filtrer par destination
        if 'destination' in entities:
            queryset = queryset.filter(
                Q(destination__name__icontains=entities['destination']) |
                Q(origin__name__icontains=entities['destination'])
            )
        
        # Filtrer par budget
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price__lte=budget)
        
        # Trier par prix
        queryset = queryset.order_by('price')
        
        return list(queryset[:limit])
    
    def _recommend_packages(self, entities, limit):
        """Recommande des circuits"""
        queryset = TourPackage.objects.filter(is_available=True)
        
        # Filtrer par destination
        if 'destination' in entities:
            queryset = queryset.filter(
                destination__name__icontains=entities['destination']
            )
        
        # Filtrer par budget
        if 'budget' in entities:
            budget = entities['budget']
            queryset = queryset.filter(price__lte=budget)
        
        # Trier par popularité (créé récemment = nouveau = populaire)
        queryset = queryset.order_by('-created_at')
        
        return list(queryset[:limit])
    
    def generate_response(self, intent, entities, recommendations):
        """Génère une réponse textuelle"""
        
        # Salutation
        if intent == 'greeting':
            return "Bonjour ! 👋 Je suis votre assistant voyage TravelTodo. Comment puis-je vous aider aujourd'hui ? Vous cherchez un hôtel, un vol ou un circuit ?"
        
        # Remerciement
        if intent == 'thanks':
            return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions !"
        
        # Aide
        if intent == 'help':
            return """Je peux vous aider à :
            
🏨 Trouver un hôtel (ex: "un hôtel pas cher à Paris")
✈️ Chercher un vol (ex: "un vol pour Rome")
🎒 Découvrir des circuits (ex: "un circuit en Italie")

Dites-moi simplement ce que vous cherchez !"""
        
        # Réponses avec recommandations
        if recommendations:
            response = self._format_recommendations_text(intent, entities, recommendations)
            return response
        
        # Pas de résultats
        if intent in ['search_hotel', 'search_flight', 'search_package']:
            return "Je n'ai pas trouvé de résultats pour votre recherche. 😕 Pouvez-vous reformuler ou élargir vos critères ?"
        
        # Par défaut
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
        
        # Ajouter les critères de recherche
        criteria = []
        if 'destination' in entities:
            criteria.append(f"à {entities['destination']}")
        if 'budget' in entities:
            criteria.append(f"budget max {entities['budget']} TND")
        if 'stars' in entities:
            criteria.append(f"{entities['stars']} étoiles")
        
        if criteria:
            intro += " " + ", ".join(criteria)
        
        intro += " ! 🎉\n\nCliquez sur une carte ci-dessous pour voir les détails."
        
        return intro
"""
Intelligence du chatbot - Analyse des messages et recommandations
Version AMÉLIORÉE avec Google Gemini AI
Permet de chercher dans la base interne ET sur le web
"""

import re
from urllib.parse import quote_plus
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
            'greeting': ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'alut', 'slt', 'bjr', 'bsr', 'hey', 'hi'],
            'thanks': ['merci', 'thank', 'remercie'],
            'help': ['aide', 'aider', 'help', 'comment', 'besoin'],
            'language_switch': ['parle', 'speak', 'arabe', 'arabic', 'francais', 'french', 'anglais', 'english', 'langue'],
            'follow_up': ['oui', 'donner', 'donne', 'montre', 'montrer', 'voir', 'affiche', 'afficher', 'les options', 'les resultats', 'les résultats', 'je deja te dit', 'je t\'ai deja dit', 'je t\'ai déjà dit', 'deja dit', 'déjà dit'],
        }

        # Destinations communes (villes)
        self.common_cities = [
            'paris', 'rome', 'londres', 'london', 'tunis', 'barcelone', 'madrid',
            'hammamet', 'sousse', 'djerba', 'monastir', 'nabeul', 'tabarka',
            'istanbul', 'cairo', 'caire', 'athens', 'athenes', 'marrakech',
            'casablanca', 'dubai', 'amsterdam', 'berlin', 'vienne', 'vienna',
            'prague', 'budapest', 'lisbonne', 'lisbon', 'porto', 'nice', 'cannes',
            'lyon', 'marseille', 'bordeaux', 'strasbourg', 'nantes', 'toulouse'
        ]
        
        # Pays avec leurs variantes
        self.countries = {
            'france': ['france', 'français', 'francais', 'french'],
            'tunisie': ['tunisie', 'tunisia', 'tunisien', 'tunisien'],
            'italie': ['italie', 'italy', 'italien', 'italian'],
            'espagne': ['espagne', 'espana', 'spain', 'espagnol', 'spanish'],
            'maroc': ['maroc', 'morocco', 'marocain', 'moroccan'],
            'turquie': ['turquie', 'turkey', 'turc', 'turkish'],
            'egypte': ['egypte', 'egypt', 'egyptien', 'egyptian'],
            'grece': ['grece', 'greece', 'grec', 'greek'],
            'portugal': ['portugal', 'portugais', 'portuguese'],
            'allemagne': ['allemagne', 'germany', 'allemand', 'german'],
            'pays-bas': ['pays-bas', 'holland', 'netherlands', 'hollandais', 'dutch'],
            'belgique': ['belgique', 'belgium', 'belge', 'belgian'],
            'suisse': ['suisse', 'switzerland', 'suisse', 'swiss'],
            'autriche': ['autriche', 'austria', 'autrichien', 'austrian'],
            'royaume-uni': ['royaume-uni', 'uk', 'united kingdom', 'angleterre', 'england', 'anglais', 'english'],
            'emirats arabes unis': ['emirats', 'uae', 'dubai', 'abu dhabi'],
            'japon': ['japon', 'japan', 'japonais', 'japanese'],
            'thailande': ['thailande', 'thailand', 'thai'],
            'indonesie': ['indonesie', 'indonesia', 'indonesien', 'indonesian'],
            'vietnam': ['vietnam', 'vietnamien', 'vietnamese'],
            'cambodge': ['cambodge', 'cambodia', 'cambodgien', 'cambodian'],
            'chine': ['chine', 'china', 'chinois', 'chinese'],
            'inde': ['inde', 'india', 'indien', 'indian'],
            'mexique': ['mexique', 'mexico', 'mexicain', 'mexican'],
            'bresil': ['bresil', 'brazil', 'bresilien', 'brazilian'],
            'argentine': ['argentine', 'argentina', 'argentin', 'argentine'],
            'chili': ['chili', 'chile', 'chilien', 'chilean'],
            'perou': ['perou', 'peru', 'peruvien', 'peruvian'],
            'colombie': ['colombie', 'colombia', 'colombien', 'colombian'],
            'australie': ['australie', 'australia', 'australien', 'australian'],
            'nouvelle-zelande': ['nouvelle-zelande', 'new zealand', 'nz', 'neozelandais'],
            'canada': ['canada', 'canadien', 'canadian'],
            'etats-unis': ['etats-unis', 'usa', 'united states', 'amerique', 'america', 'americain', 'american'],
            'afrique du sud': ['afrique du sud', 'south africa', 'sud-africain', 'south african'],
            'kenya': ['kenya', 'kenyan'],
            'tanzanie': ['tanzanie', 'tanzania', 'tanzanien', 'tanzanian'],
        }

    def analyze_message(self, message, conversation_history=None):
        """Analyse un message utilisateur avec contexte de conversation"""
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

        # Si c'est un message de suivi, utiliser le contexte précédent —
        # Mais ne pas remplacer une intention EXPLICITE détectée dans le message courant.
        follow_up_keywords = ['oui', 'donner', 'donne', 'montre', 'montrer', 'voir', 'affiche', 'afficher',
                              'les options', 'les resultats', 'les résultats', 'je deja te dit',
                              'je t\'ai deja dit', 'je t\'ai déjà dit', 'deja dit', 'déjà dit',
                              'ok', 'd\'accord', "d'accord", 'alors', 'donc']

        is_follow_up = any(keyword in message_lower for keyword in follow_up_keywords) and len(message_lower.split()) <= 5

        # Si c'est un apparent follow-up mais le message contient déjà des mots-clés d'intention
        # (p.ex. 'vol', 'hôtel'), on considère plutôt l'intention explicite.
        if is_follow_up and conversation_history:
            # detected_intents a été calculé plus haut — s'il y a une intention explicite, la conserver
            if detected_intents:
                # Ne pas écraser l'intent explicite par le contexte précédent
                pass
            else:
                previous_context = self._extract_context_from_history(conversation_history)
                if previous_context.get('last_intent'):
                    result['intent'] = previous_context['last_intent']
                    result['entities'] = previous_context.get('entities', {}).copy()
                    result['confidence'] = 0.95
                    # Extraire les nouvelles entités du message actuel et les fusionner (priorité aux nouvelles)
                    new_budget = self._extract_budget(message_lower)
                    if new_budget:
                        result['entities']['budget'] = new_budget
                    new_destination = self._extract_destination(message_lower)
                    if new_destination:
                        result['entities']['destination'] = new_destination
                    return result

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

        # Si pas d'entités trouvées mais qu'on a un historique, utiliser le contexte
        if not result['entities'] and conversation_history:
            previous_context = self._extract_context_from_history(conversation_history)
            if previous_context.get('entities'):
                result['entities'] = previous_context['entities']

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
        """Extrait la destination (pays ou ville) avec une meilleure précision"""
        message_lower = message.lower()
        
        # D'abord, chercher un pays
        country_found = None
        country_name = None
        for country_key, variants in self.countries.items():
            for variant in variants:
                if variant in message_lower:
                    country_found = country_key
                    country_name = country_key.title()
                    break
            if country_found:
                break
        
        # Ensuite, chercher UNE VILLE (préférer la DERNIÈRE ville mentionnée pour les routes comme "de X à Y")
        city_found = None
        last_city_pos = -1
        last_city = None
        for city in self.common_cities:
            # Chercher toutes les occurrences de la ville et garder la dernière
            pos = message_lower.rfind(city)  # rfind = find right (dernière occurrence)
            if pos > last_city_pos:
                last_city_pos = pos
                last_city = city.capitalize()
        
        city_found = last_city
        
        # Retourner la ville si trouvée, sinon le pays
        if city_found:
            return {'type': 'city', 'name': city_found, 'country': country_name}
        elif country_found:
            return {'type': 'country', 'name': country_name}
        
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

    def _extract_context_from_history(self, conversation_history):
        """Extrait le contexte des messages précédents pour améliorer la mémoire"""
        context = {
            'last_intent': None,
            'entities': {}
        }
        
        if not conversation_history:
            return context
        
        # Parcourir l'historique en ordre inverse (du plus récent au plus ancien)
        for msg in reversed(conversation_history):
            if msg.get('sender') == 'bot':
                # Chercher l'intent dans les entités du message bot
                if isinstance(msg.get('entities'), dict):
                    # L'intent peut être stocké dans les entités
                    if 'intent' in msg.get('entities', {}):
                        context['last_intent'] = msg['entities']['intent']
                break
        
        # Parcourir tous les messages utilisateur pour extraire les entités
        for msg in conversation_history:
            if msg.get('sender') == 'user':
                message_text = msg.get('message', '').lower()
                
                # Extraire le budget
                budget = self._extract_budget(message_text)
                if budget and 'budget' not in context['entities']:
                    context['entities']['budget'] = budget
                
                # Extraire la destination
                dest = self._extract_destination(message_text)
                if dest and 'destination' not in context['entities']:
                    if isinstance(dest, dict):
                        context['entities']['destination'] = dest
                    else:
                        context['entities']['destination'] = dest
                
                # Détecter l'intent si pas encore trouvé
                if not context['last_intent']:
                    for intent, keywords in self.intents.items():
                        if intent in ['search_hotel', 'search_flight', 'search_package']:
                            for keyword in keywords:
                                if keyword in message_text:
                                    context['last_intent'] = intent
                                    break
                            if context['last_intent']:
                                break
        
        return context

    def get_recommendations(self, intent, entities, limit=3, search_web=True):
        """Obtient des recommandations - PRIORITÉ à la base de données, web en complément"""
        recommendations = []

        if intent == 'search_hotel':
            # PRIORITÉ 1: Chercher d'abord dans NOTRE base de données
            recommendations = self._recommend_hotels(entities, limit)
            
            # PRIORITÉ 2: Si pas assez de résultats locaux, compléter avec le web
            if search_web:
                local_count = len(recommendations)
                if local_count < limit:
                    # Si on a peu de résultats locaux, chercher sur le web
                    missing = limit - local_count
                    web_results = self._search_web(intent, entities, missing)
                    recommendations.extend(web_results)
                # Si on a assez de résultats locaux, on ne cherche PAS sur le web
                # Votre site est la source principale !
        elif intent == 'search_flight':
            recommendations = self._recommend_flights(entities, limit)
            if search_web and len(recommendations) < limit:
                missing = limit - len(recommendations)
                web_results = self._search_web(intent, entities, missing)
                recommendations.extend(web_results)
        elif intent == 'search_package':
            recommendations = self._recommend_packages(entities, limit)
            if search_web and len(recommendations) < limit:
                missing = limit - len(recommendations)
                web_results = self._search_web(intent, entities, missing)
                recommendations.extend(web_results)

        return recommendations

    def _recommend_hotels(self, entities, limit):
        """Recommande des hôtels - Recherche améliorée par pays et ville"""
        queryset = Hotel.objects.filter(is_available=True).select_related('destination')

        if 'destination' in entities:
            dest_info = entities['destination']
            
            # Si c'est un dict avec type (nouveau format)
            if isinstance(dest_info, dict):
                if dest_info.get('type') == 'country':
                    # Rechercher par pays
                    country_name = dest_info.get('name', '')
                    queryset = queryset.filter(destination__country__icontains=country_name)
                elif dest_info.get('type') == 'city':
                    # Rechercher par ville
                    city_name = dest_info.get('name', '')
                    queryset = queryset.filter(destination__name__icontains=city_name)
                    # Si on a aussi le pays, on peut affiner
                    if dest_info.get('country'):
                        queryset = queryset.filter(destination__country__icontains=dest_info['country'])
            else:
                # Ancien format (string simple) - compatibilité
                dest_str = str(dest_info)
                # Essayer d'abord comme ville
                queryset_city = queryset.filter(destination__name__icontains=dest_str)
                if queryset_city.exists():
                    queryset = queryset_city
                else:
                    # Sinon, essayer comme pays
                    queryset = queryset.filter(destination__country__icontains=dest_str)

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
        """Génère une réponse textuelle intelligente et conversationnelle avec mémoire"""

        # AMÉLIORATION: Utiliser l'historique de conversation pour améliorer le contexte
        if conversation_history and len(conversation_history) > 0:
            # Extraire les informations précédentes de la conversation
            previous_context = self._extract_context_from_history(conversation_history)
            
            # Si pas d'intent détecté, utiliser celui de l'historique
            if intent == 'unknown' and previous_context.get('last_intent'):
                intent = previous_context['last_intent']
            
            # Fusionner les entités : celles de l'historique + celles actuelles (les actuelles ont priorité)
            if previous_context.get('entities'):
                merged_entities = {**previous_context['entities'], **entities}
                entities = merged_entities

        # 1. Si on a des recommandations, utiliser Gemini pour une réponse avec contexte
        if recommendations and self.gemini:
            try:
                # Passer aussi l'historique à Gemini pour qu'il se souvienne
                response = self.gemini.generate_response_with_recommendations(intent, entities, recommendations, conversation_history)
                if response:
                    return response
            except Exception as e:
                print(f"Erreur Gemini (avec recs): {e}")
                # Fallback si Gemini échoue
                return self._format_recommendations_text(intent, entities, recommendations)

        # 2. Pour les messages sans recommandations, utiliser Gemini en mode conversationnel
        if self.gemini and user_message:
            try:
                # Passer les entités comme contexte à Gemini
                gemini_response = self.gemini.generate_conversational_response(
                    user_message, 
                    conversation_history,
                    context_entities=entities
                )
                if gemini_response:
                    return gemini_response
            except Exception as e:
                print(f"Erreur Gemini (conversationnel): {e}")

        # 3. Fallback sur les réponses pré-définies améliorées
        if intent == 'greeting':
            return "Bonjour ! 👋 Je suis votre assistant voyage intelligent. Je peux vous aider à trouver des hôtels dans n'importe quel pays, des vols, ou des circuits. Que recherchez-vous aujourd'hui ?"

        if intent == 'thanks':
            return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider à planifier votre voyage parfait !"

        if intent == 'help':
            return "Je peux vous aider à trouver des hôtels, des vols ou des circuits. Essayez de me dire par exemple : 'Je cherche un hôtel en France' ou 'Hôtels pas chers en Tunisie'. Comment puis-je vous aider ?"

        # 4. Réponses intelligentes pour les recherches d'hôtels
        if intent == 'search_hotel':
            if not recommendations:
                dest_info = entities.get('destination')
                budget = entities.get('budget')
                
                # Construire un message contextuel en utilisant l'historique si disponible
                if conversation_history:
                    # Vérifier si l'utilisateur a déjà mentionné quelque chose
                    last_user_msg = None
                    for msg in reversed(conversation_history):
                        if msg.get('sender') == 'user':
                            last_user_msg = msg.get('message', '')
                            break
                    
                    # Si c'est un message de suivi court, être plus contextuel
                    if last_user_msg and len(user_message.split()) <= 3:
                        if budget:
                            return f"Parfait ! Je cherche des hôtels avec un budget de {budget} TND/nuit. Laissez-moi vous proposer les meilleures options disponibles ! 🏨"
                        elif dest_info:
                            dest_name = dest_info.get('name', '') if isinstance(dest_info, dict) else str(dest_info)
                            return f"Je cherche des hôtels à {dest_name} pour vous. Voici les meilleures options ! 🏨"
                
                # Messages normaux
                if budget and dest_info:
                    dest_name = dest_info.get('name', '') if isinstance(dest_info, dict) else str(dest_info)
                    return f"Je n'ai pas trouvé d'hôtels dans notre base de données pour {dest_name} avec un budget de {budget} TND/nuit. Je peux vous proposer des options sur plusieurs sites de réservation pour comparer les prix. Cliquez sur les cartes ci-dessous ! 🏨"
                elif dest_info:
                    dest_name = dest_info.get('name', '') if isinstance(dest_info, dict) else str(dest_info)
                    return f"Je n'ai pas trouvé d'hôtels dans notre base pour {dest_name}. Je peux vous rediriger vers plusieurs sites de réservation pour comparer les meilleures offres ! Cliquez sur les cartes pour voir les prix. 🏨"
                elif budget:
                    return f"Je peux vous aider à trouver des hôtels avec un budget de {budget} TND/nuit ! Dites-moi dans quel pays ou ville vous souhaitez séjourner. 🌍"
                else:
                    return "Je peux vous aider à trouver des hôtels ! Dites-moi dans quel pays ou ville vous souhaitez séjourner. Je chercherai d'abord dans notre base de données, puis sur plusieurs sites de réservation si nécessaire. 🌍"
            else:
                # Séparer les résultats locaux (instances Django) et web (dicts)
                from catalog.models import Hotel, Flight, TourPackage
                local_results = [r for r in recommendations if isinstance(r, (Hotel, Flight, TourPackage))]
                web_results = [r for r in recommendations if isinstance(r, dict)]
                
                response = self._format_recommendations_text(intent, entities, recommendations)
                
                # Ajouter une note si on a des résultats des deux sources
                if local_results and web_results:
                    response += "\n\n💡 Les premiers résultats viennent de notre base de données. Les autres sont des suggestions de sites de réservation pour comparer les prix."
                elif local_results:
                    response += "\n\n✅ Tous ces résultats proviennent de notre base de données."
                elif web_results:
                    response += "\n\n🌐 Ces résultats proviennent de plusieurs sites de réservation (Booking.com, Expedia, Hotels.com, Agoda, Trivago) pour vous permettre de comparer les prix."
                
                return response

        # 5. Réponse par défaut
        return "Je comprends votre demande. Laissez-moi vous aider à trouver ce que vous cherchez. Pouvez-vous être plus précis sur votre destination ou vos critères ?"

    def _format_recommendations_text(self, intent, entities, recommendations):
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
            dest_info = entities['destination']
            if isinstance(dest_info, dict):
                dest_display = dest_info.get('name', '')
                if dest_info.get('type') == 'country':
                    criteria.append(f"en {dest_display}")
                else:
                    criteria.append(f"à {dest_display}")
            else:
                criteria.append(f"à {dest_info}")
        if 'budget' in entities:
            criteria.append(f"budget max {entities['budget']} TND")

        if criteria:
            intro += " " + ", ".join(criteria)

        intro += " ! 🎉\n\nCliquez sur une carte ci-dessous pour voir les détails et réserver directement."
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
        """Cherche des hôtels sur le web - Génère des liens vers PLUSIEURS sites de réservation"""
        results = []
        
        # Extraire la destination (pays ou ville)
        dest_info = entities.get('destination')
        if isinstance(dest_info, dict):
            if dest_info.get('type') == 'country':
                destination = dest_info.get('name', '')
                search_query = destination
            elif dest_info.get('type') == 'city':
                destination = dest_info.get('name', '')
                country = dest_info.get('country', '')
                search_query = f"{destination} {country}" if country else destination
            else:
                destination = dest_info.get('name', 'Hammamet')
                search_query = destination
        else:
            destination = str(dest_info) if dest_info else 'Hammamet'
            search_query = destination
        
        budget = entities.get('budget')
        
        # Liste des sites de réservation à utiliser
        booking_sites = [
            {
                'name': 'Booking.com',
                'url_template': 'https://www.booking.com/searchresults.html?ss={query}',
                'price_filter': '&nflt=price%3D{min}-{max}',
                'stars_filter': '&nflt=class%3D{stars}'
            },
            {
                'name': 'Expedia',
                'url_template': 'https://www.expedia.com/Hotel-Search?destination={query}',
                'price_filter': '&priceMin={min}&priceMax={max}',
                'stars_filter': '&starRating={stars}'
            },
            {
                'name': 'Hotels.com',
                'url_template': 'https://www.hotels.com/search.do?destination-id={query}',
                'price_filter': '&price-min={min}&price-max={max}',
                'stars_filter': '&star-filter={stars}'
            },
            {
                'name': 'Agoda',
                'url_template': 'https://www.agoda.com/search?city={query}',
                'price_filter': '&priceRange={min}-{max}',
                'stars_filter': '&starRating={stars}'
            },
            {
                'name': 'Trivago',
                'url_template': 'https://www.trivago.com/fr-fr/s?search={query}',
                'price_filter': '&priceRange={min}-{max}',
                'stars_filter': '&stars={stars}'
            }
        ]

        try:
            web_hotels = []
            search_query_encoded = quote_plus(search_query)
            
            # Calculer la fourchette de prix si budget spécifié
            price_range_min = None
            price_range_max = None
            price_min_eur = None
            price_max_eur = None
            
            if budget:
                # Convertir TND approximativement en EUR (1 TND ≈ 0.3 EUR)
                budget_eur = int(budget * 0.3)
                
                # Créer une fourchette de prix : de 20% moins cher à 20% plus cher que le budget
                price_min_eur = max(20, int(budget_eur * 0.8))  # Minimum 20 EUR
                price_max_eur = int(budget_eur * 1.2)
                
                # Convertir back en TND pour l'affichage
                price_range_min = int(price_min_eur / 0.3)
                price_range_max = int(price_max_eur / 0.3)

            # Distribuer les résultats sur plusieurs sites de réservation
            # Exemple: si limit=3, on aura 1 résultat Booking, 1 Expedia, 1 Hotels.com
            for i in range(limit):
                # Sélectionner un site différent pour chaque résultat
                site_index = i % len(booking_sites)
                site = booking_sites[site_index]
                
                # Déterminer les étoiles selon l'index (varier entre 3, 4 et 5 étoiles)
                stars = 3 + (i % 3)
                if stars > 5:
                    stars = 5

                # Construire l'URL selon le site
                if site['name'] == 'Booking.com':
                    hotel_url = site['url_template'].format(query=search_query_encoded)
                    if budget and price_min_eur and price_max_eur:
                        hotel_url += site['price_filter'].format(min=price_min_eur, max=price_max_eur)
                    if stars >= 4:
                        hotel_url += site['stars_filter'].format(stars=stars)
                    if i > 0:
                        hotel_url += f'&offset={i * 25}'
                elif site['name'] == 'Expedia':
                    hotel_url = site['url_template'].format(query=search_query_encoded)
                    if budget and price_min_eur and price_max_eur:
                        hotel_url += site['price_filter'].format(min=price_min_eur, max=price_max_eur)
                    if stars >= 4:
                        hotel_url += site['stars_filter'].format(stars=stars)
                elif site['name'] == 'Hotels.com':
                    hotel_url = site['url_template'].format(query=search_query_encoded)
                    if budget and price_min_eur and price_max_eur:
                        hotel_url += site['price_filter'].format(min=price_min_eur, max=price_max_eur)
                    if stars >= 4:
                        hotel_url += site['stars_filter'].format(stars=stars)
                elif site['name'] == 'Agoda':
                    hotel_url = site['url_template'].format(query=search_query_encoded)
                    if budget and price_min_eur and price_max_eur:
                        hotel_url += site['price_filter'].format(min=price_min_eur, max=price_max_eur)
                    if stars >= 4:
                        hotel_url += site['stars_filter'].format(stars=stars)
                elif site['name'] == 'Trivago':
                    hotel_url = site['url_template'].format(query=search_query_encoded)
                    if budget and price_min_eur and price_max_eur:
                        hotel_url += site['price_filter'].format(min=price_min_eur, max=price_max_eur)
                    if stars >= 4:
                        hotel_url += site['stars_filter'].format(stars=stars)
                else:
                    # Fallback: URL simple
                    hotel_url = site['url_template'].format(query=search_query_encoded)

                # Générer un nom d'hôtel avec le nom du site
                hotel_name = f"Recherche d'hôtels {stars} étoiles sur {site['name']}"
                if i == 0:
                    hotel_name = f"Meilleurs hôtels à {destination} - {site['name']}"
                elif i == 1:
                    hotel_name = f"Hôtels recommandés à {destination} - {site['name']}"
                elif i == 2:
                    hotel_name = f"Offres spéciales à {destination} - {site['name']}"

                # Description selon si budget spécifié ou non
                if budget:
                    description = f'Comparez les prix des hôtels {stars} étoiles à {destination} dans votre budget ({price_range_min}-{price_range_max} TND/nuit) sur {site["name"]}.'
                else:
                    description = f'Découvrez les meilleurs hôtels {stars} étoiles à {destination} sur {site["name"]}. Comparez les prix et réservez directement.'

                # Texte d'affichage du prix
                if budget:
                    price_display_text = f'Prix: {price_range_min}-{price_range_max} TND/nuit'
                else:
                    price_display_text = f'Voir les prix sur {site["name"]}'

                web_hotels.append({
                    'id': f'web-hotel-{i}',
                    'name': hotel_name,
                    'destination': destination,
                    'stars': stars,
                    'price': None,  # Ne pas afficher de prix spécifique fictif
                    'price_display': price_display_text,
                    'price_range_min': price_range_min,
                    'price_range_max': price_range_max,
                    'image': f'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&q=80',
                    'type': 'hotel',
                    'source': site['name'],  # Nom du site de réservation
                    'source_url': hotel_url,
                    'rating': 4.0 + (i * 0.15),
                    'description': description
                })
            
            results = web_hotels
        except Exception as e:
            print(f"Erreur recherche hôtels web: {e}")
        return results

    def _search_flights_web(self, entities, limit):
        """Cherche des vols sur le web - Génère des liens vers les meilleurs sites avec route précise"""
        results = []
        try:
            # Extraire la destination
            dest_info = entities.get('destination')
            if isinstance(dest_info, dict):
                destination = dest_info.get('name', 'Djerba')
            else:
                destination = str(dest_info) if dest_info else 'Djerba'
            
            # Mapping des villes vers codes aéroport
            airport_codes = {
                'tunis': 'TUN',
                'djerba': 'DJE',
                'hammamet': 'NBE',
                'sousse': 'SKX',
                'monastir': 'MIR',
                'nabeul': 'NBE',
                'tabarka': 'TBJ',
                'paris': 'CDG',
                'rome': 'FCO',
                'londres': 'LHR',
                'london': 'LHR',
                'barcelone': 'BCN',
                'madrid': 'MAD',
                'istanbul': 'IST',
                'cairo': 'CAI',
                'caire': 'CAI',
                'athens': 'ATH',
                'athenes': 'ATH',
                'marrakech': 'RAK',
                'casablanca': 'CMN',
                'dubai': 'DXB',
                'amsterdam': 'AMS',
                'berlin': 'BER',
                'vienne': 'VIE',
                'vienna': 'VIE',
                'prague': 'PRG',
                'budapest': 'BUD',
                'lisbonne': 'LIS',
                'lisbon': 'LIS',
                'porto': 'OPO',
                'nice': 'NCE',
                'cannes': 'NCE',
                'lyon': 'LYS',
                'marseille': 'MRS',
                'bordeaux': 'BOD',
                'strasbourg': 'SXB',
                'nantes': 'NTE',
                'toulouse': 'TLS',
            }
            
            # Déterminer les codes aéroport
            origin = 'TUN'  # Tunis par défaut
            origin_name = 'Tunis'
            
            dest_lower = destination.lower()
            dest_code = airport_codes.get(dest_lower, destination[:3].upper())
            dest_name = destination
            
            # Encoder pour les URLs (destination)
            dest_encoded = quote_plus(destination)
            
            # Liste des sites de recherche de vols avec URLs qui affichent directement les résultats
            # Les dates sont mises à 7 jours à partir d'aujourd'hui (aller) et 14 jours (retour)
            from datetime import datetime, timedelta
            today = datetime.now()
            departure_date = (today + timedelta(days=7)).strftime('%Y-%m-%d')  # 7 jours
            return_date = (today + timedelta(days=14)).strftime('%Y-%m-%d')    # 14 jours
            
            # Formater les dates pour Google Flights (YYYYMMDD)
            departure_date_gf = (today + timedelta(days=7)).strftime('%Y%m%d')
            return_date_gf = (today + timedelta(days=14)).strftime('%Y%m%d')
            
            flight_sites = [
                {
                    'name': 'Skyscanner',
                    # URL avec recherche directe - affiche les résultats
                    'url': f'https://www.skyscanner.net/transport/flights/{origin}/{dest_code}/{departure_date}?adults=1&children=0&infants=0&cabinclass=economy&rtn={return_date}'
                },
                {
                    'name': 'Kayak',
                    # URL avec dates et recherche - affiche les résultats
                    'url': f'https://www.kayak.com/flights/{origin}-{dest_code}/{departure_date}--{return_date}?fs=1'
                },
                {
                    'name': 'Momondo',
                    # URL directe avec résultats (format: TUN-DJE)
                    'url': f'https://www.momondo.com/flight-search/{origin}-{dest_code}/{departure_date}/{return_date}?fs=1'
                },
                {
                    'name': 'Kiwi.com',
                    # URL avec recherche directe - affiche les résultats
                    'url': f'https://www.kiwi.com/search/results/{origin}/{dest_code}/{departure_date}/{return_date}?lang=fr&adults=1'
                },
                {
                    'name': 'Booking.com Flights',
                    # URL pour Booking (vols)
                    'url': f'https://www.booking.com/flights/search.html?ss={origin}&ss2={dest_code}&checkin_month={departure_date[:7]}&checkin_monthday={departure_date[-2:]}&checkout_month={return_date[:7]}&checkout_monthday={return_date[-2:]}&group_adults=1&no_rooms=1&group_children=0'
                }
            ]
            
            # Distribuer les résultats sur les différents sites
            web_flights = []
            for i in range(min(limit, len(flight_sites))):
                site = flight_sites[i]
                
                web_flights.append({
                    'id': f'web-flight-{i}',
                    'name': f'Vols {origin_name} → {dest_name}',
                    'origin': origin,
                    'origin_name': origin_name,
                    'destination': dest_name,
                    'destination_code': dest_code,
                    'price': None,
                    'duration': None,
                    'image': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&q=80',
                    'type': 'flight',
                    'source': site['name'],
                    'source_url': site['url'],
                    'rating': 4.5,
                    'price_display': f'Voir les prix sur {site["name"]}',
                    'description': f'Cherchez les meilleurs vols de {origin_name} ({origin}) vers {dest_name} ({dest_code}) sur {site["name"]}. Comparez les prix, horaires et réservez directement.'
                })
            
            results = web_flights
        except Exception as e:
            print(f"Erreur recherche vols web: {e}")
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

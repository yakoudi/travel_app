from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
import uuid

from .models import ChatConversation, ChatMessage, ChatbotFAQ
from catalog.models import Hotel, Flight, TourPackage
from .bot_intelligence import ChatbotBrain
from .serializers import ChatMessageSerializer, ChatConversationSerializer


class ChatbotViewSet(viewsets.ViewSet):
    """API du chatbot"""
    permission_classes = [AllowAny]  # Accessible même sans connexion

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.brain = ChatbotBrain()

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Envoyer un message au chatbot
        POST /api/chatbot/send_message/
        Body: {
            "session_id": "abc123",  # Optionnel, sera créé si absent
            "message": "Je cherche un hôtel pas cher à Paris"
        }
        """
        message_text = request.data.get('message', '').strip()
        session_id = request.data.get('session_id')

        if not message_text:
            return Response(
                {'error': 'Le message ne peut pas être vide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Récupérer ou créer la conversation
        if session_id:
            try:
                conversation = ChatConversation.objects.get(session_id=session_id)
            except ChatConversation.DoesNotExist:
                conversation = self._create_conversation(request.user)
        else:
            conversation = self._create_conversation(request.user)

        # 2. Sauvegarder le message utilisateur
        user_message = ChatMessage.objects.create(
            conversation=conversation,
            sender='user',
            message=message_text
        )

        # 3. Récupérer l'historique de conversation (une seule fois)
        conversation_history = []
        previous_messages = conversation.messages.all().order_by('-timestamp')[:10]
        for msg in reversed(list(previous_messages)):
            conversation_history.append({
                'sender': msg.sender,
                'message': msg.message,
                'entities': msg.entities if msg.sender == 'bot' else None
            })
        
        # 4. Analyser le message avec l'historique
        analysis = self.brain.analyze_message(message_text, conversation_history)
        
        # 5. Obtenir des recommandations (interne + web)
        recommendations = self.brain.get_recommendations(
            analysis['intent'],
            analysis['entities'],
            limit=3,
            search_web=True  # Activer la recherche web
        )

        # Fallback supplémentaire : si aucune recommandation et que le message
        # ou les entités indiquent une recherche d'hôtel ou de vol, forcer une recherche web
        if not recommendations:
            msg_lower = message_text.lower() if message_text else ''
            wants_hotel = 'hotel' in msg_lower or 'hôtel' in msg_lower or 'chambre' in msg_lower
            wants_flight = 'vol' in msg_lower or 'avion' in msg_lower or 'billet' in msg_lower
            has_destination = bool(analysis.get('entities') and analysis['entities'].get('destination'))

            # Préparer des entités adaptées pour la recherche web (destination en string si nécessaire)
            entities_for_search = analysis.get('entities', {}).copy() if analysis.get('entities') else {}
            dest_info = entities_for_search.get('destination')
            if isinstance(dest_info, dict):
                # convertir en nom lisible pour la recherche web
                entities_for_search['destination'] = dest_info.get('name') or ''

            try:
                if wants_hotel or (has_destination and analysis.get('intent') == 'search_hotel'):
                    web_fallback = self.brain._search_web('search_hotel', entities_for_search, 3)
                    if web_fallback:
                        recommendations = web_fallback
                elif wants_flight or (has_destination and analysis.get('intent') == 'search_flight'):
                    web_fallback = self.brain._search_web('search_flight', entities_for_search, 3)
                    if web_fallback:
                        recommendations = web_fallback
            except Exception:
                pass

        # 6. Générer la réponse du bot avec l'historique
        
        bot_response_text = self.brain.generate_response(
            analysis['intent'],
            analysis['entities'],
            recommendations,
            user_message=message_text,
            conversation_history=conversation_history
        )

        # 6. Sauvegarder la réponse du bot avec l'intent et les entités
        # Stocker l'intent dans les entités pour pouvoir le récupérer plus tard
        bot_entities = analysis['entities'].copy() if analysis.get('entities') else {}
        bot_entities['intent'] = analysis['intent']  # Stocker l'intent pour la mémoire
        
        bot_message = ChatMessage.objects.create(
            conversation=conversation,
            sender='bot',
            message=bot_response_text,
            intent=analysis['intent'],
            entities=bot_entities
        )

        # 7. Lier les recommandations au message
        # Séparer les recommandations internes (model instances) et celles provenant du web (dicts)
        if recommendations:
            web_results = []
            local_hotels = []
            local_flights = []
            local_packages = []

            for rec in recommendations:
                if isinstance(rec, dict):
                    web_results.append(rec)
                    continue

                # modèles Django
                if isinstance(rec, Hotel):
                    local_hotels.append(rec)
                elif isinstance(rec, Flight):
                    local_flights.append(rec)
                elif isinstance(rec, TourPackage):
                    local_packages.append(rec)
                else:
                    # si c'est un id numérique, on tente de récupérer l'objet selon l'intent
                    try:
                        if analysis['intent'] == 'search_hotel':
                            local_hotels.append(Hotel.objects.get(id=int(rec)))
                        elif analysis['intent'] == 'search_flight':
                            local_flights.append(Flight.objects.get(id=int(rec)))
                        elif analysis['intent'] == 'search_package':
                            local_packages.append(TourPackage.objects.get(id=int(rec)))
                    except Exception:
                        # ignorer les éléments non valides
                        pass

            if local_hotels:
                bot_message.recommended_hotels.set(local_hotels)
            if local_flights:
                bot_message.recommended_flights.set(local_flights)
            if local_packages:
                bot_message.recommended_packages.set(local_packages)

            # Stocker les résultats web directement dans le champ JSON 'entities'
            if web_results:
                entities = bot_message.entities or {}
                entities['web_recommendations'] = web_results
                bot_message.entities = entities
                bot_message.save()
        
        return Response({
            'session_id': conversation.session_id,
            'message': bot_response_text,
            'recommendations': self._serialize_recommendations(bot_message)
        })

    @action(detail=False, methods=['get'])
    def get_conversation(self, request):
        """
        Récupérer l'historique d'une conversation
        GET /api/chatbot/get_conversation/?session_id=abc123
        """
        session_id = request.query_params.get('session_id')

        if not session_id:
            return Response(
                {'error': 'session_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation = ChatConversation.objects.get(session_id=session_id)
        except ChatConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = conversation.messages.all()

        messages_data = []
        for msg in messages:
            msg_data = {
                'id': msg.id,
                'sender': msg.sender,
                'message': msg.message,
                'timestamp': msg.timestamp,
            }

            if msg.sender == 'bot':
                msg_data['recommendations'] = self._serialize_recommendations(msg)

            messages_data.append(msg_data)

        return Response({
            'session_id': conversation.session_id,
            'messages': messages_data
        })

    @action(detail=False, methods=['post'])
    def new_conversation(self, request):
        """
        Créer une nouvelle conversation
        POST /api/chatbot/new_conversation/
        """
        conversation = self._create_conversation(request.user)

        # Message de bienvenue
        welcome_message = ChatMessage.objects.create(
            conversation=conversation,
            sender='bot',
            message="Bonjour ! 👋 Je suis votre assistant voyage. Comment puis-je vous aider aujourd'hui ?",
            intent='greeting'
        )

        return Response({
            'session_id': conversation.session_id,
            'welcome_message': {
                'id': welcome_message.id,
                'message': welcome_message.message,
                'timestamp': welcome_message.timestamp
            }
        })

    @action(detail=False, methods=['get'])
    def faq(self, request):
        """
        Récupérer les questions fréquentes
        GET /api/chatbot/faq/
        """
        faqs = ChatbotFAQ.objects.filter(is_active=True)[:10]

        faq_data = [
            {
                'id': faq.id,
                'question': faq.question,
                'answer': faq.answer,
                'category': faq.category
            }
            for faq in faqs
        ]

        return Response({'faqs': faq_data})

    # Méthodes utilitaires

    def _create_conversation(self, user):
        """Créer une nouvelle conversation"""
        return ChatConversation.objects.create(
            user=user if user.is_authenticated else None,
            session_id=str(uuid.uuid4())
        )

    def _serialize_recommendations(self, message):
        """Sérialiser les recommandations d'un message"""
        recommendations = []

        # Hôtels
        for hotel in message.recommended_hotels.all():
            recommendations.append({
                'type': 'hotel',
                'id': hotel.id,
                'name': hotel.name,
                'image': hotel.image_main.url if hotel.image_main else None,
                'price': float(hotel.price_per_night),
                'stars': hotel.stars,
                'destination': hotel.destination.name,
                'rating': float(hotel.average_rating) if hotel.average_rating else 0,
            })

        # Vols
        for flight in message.recommended_flights.all():
            recommendations.append({
                'type': 'flight',
                'id': flight.id,
                'name': f"{flight.airline} - {flight.flight_number}",
                'price': float(flight.price),
                'origin': flight.origin.name,
                'destination': flight.destination.name,
                'duration': flight.duration,
            })

        # Circuits
        for package in message.recommended_packages.all():
            recommendations.append({
                'type': 'package',
                'id': package.id,
                'name': package.name,
                'image': package.image.url if package.image else None,
                'price': float(package.price),
                'duration': package.duration_days,
                'destination': package.destination.name,
            })
        
        # Ajouter aussi les recommandations provenant du web (stockées dans entities)
        try:
            web_recs = message.entities.get('web_recommendations', []) if message.entities else []
            for rec in web_recs:
                # rec est déjà un dict avec les champs attendus
                recommendations.append(rec)
        except Exception:
            pass

        return recommendations

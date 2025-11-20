from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
import uuid

from .models import ChatConversation, ChatMessage, ChatbotFAQ
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
        
        # 3. Analyser le message
        analysis = self.brain.analyze_message(message_text)
        
        # 4. Obtenir des recommandations
        recommendations = self.brain.get_recommendations(
            analysis['intent'],
            analysis['entities'],
            limit=3
        )
        
        # 5. Générer la réponse du bot
        bot_response_text = self.brain.generate_response(
            analysis['intent'],
            analysis['entities'],
            recommendations
        )
        
        # 6. Sauvegarder la réponse du bot
        bot_message = ChatMessage.objects.create(
            conversation=conversation,
            sender='bot',
            message=bot_response_text,
            intent=analysis['intent'],
            entities=analysis['entities']
        )
        
        # 7. Lier les recommandations au message
        if recommendations:
            if analysis['intent'] == 'search_hotel':
                bot_message.recommended_hotels.set(recommendations)
            elif analysis['intent'] == 'search_flight':
                bot_message.recommended_flights.set(recommendations)
            elif analysis['intent'] == 'search_package':
                bot_message.recommended_packages.set(recommendations)
        
        # 8. Retourner la réponse
        return Response({
            'session_id': conversation.session_id,
            'bot_message': {
                'id': bot_message.id,
                'message': bot_message.message,
                'intent': bot_message.intent,
                'recommendations': self._serialize_recommendations(bot_message),
                'timestamp': bot_message.timestamp
            },
            'user_message': {
                'id': user_message.id,
                'message': user_message.message,
                'timestamp': user_message.timestamp
            }
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
        
        return recommendations
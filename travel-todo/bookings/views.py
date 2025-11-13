from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Booking, Payment
from .serializers import (
    BookingSerializer, BookingCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """Gestion des réservations"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Chaque utilisateur voit seulement ses réservations"""
        user = self.request.user
        
        # Les admins voient toutes les réservations
        if user.role == 'admin':
            return Booking.objects.all()
        
        # Les clients voient leurs propres réservations
        return Booking.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def create(self, request, *args, **kwargs):
        """Créer une nouvelle réservation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Retourner la réservation complète
        return_serializer = BookingSerializer(booking)
        return Response(
            return_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une réservation"""
        booking = self.get_object()
        
        # Vérifier que l'utilisateur peut annuler
        if booking.user != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'Vous ne pouvez pas annuler cette réservation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Cette réservation est déjà annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.status == 'completed':
            return Response(
                {'error': 'Impossible d\'annuler une réservation terminée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Annuler la réservation
        booking.status = 'cancelled'
        booking.save()
        
        # Si un paiement existe, le rembourser
        if hasattr(booking, 'payment') and booking.payment.is_successful:
            booking.payment_status = 'refunded'
            booking.save()
        
        return Response({
            'message': 'Réservation annulée avec succès',
            'booking': BookingSerializer(booking).data
        })
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Récupérer toutes les réservations de l'utilisateur"""
        bookings = Booking.objects.filter(user=request.user)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Réservations à venir"""
        from django.utils import timezone
        
        bookings = self.get_queryset().filter(
            start_date__gte=timezone.now().date(),
            status__in=['pending', 'confirmed']
        )
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Réservations passées"""
        from django.utils import timezone
        
        bookings = self.get_queryset().filter(
            end_date__lt=timezone.now().date()
        )
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """Gestion des paiements"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les paiements selon l'utilisateur"""
        user = self.request.user
        
        if user.role == 'admin':
            return Payment.objects.all()
        
        return Payment.objects.filter(booking__user=user)
    
    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        """Créer un paiement"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Vérifier que l'utilisateur peut payer cette réservation
        booking = get_object_or_404(Booking, id=request.data.get('booking'))
        
        if booking.user != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'Vous ne pouvez pas payer cette réservation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment = serializer.save()
        
        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        """
        Endpoint simplifié pour traiter un paiement
        Données attendues: booking_id, payment_method
        """
        booking_id = request.data.get('booking_id')
        payment_method = request.data.get('payment_method', 'card')
        
        # Récupérer la réservation
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Vérifier les droits
        if booking.user != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier si un paiement existe déjà
        if hasattr(booking, 'payment'):
            return Response(
                {'error': 'Cette réservation a déjà été payée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le paiement
        payment_data = {
            'booking': booking.id,
            'amount': str(booking.total_price),
            'payment_method': payment_method,
            'notes': f'Paiement pour {booking.booking_number}'
        }
        
        serializer = PaymentCreateSerializer(data=payment_data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        
        return Response({
            'message': 'Paiement effectué avec succès',
            'payment': PaymentSerializer(payment).data,
            'booking': BookingSerializer(booking).data
        })
    
    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """Générer un reçu de paiement"""
        payment = self.get_object()
        
        return Response({
            'payment': PaymentSerializer(payment).data,
            'booking': BookingSerializer(payment.booking).data,
            'receipt_number': f"REC{payment.id:08d}",
            'message': 'Reçu généré avec succès'
        })
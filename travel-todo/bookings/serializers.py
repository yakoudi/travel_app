from rest_framework import serializers
from .models import Booking, Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer simple pour les paiements"""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'transaction_id',
            'payment_date', 'is_successful', 'notes'
        ]
        read_only_fields = ['payment_date']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer pour les réservations"""
    
    # Champs en lecture seule
    booking_number = serializers.CharField(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'user', 'user_email', 'user_name',
            'booking_type', 'hotel', 'flight', 'package',
            'start_date', 'end_date', 'num_guests',
            'unit_price', 'total_price', 'status', 'payment_status',
            'special_requests', 'item_name', 'payment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'total_price', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_item_name(self, obj):
        """Retourne le nom de l'élément réservé"""
        return obj.get_item_name()
    
    def validate(self, data):
        """Validation des données"""
        # Vérifier que la date de fin est après la date de début
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "La date de fin doit être après la date de début"
                )
        
        # Vérifier qu'un élément est sélectionné selon le type
        booking_type = data.get('booking_type')
        if booking_type == 'hotel' and not data.get('hotel'):
            raise serializers.ValidationError("Veuillez sélectionner un hôtel")
        elif booking_type == 'flight' and not data.get('flight'):
            raise serializers.ValidationError("Veuillez sélectionner un vol")
        elif booking_type == 'package' and not data.get('package'):
            raise serializers.ValidationError("Veuillez sélectionner un circuit")
        
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour créer une réservation"""
    
    class Meta:
        model = Booking
        fields = [
            'booking_type', 'hotel', 'flight', 'package',
            'start_date', 'end_date', 'num_guests',
            'unit_price', 'special_requests'
        ]
    
    def create(self, validated_data):
        # Ajouter l'utilisateur depuis le contexte
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement"""
    
    class Meta:
        model = Payment
        fields = ['booking', 'amount', 'payment_method', 'notes']
    
    def validate(self, data):
        """Vérifier que la réservation existe et n'a pas déjà été payée"""
        booking = data.get('booking')
        
        if hasattr(booking, 'payment'):
            raise serializers.ValidationError(
                "Cette réservation a déjà un paiement"
            )
        
        if data['amount'] != booking.total_price:
            raise serializers.ValidationError(
                "Le montant du paiement doit correspondre au prix total"
            )
        
        return data
    
    def create(self, validated_data):
        # Créer le paiement
        payment = super().create(validated_data)
        
        # Mettre à jour le statut de la réservation
        booking = payment.booking
        booking.payment_status = 'paid'
        booking.status = 'confirmed'
        booking.save()
        
        # Marquer le paiement comme réussi
        payment.is_successful = True
        payment.transaction_id = f"TRX{payment.id:08d}"
        payment.save()
        
        return payment
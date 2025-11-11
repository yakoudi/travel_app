from rest_framework import serializers
from .models import Destination, Hotel, HotelImage, Flight, TourPackage, Promotion


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'
        read_only_fields = ['created_at']


class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = ['id', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class HotelSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    images = HotelImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'destination', 'destination_name', 'description',
            'address', 'stars', 'price_per_night', 'has_wifi', 'has_pool',
            'has_parking', 'has_restaurant', 'has_spa', 'is_available',
            'total_rooms', 'image_main', 'images', 'uploaded_images',
            'average_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'average_rating']
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        hotel = Hotel.objects.create(**validated_data)
        
        # Créer les images supplémentaires
        for image in uploaded_images:
            HotelImage.objects.create(hotel=hotel, image=image)
        
        return hotel
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Mettre à jour l'hôtel
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Ajouter de nouvelles images
        for image in uploaded_images:
            HotelImage.objects.create(hotel=instance, image=image)
        
        return instance


class HotelListSerializer(serializers.ModelSerializer):
    """Version simplifiée pour la liste"""
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'destination_name', 'stars', 
            'price_per_night', 'image_main', 'average_rating', 'is_available'
        ]


class FlightSerializer(serializers.ModelSerializer):
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    duration = serializers.ReadOnlyField()
    
    class Meta:
        model = Flight
        fields = [
            'id', 'airline', 'flight_number', 'origin', 'origin_name',
            'destination', 'destination_name', 'departure_time', 'arrival_time',
            'duration', 'price', 'available_seats', 'is_direct',
            'baggage_included', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TourPackageSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = TourPackage
        fields = [
            'id', 'name', 'destination', 'destination_name', 'description',
            'duration_days', 'price', 'includes_hotel', 'includes_flight',
            'includes_meals', 'includes_guide', 'itinerary', 'max_participants',
            'image', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'
        read_only_fields = ['created_at', 'times_used']
    
    def validate(self, data):
        """Valider que la date de fin est après la date de début"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "La date de fin doit être après la date de début"
                )
        return data
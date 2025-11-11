from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Destination, Hotel, HotelImage, Flight, TourPackage, Promotion
from .serializers import (
    DestinationSerializer, HotelSerializer, HotelListSerializer,
    HotelImageSerializer, FlightSerializer, TourPackageSerializer,
    PromotionSerializer
)
from .permissions import IsAdminUser, IsAdminOrReadOnly


class DestinationViewSet(viewsets.ModelViewSet):
    """CRUD des destinations"""
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'description']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Récupérer les destinations populaires"""
        popular_destinations = self.queryset.filter(is_popular=True)
        serializer = self.get_serializer(popular_destinations, many=True)
        return Response(serializer.data)


class HotelViewSet(viewsets.ModelViewSet):
    """CRUD des hôtels"""
    queryset = Hotel.objects.select_related('destination').prefetch_related('images')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['destination', 'stars', 'is_available']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['price_per_night', 'average_rating', 'created_at']
    
    def get_serializer_class(self):
        """Utiliser un serializer différent pour la liste"""
        if self.action == 'list':
            return HotelListSerializer
        return HotelSerializer
    
    def perform_create(self, serializer):
        """Sauvegarder l'utilisateur qui crée l'hôtel"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_availability(self, request, pk=None):
        """Activer/Désactiver la disponibilité d'un hôtel"""
        hotel = self.get_object()
        hotel.is_available = not hotel.is_available
        hotel.save()
        
        return Response({
            'message': f"Hôtel {'activé' if hotel.is_available else 'désactivé'}",
            'is_available': hotel.is_available
        })


class HotelImageViewSet(viewsets.ModelViewSet):
    """Gestion des images des hôtels"""
    queryset = HotelImage.objects.all()
    serializer_class = HotelImageSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Filtrer par hôtel si paramètre fourni"""
        queryset = super().get_queryset()
        hotel_id = self.request.query_params.get('hotel')
        if hotel_id:
            queryset = queryset.filter(hotel_id=hotel_id)
        return queryset


class FlightViewSet(viewsets.ModelViewSet):
    """CRUD des vols"""
    queryset = Flight.objects.select_related('origin', 'destination')
    serializer_class = FlightSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['origin', 'destination', 'is_direct', 'is_available']
    ordering_fields = ['departure_time', 'price']
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Rechercher des vols selon critères"""
        origin = request.query_params.get('origin')
        destination = request.query_params.get('destination')
        date = request.query_params.get('date')
        
        queryset = self.queryset.filter(is_available=True)
        
        if origin:
            queryset = queryset.filter(origin_id=origin)
        if destination:
            queryset = queryset.filter(destination_id=destination)
        if date:
            queryset = queryset.filter(departure_time__date=date)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TourPackageViewSet(viewsets.ModelViewSet):
    """CRUD des circuits touristiques"""
    queryset = TourPackage.objects.select_related('destination')
    serializer_class = TourPackageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['destination', 'is_available']
    search_fields = ['name', 'description', 'itinerary']
    ordering_fields = ['price', 'duration_days', 'created_at']
    
    @action(detail=False, methods=['get'])
    def by_duration(self, request):
        """Filtrer par durée (court, moyen, long séjour)"""
        duration_type = request.query_params.get('type', 'all')
        
        queryset = self.queryset.filter(is_available=True)
        
        if duration_type == 'short':
            queryset = queryset.filter(duration_days__lte=3)
        elif duration_type == 'medium':
            queryset = queryset.filter(duration_days__range=(4, 7))
        elif duration_type == 'long':
            queryset = queryset.filter(duration_days__gte=8)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PromotionViewSet(viewsets.ModelViewSet):
    """CRUD des promotions"""
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'description']
    ordering_fields = ['start_date', 'end_date']
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def active(self, request):
        """Récupérer les promotions actives"""
        from django.utils import timezone
        
        active_promos = self.queryset.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )
        
        serializer = self.get_serializer(active_promos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def validate_code(self, request, pk=None):
        """Valider un code promo"""
        from django.utils import timezone
        
        promo = self.get_object()
        now = timezone.now()
        
        errors = []
        
        if not promo.is_active:
            errors.append("Ce code promo n'est plus actif")
        
        if promo.start_date > now:
            errors.append("Ce code promo n'est pas encore valide")
        
        if promo.end_date < now:
            errors.append("Ce code promo a expiré")
        
        if promo.max_uses and promo.times_used >= promo.max_uses:
            errors.append("Ce code promo a atteint sa limite d'utilisation")
        
        if errors:
            return Response({
                'valid': False,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'valid': True,
            'promotion': self.get_serializer(promo).data
        })
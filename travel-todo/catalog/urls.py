from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DestinationViewSet, HotelViewSet, HotelImageViewSet,
    FlightViewSet, TourPackageViewSet, PromotionViewSet
)

app_name = 'catalog'

router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'hotel-images', HotelImageViewSet, basename='hotel-image')
router.register(r'flights', FlightViewSet, basename='flight')
router.register(r'packages', TourPackageViewSet, basename='package')
router.register(r'promotions', PromotionViewSet, basename='promotion')

urlpatterns = [
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatbotViewSet

app_name = 'chatbot'

router = DefaultRouter()
router.register('', ChatbotViewSet, basename='chatbot')

urlpatterns = [
    path('', include(router.urls)),
]
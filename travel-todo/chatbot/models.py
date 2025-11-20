from django.db import models
from users.models import User
from catalog.models import Hotel, Flight, TourPackage


class ChatConversation(models.Model):
    """Conversations du chatbot"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='chat_conversations',
        null=True, 
        blank=True  # Permettre les conversations anonymes
    )
    session_id = models.CharField(max_length=100, unique=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Conversation'
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"Chat {self.session_id} - {self.user or 'Anonyme'}"


class ChatMessage(models.Model):
    """Messages de la conversation"""
    SENDER_CHOICES = [
        ('user', 'Utilisateur'),
        ('bot', 'Bot'),
    ]
    
    conversation = models.ForeignKey(
        ChatConversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    
    # Métadonnées pour les recommandations
    intent = models.CharField(max_length=50, blank=True)  # search_hotel, search_flight, etc.
    entities = models.JSONField(default=dict, blank=True)  # {budget: 500, destination: "Paris"}
    
    # Liens vers les recommandations
    recommended_hotels = models.ManyToManyField(Hotel, blank=True)
    recommended_flights = models.ManyToManyField(Flight, blank=True)
    recommended_packages = models.ManyToManyField(TourPackage, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Message'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender}: {self.message[:50]}"


class UserPreference(models.Model):
    """Préférences utilisateur pour recommandations"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='chat_preferences'
    )
    
    # Préférences de voyage
    preferred_budget_min = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    preferred_budget_max = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    preferred_stars = models.IntegerField(null=True, blank=True)  # Pour hôtels
    preferred_destinations = models.JSONField(default=list, blank=True)  # ["Paris", "Rome"]
    
    # Préférences détaillées
    likes_wifi = models.BooleanField(default=True)
    likes_pool = models.BooleanField(default=False)
    likes_spa = models.BooleanField(default=False)
    likes_restaurant = models.BooleanField(default=False)
    
    # Historique
    search_history = models.JSONField(default=list, blank=True)  # Dernières recherches
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Préférence utilisateur'
    
    def __str__(self):
        return f"Préférences de {self.user.email}"


class ChatbotFAQ(models.Model):
    """Base de connaissances FAQ"""
    question = models.CharField(max_length=500)
    answer = models.TextField()
    keywords = models.JSONField(default=list)  # Mots-clés pour matching
    category = models.CharField(max_length=50, default='general')
    is_active = models.BooleanField(default=True)
    times_used = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
    
    def __str__(self):
        return self.question
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User

class Destination(models.Model):
    """Destinations de voyage"""
    name = models.CharField(max_length=200, verbose_name='Nom')
    country = models.CharField(max_length=100, verbose_name='Pays')
    description = models.TextField(verbose_name='Description')
    image = models.ImageField(upload_to='destinations/', verbose_name='Image')
    is_popular = models.BooleanField(default=False, verbose_name='Destination populaire')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Destination'
        verbose_name_plural = 'Destinations'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name}, {self.country}"


class Hotel(models.Model):
    """Hôtels disponibles"""
    STAR_CHOICES = [(i, f"{i} étoile{'s' if i > 1 else ''}") for i in range(1, 6)]
    
    name = models.CharField(max_length=200, verbose_name='Nom')
    destination = models.ForeignKey(
        Destination, 
        on_delete=models.CASCADE, 
        related_name='hotels',
        verbose_name='Destination'
    )
    description = models.TextField(verbose_name='Description')
    address = models.CharField(max_length=300, verbose_name='Adresse')
    stars = models.IntegerField(
        choices=STAR_CHOICES, 
        default=3,
        verbose_name='Nombre d\'étoiles'
    )
    price_per_night = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Prix par nuit (TND)'
    )
    
    # Équipements
    has_wifi = models.BooleanField(default=True, verbose_name='WiFi')
    has_pool = models.BooleanField(default=False, verbose_name='Piscine')
    has_parking = models.BooleanField(default=False, verbose_name='Parking')
    has_restaurant = models.BooleanField(default=False, verbose_name='Restaurant')
    has_spa = models.BooleanField(default=False, verbose_name='Spa')
    
    # Disponibilité
    is_available = models.BooleanField(default=True, verbose_name='Disponible')
    total_rooms = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        verbose_name='Nombre de chambres'
    )
    
    # Informations supplémentaires
    image_main = models.ImageField(
        upload_to='hotels/', 
        verbose_name='Image principale'
    )
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name='Note moyenne'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='Créé par'
    )
    
    class Meta:
        verbose_name = 'Hôtel'
        verbose_name_plural = 'Hôtels'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.destination.name}"


class HotelImage(models.Model):
    """Images supplémentaires des hôtels"""
    hotel = models.ForeignKey(
        Hotel, 
        on_delete=models.CASCADE, 
        related_name='images',
        verbose_name='Hôtel'
    )
    image = models.ImageField(upload_to='hotels/gallery/', verbose_name='Image')
    caption = models.CharField(max_length=200, blank=True, verbose_name='Légende')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Image d\'hôtel'
        verbose_name_plural = 'Images d\'hôtels'
    
    def __str__(self):
        return f"Image - {self.hotel.name}"


class Flight(models.Model):
    """Vols disponibles"""
    airline = models.CharField(max_length=100, verbose_name='Compagnie aérienne')
    flight_number = models.CharField(max_length=20, verbose_name='Numéro de vol')
    
    origin = models.ForeignKey(
        Destination, 
        on_delete=models.CASCADE, 
        related_name='flights_from',
        verbose_name='Origine'
    )
    destination = models.ForeignKey(
        Destination, 
        on_delete=models.CASCADE, 
        related_name='flights_to',
        verbose_name='Destination'
    )
    
    departure_time = models.DateTimeField(verbose_name='Heure de départ')
    arrival_time = models.DateTimeField(verbose_name='Heure d\'arrivée')
    
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Prix (TND)'
    )
    available_seats = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name='Sièges disponibles'
    )
    
    is_direct = models.BooleanField(default=True, verbose_name='Vol direct')
    baggage_included = models.BooleanField(default=True, verbose_name='Bagage inclus')
    
    is_available = models.BooleanField(default=True, verbose_name='Disponible')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Vol'
        verbose_name_plural = 'Vols'
        ordering = ['departure_time']
    
    def __str__(self):
        return f"{self.flight_number} - {self.origin} → {self.destination}"
    
    @property
    def duration(self):
        """Calculer la durée du vol"""
        delta = self.arrival_time - self.departure_time
        hours = delta.seconds // 3600
        minutes = (delta.seconds % 3600) // 60
        return f"{hours}h {minutes}min"


class TourPackage(models.Model):
    """Circuits touristiques / Packages"""
    name = models.CharField(max_length=200, verbose_name='Nom du circuit')
    destination = models.ForeignKey(
        Destination, 
        on_delete=models.CASCADE, 
        related_name='packages',
        verbose_name='Destination'
    )
    description = models.TextField(verbose_name='Description')
    
    duration_days = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Durée (jours)'
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Prix (TND)'
    )
    
    # Inclusions
    includes_hotel = models.BooleanField(default=True, verbose_name='Hôtel inclus')
    includes_flight = models.BooleanField(default=True, verbose_name='Vol inclus')
    includes_meals = models.BooleanField(default=False, verbose_name='Repas inclus')
    includes_guide = models.BooleanField(default=False, verbose_name='Guide inclus')
    
    itinerary = models.TextField(
        verbose_name='Itinéraire détaillé',
        help_text='Décrivez le programme jour par jour'
    )
    
    max_participants = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Nombre max de participants'
    )
    
    image = models.ImageField(upload_to='packages/', verbose_name='Image')
    is_available = models.BooleanField(default=True, verbose_name='Disponible')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Circuit touristique'
        verbose_name_plural = 'Circuits touristiques'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.duration_days} jours"


class Promotion(models.Model):
    """Promotions et réductions"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Pourcentage'),
        ('fixed', 'Montant fixe'),
    ]
    
    code = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name='Code promo'
    )
    description = models.CharField(max_length=200, verbose_name='Description')
    
    discount_type = models.CharField(
        max_length=20, 
        choices=DISCOUNT_TYPE_CHOICES,
        verbose_name='Type de réduction'
    )
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Valeur de la réduction'
    )
    
    start_date = models.DateTimeField(verbose_name='Date de début')
    end_date = models.DateTimeField(verbose_name='Date de fin')
    
    is_active = models.BooleanField(default=True, verbose_name='Active')
    max_uses = models.IntegerField(
        null=True, 
        blank=True,
        verbose_name='Utilisations maximales'
    )
    times_used = models.IntegerField(default=0, verbose_name='Fois utilisée')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Promotion'
        verbose_name_plural = 'Promotions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else ' TND'}"
from django.db import models
from django.core.validators import MinValueValidator
from users.models import User
from catalog.models import Hotel, Flight, TourPackage
import uuid


class Booking(models.Model):
    """Modèle principal pour les réservations"""
    
    # Types de réservation
    BOOKING_TYPES = [
        ('hotel', 'Hôtel'),
        ('flight', 'Vol'),
        ('package', 'Circuit'),
    ]
    
    # Statuts de réservation
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('cancelled', 'Annulée'),
        ('completed', 'Terminée'),
    ]
    
    # Statuts de paiement
    PAYMENT_STATUS = [
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('refunded', 'Remboursé'),
    ]
    
    # Informations de base
    booking_number = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        verbose_name='Numéro de réservation'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        verbose_name='Client'
    )
    booking_type = models.CharField(
        max_length=20, 
        choices=BOOKING_TYPES,
        verbose_name='Type de réservation'
    )
    
    # Relations (une seule sera remplie selon le type)
    hotel = models.ForeignKey(
        Hotel, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='bookings'
    )
    flight = models.ForeignKey(
        Flight, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='bookings'
    )
    package = models.ForeignKey(
        TourPackage, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='bookings'
    )
    
    # Dates
    start_date = models.DateField(verbose_name='Date de début')
    end_date = models.DateField(verbose_name='Date de fin')
    
    # Participants
    num_guests = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Nombre de participants'
    )
    
    # Prix
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Prix unitaire'
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Prix total'
    )
    
    # Statuts
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='Statut'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS, 
        default='pending',
        verbose_name='Statut paiement'
    )
    
    # Notes
    special_requests = models.TextField(
        blank=True,
        verbose_name='Demandes spéciales'
    )
    
    # Dates système
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Générer un numéro de réservation unique
        if not self.booking_number:
            self.booking_number = f"BK{uuid.uuid4().hex[:8].upper()}"
        
        # Calculer le prix total
        self.total_price = self.unit_price * self.num_guests
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.booking_number} - {self.user.email}"
    
    def get_item_name(self):
        """Retourne le nom de l'élément réservé"""
        if self.booking_type == 'hotel' and self.hotel:
            return self.hotel.name
        elif self.booking_type == 'flight' and self.flight:
            return f"{self.flight.flight_number} - {self.flight.airline}"
        elif self.booking_type == 'package' and self.package:
            return self.package.name
        return "Non défini"


class Payment(models.Model):
    """Modèle pour les paiements"""
    
    PAYMENT_METHODS = [
        ('card', 'Carte bancaire'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Virement bancaire'),
        ('cash', 'Espèces (en agence)'),
    ]
    
    booking = models.OneToOneField(
        Booking, 
        on_delete=models.CASCADE, 
        related_name='payment',
        verbose_name='Réservation'
    )
    
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Montant'
    )
    
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS,
        verbose_name='Méthode de paiement'
    )
    
    # Informations de transaction
    transaction_id = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='ID de transaction'
    )
    
    payment_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de paiement'
    )
    
    is_successful = models.BooleanField(
        default=False,
        verbose_name='Paiement réussi'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notes'
    )
    
    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Paiement {self.booking.booking_number} - {self.amount} TND"
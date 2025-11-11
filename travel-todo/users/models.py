from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email est obligatoire')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('user', 'Utilisateur'),
        ('admin', 'Administrateur'),
    )
    
    email = models.EmailField(unique=True, verbose_name='Email')
    first_name = models.CharField(max_length=100, blank=True, verbose_name='Prénom')
    last_name = models.CharField(max_length=100, blank=True, verbose_name='Nom')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Téléphone')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user', verbose_name='Rôle')
    
    # Préférences voyages
    favorite_destinations = models.JSONField(default=list, blank=True, verbose_name='Destinations favorites')
    travel_preferences = models.JSONField(default=dict, blank=True, verbose_name='Préférences de voyage')
    
    # Photo de profil
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True, verbose_name='Photo de profil')
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    
    # Dates
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'inscription')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Dernière modification')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    @property
    def is_admin(self):
        return self.role == 'admin'
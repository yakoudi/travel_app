from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()

class Command(BaseCommand):
    help = 'Créer un administrateur prédéfini'

    def handle(self, *args, **kwargs):
        admin_email = config('ADMIN_EMAIL', default='admin@traveltodo.com')
        admin_password = config('ADMIN_PASSWORD', default='Admin@123456')
        
        # Vérifier si l'admin existe déjà
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin avec email {admin_email} existe déjà!')
            )
            return
        
        # Créer le superuser
        admin = User.objects.create_superuser(
            email=admin_email,
            password=admin_password,
            first_name='Admin',
            last_name='Travel Todo'
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Admin créé avec succès!\n'
                f'Email: {admin_email}\n'
                f'Mot de passe: {admin_password}\n'
                f'⚠️  N\'oubliez pas de changer le mot de passe en production!'
            )
        )
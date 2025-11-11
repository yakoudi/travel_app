from django.core.management.base import BaseCommand
from catalog.models import Destination, Hotel, Flight, TourPackage, Promotion
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Peupler la base de données avec des données d\'exemple'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌍 Création des destinations...')
        
        # Destinations
        paris = Destination.objects.create(
            name='Paris',
            country='France',
            description='La ville lumière, capitale de la France',
            is_popular=True
        )
        
        istanbul = Destination.objects.create(
            name='Istanbul',
            country='Turquie',
            description='Pont entre l\'Europe et l\'Asie',
            is_popular=True
        )
        
        dubai = Destination.objects.create(
            name='Dubaï',
            country='Émirats Arabes Unis',
            description='Ville futuriste du désert',
            is_popular=True
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Destinations créées'))
        
        # Hôtels
        self.stdout.write('🏨 Création des hôtels...')
        
        Hotel.objects.create(
            name='Hôtel Luxe Paris',
            destination=paris,
            description='Hôtel 5 étoiles au cœur de Paris',
            address='123 Avenue des Champs-Élysées, Paris',
            stars=5,
            price_per_night=250.00,
            has_wifi=True,
            has_pool=True,
            has_parking=True,
            has_restaurant=True,
            has_spa=True,
            total_rooms=50,
            is_available=True,
            average_rating=4.8
        )
        
        Hotel.objects.create(
            name='Istanbul Palace Hotel',
            destination=istanbul,
            description='Vue sur le Bosphore',
            address='Sultanahmet, Istanbul',
            stars=4,
            price_per_night=120.00,
            has_wifi=True,
            has_pool=True,
            has_restaurant=True,
            total_rooms=80,
            is_available=True,
            average_rating=4.5
        )
        
        Hotel.objects.create(
            name='Dubai Marina Resort',
            destination=dubai,
            description='Complexe de luxe à Dubai Marina',
            address='Dubai Marina, Dubai',
            stars=5,
            price_per_night=350.00,
            has_wifi=True,
            has_pool=True,
            has_parking=True,
            has_restaurant=True,
            has_spa=True,
            total_rooms=200,
            is_available=True,
            average_rating=4.9
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Hôtels créés'))
        
        # Vols
        self.stdout.write('✈️ Création des vols...')
        
        tunis = Destination.objects.create(
            name='Tunis',
            country='Tunisie',
            description='Capitale de la Tunisie',
            is_popular=False
        )
        
        now = timezone.now()
        
        Flight.objects.create(
            airline='Tunisair',
            flight_number='TU101',
            origin=tunis,
            destination=paris,
            departure_time=now + timedelta(days=7),
            arrival_time=now + timedelta(days=7, hours=2),
            price=180.00,
            available_seats=50,
            is_direct=True,
            baggage_included=True,
            is_available=True
        )
        
        Flight.objects.create(
            airline='Turkish Airlines',
            flight_number='TK202',
            origin=tunis,
            destination=istanbul,
            departure_time=now + timedelta(days=10),
            arrival_time=now + timedelta(days=10, hours=3),
            price=150.00,
            available_seats=80,
            is_direct=True,
            baggage_included=True,
            is_available=True
        )
        
        Flight.objects.create(
            airline='Emirates',
            flight_number='EK303',
            origin=tunis,
            destination=dubai,
            departure_time=now + timedelta(days=15),
            arrival_time=now + timedelta(days=15, hours=6),
            price=400.00,
            available_seats=30,
            is_direct=False,
            baggage_included=True,
            is_available=True
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Vols créés'))
        
        # Circuits touristiques
        self.stdout.write('🎒 Création des circuits...')
        
        TourPackage.objects.create(
            name='Week-end romantique à Paris',
            destination=paris,
            description='3 jours et 2 nuits dans la ville de l\'amour',
            duration_days=3,
            price=599.00,
            includes_hotel=True,
            includes_flight=True,
            includes_meals=False,
            includes_guide=True,
            itinerary='''
            Jour 1: Arrivée à Paris, installation à l'hôtel, Tour Eiffel
            Jour 2: Musée du Louvre, Bateau-mouche sur la Seine
            Jour 3: Montmartre, Sacré-Cœur, départ
            ''',
            max_participants=20,
            is_available=True
        )
        
        TourPackage.objects.create(
            name='Découverte d\'Istanbul',
            destination=istanbul,
            description='5 jours pour explorer Istanbul',
            duration_days=5,
            price=850.00,
            includes_hotel=True,
            includes_flight=True,
            includes_meals=True,
            includes_guide=True,
            itinerary='''
            Jour 1: Arrivée, Sultanahmet
            Jour 2: Palais de Topkapi, Sainte-Sophie
            Jour 3: Grand Bazar, Mosquée Bleue
            Jour 4: Croisière sur le Bosphore
            Jour 5: Shopping et départ
            ''',
            max_participants=15,
            is_available=True
        )
        
        TourPackage.objects.create(
            name='Luxe à Dubaï - 7 jours',
            destination=dubai,
            description='Séjour de luxe aux Émirats',
            duration_days=7,
            price=1999.00,
            includes_hotel=True,
            includes_flight=True,
            includes_meals=True,
            includes_guide=True,
            itinerary='''
            Jour 1-2: Découverte de Dubai Mall, Burj Khalifa
            Jour 3-4: Safari dans le désert, soirée bédouine
            Jour 4-5: Palm Jumeirah, Atlantis
            Jour 6: Shopping et détente
            Jour 7: Départ
            ''',
            max_participants=10,
            is_available=True
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Circuits créés'))
        
        # Promotions
        self.stdout.write('🎁 Création des promotions...')
        
        Promotion.objects.create(
            code='WELCOME2025',
            description='Réduction de bienvenue',
            discount_type='percentage',
            discount_value=15.00,
            start_date=now,
            end_date=now + timedelta(days=30),
            is_active=True,
            max_uses=100
        )
        
        Promotion.objects.create(
            code='SUMMER50',
            description='Réduction été - 50 TND',
            discount_type='fixed',
            discount_value=50.00,
            start_date=now,
            end_date=now + timedelta(days=60),
            is_active=True,
            max_uses=50
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Promotions créées'))
        
        self.stdout.write(self.style.SUCCESS('🎉 Base de données peuplée avec succès!'))
from django.contrib import admin
from .models import Destination, Hotel, HotelImage, Flight, TourPackage, Promotion


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'is_popular', 'created_at']
    list_filter = ['is_popular', 'country']
    search_fields = ['name', 'country']
    list_editable = ['is_popular']


class HotelImageInline(admin.TabularInline):
    model = HotelImage
    extra = 1


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'stars', 'price_per_night', 'is_available', 'average_rating']
    list_filter = ['stars', 'is_available', 'destination']
    search_fields = ['name', 'description', 'address']
    list_editable = ['is_available']
    inlines = [HotelImageInline]
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'destination', 'description', 'address', 'stars')
        }),
        ('Tarif et disponibilité', {
            'fields': ('price_per_night', 'total_rooms', 'is_available')
        }),
        ('Équipements', {
            'fields': ('has_wifi', 'has_pool', 'has_parking', 'has_restaurant', 'has_spa')
        }),
        ('Média', {
            'fields': ('image_main',)
        }),
    )


@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = ['flight_number', 'airline', 'origin', 'destination', 'departure_time', 'price', 'is_available']
    list_filter = ['is_available', 'is_direct', 'airline']
    search_fields = ['flight_number', 'airline']
    date_hierarchy = 'departure_time'


@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'duration_days', 'price', 'is_available']
    list_filter = ['is_available', 'destination']
    search_fields = ['name', 'description']
    list_editable = ['is_available']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active', 'times_used']
    list_filter = ['is_active', 'discount_type']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['times_used']
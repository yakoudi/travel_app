from django.contrib import admin
from .models import Booking, Payment


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'booking_number', 'user', 'booking_type', 'get_item_name',
        'start_date', 'end_date', 'total_price', 'status', 'payment_status'
    ]
    list_filter = ['status', 'payment_status', 'booking_type', 'created_at']
    search_fields = ['booking_number', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['booking_number', 'total_price', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('booking_number', 'user', 'booking_type')
        }),
        ('Élément réservé', {
            'fields': ('hotel', 'flight', 'package')
        }),
        ('Dates et participants', {
            'fields': ('start_date', 'end_date', 'num_guests')
        }),
        ('Prix', {
            'fields': ('unit_price', 'total_price')
        }),
        ('Statuts', {
            'fields': ('status', 'payment_status')
        }),
        ('Informations supplémentaires', {
            'fields': ('special_requests',)
        }),
        ('Dates système', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_item_name(self, obj):
        return obj.get_item_name()
    get_item_name.short_description = 'Élément réservé'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'booking', 'amount', 'payment_method', 'transaction_id',
        'is_successful', 'payment_date'
    ]
    list_filter = ['payment_method', 'is_successful', 'payment_date']
    search_fields = ['booking__booking_number', 'transaction_id']
    readonly_fields = ['payment_date']
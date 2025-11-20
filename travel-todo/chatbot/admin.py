from django.contrib import admin
from .models import ChatConversation, ChatMessage, UserPreference, ChatbotFAQ


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['sender', 'message', 'timestamp']
    can_delete = False


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'started_at', 'last_activity', 'is_active']
    list_filter = ['is_active', 'started_at']
    search_fields = ['session_id', 'user__email']
    inlines = [ChatMessageInline]
    readonly_fields = ['session_id', 'started_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'message_preview', 'intent', 'timestamp']
    list_filter = ['sender', 'intent', 'timestamp']
    search_fields = ['message', 'conversation__session_id']
    readonly_fields = ['timestamp']
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_budget_min', 'preferred_budget_max', 'preferred_stars']
    search_fields = ['user__email']


@admin.register(ChatbotFAQ)
class ChatbotFAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'is_active', 'times_used']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer']
    list_editable = ['is_active']
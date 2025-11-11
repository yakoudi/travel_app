from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permission pour les administrateurs uniquement"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Les admins peuvent tout faire,
    Les autres peuvent seulement lire (GET)
    """
    
    def has_permission(self, request, view):
        # Lecture autorisée pour tout le monde
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture seulement pour les admins
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )
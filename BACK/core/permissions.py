from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) == 'admin'

class IsAdminOrCaissier(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        return role in ['admin', 'caissier']

class IsAdminOrChauffeur(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        return role in ['admin', 'chauffeur']

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if role == 'admin':
            return True
        if role == 'chauffeur':
            if hasattr(obj, 'chauffeur'):
                return obj.chauffeur == request.user
            if hasattr(obj, 'user'):
                return obj.user == request.user
        return False
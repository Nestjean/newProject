from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
  def has_permission(self, request, view):
    if request.method in permissions.SAFE_METHODS:
      return True
    return request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrCaissier(permissions.BasePermission):
  def has_permission(self, request, view):
    if not request.user.is_authenticated:
      return False
    return request.user.role in ['admin', 'caissier']

class IsAdminOrChauffeur(permissions.BasePermission):
  def has_permission(self, request, view):
    if not request.user.is_authenticated:
      return False
    return request.user.role in ['admin', 'chauffeur']
  
  def has_object_permission(self, request, view, obj):
    if request.user.role == 'admin':
      return True
    if request.user.role == 'chauffeur':
      # Un chauffeur ne voit que ses propres données
      if hasattr(obj, 'chauffeur'):
        return obj.chauffeur == request.user
      if hasattr(obj, 'user'):
        return obj.user == request.user
      return False

class CustomDjangoModelPermissions(permissions.DjangoModelPermissions):
  def __init__(self):
    self.perms_map['GET'] = ['%(app_label)s.view_%(model_name)s']
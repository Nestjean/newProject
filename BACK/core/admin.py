from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Utilisateur)
admin.site.register(Vehicule)
admin.site.register(Affectation)
admin.site.register(Trajet)
admin.site.register(Depense)
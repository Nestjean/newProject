from django.contrib import admin
from .models import *

admin.site.register(Utilisateur)
admin.site.register(Vehicule)
admin.site.register(Affectation)
admin.site.register(Trajet)
admin.site.register(Depense)
admin.site.register(RecetteJournaliere)
admin.site.register(DepenseJournaliere)
admin.site.register(CommissionChauffeur)
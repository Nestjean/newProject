from rest_framework import serializers
from .models import *

class UtilisateurSerializer(serializers.ModelSerializer):
    mot_de_passe = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'telephone', 'adresse', 'est_actif', 'mot_de_passe']

    def create(self, validated_data):
        password = validated_data.pop('mot_de_passe', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class VehiculeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicule
        fields = '__all__'

class TrajetSerializer(serializers.ModelSerializer):
    recette = serializers.ReadOnlyField()
    chauffeur_nom = serializers.StringRelatedField(source='chauffeur', read_only=True)
    vehicule_immatriculation = serializers.StringRelatedField(source='vehicule', read_only=True)

    class Meta:
        model = Trajet
        fields = '__all__'

class DepenseSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Depense
        fields = '__all__'

class CommissionChauffeurSerializer(serializers.ModelSerializer):
    chauffeur_nom = serializers.StringRelatedField(source='chauffeur', read_only=True)

    class Meta:
        model = CommissionChauffeur
        fields = '__all__'

class DashboardSerializer(serializers.Serializer):
    recettes_jour = serializers.DecimalField(max_digits=15, decimal_places=2)
    depenses_jour = serializers.DecimalField(max_digits=15, decimal_places=2)
    benefice_jour = serializers.DecimalField(max_digits=15, decimal_places=2)
    recettes_mois = serializers.DecimalField(max_digits=15, decimal_places=2)
    depenses_mois = serializers.DecimalField(max_digits=15, decimal_places=2)
    benefice_mois = serializers.DecimalField(max_digits=15, decimal_places=2)
    nombre_trajets_jour = serializers.IntegerField()
    nombre_trajets_mois = serializers.IntegerField()
    passagers_total_jour = serializers.IntegerField()
    passagers_total_mois = serializers.IntegerField()
    chauffeurs_actifs = serializers.IntegerField()
    vehicules_disponibles = serializers.IntegerField()
from rest_framework import serializers 
from django.contrib.auth.hashers import make_password
from .models import *
from datetime import datetime, timedelta
from django.utils import timezone

class UtilisateurSerializer(serializers.ModelSerializer):
  mot_de_passe = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = Utilisateur
    fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'telephone', 'adresse', 'date_embauche', 'salaire_base', 'est_actif', 'mot_de_passe', 'last_login', 'date_joined']
    read_only_fields = ['id', 'last_login', 'date_joined'] 
  
  def create(self, validated_data):
    password = validated_data.pop('mot_de_passe', None)
    user = super().create(validated_data)
    if password:
      user.set_password(password)
      user.save()
    return user
  
# update method pour le mot de passe 
  def update(self, instance, validated_data):
    password = validated_data.pop('mot_de_passe', None)
    user = super().update(instance, validated_data)
    if password: 
      user.set_password(password) 
      user.save()
    return user 


class VehiculeSerializer(serializers.ModelSerializer):
  chauffeur_actuel = serializers.StringRelatedField(read_only=True)
  chauffeur_actuel_id = serializers.IntegerField(write_only=True, required=False)


  class Meta:
    model = Vehicule
    fields = '__all__'
  

  def create(self, validated_data):
    chauffeur_id = validated_data.pop('chauffeur_actuel_id', None)
    vehicule = Vehicule.objects.create(**validated_data) 

    if chauffeur_id:
      Affectation.objects.create(
        chauffeur_id=chauffeur_id,
        vehicule=vehicule,
        date_debut=timezone.now().date()
      )
    return vehicule

class AffectationSerializer(serializers.ModelSerializer):
  chauffeur_nom = serializers.StringRelatedField(source='chauffeur', read_only=True) 
  vehicule_immatriculation = serializers.StringRelatedField(source='vehicule', read_only=True)

  class Meta:
    model = Affectation
    fields = '__all__'



class TrajetSerializer(serializers.ModelSerializer):
  recette = serializers.ReadOnlyField()
  chauffeur_nom = serializers.StringRelatedField(source='chauffeur', read_only=True)
  vehicule_immatriculation = serializers.StringRelatedField(source='vehicule', read_only=True)

  class Meta:
    model = Trajet
    fields = '__all__' 
  
  def validate(self, data):
    if data['nombre_passagers'] > data['vehicule'].nombre_places:
      raise serializers.ValidationError(
        f"Le nombre de passagers ({data['nombre_passagers']}) dépasse la capacité du véhicule ({data['vehicule'].nombre_places})"
      )
    return data

class DepenseSerializer(serializers.ModelSerializer):
  type_display = serializers.CharField(source='get_type_display', read_only=True)


  class Meta:
    model = Depense
    fields = '__all__' 

class RecetteJournaliereSerializer(serializers.ModelSerializer):
  class Meta:
    model = RecetteJournaliere
    fields = '__all__'

class DepenseJournaliereSerializer(serializers.ModelSerializer):
  class Meta:
    model = DepenseJournaliere
    fields = '__all__'

class BeneficeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Benefice
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
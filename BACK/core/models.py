from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

# Create your models here.

# Utilisateur 
class Utilisateur(AbstractUser):
  ROLE_CHOICES = [
    ('admin', 'Administrateur'),
    ('caissier', 'Caissier'),
    ('chauffeur', 'Chauffeur'),
  ]

  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='chauffeur')
  telephone = models.CharField(max_length=15, blank=True)
  adresse = models.TextField(blank=True)
  date_embauche = models.DateField(auto_now_add=True)
  salaire_base = models.DecimalField(max_digits=10, decimal_places=2, default=0) 
  est_actif = models.BooleanField(default=True)

  def __str__(self):
    return f"{self.username} ({self.get_role_display()})" 
  

  class Meta:
    ordering = ['username']
  


# Véhicule
class Vehicule(models.Model):
  TYPE_CHOICES = [
    ('taxi_brousse', 'Taxi Brousse'),
    ('bus', 'Bus'),
    ('minibus', 'Minibus'),
  ] 


  ETAT_CHOICES = [
    ('disponible', 'Disponible'), 
    ('en_maintenance', 'En maintenance'),
    ('en_trajet', 'En trajet'),
  ] 

  immatriculation = models.CharField(max_length=50, unique=True)
  type = models.CharField(max_length=20, choices=TYPE_CHOICES)
  marque = models.CharField(max_length=50)
  modele = models.CharField(max_length=50)
  annee_fabrication = models.IntegerField()
  nombre_places = models.IntegerField()
  etat = models.CharField(max_length=20, choices=ETAT_CHOICES, default='disponible')
  kilometrage = models.IntegerField(default=0)
  date_achat = models.DateField()
  prix_achat = models.DecimalField(max_digits=15, decimal_places=2)

  def __str__(self):
    return f"{self.immatriculation} - {self.marque} {self.modele}"
  
  @property
  def chauffeur_actuel(self):
    affectation = self.affectation_set.filter(date_fin__isnull=True.first())
    return affectation.chauffeur if affectation else None

# Affectation chauffeur - véhicule
class Affectation(models.Model):
  chauffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'role': 'chauffeur'} )
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  date_debut = models.DateField()
  date_fin = models.DateField(null=True, blank=True)
  motif_fin = models.TextField(blank=True)

  def __str__(self):
    return f"{self.chauffeur.username} -> {self.vehicule.immatriculation}"
  
  class Meta:
    ordering = ['-date_debut']


# Trajet 
class Trajet(models.Model):
  STATUS_CHOICES = [
    ('planifie', 'Planifié'),
    ('en_cours', 'En cours'),
    ('termine', 'Terminé'), 
    ('annule', 'Annulé'),
  ]

  date = models.DateField()
  heure_depart = models.TimeField()
  heure_arrivee = models.TimeField(null=True, blank=True)
  destination = models.CharField(max_length=100)
  origine = models.CharField(max_length=100, default='Dakar')
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  chauffeur = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'chauffeur'})
  nombre_passagers = models.IntegerField()
  prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
  distance = models.DecimalField(max_digits=10, decimal_places=2, help_text="Distance en km")
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planifie')
  date_creation = models.DateTimeField(auto_now_add=True)

  def recette(self):
    return self.nombre_passagers * self.prix_unitaire 
  
  def __str__(self):
    return f"{self.origine} -> {self.destination} ({self.date})" 
  
  class Meta:
    ordering = ['-date', '-heure_depart']
  

# Dépense 
class Depense(models.Model):
  TYPE_CHOICES = [
    ('carburant', 'Carburant'),
    ('reparation', 'Réparation'),
    ('entretien', 'Entretien'),
    ('assurance', 'Assurance'),
    ('vignette', 'Vignette'),
    ('amende', 'Amende'),
    ('autre', 'Autre'),
  ]

  type = models.CharField(max_length=20, choices=TYPE_CHOICES)
  montant = models.DecimalField(max_digits=10, decimal_places=2)
  date = models.DateField()
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  trajet = models.ForeignKey(Trajet, on_delete=models.SET_NULL, null=True, blank=True)
  description = models.TextField(blank=True)
  quantite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
  fournisseur = models.CharField(max_length=100, blank=True)
  facture = models.FileField(upload_to='factures/', null=True, blank=True)

  def __str__(self):
    return f"{self.get_type_display()} - {self.montant} Ar ({self.date})"


class RecetteJournaliere(models.Model):
  date = models.DateField(unique=True)
  montant_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  nombre_trajets = models.IntegerField(default=0)
  nombre_passagers_total = models.IntegerField(default=0)
  date_creation = models.DateTimeField(auto_now_add=True)
  date_modification = models.DateTimeField(auto_now=True) 

  def calculer_recette(self):
    """Calcule la recette totale à partir des trajets de la journée"""
    
    trajets = Trajet.objects.filter(date=self.date, status='termine') 
    self.nombre_trajets = trajets.count()
    self.nombre_passagers_total = sum(t.nombre_passagers for t in trajets)
    self.montant_total = sum(t.recette() for t in trajets)
    self.save()
    return self.montant_total
  
  def __str__(self):
    return f"Recette du {self.date}: {self.montant_total} Ar"

class DepenseJournaliere(models.Model):
  date = models.DateField(unique=True)
  montant_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  details = models.JSONField(default=dict) # Stocke le détail par type de dépense
  date_creation = models.DateTimeField(auto_now_add=True)

  def calculer_depenses(self):
    """Calcule le total des dépenses de la journée"""
    depenses = Depense.objects.filter(date=self.date)
    self.montant_total = sum(d.montant for d in depenses)

    # Détail par type
    details = {}
    for type_choice in Depense.TYPE_CHOICES:
      type_key = type_choice[0]
      total = sum(d.montant for d in depenses if d.type == type_key)
      if total > 0:
        details[type_key] = float(total)
    self.details = details
    self.save()
    return self.montant_total 

class Benefice(models.Model):
  PERIODE_CHOICES = [
    ('journalier', 'Journalier'),
    ('hebdomadaire', 'Hebdomadaire'),
    ('mensuel', 'Mensuel'),
    ('trimestriel', 'Trimestriel'),
    ('annuel', 'Annuel'),
  ] 

  periode = models.CharField(max_length=20, choices=PERIODE_CHOICES)
  date_debut = models.DateField()
  date_fin = models.DateField()
  recettes_totales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  depenses_totales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  benefice_net = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  marge_beneficiaire = models.DecimalField(max_digits=5, decimal_places=2, default=0)
  date_calcul = models.DateTimeField(auto_now_add=True)

  def calculer_benefice(self):
    """Calcule le bénéfice pour la période"""
    self.benefice_net = self.recettes_totales - self.depenses_totales
    if self.recettes_totales > 0:
      self.marge_beneficiaire = (self.benefice_net / self.recettes_totales) * 100 
    return self.benefice_net
  
  def __str__(self):
    return f"{self.periode} - {self.date_debut} à {self.date_fin}: {self.benefice_net} Ar"
  
class CommissionChauffeur(models.Model):
  chauffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'role': 'chauffeur'})
  periode_debut = models.DateField()
  periode_fin = models.DateField()
  recettes_realisees = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  taux_commission = models.DecimalField(max_digits=5, decimal_places=2, default=10) # en pourcentage
  montant_commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
  est_paye = models.BooleanField(default=False)
  date_paiement = models.DateField(null=True, blank=True) 

  def calculer_commission(self):
    self.montant_commission = (self.recettes_realisees * self.taux_commission) / 100

    return self.montant_commission 
  
  def __str__(self):
    return f"Commission {self.chauffeur.username}: {self.montant_commission} Ar"



from django.db import models

# Create your models here.

# Utilisateur 
class Utilisateur(models.Model):
  ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('caissier', 'Caissier'),
    ('chauffeur', 'Chauffeur'),
  ]

  nom = models.CharField(max_length=100)
  role = models.CharField(max_length=20, choices=ROLE_CHOICES)
  mot_de_passe = models.CharField(max_length=255)

  def __str__(self):
    return f"{self.nom} ({self.role})"
  


# Véhicule
class Vehicule(models.Model):
  immatriculation = models.CharField(max_length=50, unique=True)
  type = models.CharField(max_length=50) 

  def __str__(self):
    return self.immatriculation

# Affectation chauffeur - véhicule
class Affectation(models.Model):
  chauffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'role': 'chauffeur'} )
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  date_debut = models.DateField()
  date_fin = models.DateField(null=True, blank=True)

  def __str__(self):
    return f"{self.chauffeur} -> {self.vehicule}"


# Trajet 
class Trajet(models.Model):
  date = models.DateField()
  destination = models.CharField(max_length=100)
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  nombre_passagers = models.IntegerField()
  prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

  def recette(self):
    return self.nombre_passagers * self.prix_unitaire
  
  def __str__(self):
    return f"{self.destination} ({self.date})"
  

# Dépense 
class Depense(models.Model):
  TYPE_CHOICES = [
    ('carburant', 'Carburant'),
    ('reparation', 'Réparation'),
    ('autre', 'Autre'),
  ]

  type = models.CharField(max_length=20, choices=TYPE_CHOICES)
  montant = models.DecimalField(max_digits=10, decimal_places=2)
  date = models.DateField()
  vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
  trajet = models.ForeignKey(Trajet, on_delete=models.SET_NULL, null=True, blank=True)

  def __str__(self):
    return f"{self.type} - {self.montant}"



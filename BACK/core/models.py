from django.db import models
from django.contrib.auth.models import AbstractUser

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

class Affectation(models.Model):
    chauffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'role': 'chauffeur'})
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    motif_fin = models.TextField(blank=True)

    def __str__(self):
        return f"{self.chauffeur.username} -> {self.vehicule.immatriculation}"

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
    origine = models.CharField(max_length=100, default='Antananarivo')
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
    fournisseur = models.CharField(max_length=100, blank=True)
    quantite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Quantité en litres ou unités")

    def __str__(self):
        return f"{self.get_type_display()} - {self.montant} Ar"
class RecetteJournaliere(models.Model):
    date = models.DateField(unique=True)
    montant_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    nombre_trajets = models.IntegerField(default=0)
    nombre_passagers_total = models.IntegerField(default=0)

    def calculer_recette(self):
        trajets = Trajet.objects.filter(date=self.date, status='termine')
        self.nombre_trajets = trajets.count()
        self.nombre_passagers_total = sum(t.nombre_passagers for t in trajets)
        self.montant_total = sum(t.recette() for t in trajets)
        self.save()
        return self.montant_total

class DepenseJournaliere(models.Model):
    date = models.DateField(unique=True)
    montant_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def calculer_depenses(self):
        depenses = Depense.objects.filter(date=self.date)
        self.montant_total = sum(d.montant for d in depenses)
        self.save()
        return self.montant_total

class CommissionChauffeur(models.Model):
    chauffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, limit_choices_to={'role': 'chauffeur'})
    periode_debut = models.DateField()
    periode_fin = models.DateField()
    recettes_realisees = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    taux_commission = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    montant_commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    est_paye = models.BooleanField(default=False)
    # date_paiement = models.DateField(null=True, blank=True)
    # date_creation = models.DateTimeField(auto_now_add=True)  # COMMENTE IZAO

    def calculer_commission(self):
        self.montant_commission = (self.recettes_realisees * self.taux_commission) / 100
        return self.montant_commission

    def __str__(self):
        return f"{self.chauffeur.username} - {self.periode_debut} à {self.periode_fin}"
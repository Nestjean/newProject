from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.response import Response 
from rest_framework import viewsets, status, generics 
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import *
from .serializers import *
from .permissions import *
from rest_framework.views import APIView 
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .models import Utilisateur
from .serializers import UtilisateurSerializer
import random

# Create your views here.

@api_view(['GET'])
def test_api(request):
    return Response({"message": "Hello from Django!"}) 

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly] 

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'chauffeur':
            queryset = queryset.filter(id=self.request.user.id)
        return queryset 
    
    @action(detail=True, methods=['get'])
    def trajets(self, request, pk=None):
        chauffeur = self.get_object()
        trajets = Trajet.objects.filter(chauffeur=chauffeur)
        serializer = TrajetSerializer(trajets, many=True)
        return Response(serializer.data) 

# ========== 1. LOGIN ==========
class LoginView(APIView):
    permission_classes = []  # Pas besoin d'authentification
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Veuillez fournir nom d\'utilisateur et mot de passe'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user and user.est_actif:
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'nom': user.first_name,
                    'prenom': user.last_name,
                }
            })
        elif user and not user.est_actif:
            return Response({
                'error': 'Votre compte est désactivé. Contactez l\'administrateur.'
            }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'error': 'Nom d\'utilisateur ou mot de passe incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)


# ========== 2. INSCRIPTION ==========
class RegisterView(APIView):
    permission_classes = []  # Pas besoin d'authentification
    
    def post(self, request):
        # Vérifier si l'utilisateur existe déjà
        username = request.data.get('username')
        email = request.data.get('email')
        
        if Utilisateur.objects.filter(username=username).exists():
            return Response({
                'error': 'Ce nom d\'utilisateur existe déjà'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if Utilisateur.objects.filter(email=email).exists():
            return Response({
                'error': 'Cet email est déjà utilisé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer l'utilisateur (par défaut rôle chauffeur)
        serializer = UtilisateurSerializer(data={
            'username': username,
            'email': email,
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'role': 'chauffeur',  # Par défaut chauffeur
            'telephone': request.data.get('telephone', ''),
            'mot_de_passe': request.data.get('password')
        })
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Générer les tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Inscription réussie',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'nom': user.first_name,
                    'prenom': user.last_name,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Données invalides',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ========== 3. MOT DE PASSE OUBLIÉ - Étape 1 ==========
class PasswordResetRequestView(APIView):
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Veuillez fournir votre email'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Utilisateur.objects.get(email=email)
            
            # Générer un code de réinitialisation (6 chiffres)
            reset_code = str(random.randint(100000, 999999))
            
            # Stocker le code en session ou en cache (ici on utilise une variable simple)
            # En production, utilisez Redis ou un modèle dédié
            request.session['reset_code'] = reset_code
            request.session['reset_email'] = email
            
            # Envoyer l'email avec le code
            send_mail(
                subject='Réinitialisation de votre mot de passe',
                message=f"""
                Bonjour {user.username},
                
                Vous avez demandé la réinitialisation de votre mot de passe.
                Voici votre code de vérification : {reset_code}
                
                Ce code est valable pendant 15 minutes.
                
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                
                Cordialement,
                L'équipe Coopérative Transport
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'Un code de réinitialisation a été envoyé à votre email',
                'email': email
            })
            
        except Utilisateur.DoesNotExist:
            # Pour des raisons de sécurité, on retourne le même message
            return Response({
                'success': True,
                'message': 'Si cet email existe, un code de réinitialisation a été envoyé'
            })


# ========== 4. MOT DE PASSE OUBLIÉ - Étape 2 (Confirmation) ==========
class PasswordResetConfirmView(APIView):
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validation
        if not all([email, code, new_password, confirm_password]):
            return Response({
                'error': 'Tous les champs sont requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                'error': 'Les mots de passe ne correspondent pas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                'error': 'Le mot de passe doit contenir au moins 6 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier le code (en production, vérifiez avec session/cache)
        stored_code = request.session.get('reset_code')
        stored_email = request.session.get('reset_email')
        
        if not stored_code or not stored_email:
            return Response({
                'error': 'Aucune demande de réinitialisation en cours'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if stored_email != email or stored_code != code:
            return Response({
                'error': 'Code invalide ou expiré'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Utilisateur.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Nettoyer la session
            del request.session['reset_code']
            del request.session['reset_email']
            
            return Response({
                'success': True,
                'message': 'Mot de passe réinitialisé avec succès'
            })
            
        except Utilisateur.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=True, methods=['get'])
    def historique_trajets(self, request, pk=None):
        vehicule = self.get_object()
        trajets = Trajet.objects.filter(vehicule=vehicule)
        serializer = TrajetSerializer(trajets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def depenses(self, request, pk=None):
        vehicule = self.get_object()
        depenses = Depense.objects.filter(vehicule=vehicule)
        serializer = DepenseSerializer(depenses, many=True)
        return Response(serializer.data)
    


class TrajetViewSet(viewsets.ModelViewSet):
    queryset = Trajet.objects.all() 
    serializer_class = TrajetSerializer
    permission_classes = [IsAuthenticated, IsAdminOrCaissier]

    def perform_create(self, serializer):
        trajet = serializer.save()
        # Mettre à jour l'état du véhicule
        trajet.vehicule.etat = 'en_trajet'
        trajet.vehicule.save()


        # Mettre à jour ou créer la recette journalière
        recette_jour, _ = RecetteJournaliere.objects.__getitem__or_create(date=trajet.date)
        recette_jour.calculer_recette() 
    
    def perform_update(self, serializer):
        trajet = serializer.save()
        if trajet.statut == 'termine':
            trajet.vehicule.etat = 'disponible'
            trajet.vehicule.save()
        # Recalculer les recettes
        recette_jour = RecetteJournaliere.objects.get_or_create(date=trajet.date)[0]
        recette_jour.calculer_recette()

    
    @action(detail=False, methods=['get'])
    def par_periode(self, request):
        debut = request.query_params.get('debut')
        fin = request.query_params.get('fin')

        if debut and fin:
            trajets = self.queryset.filter(date__range=[debut, fin])
        else:
            trajets = self.queryset
        
        serializer = self.get_serializer(trajets, many=True)
        return Response(serializer.data) 
    
    @action(detail=False, methods=['get']) 
    def statistiques(self, request):
        mois = int(request.query_params.get('mois', timezone.now().month))
        annee = int(request.query_params.get('annee', timezone.now().year)) 

        trajets = Trajet.objects.filter(date__year=annee, date__month=mois, statut='termine')

        stats = {
            'total_trajets': trajets.count(),
            'total_passagers': trajets.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or o,
            'recettes_totales': sum(t.recette() for t in trajets),
            'destination_populaire': trajets.values('destination').annotate(count=Count('id')).order_by('-count').first(),
            'moyenne_passagers_par_trajet': trajets.aggregate(Avg('nombre_passagers'))['nombre_passagers__avg'] or 0,
        }
        return Response(stats)

class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer 
    permission_classes = [IsAuthenticated, IsAdminOrCaissier]

    def perform_create(self, serializer):
        depense = serializer.save()

        # Mettre à jour les dépenses journalières
        depense_jour, _ = DepenseJournaliere.objects.get_or_create(date=depense.date)
        depense_jour.calculer_depenses()
    
    @action(detail=False, methods=['get'])
    def par_categorie(self, request):
        mois = int(request.query_params.get('mois', timezone.now().month)) 
        annee = int(request.query_params.get('annee', timezone.now().year)) 
        depenses = Depense.objects.filter(date__year=annee, date__month=mois)
        categories = {} 

        for type_choice in Depense.TYPE_CHOICES:
            type_key = type_choice[0]
            total = depenses.filter(type=type_key).aggregate(Sum('montant'))['montant__sum'] or 0
            categories[type_key] = total 
        
        return Response(categories) 

class DashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardSerializer

    def get(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1) 

        # Deonnées du jour 
        trajets_jour = Trajet.objects.filter(date=today, statut='termine')
        depenses_jour = Depense.objects.filter(date=today)

        recettes_jour = sum(t.recette() for t in trajets_jour)
        depenses_jour_total = depenses_jour.aggregate(Sum('montant'))['montant_sum'] or 0

        # Données du mois
        trajets_mois = Trajet.objects.filter(date__gte=start_of_month, statut='termine')
        depenses_mois = Depense.objects.filter(date__gte=start_of_month) 

        recettes_mois = sum(t.recette() for t in trajets_mois)
        depenses_mois_total = depenses_mois.aggregate(Sum('montant'))['montant__sum'] or 0 


        data = {
            'recettes_jour': recettes_jour,
            'depenses_jour': depenses_jour_total,
            'benefice_jour': recettes_jour - depenses_jour_total,
            'recettes_mois': recettes_mois,
            'depenses_mois': depenses_mois_total,
            'benefice_mois': recettes_mois - depenses_mois_total,
            'nombre_trajets_jour': trajets_jour.count(),
            'nombre_trajets_mois': trajets_mois.count(),
            'passagers_total_jour': trajets_jour.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'passagers_total_mois': trajets_mois.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'chauffeurs_actifs': Utilisateur.objects.filter(role='chauffeur', est_actif=True).count(),
            'vehicules_disponibles': Vehicule.objects.filter(etat='disponible').count(),

        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data) 

class RapportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrCaissier] 

    def get(self, request, periode):
        today = timezone.now().date()

        if periode == 'journalier':
            date = request.query_params.get('date', today)
            return self.rapport_journalier(date)
        elif periode == 'hebdomadaire':
            date = request.query_params.get('date', today)
            return self.rapport_hebdomadaire(date)
        elif periode == 'mensuel':
            mois = int(request.query_params.get('mois', today.month))
            annee = int(request.query_params.get('annee', today.year))
            return self.rapport_mensuel(mois, annee) 
        
        elif periode == 'annuel':
            annee = int(request.query_params.get('annee', today.year))
            return self.rapport_annuel(annee)
        else:
            return Response({'error': 'Période invalide'}, status=400) 

    def rapport_journalier(self, date):
        trajets = Trajet.objects.filter(date=date, statut='termine')
        depenses = Depense.objects.filter(date=date)
        recettes = sum(t.recette() for t in trajets) 
        depenses_total = depenses.aggregate(Sum('montant'))['montant__sum'] or 0

        return Response({
            'date': date,
            'recettes': recettes,
            'depenses': depenses_total,
            'benefice': recettes - depenses_total,
            'nombre_trajets': trajets.count(),
            'nombre_passagers': trajets.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'details_trajets': TrajetSerializer(trajets, many=True).data, 
            'details_depenses': DepenseSerializer(depenses, many=True).data,
        }) 
    

    def rapport_hebdomadaire(self, date):
        # Calculer la semaine
        start_of_week = date - timedelta(days=date.weekday()) 
        end_of_week = start_of_week + timedelta(days=6)

        trajets = Trajet.objects.filter(date__range=[start_of_week, end_of_week], statut='termine') 
        depenses = Depense.objects.filter(date__range=[start_of_week, end_of_week]) 

        recettes = sum(t.recette() for t in trajets)
        depenses_total = depenses.aggregate(Sum('montant'))['montant__sum'] or 0

        # Statistiques par jour 
        stats_par_jour = {}
        for i in range(7):
                jour = start_of_week + timedelta(days=i)
                trajets_jour = trajets.filter(date=jour)
                depenses_jour = depenses.filter(date=jour)
                stats_par_jour[jour.isoformat()] = {
                    'recettes': sum(t.recette() for t in trajets_jour),
                    'depenses': depenses_jour.aggregate(Sum('montant'))['montant__sum'] or 0,
                    'trajets': trajets_jour.count(),
                }
        return Response({
             'debut_semaine': start_of_week,
             'fin_semaine': end_of_week,
             'recettes_totales': recettes,
             'depenses_totales': depenses_total,
             'benefice_total': recettes - depenses_total,
             'stats_par_jour': stats_par_jour,})   
    
    def rapport_mensuel(self, mois, annee):
        import calendar 
        from datetime import date

        dernier_jour = calendar.monthrange(annee, mois)[1]
        start_date = date(annee, mois, 1) 
        end_date = date(annee, mois, dernier_jour) 

        trajets = Trajet.objects.filter(date__range=[start_date, end_date], statut='termine') 
        depenses = Depense.objects.filter(date__range=[start_date, end_date]) 

        recettes = sum(t.recette() for t in trajets) 
        depenses_total = depenses.aggregate(Sum('montant'))['montant__sum'] or 0 

        # Performance par véhicule 
        performance_vehicules = []
        for vehicule in Vehicule.objects.all():
            trajets_vehicule = trajets.filter(vehicule=vehicule)
            recettes_vehicule = sum(t.recette() for t in trajets_vehicule)
            if recettes_vehicule > 0:
                performance_vehicules.append({
                    'vehicule': vehicule.immatriculation,
                    'trajets': trajets_vehicule.count(),
                    'recettes': recettes_vehicule,
                }) 
        
        return Response({
            'mois': mois,
            'annee': annee,
            'recettes_totales': recettes, 
            'depenses_totales': depenses_total,
            'benefice_total': recettes - depenses_total,
            'nombre_trajets': trajets.count(),
            'nombre_passagers': trajets.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'performance_vehicules': performance_vehicules,
            'details_depenses_par_type': DepenseViewSet().par_categorie(request=None).data,
        })
    
    def rapport_annuel(self, annee):
        start_date = date(annee, 1, 1)
        end_date = date(annee, 12, 31)

        trajets = Trajet.objects.filter(date__range=[start_date, end_date], statut='termine')
        depenses = Depense.objects.filter(date__range=[start_date, end_date])

        recettes = sum(t.recette() for t in trajets)
        depenses_total = depenses.aggregate(Sum('montant'))['montant__sum'] or 0 

        # Statistiques mensuelles
        stats_mensuelles = {}
        for mois in range(1, 13):
            trajets_mois = trajets.filter(date__month=mois)
            depenses_mois = depenses.filter(date__month=mois)
            recettes_mois = sum(t.recette() for t in trajets_mois)
            stats_mensuelles[mois] = {
                'recettes': recettes_mois,
                'depenses': depenses_mois.aggregate(Sum('montant'))['montant__sum'] or 0,
                'benefice': recettes_mois - (depenses_mois.aggregate(Sum('montant'))['montant__sum'] or 0), 
                'trajets': trajets_mois.count(),
            }
        return Response({
            'annee': annee,
            'recettes_totales': recettes,
            'depenses_totales': depenses_total,
            'benefice_total': recettes - depenses_total,
            'stats_mensuelles': stats_mensuelles,
        })


class CommissionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrCaissier]

    def get(self, request):
        chauffeur_id = request.query_params.get('chauffeur')
        if chauffeur_id:
            commissions = CommissionChauffeur.objects.filter(chauffeur_id=chauffeur_id)
        else:
            commissions = CommissionChauffeur.objects.all()
        serializer = CommissionChauffeurSerializer(commissions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Calculer les commissions pour une période"""
        mois = int(request.data.get('mois', timezone.now().month))
        annee = int(request.data.get('annee', timezone.now().year))
        taux = float(request.data.get('taux', 10)) 

        start_date = date(annee, mois, 1)
        if mois == 12:
            end_date = date(annee+1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(annee, mois+1, 1) - timedelta(days=1)
        
        chauffeurs = Utilisateur.objects.filter(role='chauffeur', est_actif=True)

        commissions_crees = []

        for chauffeur in chauffeurs:
            trajets = Trajet.objects.filter(
                chauffeur=chauffeur,
                date__range=[start_date, end_date],
                statut='termine'
            )
            recettes = sum(t.recette() for t in trajets)

            commission, created = CommissionChauffeur.objects.get_or_create(
                chauffeur=chauffeur,
                periode_debut=start_date,
                periode_fin=end_date,
                defaults={
                    'recettes_realisees': recettes,
                    'taux_commission': taux,
                }
            )

            if not created:
                commision.recettes_realisees = recettes
                commission.taux_commission = taux
            
            commission.calculer_commission()
            commission.save()
            commissions_crees.append(commission)
        serializer = CommissionChauffeurSerializer(commissions_crees, many=True)
        return Response(serializer.data, status=201)
            
        
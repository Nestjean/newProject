from django.shortcuts import render
from rest_framework.decorators import action, api_view
from rest_framework.response import Response 
from rest_framework import viewsets, status, generics 
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import *
from .serializers import *
from .permissions import *
from rest_framework.views import APIView 
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
import random
import calendar

# ========== TEST API ==========
@api_view(['GET'])
def test_api(request):
    return Response({"message": "API CoopTransport fonctionne correctement!"})

# ========== UTILISATEURS ==========
class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'role') and self.request.user.role == 'chauffeur':
            queryset = queryset.filter(id=self.request.user.id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def trajets(self, request, pk=None):
        chauffeur = self.get_object()
        trajets = Trajet.objects.filter(chauffeur=chauffeur)
        serializer = TrajetSerializer(trajets, many=True)
        return Response(serializer.data)

# ========== LOGIN ==========
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"[LOGIN] Tentative de connexion: username={username}")

        # Validation des champs vides
        if not username or not username.strip():
            return Response({
                'success': False,
                'error': 'Veuillez saisir votre nom d\'utilisateur'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({
                'success': False,
                'error': 'Veuillez saisir votre mot de passe'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Utilisateur.objects.get(username=username)
            print(f"[LOGIN] Utilisateur trouvé: {user.username}, role={user.role}")
            
            # Vérifier si le compte est actif
            if not user.est_actif:
                return Response({
                    'success': False,
                    'error': 'Votre compte est désactivé. Veuillez contacter l\'administrateur.'
                }, status=status.HTTP_403_FORBIDDEN)

            # Vérifier le mot de passe
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                
                print(f"[LOGIN] Connexion réussie pour {user.username}")
                
                return Response({
                    'success': True,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                        'nom': user.last_name,
                        'prenom': user.first_name,
                        'telephone': user.telephone,
                        'est_actif': user.est_actif
                    }
                }, status=status.HTTP_200_OK)

            # Mot de passe incorrect
            print(f"[LOGIN] Mot de passe incorrect pour {user.username}")
            return Response({
                'success': False,
                'error': 'Mot de passe incorrect. Veuillez réessayer.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        except Utilisateur.DoesNotExist:
            print(f"[LOGIN] Utilisateur non trouvé: {username}")
            return Response({
                'success': False,
                'error': 'Nom d\'utilisateur incorrect. Veuillez vérifier.'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
# ========== INSCRIPTION AVEC RÔLE ==========
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        telephone = request.data.get('telephone', '')
        role = request.data.get('role', 'chauffeur')  # Rôle par défaut: chauffeur

        # Validation
        if not username or not email or not password:
            return Response({
                'success': False,
                'error': 'Username, email et mot de passe sont requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({
                'success': False,
                'error': 'Le mot de passe doit contenir au moins 6 caractères'
            }, status=status.HTTP_400_BAD_REQUEST)

        if Utilisateur.objects.filter(username=username).exists():
            return Response({
                'success': False,
                'error': 'Ce nom d\'utilisateur existe déjà'
            }, status=status.HTTP_400_BAD_REQUEST)

        if Utilisateur.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'error': 'Cet email est déjà utilisé'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si le rôle est valide
        valid_roles = ['admin', 'caissier', 'chauffeur']
        if role not in valid_roles:
            role = 'chauffeur'

        try:
            user = Utilisateur.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                telephone=telephone,
                role=role,
                est_actif=True
            )

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
                    'nom': user.last_name,
                    'prenom': user.first_name,
                    'telephone': user.telephone,
                    'est_actif': user.est_actif
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# ========== RAFRAÎCHIR TOKEN ==========
class TokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'detail': 'Refresh token required',
                'code': 'token_not_valid'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'detail': 'Token is invalid or expired',
                'code': 'token_not_valid'
            }, status=status.HTTP_401_UNAUTHORIZED)

# ========== MOT DE PASSE OUBLIÉ ==========
class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Veuillez fournir votre email'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Utilisateur.objects.get(email=email)
            reset_code = str(random.randint(100000, 999999))
            
            request.session['reset_code'] = reset_code
            request.session['reset_email'] = email
            request.session.set_expiry(900)
            
            print(f"Code de réinitialisation pour {email}: {reset_code}")
            
            return Response({
                'success': True,
                'message': 'Un code de réinitialisation a été envoyé à votre email',
                'email': email
            }, status=status.HTTP_200_OK)
            
        except Utilisateur.DoesNotExist:
            return Response({
                'success': True,
                'message': 'Un code de réinitialisation a été envoyé à votre email',
                'email': email
            }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
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
            
            del request.session['reset_code']
            del request.session['reset_email']
            
            return Response({
                'success': True,
                'message': 'Mot de passe réinitialisé avec succès'
            }, status=status.HTTP_200_OK)
            
        except Utilisateur.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)

# ========== VÉHICULES ==========
class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'role') and self.request.user.role == 'chauffeur':
            affectations = Affectation.objects.filter(
                chauffeur=self.request.user, 
                date_fin__isnull=True
            ).values_list('vehicule_id', flat=True)
            queryset = queryset.filter(Q(etat='disponible') | Q(id__in=affectations))
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    'success': True,
                    'message': 'Véhicule créé avec succès',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response({
                    'success': True,
                    'message': 'Véhicule modifié avec succès',
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                'success': True,
                'message': 'Véhicule supprimé avec succès'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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

# ========== TRAJETS ==========
class TrajetViewSet(viewsets.ModelViewSet):
    queryset = Trajet.objects.all().order_by('-date', '-heure_depart')
    serializer_class = TrajetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'role') and self.request.user.role == 'chauffeur':
            queryset = queryset.filter(chauffeur=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    'success': True,
                    'message': 'Trajet créé avec succès',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response({
                    'success': True,
                    'message': 'Trajet modifié avec succès',
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                'success': True,
                'message': 'Trajet supprimé avec succès'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        trajet = serializer.save()
        vehicule = trajet.vehicule
        vehicule.etat = 'en_trajet'
        vehicule.save()
        
        recette_jour, _ = RecetteJournaliere.objects.get_or_create(date=trajet.date)
        recette_jour.calculer_recette()
    
    def perform_update(self, serializer):
        trajet = serializer.save()
        if trajet.status == 'termine':
            vehicule = trajet.vehicule
            vehicule.etat = 'disponible'
            vehicule.save()
        
        recette_jour, _ = RecetteJournaliere.objects.get_or_create(date=trajet.date)
        recette_jour.calculer_recette()

    @action(detail=False, methods=['get'])
    def recent(self, request):
        trajets = self.get_queryset().filter(status='termine')[:5]
        serializer = self.get_serializer(trajets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def par_periode(self, request):
        debut = request.query_params.get('debut')
        fin = request.query_params.get('fin')
        queryset = self.get_queryset()
        if debut and fin:
            queryset = queryset.filter(date__range=[debut, fin])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get']) 
    def statistiques(self, request):
        mois = int(request.query_params.get('mois', timezone.now().month))
        annee = int(request.query_params.get('annee', timezone.now().year))
        trajets = Trajet.objects.filter(date__year=annee, date__month=mois, status='termine')
        stats = {
            'total_trajets': trajets.count(),
            'total_passagers': trajets.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'recettes_totales': float(sum(t.recette() for t in trajets)),
            'destination_populaire': trajets.values('destination').annotate(count=Count('id')).order_by('-count').first(),
            'moyenne_passagers_par_trajet': float(trajets.aggregate(Avg('nombre_passagers'))['nombre_passagers__avg'] or 0),
        }
        return Response(stats)

# ========== DÉPENSES ==========
class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all().order_by('-date')
    serializer_class = DepenseSerializer 
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    'success': True,
                    'message': 'Dépense créée avec succès',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response({
                    'success': True,
                    'message': 'Dépense modifiée avec succès',
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                'success': True,
                'message': 'Dépense supprimée avec succès'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        depense = serializer.save()
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
            categories[type_key] = float(total) 
        return Response(categories)

# ========== DASHBOARD ==========
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)

        trajets_jour = Trajet.objects.filter(date=today, status='termine')
        depenses_jour = Depense.objects.filter(date=today)
        recettes_jour = float(sum(t.recette() for t in trajets_jour))
        depenses_jour_total = float(depenses_jour.aggregate(Sum('montant'))['montant__sum'] or 0)

        trajets_mois = Trajet.objects.filter(date__gte=start_of_month, status='termine')
        depenses_mois = Depense.objects.filter(date__gte=start_of_month)
        recettes_mois = float(sum(t.recette() for t in trajets_mois))
        depenses_mois_total = float(depenses_mois.aggregate(Sum('montant'))['montant__sum'] or 0)

        jours_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        chart_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            trajets_day = Trajet.objects.filter(date=day, status='termine')
            depenses_day = Depense.objects.filter(date=day)
            chart_data.append({
                'day': jours_fr[day.weekday()],
                'recettes': float(sum(t.recette() for t in trajets_day)),
                'depenses': float(depenses_day.aggregate(Sum('montant'))['montant__sum'] or 0)
            })

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
            'chart_data': chart_data
        }
        return Response(data)

# ========== STATISTIQUES HEBDOMADAIRES ==========
class StatsHebdomadairesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        jours_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        weekly_stats = []
        for i in range(7):
            day = start_of_week + timedelta(days=i)
            trajets = Trajet.objects.filter(date=day, status='termine')
            depenses = Depense.objects.filter(date=day)
            weekly_stats.append({
                'jour': jours_fr[i],
                'recettes': float(sum(t.recette() for t in trajets)),
                'depenses': float(depenses.aggregate(Sum('montant'))['montant__sum'] or 0),
                'nombre_trajets': trajets.count()
            })
        return Response(weekly_stats)

# ========== COMMISSIONS ==========
class CommissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chauffeur_id = request.query_params.get('chauffeur')
        if chauffeur_id:
            commissions = CommissionChauffeur.objects.filter(chauffeur_id=chauffeur_id)
        else:
            commissions = CommissionChauffeur.objects.all().order_by('-periode_debut')
        serializer = CommissionChauffeurSerializer(commissions, many=True)
        return Response(serializer.data)

    def post(self, request):
        mois = int(request.data.get('mois', timezone.now().month))
        annee = int(request.data.get('annee', timezone.now().year))
        taux = float(request.data.get('taux', 10))

        dernier_jour = calendar.monthrange(annee, mois)[1]
        start_date = date(annee, mois, 1)
        end_date = date(annee, mois, dernier_jour)

        chauffeurs = Utilisateur.objects.filter(role='chauffeur', est_actif=True)
        commissions_crees = []

        for chauffeur in chauffeurs:
            trajets = Trajet.objects.filter(
                chauffeur=chauffeur,
                date__range=[start_date, end_date],
                status='termine'
            )
            recettes = float(sum(t.recette() for t in trajets))

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
                commission.recettes_realisees = recettes
                commission.taux_commission = taux

            commission.calculer_commission()
            commission.save()
            commissions_crees.append(commission)

        serializer = CommissionChauffeurSerializer(commissions_crees, many=True)
        return Response({
            'success': True,
            'message': 'Commissions calculées avec succès',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        try:
            commission = CommissionChauffeur.objects.get(pk=pk)
            commission.est_paye = True
            commission.save()
            return Response({
                'success': True,
                'message': 'Commission marquée comme payée'
            }, status=status.HTTP_200_OK)
        except CommissionChauffeur.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Commission non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)

# ========== RAPPORTS ==========
class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        periode = request.query_params.get('periode', 'mois')
        today = date.today()
        
        if periode == 'semaine':
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif periode == 'mois':
            start_date = today.replace(day=1)
            end_date = date(today.year, today.month, calendar.monthrange(today.year, today.month)[1])
        elif periode == 'annee':
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 12, 31)
        else:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            if start_date_str and end_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            else:
                return Response({'error': 'Période invalide'}, status=400)

        trajets = Trajet.objects.filter(date__range=[start_date, end_date], status='termine')
        depenses = Depense.objects.filter(date__range=[start_date, end_date])

        recettes_totales = float(sum(t.recette() for t in trajets))
        depenses_totales = float(depenses.aggregate(Sum('montant'))['montant__sum'] or 0)
        benefice_total = recettes_totales - depenses_totales

        jours_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        daily_stats = []
        current_date = start_date
        
        while current_date <= end_date:
            trajets_day = trajets.filter(date=current_date)
            depenses_day = depenses.filter(date=current_date)
            daily_stats.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'jour': jours_fr[current_date.weekday()],
                'recettes': float(sum(t.recette() for t in trajets_day)),
                'depenses': float(depenses_day.aggregate(Sum('montant'))['montant__sum'] or 0),
                'nombre_trajets': trajets_day.count()
            })
            current_date += timedelta(days=1)

        return Response({
            'periode': {
                'debut': start_date.strftime('%Y-%m-%d'),
                'fin': end_date.strftime('%Y-%m-%d')
            },
            'recettes_totales': recettes_totales,
            'depenses_totales': depenses_totales,
            'benefice_total': benefice_total,
            'nombre_trajets': trajets.count(),
            'nombre_passagers': trajets.aggregate(Sum('nombre_passagers'))['nombre_passagers__sum'] or 0,
            'daily_stats': daily_stats
        })
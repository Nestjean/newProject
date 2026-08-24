from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('utilisateurs', UtilisateurViewSet)
router.register('vehicules', VehiculeViewSet)
router.register('trajets', TrajetViewSet)
router.register('depenses', DepenseViewSet)

urlpatterns = [
    path('test/', test_api),
    path('', include(router.urls)),
    
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard/stats-hebdo/', StatsHebdomadairesView.as_view(), name='dashboard_stats_hebdo'),
    path('commissions/', CommissionView.as_view(), name='commissions'),
    path('commissions/<int:pk>/', CommissionView.as_view(), name='commission-detail'),
    path('reports/', ReportView.as_view(), name='reports'),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import * 
from .views import test_api  


router = DefaultRouter()
router.register('utilisateurs', UtilisateurViewSet) 
router.register('vehicules', VehiculeViewSet) 
router.register('trajets', TrajetViewSet) 
router.register('depenses', DepenseViewSet) 


urlpatterns = [
  path('test/', test_api),  
  path('', include(router.urls)),
  path('dashboard/', DashboardView.as_view(), name='dashboard'),
  path('rapports/<str:periode>/', RapportView.as_view(), name='rapports'),
  path('commissions/', CommissionView.as_view(), name='commissions'), 
]
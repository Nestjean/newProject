import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState({
    recettes_jour: 0, depenses_jour: 0, benefice_jour: 0,
    recettes_mois: 0, depenses_mois: 0, benefice_mois: 0,
    nombre_trajets_jour: 0, nombre_trajets_mois: 0,
    passagers_total_jour: 0, chauffeurs_actifs: 0, vehicules_disponibles: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [chartData, setChartData] = useState({ recettes: [0,0,0,0,0,0,0], depenses: [0,0,0,0,0,0,0] });
  const [chartLabels, setChartLabels] = useState(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']);

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboardRes = await api.get('dashboard/');
      const data = dashboardRes.data;
      
      setStats({
        recettes_jour: data.recettes_jour || 0,
        depenses_jour: data.depenses_jour || 0,
        benefice_jour: data.benefice_jour || 0,
        recettes_mois: data.recettes_mois || 0,
        depenses_mois: data.depenses_mois || 0,
        benefice_mois: data.benefice_mois || 0,
        nombre_trajets_jour: data.nombre_trajets_jour || 0,
        nombre_trajets_mois: data.nombre_trajets_mois || 0,
        passagers_total_jour: data.passagers_total_jour || 0,
        chauffeurs_actifs: data.chauffeurs_actifs || 0,
        vehicules_disponibles: data.vehicules_disponibles || 0,
      });

      const trajetsRes = await api.get('trajets/');
      const trajets = trajetsRes.data || [];
      const trajetsTermines = Array.isArray(trajets) ? trajets.filter(t => t.status === 'termine') : [];
      setRecentTrips([...trajetsTermines].reverse().slice(0, 5));

      if (data.chart_data && data.chart_data.length === 7) {
        const recettes7Jours = data.chart_data.map(item => item.recettes);
        const depenses7Jours = data.chart_data.map(item => item.depenses);
        const labels7Jours = data.chart_data.map(item => item.day);
        setChartLabels(labels7Jours);
        setChartData({ recettes: recettes7Jours, depenses: depenses7Jours });
      }
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    setTimeout(() => setAnimate(true), 100);
    
    const interval = setInterval(() => {
      console.log('🔄 Mise à jour automatique du dashboard...');
      fetchDashboardData();
    }, 30000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Rafraîchissement après retour sur l\'onglet');
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 Ar';
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };
  
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';

  const recettesData = chartData?.recettes || [0,0,0,0,0,0,0];
  const depensesData = chartData?.depenses || [0,0,0,0,0,0,0];
  
  const maxValue = Math.max(...recettesData, ...depensesData, 10000);
  const yStep = Math.ceil(maxValue / 4);
  
  const marge = stats.recettes_mois > 0 
    ? ((stats.benefice_mois / stats.recettes_mois) * 100).toFixed(1) 
    : 0;

  if (loading) return <LoadingSpinner message="Chargement de votre tableau de bord..." />;

  return (
    <DashboardLayout>
      <div className={`space-y-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-gray-500">
                Bienvenue, <span className="font-semibold text-gray-700">{user?.prenom || user?.username} {user?.nom || ''}</span> !
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Dernière mise à jour</p>
              <p className="text-sm font-medium text-gray-600">{lastUpdate.toLocaleTimeString('fr-FR')}</p>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <p className="text-red-100 text-xs font-medium">Performance globale</p>
              <p className="text-white text-2xl font-bold">+{marge}%</p>
              <div className="mt-1 h-1 bg-white/30 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: `${marge}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 CARTES SEXY AVEC HOVER EFFECT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Carte 1: Recettes du Jour */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100 text-xs font-medium uppercase tracking-wider">RECETTES DU JOUR</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.recettes_jour)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-red-100">+12% vs hier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-full">Objectif 85%</div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full w-[85%] group-hover:w-[90%] transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 2: Dépenses */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">DÉPENSES</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.depenses_jour)}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-xs text-gray-400">-3% vs hier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-full">Budget 65%</div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full w-[65%] group-hover:w-[70%] transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 3: Bénéfice net (Mois) */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100 text-xs font-medium uppercase tracking-wider">BÉNÉFICE NET (MOIS)</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.benefice_mois)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-red-100">Marge: {marge}%</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-full">Objectif 60%</div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, parseFloat(marge))}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 4: Trajets aujourd'hui */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">TRAJETS AUJOURD'HUI</p>
                  <p className="text-3xl font-bold mt-2">{stats.nombre_trajets_jour}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs text-gray-400">Objectif journalier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-full">20 trajets</div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (stats.nombre_trajets_jour / 20) * 100)}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {stats.passagers_total_jour} passagers transportés
              </p>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Recettes vs Dépenses
              </h2>
              <p className="text-sm text-gray-500 mt-1">Évolution sur les 7 derniers jours</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-3 h-3 bg-red-600 rounded-full ring-2 ring-red-200"></div>
                <span className="text-sm text-gray-600 font-medium">Recettes</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-3 h-3 bg-gray-900 rounded-full ring-2 ring-gray-200"></div>
                <span className="text-sm text-gray-600 font-medium">Dépenses</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line 
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: 'Recettes',
                    data: recettesData,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.05)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#dc2626',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 10,
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: 'Dépenses',
                    data: depensesData,
                    borderColor: '#111827',
                    backgroundColor: 'rgba(17, 24, 39, 0.05)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#111827',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 10,
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12, weight: 'bold' } } },
                  tooltip: { backgroundColor: '#1a1a1a', callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } }
                },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    max: maxValue, 
                    grid: { color: '#e5e7eb' }, 
                    ticks: { callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v, stepSize: yStep } 
                  },
                  x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' }, color: '#6B7280' } }
                },
              }}
            />
          </div>
        </div>

        {/* DERNIERS TRAJETS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Derniers Trajets
              </h2>
              <p className="text-sm text-gray-500 mt-1">Les 5 derniers trajets effectués</p>
            </div>
            <Link to="/dashboard/trajets" className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 group">
              Voir tous 
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentTrips.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400">Aucun trajet enregistré</p>
                <Link to="/dashboard/trajets" className="mt-3 inline-block text-red-500 hover:text-red-600 text-sm font-medium">+ Ajouter un trajet</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Chauffeur</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Recette</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-sm text-gray-600">{formatDate(trip.date)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                            {trip.chauffeur_nom?.[0] || trip.chauffeur?.first_name?.[0] || 'C'}
                          </div>
                          <span className="text-sm text-gray-700">{trip.chauffeur_nom || trip.chauffeur?.username || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{trip.vehicule_immatriculation || '-'}</td>
                      <td className="py-4 px-6 text-right font-semibold text-red-600">{formatCurrency(trip.nombre_passagers * trip.prix_unitaire)}</td>
                      <td className="py-4 px-6 text-center">
                        <Link to={`/dashboard/trajets/${trip.id}`} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
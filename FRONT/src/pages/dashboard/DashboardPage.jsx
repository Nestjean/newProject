import React, { useState, useEffect } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Icons
const TrendingUpIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
  </svg>
);

const WalletIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TrendingIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recettes_jour: 50000,
    depenses_jour: 30000,
    benefice_jour: 20000,
    nombre_trajets_jour: 12,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [animate, setAnimate] = useState(false);

  const lineChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Recettes',
        data: [45000, 52000, 48000, 60000, 75000, 68000, 55000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        tension: 0,
        fill: false,
      },
      {
        label: 'Dépenses',
        data: [25000, 28000, 30000, 32000, 35000, 30000, 25000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        tension: 0,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12, weight: 'bold' } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} Ar` } }
    },
    scales: {
      y: { beginAtZero: true, min: 0, max: 80000, ticks: { stepSize: 20000, callback: (v) => v === 0 ? '0' : v === 20000 ? '20k' : v === 40000 ? '40k' : v === 60000 ? '60k' : '80k' } },
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' }, color: '#6B7280' } }
    },
    elements: { line: { tension: 0 }, point: { radius: 5, hoverRadius: 8 } }
  };

  useEffect(() => {
    fetchDashboardData();
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/');
      const data = response.data;
      setStats({
        recettes_jour: data.recettes_jour || 50000,
        depenses_jour: data.depenses_jour || 30000,
        benefice_jour: data.benefice_jour || 20000,
        nombre_trajets_jour: data.nombre_trajets_jour || 12,
      });
      const tripsResponse = await api.get('/trajets/recent/');
      setRecentTrips(tripsResponse.data);
    } catch (error) {
      setRecentTrips([
        { id: 1, date: '18/04/2024', chauffeur_nom: 'Jean', vehicule_immatriculation: 'Toyota Hiace', recette: 15000 },
        { id: 2, date: '17/04/2024', chauffeur_nom: 'Luc', vehicule_immatriculation: 'Mercedes Sprinter', recette: 20000 },
        { id: 3, date: '16/04/2024', chauffeur_nom: 'Aina', vehicule_immatriculation: 'Nissan Navara', recette: 12000 },
        { id: 4, date: '15/04/2024', chauffeur_nom: 'Mamy', vehicule_immatriculation: 'Hyundai Starex', recette: 18000 },
        { id: 5, date: '14/04/2024', chauffeur_nom: 'Paul', vehicule_immatriculation: 'Renault Trafic', recette: 10000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className={`space-y-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Tableau de bord</h1>
            <p className="text-gray-500">Bienvenue, {user?.prenom || user?.username} {user?.nom || ''} !</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-5 py-2 shadow-lg">
            <p className="text-white text-xs">Performance</p>
            <p className="text-white text-xl font-bold">+24%</p>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Carte 1: Recettes du Jour */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Recettes du Jour</p>
                  <p className="text-2xl font-bold mt-1">{stats.recettes_jour.toLocaleString()} <span className="text-sm font-normal">Ar</span></p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <TrendingUpIcon className="w-3 h-3" />
                <span className="text-xs">+12% vs hier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Objectif 85%</div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 2: Dépenses */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-rose-100 text-xs font-medium">Dépenses</p>
                  <p className="text-2xl font-bold mt-1">{stats.depenses_jour.toLocaleString()} <span className="text-sm font-normal">Ar</span></p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <TrendingDownIcon className="w-3 h-3" />
                <span className="text-xs">-3% vs hier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Budget 65%</div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 3: Bénéfice */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Bénéfice</p>
                  <p className="text-2xl font-bold mt-1">{stats.benefice_jour.toLocaleString()} <span className="text-sm font-normal">Ar</span></p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <TrendingUpIcon className="w-3 h-3" />
                <span className="text-xs">Marge: 40%</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Objectif 60%</div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte 4: Trajets Aujourd'hui */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Trajets Aujourd'hui</p>
                  <p className="text-2xl font-bold mt-1">{stats.nombre_trajets_jour}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <span className="text-xs">Objectif journalier</span>
                <div className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">20 trajets</div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${(stats.nombre_trajets_jour / 20) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Recettes vs Dépenses</h2>
              <p className="text-sm text-gray-500">Évolution sur la semaine</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Recettes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Dépenses</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        {/* DERNIERS TRAJETS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Derniers Trajets</h2>
              <p className="text-sm text-gray-500">Les 5 derniers trajets effectués</p>
            </div>
            <Link to="/trips" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Voir tous <span>→</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Chauffeur</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Recette</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                 </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">{trip.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {trip.chauffeur_nom?.[0] || 'J'}
                        </div>
                        <span className="text-sm text-gray-700">{trip.chauffeur_nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{trip.vehicule_immatriculation}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">{trip.recette?.toLocaleString()} Ar</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STATS SUPPLEMENTAIRES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Chauffeurs actifs</h3>
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-indigo-200 text-sm">sur 12 chauffeurs totaux</p>
            <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
              <div className="h-full bg-white rounded-full w-[66%]"></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold">Objectif du mois</h3>
              </div>
              <p className="text-2xl font-bold">1 250 000 Ar</p>
              <p className="text-amber-200 text-sm">Objectif de recettes mensuelles</p>
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="h-full bg-white rounded-full w-[52%]"></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>52% atteint</span>
                  <span>650k / 1 250k Ar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
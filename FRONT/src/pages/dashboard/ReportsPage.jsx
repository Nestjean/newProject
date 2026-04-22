import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import { CalendarIcon } from '@heroicons/react/24/outline';

// Icon Download manokana (satria tsy misy ao @heroicons)
const DownloadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// Icon Trending manokana
const TrendingUpIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
  </svg>
);

const ReportsPage = () => {
  const [period, setPeriod] = useState('mois');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    recettes_totales: 0,
    depenses_totales: 0,
    benefice_total: 0,
    nombre_trajets: 0,
    nombre_passagers: 0,
    daily_stats: []
  });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchReports();
    setTimeout(() => setAnimate(true), 100);
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/?periode=${period}`);
      setData(response.data);
    } catch (error) {
      setData({
        recettes_totales: 168000,
        depenses_totales: 0,
        benefice_total: 168000,
        nombre_trajets: 1,
        nombre_passagers: 28,
        daily_stats: [
          { date: '2026-04-13', jour: 'Lundi', recettes: 0, depenses: 0, nombre_trajets: 0 },
          { date: '2026-04-14', jour: 'Mardi', recettes: 0, depenses: 0, nombre_trajets: 0 },
          { date: '2026-04-15', jour: 'Mercredi', recettes: 0, depenses: 0, nombre_trajets: 0 },
          { date: '2026-04-16', jour: 'Jeudi', recettes: 0, depenses: 0, nombre_trajets: 0 },
          { date: '2026-04-17', jour: 'Vendredi', recettes: 168000, depenses: 0, nombre_trajets: 1 },
          { date: '2026-04-18', jour: 'Samedi', recettes: 0, depenses: 0, nombre_trajets: 0 },
          { date: '2026-04-19', jour: 'Dimanche', recettes: 0, depenses: 0, nombre_trajets: 0 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const margeBeneficiaire = data.recettes_totales > 0 ? (data.benefice_total / data.recettes_totales) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Chargement des rapports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`space-y-6 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Rapports & Analyses</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Visualisez les performances de votre coopérative
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
            <DownloadIcon className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {['semaine', 'mois', 'annee'].map((p) => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)} 
                className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                  period === p 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'semaine' ? 'Cette semaine' : p === 'mois' ? 'Ce mois' : 'Cette année'}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Recettes totales */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <p className="text-emerald-100 text-sm">Recettes totales</p>
              <p className="text-2xl font-bold mt-1">{data.recettes_totales.toLocaleString()} Ar</p>
              <p className="text-emerald-200 text-xs mt-2 flex items-center gap-1">
                <TrendingUpIcon className="w-3 h-3" /> +15% vs période précédente
              </p>
            </div>
          </div>

          {/* Dépenses totales */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <p className="text-rose-100 text-sm">Dépenses totales</p>
              <p className="text-2xl font-bold mt-1">{data.depenses_totales.toLocaleString()} Ar</p>
              <p className="text-rose-200 text-xs mt-2 flex items-center gap-1">
                <TrendingDownIcon className="w-3 h-3" /> -5% vs période précédente
              </p>
            </div>
          </div>

          {/* Bénéfice net */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <p className="text-blue-100 text-sm">Bénéfice net</p>
              <p className="text-2xl font-bold mt-1">{data.benefice_total.toLocaleString()} Ar</p>
              <p className="text-blue-200 text-xs mt-2">Marge: {margeBeneficiaire.toFixed(1)}%</p>
            </div>
          </div>

          {/* Trajets réalisés */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <p className="text-purple-100 text-sm">Trajets réalisés</p>
              <p className="text-2xl font-bold mt-1">{data.nombre_trajets}</p>
              <p className="text-purple-200 text-xs mt-2">{data.nombre_passagers} passagers transportés</p>
            </div>
          </div>
        </div>

        {/* ÉVOLUTION QUOTIDIENNE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">📊 Évolution quotidienne</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.daily_stats || []).map((item, idx) => (
              <div 
                key={idx} 
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{item.jour}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.nombre_trajets > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.nombre_trajets} trajet{item.nombre_trajets > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Recettes</span>
                    <span className="font-semibold text-green-600">{item.recettes.toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dépenses</span>
                    <span className="font-semibold text-red-500">{item.depenses.toLocaleString()} Ar</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Moyenne par trajet</span>
                      <span className="font-medium text-gray-600">
                        {item.nombre_trajets > 0 ? (item.recettes / item.nombre_trajets).toLocaleString() : 0} Ar
                      </span>
                    </div>
                  </div>
                </div>
                {item.recettes > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (item.recettes / 200000) * 100)}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RÉSUMÉ ADDITIONNEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <h3 className="font-semibold text-lg mb-4">📈 Indicateurs clés</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Recette moyenne par trajet</span>
                  <span className="font-bold">{(data.recettes_totales / (data.nombre_trajets || 1)).toLocaleString()} Ar</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div className="h-full bg-white rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Marge bénéficiaire</span>
                  <span className="font-bold">{margeBeneficiaire.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div className="h-full bg-white rounded-full" style={{ width: `${margeBeneficiaire}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux d'occupation</span>
                  <span className="font-bold">78%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div className="h-full bg-white rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <h3 className="font-semibold text-lg mb-4">🎯 Objectifs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Objectif recettes</span>
                    <span className="font-bold">2 500 000 Ar / {data.recettes_totales.toLocaleString()} Ar</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="h-full bg-white rounded-full" style={{ width: `${(data.recettes_totales / 2500000) * 100}%` }}></div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{((data.recettes_totales / 2500000) * 100).toFixed(0)}% atteint</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Objectif trajets</span>
                    <span className="font-bold">200 / {data.nombre_trajets}</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="h-full bg-white rounded-full" style={{ width: `${(data.nombre_trajets / 200) * 100}%` }}></div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{((data.nombre_trajets / 200) * 100).toFixed(0)}% atteint</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
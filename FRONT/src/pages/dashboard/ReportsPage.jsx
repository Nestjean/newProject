// src/pages/dashboard/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsPage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('mois');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [data, setData] = useState({
    recettes_totales: 0, depenses_totales: 0, benefice_total: 0,
    nombre_trajets: 0, nombre_passagers: 0, daily_stats: []
  });

  useEffect(() => { fetchReports(); setTimeout(() => setAnimate(true), 100); }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/?periode=${period}`);
      setData(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les rapports');
      setData({ recettes_totales: 0, depenses_totales: 0, benefice_total: 0, nombre_trajets: 0, nombre_passagers: 0, daily_stats: [] });
    } finally { setLoading(false); }
  };

  const handleExportPDF = () => {
    window.print();
    toast.success('📄 Page prête pour l\'impression/export PDF');
  };

  const formatCurrency = (amount) => amount ? Number(amount).toLocaleString('fr-FR') + ' Ar' : '0 Ar';
  const margeBeneficiaire = data.recettes_totales > 0 ? (data.benefice_total / data.recettes_totales) * 100 : 0;

  const periodeOptions = [
    { id: 'semaine', label: 'Cette semaine', icon: '📅' },
    { id: 'mois', label: 'Ce mois', icon: '📆' },
    { id: 'annee', label: 'Cette année', icon: '📊' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Chargement des rapports..." />
      </DashboardLayout>
    );
  }

  // ========== ICÔNES SVG ==========
  const PrintIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const TrendingDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
  );

  // Calcul des totaux pour les pourcentages
  const totalRecettesPeriode = data.recettes_totales;
  const nbItems = data.daily_stats?.length || 1;

  return (
    <DashboardLayout>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          button { display: none !important; }
          a { display: none !important; }
          .bg-red-600 { background-color: #dc2626 !important; }
          .bg-gray-900 { background-color: #111827 !important; }
          .bg-black { background-color: #000000 !important; }
          .text-white { color: white !important; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>

      <div className={`space-y-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Rapports & Analyses
              </h1>
              <p className="text-red-100 mt-1 flex items-center gap-2">
                <CalendarIcon />
                Visualisez les performances de votre coopérative
              </p>
            </div>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all font-medium shadow-md no-print">
              <PrintIcon />
              Exporter / Imprimer
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {periodeOptions.map((p) => (
              <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${period === p.id ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <CalendarIcon />
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="print-area">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Recettes totales</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.recettes_totales)}</p>
              <div className="mt-4"><div className="h-1.5 bg-white/30 rounded-full"><div className="h-full bg-white rounded-full w-3/4"></div></div></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Dépenses totales</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.depenses_totales)}</p>
              <div className="mt-4"><div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full w-1/2"></div></div></div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Bénéfice net</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.benefice_total)}</p>
              <p className="text-xs text-red-100 mt-2">Marge: {margeBeneficiaire.toFixed(1)}%</p>
              <div className="mt-4"><div className="h-1.5 bg-white/30 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, margeBeneficiaire)}%` }}></div></div></div>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Trajets réalisés</p>
              <p className="text-3xl font-bold mt-2">{data.nombre_trajets}</p>
              <p className="text-xs text-gray-400 mt-2">{data.nombre_passagers.toLocaleString()} passagers</p>
              <div className="mt-4"><div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full w-2/3"></div></div></div>
            </div>
          </div>

          {/* ========== TABLEAU D'ÉVOLUTION (au lieu des cartes) ========== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Évolution {period === 'semaine' ? 'quotidienne' : period === 'mois' ? 'hebdomadaire' : 'mensuelle'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Détail des performances par période</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Période</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Recettes</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Dépenses</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Bénéfice</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Trajets</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Passagers</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.daily_stats && data.daily_stats.length > 0 ? (
                    data.daily_stats.map((item, idx) => {
                      const recetteMoyenne = totalRecettesPeriode / nbItems;
                      const pourcentage = recetteMoyenne > 0 ? (item.recettes / recetteMoyenne) * 100 : 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{item.jour}</span>
                              <span className="text-xs text-gray-400">{item.date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-semibold text-red-600">{formatCurrency(item.recettes)}</span>
                            <div className="text-xs text-gray-400 mt-1">
                              {pourcentage > 100 ? '+' : ''}{pourcentage.toFixed(0)}% vs moyenne
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right text-gray-600">{formatCurrency(item.depenses)}</td>
                          <td className="py-4 px-6 text-right font-semibold text-green-600">{formatCurrency(item.recettes - item.depenses)}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {item.nombre_trajets}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              {item.nombre_passagers || (item.recettes > 0 ? Math.round(item.recettes / 6000) : 0)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, pourcentage)}%` }}></div>
                              </div>
                              <span className="text-xs font-medium text-gray-600 w-10">{Math.min(100, pourcentage).toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>Aucune donnée disponible pour cette période</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== RÉSUMÉ ADDITIONNEL ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">📈 Indicateurs clés</h3>
              <div className="space-y-4">
                <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Recette moyenne par trajet</span><span className="font-bold text-white">{(data.recettes_totales / (data.nombre_trajets || 1)).toLocaleString()} Ar</span></div><div className="w-full bg-white/20 rounded-full h-1.5"><div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }}></div></div></div>
                <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Marge bénéficiaire</span><span className="font-bold text-white">{margeBeneficiaire.toFixed(1)}%</span></div><div className="w-full bg-white/20 rounded-full h-1.5"><div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, margeBeneficiaire)}%` }}></div></div></div>
                <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Passagers par trajet</span><span className="font-bold text-white">{(data.nombre_passagers / (data.nombre_trajets || 1)).toFixed(1)}</span></div><div className="w-full bg-white/20 rounded-full h-1.5"><div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }}></div></div></div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">🎯 Objectifs</h3>
                <div className="space-y-4">
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-red-100">Objectif recettes</span><span className="font-bold">2 500 000 Ar</span></div><div className="w-full bg-white/30 rounded-full h-2"><div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (data.recettes_totales / 2500000) * 100)}%` }}></div></div><p className="text-xs mt-1 text-red-200">{((data.recettes_totales / 2500000) * 100).toFixed(0)}% atteint</p></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-red-100">Objectif trajets</span><span className="font-bold">200 trajets</span></div><div className="w-full bg-white/30 rounded-full h-2"><div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (data.nombre_trajets / 200) * 100)}%` }}></div></div><p className="text-xs mt-1 text-red-200">{((data.nombre_trajets / 200) * 100).toFixed(0)}% atteint</p></div>
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
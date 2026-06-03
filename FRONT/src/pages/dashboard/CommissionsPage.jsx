// src/pages/dashboard/CommissionsPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/commissions/');
      setCommissions(res.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setCommissions([]);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCommissions = async () => {
    setLoading(true);
    try {
      await api.post('/commissions/', { mois: selectedMonth, annee: selectedYear });
      toast.success('✅ Commissions générées');
      await fetchCommissions();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCommission = async (id) => {
    setLoading(true);
    try {
      await api.put(`/commissions/${id}/`, { est_paye: true });
      toast.success('✅ Commission payée');
      await fetchCommissions();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 Ar';
    return `${Number(amount).toLocaleString('fr-FR')} Ar`;
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.montant_commission || 0), 0);
  const pendingCommissions = commissions.filter(c => !c.est_paye).reduce((sum, c) => sum + Number(c.montant_commission || 0), 0);
  const paidCommissions = commissions.filter(c => c.est_paye).reduce((sum, c) => sum + Number(c.montant_commission || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Chargement des commissions..." />
      </DashboardLayout>
    );
  }

  // Icônes
  const MoneyIcon = () => (
    <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const GenerateIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER - ROUGE */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MoneyIcon />
                Commissions
              </h1>
              <p className="text-red-100 mt-1">Gestion des commissions des chauffeurs</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <CalendarIcon />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-transparent text-white focus:outline-none"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <CalendarIcon />
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-24 bg-transparent text-white focus:outline-none"
                />
              </div>
              <button
                onClick={handleGenerateCommissions}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-red-600 px-5 py-2 rounded-xl hover:bg-gray-100 font-semibold shadow-md transition disabled:opacity-50"
              >
                <GenerateIcon />
                Générer
              </button>
            </div>
          </div>
        </div>

        {/* STATISTIQUES - ERGONOMIE ROUGE/NOIR/BLANC */}
        {commissions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total commissions - ROUGE */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Total commissions</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(totalCommissions)}</p>
                  </div>
                  <MoneyIcon />
                </div>
                <div className="mt-4 h-1.5 bg-white/30 rounded-full"><div className="h-full bg-white rounded-full w-full"></div></div>
              </div>
            </div>

            {/* En attente - NOIR */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">En attente</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(pendingCommissions)}</p>
                  </div>
                  <ClockIcon />
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span className="text-xs text-gray-400">{commissions.filter(c => !c.est_paye).length} commission(s)</span>
                </div>
                <div className="mt-4 h-1.5 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: totalCommissions > 0 ? (pendingCommissions / totalCommissions) * 100 : 0 }}></div>
                </div>
              </div>
            </div>

            {/* Déjà payées - VERT FONCÉ (ou ROUGE selon ergonomie) */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Déjà payées</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(paidCommissions)}</p>
                  </div>
                  <CheckIcon />
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span className="text-xs text-green-200">{commissions.filter(c => c.est_paye).length} commission(s)</span>
                </div>
                <div className="mt-4 h-1.5 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: totalCommissions > 0 ? (paidCommissions / totalCommissions) * 100 : 0 }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLEAU - BLANC avec bordures rouges */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-bold text-lg text-gray-900">Liste des commissions</h3>
            <p className="text-sm text-gray-500 mt-1">Période : {months[selectedMonth - 1]} {selectedYear}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Chauffeur</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Recettes</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Taux</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Commission</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.length > 0 ? (
                  commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                            {c.chauffeur_nom?.[0] || 'C'}
                          </div>
                          <span className="font-semibold text-gray-900">{c.chauffeur_nom || 'Chauffeur'}</span>
                        </div>
                       </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-700">{formatCurrency(c.recettes_realisees)}</td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {c.taux_commission || 0}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-red-600 text-lg">{formatCurrency(c.montant_commission)}</td>
                      <td className="py-4 px-6 text-center">
                        {c.est_paye ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckIcon /> Payée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <ClockIcon /> En attente
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {!c.est_paye && (
                          <button
                            onClick={() => handlePayCommission(c.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 mx-auto"
                          >
                            <CheckIcon /> Marquer payée
                          </button>
                        )}
                        {c.est_paye && (
                          <span className="text-green-600 text-sm flex items-center justify-center gap-1">
                            <CheckIcon /> Payé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500">Aucune commission disponible</p>
                        <button
                          onClick={handleGenerateCommissions}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <GenerateIcon /> Générer des commissions
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFORMATION - quand aucune commission */}
        {commissions.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-800">Aucune commission pour le moment</h3>
            <p className="text-sm text-blue-600 mt-2">
              Cliquez sur "Générer" pour calculer les commissions des chauffeurs pour la période sélectionnée.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommissionsPage;
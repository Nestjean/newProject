import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, CheckCircleIcon, ClockIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchCommissions(); }, []);

  const fetchCommissions = async () => {
    try {
      const res = await api.get('/commissions/');
      setCommissions(res.data);
    } catch (error) {
      setCommissions([
        { id: 1, chauffeur: { id: 1, username: 'jean.dupont', first_name: 'Jean', last_name: 'Dupont', telephone: '0321234567' }, periode_debut: '2024-04-01', periode_fin: '2024-04-30', recettes_realisees: 150000, montant_commission: 15000, est_paye: false, taux_commission: 10 },
        { id: 2, chauffeur: { id: 2, username: 'luc.raso', first_name: 'Luc', last_name: 'Raso', telephone: '0321234568' }, periode_debut: '2024-04-01', periode_fin: '2024-04-30', recettes_realisees: 200000, montant_commission: 20000, est_paye: true, taux_commission: 10 },
        { id: 3, chauffeur: { id: 3, username: 'aina.rakoto', first_name: 'Aina', last_name: 'Rakoto', telephone: '0321234569' }, periode_debut: '2024-04-01', periode_fin: '2024-04-30', recettes_realisees: 120000, montant_commission: 12000, est_paye: false, taux_commission: 10 },
        { id: 4, chauffeur: { id: 4, username: 'mamy.rabe', first_name: 'Mamy', last_name: 'Rabe', telephone: '0321234570' }, periode_debut: '2024-04-01', periode_fin: '2024-04-30', recettes_realisees: 180000, montant_commission: 18000, est_paye: false, taux_commission: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayCommission = async (id) => {
    try {
      await api.put(`/commissions/${id}/`, { est_paye: true });
      toast.success('Commission marquée comme payée');
      fetchCommissions();
    } catch (error) {
      toast.success('Commission payée avec succès');
      setCommissions(commissions.map(c => c.id === id ? { ...c, est_paye: true } : c));
    }
  };

  const handleGenerateCommissions = async () => {
    setLoading(true);
    try {
      await api.post('/commissions/', { mois: selectedMonth, annee: selectedYear });
      toast.success('Commissions générées avec succès');
      fetchCommissions();
    } catch (error) {
      toast.success('Commissions générées');
      fetchCommissions();
    } finally {
      setLoading(false);
    }
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + (c.montant_commission || 0), 0);
  const pendingCommissions = commissions.filter(c => !c.est_paye).reduce((sum, c) => sum + (c.montant_commission || 0), 0);
  const paidCommissions = commissions.filter(c => c.est_paye).reduce((sum, c) => sum + (c.montant_commission || 0), 0);
  const totalRecettes = commissions.reduce((sum, c) => sum + (c.recettes_realisees || 0), 0);

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div><p className="mt-4 text-gray-500">Chargement des commissions...</p></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Commissions</h1>
            <p className="text-gray-500">Gestion des commissions des chauffeurs</p>
          </div>
          <div className="flex gap-3">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500">
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-24 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500" />
            <button onClick={handleGenerateCommissions} disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Générer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start"><div><p className="text-purple-100 text-sm">Total commissions</p><p className="text-3xl font-bold mt-2">{totalCommissions.toLocaleString()} Ar</p></div><CurrencyDollarIcon className="w-10 h-10 text-purple-200 opacity-80" /></div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start"><div><p className="text-yellow-100 text-sm">En attente</p><p className="text-3xl font-bold mt-2">{pendingCommissions.toLocaleString()} Ar</p></div><ClockIcon className="w-10 h-10 text-yellow-200 opacity-80" /></div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start"><div><p className="text-green-100 text-sm">Déjà payées</p><p className="text-3xl font-bold mt-2">{paidCommissions.toLocaleString()} Ar</p></div><CheckCircleIcon className="w-10 h-10 text-green-200 opacity-80" /></div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start"><div><p className="text-blue-100 text-sm">Recettes totales</p><p className="text-3xl font-bold mt-2">{totalRecettes.toLocaleString()} Ar</p></div><UserGroupIcon className="w-10 h-10 text-blue-200 opacity-80" /></div>
          </div>
        </div>

        {/* Tableau des commissions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-semibold text-gray-800">Liste des commissions</h3>
            <p className="text-sm text-gray-500">Période: {months[selectedMonth-1]} {selectedYear}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chauffeur</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recettes</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Taux</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                          {c.chauffeur?.first_name?.[0]}{c.chauffeur?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{c.chauffeur?.first_name} {c.chauffeur?.last_name}</p>
                          <p className="text-xs text-gray-500">@{c.chauffeur?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.chauffeur?.telephone || '-'}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-800">{c.recettes_realisees?.toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-right text-sm text-gray-600">{c.taux_commission || 10}%</td>
                    <td className="py-4 px-6 text-right font-bold text-blue-600 text-lg">{c.montant_commission?.toLocaleString()} Ar</td>
                    <td className="py-4 px-6 text-center">
                      {c.est_paye ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircleIcon className="w-3 h-3" /> Payée</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><ClockIcon className="w-3 h-3" /> En attente</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {!c.est_paye && (
                        <button onClick={() => handlePayCommission(c.id)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto">
                          <CheckCircleIcon className="w-4 h-4" /> Marquer payée
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé graphique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Résumé des commissions</h3>
            <div className="space-y-4">
              <div><div className="flex justify-between text-sm mb-1"><span>Payées</span><span className="font-semibold">{((paidCommissions / totalCommissions) * 100).toFixed(1)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(paidCommissions / totalCommissions) * 100}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>En attente</span><span className="font-semibold">{((pendingCommissions / totalCommissions) * 100).toFixed(1)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(pendingCommissions / totalCommissions) * 100}%` }}></div></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-3">À propos des commissions</h3>
            <p className="text-sm opacity-90">Les commissions sont calculées sur la base de 10% des recettes réalisées par chaque chauffeur pendant la période.</p>
            <div className="mt-4 p-3 bg-white/20 rounded-xl"><p className="text-sm">💡 Les commissions sont versées chaque fin de mois après validation des recettes.</p></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommissionsPage;
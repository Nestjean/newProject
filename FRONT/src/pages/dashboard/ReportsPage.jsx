import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import html2pdf from 'html2pdf.js';

const ReportsPage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('mois');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [data, setData] = useState({
    recettes_totales: 0, depenses_totales: 0, benefice_total: 0,
    nombre_trajets: 0, nombre_passagers: 0, daily_stats: [],
    periode: { debut: '', fin: '' }
  });

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
      console.error('Erreur:', error);
      toast.error('Impossible de charger les rapports');
    } finally { 
      setLoading(false); 
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 Ar';
    return amount.toLocaleString('fr-FR') + ' Ar';
  };

  const margeBeneficiaire = data.recettes_totales > 0 
    ? (data.benefice_total / data.recettes_totales) * 100 
    : 0;

  const periodeLabel = period === 'semaine' ? 'Cette semaine' : period === 'mois' ? 'Ce mois' : 'Cette année';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  const handleExportPDF = async () => {
    if (data.recettes_totales === 0 && data.depenses_totales === 0) {
      toast.error('Aucune donnée à exporter pour cette période');
      return;
    }

    if (pdfLoading) return;
    setPdfLoading(true);
    toast.loading('Génération du PDF...', { id: 'pdf' });

    try {
      const element = document.createElement('div');
      element.style.padding = '15px';
      element.style.fontFamily = 'Arial, Helvetica, sans-serif';
      element.style.backgroundColor = '#ffffff';
      element.style.width = '200mm';
      
      const tableRows = data.daily_stats && data.daily_stats.length > 0 
        ? data.daily_stats.map(item => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 5px 4px;"><strong>${item.jour}</strong><br><span style="font-size: 7px; color: #6b7280;">${item.date}</span></td>
            <td style="padding: 5px 4px; text-align: right; color: #dc2626;">${formatCurrency(item.recettes)}</td>
            <td style="padding: 5px 4px; text-align: right;">${formatCurrency(item.depenses)}</td>
            <td style="padding: 5px 4px; text-align: right; color: #10b981;">${formatCurrency(item.recettes - item.depenses)}</td>
            <td style="padding: 5px 4px; text-align: center;">${item.nombre_trajets}</td>
           </tr>
        `).join('') 
        : '<tr><td colspan="5" style="padding: 15px; text-align: center; color: #9ca3af;">Aucune donnée disponible</td></tr>';
      
      element.innerHTML = `
        <div style="max-width: 100%; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 18px 20px; text-align: center; border-radius: 12px; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 5px;">
              <img src="/cotisse-logo.png" alt="Cotisse Transport" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; background-color: white; padding: 5px;" />
              <div>
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">COTISSE TRANSPORT</h1>
                <p style="margin: 5px 0 0; font-size: 11px; opacity: 0.9;">Rapport d'activité</p>
              </div>
            </div>
            <p style="margin: 8px 0 0; font-size: 9px; opacity: 0.8;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;">
            <div style="background-color: #f8fafc; padding: 8px 10px; border-radius: 8px; text-align: center; border-left: 3px solid #dc2626;">
              <p style="margin: 0; font-size: 9px; color: #6b7280;">Rapport généré par</p>
              <p style="margin: 3px 0 0; font-size: 11px; font-weight: bold;">${user?.prenom || user?.username} ${user?.nom || ''}</p>
            </div>
            <div style="background-color: #f8fafc; padding: 8px 10px; border-radius: 8px; text-align: center; border-left: 3px solid #dc2626;">
              <p style="margin: 0; font-size: 9px; color: #6b7280;">Période</p>
              <p style="margin: 3px 0 0; font-size: 11px; font-weight: bold;">${periodeLabel}</p>
            </div>
            <div style="background-color: #f8fafc; padding: 8px 10px; border-radius: 8px; text-align: center; border-left: 3px solid #dc2626;">
              <p style="margin: 0; font-size: 9px; color: #6b7280;">Date d'édition</p>
              <p style="margin: 3px 0 0; font-size: 11px; font-weight: bold;">${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 12px; border-radius: 10px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 10px; opacity: 0.9;">RECETTES</p>
              <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold;">${formatCurrency(data.recettes_totales)}</p>
            </div>
            <div style="background: linear-gradient(135deg, #1f2937, #111827); padding: 12px; border-radius: 10px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 10px; opacity: 0.9;">DÉPENSES</p>
              <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold;">${formatCurrency(data.depenses_totales)}</p>
            </div>
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 12px; border-radius: 10px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 10px; opacity: 0.9;">BÉNÉFICE</p>
              <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold;">${formatCurrency(data.benefice_total)}</p>
              <p style="margin: 2px 0 0; font-size: 8px;">Marge ${margeBeneficiaire.toFixed(0)}%</p>
            </div>
            <div style="background: linear-gradient(135deg, #000000, #1f2937); padding: 12px; border-radius: 10px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 10px; opacity: 0.9;">TRAJETS</p>
              <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold;">${data.nombre_trajets}</p>
              <p style="margin: 2px 0 0; font-size: 8px;">${data.nombre_passagers} passagers</p>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <h3 style="margin: 0; font-size: 12px; color: #dc2626;">DÉTAIL DES PERFORMANCES</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
              <thead>
                <tr style="background-color: #dc2626; color: white;">
                  <th style="padding: 6px 4px; text-align: left;">Période</th>
                  <th style="padding: 6px 4px; text-align: right;">Recettes</th>
                  <th style="padding: 6px 4px; text-align: right;">Dépenses</th>
                  <th style="padding: 6px 4px; text-align: right;">Bénéfice</th>
                  <th style="padding: 6px 4px; text-align: center;">Trajets</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>

          <div style="margin-top: 20px; padding: 10px; background-color: #dc2626; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 9px; font-weight: 500;">
              © Cotisse Transport - ${new Date().getFullYear()} - Tous droits réservés
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(element);
      
      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `rapport_${period}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
      
      toast.success('✅ PDF exporté avec succès !', { id: 'pdf' });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF', { id: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

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

  return (
    <DashboardLayout>
      <div className={`space-y-6 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform duration-200">
                <span className="text-red-600 text-xl font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Rapports & Analyses</h1>
                <p className="text-red-100 mt-1">Visualisez les performances de votre coopérative</p>
              </div>
            </div>
            <button 
              onClick={handleExportPDF} 
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200 font-medium shadow-md disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {pdfLoading ? 'Génération...' : 'Exporter PDF'}
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {periodeOptions.map((p) => (
              <button 
                key={p.id} 
                onClick={() => setPeriod(p.id)} 
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 ${
                  period === p.id 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* 4 CARTES AVEC HOVER EFFECT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Recettes totales</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.recettes_totales)}</p>
              <div className="mt-4 h-1.5 bg-white/30 rounded-full">
                <div className="h-full bg-white rounded-full w-3/4 group-hover:w-[85%] transition-all duration-500"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Dépenses totales</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.depenses_totales)}</p>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full w-1/2 group-hover:w-[55%] transition-all duration-500"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Bénéfice net</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.benefice_total)}</p>
              <p className="text-xs text-red-100 mt-2">Marge: {margeBeneficiaire.toFixed(1)}%</p>
              <div className="mt-4 h-1.5 bg-white/30 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, margeBeneficiaire)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Trajets réalisés</p>
              <p className="text-3xl font-bold mt-2">{data.nombre_trajets}</p>
              <p className="text-xs text-gray-400 mt-2">{data.nombre_passagers} passagers</p>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full w-2/3 group-hover:w-[75%] transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Évolution {period === 'semaine' ? 'quotidienne' : period === 'mois' ? 'du mois' : 'annuelle'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Période du {data.periode?.debut ? formatDate(data.periode.debut) : ''} au {data.periode?.fin ? formatDate(data.periode.fin) : ''}
            </p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.daily_stats && data.daily_stats.length > 0 ? (
                  data.daily_stats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{item.jour}</span>
                          <span className="text-xs text-gray-400">{item.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-red-600 group-hover:text-red-700">{formatCurrency(item.recettes)}</td>
                      <td className="py-4 px-6 text-right text-gray-600">{formatCurrency(item.depenses)}</td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600 group-hover:text-green-700">{formatCurrency(item.recettes - item.depenses)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                          {item.nombre_trajets} trajet{item.nombre_trajets > 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">Aucune donnée disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER AVEC HOVER */}
        <div className="bg-red-600 rounded-2xl p-4 text-center cursor-pointer hover:bg-red-700 transition-colors duration-300">
          <p className="text-white text-sm font-medium">
            © Cotisse Transport - {new Date().getFullYear()} - Tous droits réservés
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
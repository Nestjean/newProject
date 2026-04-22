// FRONT/src/pages/dashboard/StatisticsPage.jsx
import { useEffect, useState } from 'react';
import { PieChart, BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StatisticsPage = () => {
  const [depensesParCategorie, setDepensesParCategorie] = useState({});
  const [recettesMensuelles, setRecettesMensuelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statsGlobaux, setStatsGlobaux] = useState({
    totalRecettes: 0,
    totalDepenses: 0,
    totalBenefice: 0,
    totalTrajets: 0,
    totalPassagers: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Récupérer les dépenses par catégorie
      const depensesRes = await api.get(`depenses/par_categorie/?mois=${selectedMonth}&annee=${selectedYear}`);
      setDepensesParCategorie(depensesRes.data);

      // Récupérer les trajets pour les statistiques
      const trajetsRes = await api.get('trajets/');
      const trajets = trajetsRes.data;
      
      // Calculer les recettes mensuelles
      const recettesParMois = Array(12).fill(0);
      trajets.forEach(t => {
        if (t.status === 'termine') {
          const mois = new Date(t.date).getMonth();
          const recette = t.nombre_passagers * t.prix_unitaire;
          recettesParMois[mois] += recette;
        }
      });
      setRecettesMensuelles(recettesParMois);

      // Calculer les statistiques globales
      const totalRecettes = trajets
        .filter(t => t.status === 'termine')
        .reduce((sum, t) => sum + (t.nombre_passagers * t.prix_unitaire), 0);
      
      const depensesResAll = await api.get('depenses/');
      const totalDepenses = depensesResAll.data.reduce((sum, d) => sum + Number(d.montant), 0);
      
      setStatsGlobaux({
        totalRecettes: totalRecettes,
        totalDepenses: totalDepenses,
        totalBenefice: totalRecettes - totalDepenses,
        totalTrajets: trajets.filter(t => t.status === 'termine').length,
        totalPassagers: trajets
          .filter(t => t.status === 'termine')
          .reduce((sum, t) => sum + t.nombre_passagers, 0)
      });

    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      toast.error('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 Ar';
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  // Configuration du graphique Camembert pour les dépenses par catégorie
  const pieChartData = {
    labels: Object.keys(depensesParCategorie).map(key => {
      const labels = {
        carburant: 'Carburant',
        reparation: 'Réparation',
        entretien: 'Entretien',
        assurance: 'Assurance',
        vignette: 'Vignette',
        amende: 'Amende',
        autre: 'Autre'
      };
      return labels[key] || key;
    }),
    datasets: [
      {
        data: Object.values(depensesParCategorie),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(context.raw)}`
        }
      }
    }
  };

  // Configuration du graphique Barres pour les recettes mensuelles
  const barChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Recettes (Ar)',
        data: recettesMensuelles,
        backgroundColor: '#10B981',
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => formatCurrency(context.raw)
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Statistiques & Analyses</h2>
        <p className="text-gray-600 mt-1">Visualisez les performances de votre coopérative</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Période:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {m} - {new Date(2000, m-1, 1).toLocaleString('fr', {month: 'long'})}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-24 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Recettes totales</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(statsGlobaux.totalRecettes)}</p>
            </div>
            <TrendingUp size={28} className="text-white/70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm">Dépenses totales</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(statsGlobaux.totalDepenses)}</p>
            </div>
            <TrendingDown size={28} className="text-white/70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Bénéfice net</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(statsGlobaux.totalBenefice)}</p>
            </div>
            <DollarSign size={28} className="text-white/70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm">Trajets réalisés</p>
              <p className="text-2xl font-bold mt-2">{statsGlobaux.totalTrajets}</p>
            </div>
            <BarChart3 size={28} className="text-white/70" />
          </div>
          <p className="text-amber-100 text-sm mt-2">{statsGlobaux.totalPassagers} passagers</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camembert - Dépenses par catégorie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={22} className="text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Dépenses par catégorie</h3>
          </div>
          <div className="h-96">
            {Object.keys(depensesParCategorie).length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée de dépense pour cette période
              </div>
            )}
          </div>
        </div>

        {/* Graphique barres - Recettes mensuelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={22} className="text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recettes mensuelles</h3>
          </div>
          <div className="h-96">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Tableau récapitulatif mensuel */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Récapitulatif mensuel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Mois</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Recettes</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Performance</th>
              </tr>
            </thead>
            <tbody>
              {recettesMensuelles.map((recette, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {new Date(2000, index, 1).toLocaleString('fr', {month: 'long'})}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-green-600">
                    {formatCurrency(recette)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (recette / Math.max(...recettesMensuelles)) * 100)}%` }}
                      />
                    </div>
                  </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
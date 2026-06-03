// src/pages/dashboard/ExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const [formData, setFormData] = useState({
    type: 'carburant',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    fournisseur: '',
    quantite: '',
    vehicule: '',
    trajet: '',
  });

  // ========== ICÔNES SVG POUR CHAQUE TYPE DE DÉPENSE ==========
  const CarburantIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.121 14 3 3 0 009.88 16.12z" />
    </svg>
  );

  const ReparationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EntretienIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const AssuranceIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const VignetteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );

  const AmendeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const AutreIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );

  // ========== CATEGORIES AVEC ICÔNES SVG ==========
  const categories = [
    { value: 'carburant', label: 'Carburant', icon: <CarburantIcon />, color: 'bg-blue-100 text-blue-700' },
    { value: 'reparation', label: 'Réparation', icon: <ReparationIcon />, color: 'bg-orange-100 text-orange-700' },
    { value: 'entretien', label: 'Entretien', icon: <EntretienIcon />, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'assurance', label: 'Assurance', icon: <AssuranceIcon />, color: 'bg-green-100 text-green-700' },
    { value: 'vignette', label: 'Vignette', icon: <VignetteIcon />, color: 'bg-purple-100 text-purple-700' },
    { value: 'amende', label: 'Amende', icon: <AmendeIcon />, color: 'bg-red-100 text-red-700' },
    { value: 'autre', label: 'Autre', icon: <AutreIcon />, color: 'bg-gray-100 text-gray-700' },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchExpenses(),
      fetchVehicles(),
      fetchTrips()
    ]);
    setLoading(false);
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/depenses/');
      if (response.data && response.data.length > 0) {
        setExpenses(response.data);
        const total = response.data.reduce((sum, e) => sum + (Number(e.montant) || 0), 0);
        setTotalExpenses(total);
      } else {
        setExpenses([]);
        setTotalExpenses(0);
      }
    } catch (error) {
      console.error('Erreur fetch expenses:', error);
      setExpenses([]);
      setTotalExpenses(0);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicules/');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Erreur fetch vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trajets/');
      setTrips(response.data || []);
    } catch (error) {
      console.error('Erreur fetch trips:', error);
      setTrips([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }
    if (!formData.type) {
      toast.error('Veuillez sélectionner un type');
      return;
    }
    if (!formData.date) {
      toast.error('Veuillez saisir une date');
      return;
    }
    if (!formData.vehicule) {
      toast.error('Veuillez sélectionner un véhicule');
      return;
    }

    setLoading(true);
    
    const submitData = {
      type: formData.type,
      montant: parseFloat(formData.montant),
      date: formData.date,
      description: formData.description || '',
      fournisseur: formData.fournisseur || '',
      quantite: formData.quantite ? parseFloat(formData.quantite) : null,
      vehicule: parseInt(formData.vehicule),
      trajet: formData.trajet ? parseInt(formData.trajet) : null
    };

    try {
      if (editingExpense) {
        await api.put(`/depenses/${editingExpense.id}/`, submitData);
        toast.success('✅ Dépense modifiée avec succès');
      } else {
        await api.post('/depenses/', submitData);
        toast.success('✅ Dépense ajoutée avec succès');
      }
      
      await fetchExpenses();
      setShowModal(false);
      setEditingExpense(null);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/depenses/${expenseToDelete.id}/`);
      toast.success('✅ Dépense supprimée avec succès');
      await fetchExpenses();
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      type: expense.type || 'carburant',
      montant: expense.montant || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      description: expense.description || '',
      fournisseur: expense.fournisseur || '',
      quantite: expense.quantite || '',
      vehicule: expense.vehicule?.id || expense.vehicule || '',
      trajet: expense.trajet?.id || expense.trajet || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      type: 'carburant',
      montant: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      fournisseur: '',
      quantite: '',
      vehicule: '',
      trajet: '',
    });
  };

  const getCategoryInfo = (type) => {
    return categories.find(c => c.value === type) || categories[0];
  };

  const getVehicleName = (vehicle) => {
    if (!vehicle) return '-';
    const id = typeof vehicle === 'object' ? vehicle.id : vehicle;
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.marque} ${v.modele} (${v.immatriculation})` : '-';
  };

  const getTripName = (trip) => {
    if (!trip) return '-';
    const id = typeof trip === 'object' ? trip.id : trip;
    const t = trips.find(t => t.id === id);
    return t ? `${t.origine} → ${t.destination} (${t.date})` : '-';
  };

  const filteredExpenses = expenses.filter(e =>
    getCategoryInfo(e.type).label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.fournisseur || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && expenses.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Chargement des dépenses..." />
      </DashboardLayout>
    );
  }

  // ========== ICÔNES SVG POUR LE FORMULAIRE ==========
  const TypeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  );

  const MoneyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const QuantityIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  const SupplierIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const DescriptionIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );

  const VehicleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const TripIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );

  const DateIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-red-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Dépenses
              </h1>
              <p className="text-red-100 mt-1">Gestion des dépenses</p>
            </div>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-white text-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle dépense
            </button>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total des dépenses</p>
              <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString()} <span className="text-sm font-normal">Ar</span></p>
            </div>
            <MoneyIcon />
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une dépense..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </div>

        {/* TABLEAU DES DÉPENSES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Véhicule</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Montant</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p>Aucune dépense trouvée</p>
                      <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-3 text-red-600 hover:text-red-700">+ Ajouter une dépense</button>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => {
                    const catInfo = getCategoryInfo(e.type);
                    return (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-600">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${catInfo.color}`}>
                            {catInfo.icon} {catInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{e.description || '-'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{getVehicleName(e.vehicule)}</td>
                        <td className="py-4 px-6 text-right font-semibold text-red-600">{Number(e.montant).toLocaleString()} Ar</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(e)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(e)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                       </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT/MODIFICATION - FERMABLE TSARA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-zoomIn" onClick={(e) => e.stopPropagation()}>
            {/* HEADER MODAL */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
                    </h2>
                    <p className="text-red-100 text-sm mt-0.5">Remplissez tous les champs obligatoires *</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90 duration-200"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Type de dépense avec icône SVG */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <TypeIcon />
                  Type de dépense <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Montant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <MoneyIcon />
                    Montant (Ar) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Ex: 50 000"
                      value={formData.montant}
                      onChange={(e) => setFormData({...formData, montant: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      required
                      min="0"
                      step="1000"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Ar</span>
                  </div>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <QuantityIcon />
                    Quantité (L/unités)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Ex: 50"
                      value={formData.quantite}
                      onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">unités</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <SupplierIcon />
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du fournisseur"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  />
                </div>

                {/* Véhicule */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <VehicleIcon />
                    Véhicule <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.vehicule}
                    onChange={(e) => setFormData({...formData, vehicule: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  >
                    <option value="">-- Sélectionner un véhicule --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.marque} {v.modele} ({v.immatriculation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Trajet */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <TripIcon />
                    Trajet (optionnel)
                  </label>
                  <select
                    value={formData.trajet}
                    onChange={(e) => setFormData({...formData, trajet: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  >
                    <option value="">-- Non assigné --</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.origine} → {t.destination} ({t.date})</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <DateIcon />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <DescriptionIcon />
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Description détaillée de la dépense..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition resize-none"
                />
              </div>

              {/* BOUTONS */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl transition-all font-semibold shadow-md disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    editingExpense ? '✓ Modifier la dépense' : '✓ Enregistrer la dépense'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION - FERMABLE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-zoomIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-gray-500 mb-4">Êtes-vous sûr de vouloir supprimer cette dépense ?</p>
              <p className="text-sm font-medium text-gray-700 mb-6 bg-gray-100 p-3 rounded-xl">
                Montant: <span className="text-red-600 font-semibold">{Number(expenseToDelete?.montant).toLocaleString()} Ar</span>
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition font-medium">
                  Supprimer
                </button>
                <button onClick={() => { setShowDeleteModal(false); setExpenseToDelete(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition font-medium">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-zoomIn { animation: zoomIn 0.2s ease-out; }
      `}</style>
    </DashboardLayout>
  );
};

export default ExpensesPage;
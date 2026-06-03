// src/pages/dashboard/TripsPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    termine: 0,
    planifie: 0,
    enCours: 0
  });
  
  // ========== OPTIONS POUR LES SÉLECTEURS ==========
  const origineOptions = [
    'Antananarivo', 'Toamasina', 'Mahajanga', 'Fianarantsoa', 
    'Antsirabe', 'Toliara', 'Antsiranana', 'Morondava', 'Manakara'
  ];
  
  const destinationOptions = [
    'Toamasina', 'Mahajanga', 'Fianarantsoa', 'Antsirabe', 
    'Toliara', 'Antsiranana', 'Morondava', 'Manakara', 'Antananarivo'
  ];
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    heure_depart: '08:00',
    heure_arrivee: '',
    destination: '',
    origine: 'Antananarivo',
    vehicule: '',
    chauffeur: '',
    nombre_passagers: 1,
    prix_unitaire: 6000,
    distance: 0,
    status: 'planifie'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTrips(),
      fetchVehicles(),
      fetchDrivers()
    ]);
    setLoading(false);
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trajets/');
      const data = response.data || [];
      setTrips(data);
      
      const termine = data.filter(t => t.status === 'termine').length;
      const planifie = data.filter(t => t.status === 'planifie').length;
      const enCours = data.filter(t => t.status === 'en_cours').length;
      
      setStats({
        total: data.length,
        termine,
        planifie,
        enCours
      });
    } catch (error) {
      console.error('Erreur fetch trips:', error);
      setTrips([]);
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

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/utilisateurs/?role=chauffeur');
      setDrivers(response.data || []);
    } catch (error) {
      console.error('Erreur fetch drivers:', error);
      setDrivers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.vehicule || !formData.chauffeur) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    
    const submitData = {
      date: formData.date,
      heure_depart: formData.heure_depart,
      heure_arrivee: formData.heure_arrivee || null,
      destination: formData.destination,
      origine: formData.origine,
      vehicule: parseInt(formData.vehicule),
      chauffeur: parseInt(formData.chauffeur),
      nombre_passagers: parseInt(formData.nombre_passagers),
      prix_unitaire: parseFloat(formData.prix_unitaire),
      distance: parseFloat(formData.distance) || 0,
      status: formData.status
    };

    try {
      if (editingTrip) {
        await api.put(`/trajets/${editingTrip.id}/`, submitData);
        toast.success('✅ Trajet modifié avec succès');
      } else {
        await api.post('/trajets/', submitData);
        toast.success('✅ Trajet ajouté avec succès');
      }
      
      await fetchTrips();
      setShowModal(false);
      setEditingTrip(null);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/trajets/${tripToDelete.id}/`);
      toast.success('✅ Trajet supprimé avec succès');
      await fetchTrips();
      setShowDeleteModal(false);
      setTripToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      date: trip.date || new Date().toISOString().split('T')[0],
      heure_depart: trip.heure_depart || '08:00',
      heure_arrivee: trip.heure_arrivee || '',
      destination: trip.destination || '',
      origine: trip.origine || 'Antananarivo',
      vehicule: trip.vehicule?.id || trip.vehicule || '',
      chauffeur: trip.chauffeur?.id || trip.chauffeur || '',
      nombre_passagers: trip.nombre_passagers || 1,
      prix_unitaire: trip.prix_unitaire || 6000,
      distance: trip.distance || 0,
      status: trip.status || 'planifie'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTrip(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      heure_depart: '08:00',
      heure_arrivee: '',
      destination: '',
      origine: 'Antananarivo',
      vehicule: '',
      chauffeur: '',
      nombre_passagers: 1,
      prix_unitaire: 6000,
      distance: 0,
      status: 'planifie'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 Ar';
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  // ========== ICÔNES STATUT SVG ==========
  const StatusTermineIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const StatusPlanifieIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const StatusEnCoursIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const StatusAnnuleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const getStatusBadge = (status) => {
    const config = {
      termine: { color: 'bg-green-100 text-green-700', label: 'Terminé', icon: <StatusTermineIcon /> },
      planifie: { color: 'bg-blue-100 text-blue-700', label: 'Planifié', icon: <StatusPlanifieIcon /> },
      en_cours: { color: 'bg-yellow-100 text-yellow-700', label: 'En cours', icon: <StatusEnCoursIcon /> },
      annule: { color: 'bg-red-100 text-red-700', label: 'Annulé', icon: <StatusAnnuleIcon /> }
    };
    return config[status] || config.planifie;
  };

  const filteredTrips = trips.filter(t =>
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.origine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.chauffeur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vehicule_immatriculation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && trips.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Chargement des trajets..." />
      </DashboardLayout>
    );
  }

  // ========== ICÔNES SVG POUR FORMULAIRE ==========
  const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const LocationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const DistanceIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );

  const MoneyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const CarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                <CarIcon />
                Trajets
              </h1>
              <p className="text-red-100 mt-1">Gestion des trajets</p>
            </div>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-white text-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau trajet
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total trajets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <CarIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm">Terminés</p>
                <p className="text-2xl font-bold text-green-600">{stats.termine}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <StatusTermineIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm">Planifiés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planifie}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <StatusPlanifieIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enCours}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <StatusEnCoursIcon />
              </div>
            </div>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un trajet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </div>

        {/* TABLEAU DES TRAJETS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Départ</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Distance</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Chauffeur</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Véhicule</th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Recette</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Aucun trajet trouvé</p>
                      <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-3 text-red-600 hover:text-red-700">+ Nouveau trajet</button>
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((t) => {
                    const statusBadge = getStatusBadge(t.status);
                    return (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(t.date)}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{t.origine || 'Antananarivo'}</td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{t.destination}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{t.distance ? `${t.distance} km` : '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{t.chauffeur_nom || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{t.vehicule_immatriculation || '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">{formatCurrency(t.nombre_passagers * t.prix_unitaire)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(t)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
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

      {/* MODAL AJOUT/MODIFICATION */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-zoomIn" onClick={(e) => e.stopPropagation()}>
            {/* HEADER MODAL */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CarIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingTrip ? 'Modifier le trajet' : 'Ajouter un trajet'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <CalendarIcon />
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <ClockIcon />
                    Heure départ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.heure_depart}
                    onChange={(e) => setFormData({...formData, heure_depart: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Origine - SELECTEUR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <LocationIcon />
                    Origine <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.origine}
                    onChange={(e) => setFormData({...formData, origine: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  >
                    {origineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Destination - SELECTEUR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <LocationIcon />
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  >
                    <option value="">-- Sélectionner une destination --</option>
                    {destinationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <DistanceIcon />
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    placeholder="350"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <UsersIcon />
                    Nombre passagers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.nombre_passagers}
                    onChange={(e) => setFormData({...formData, nombre_passagers: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <MoneyIcon />
                    Prix unitaire (Ar) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="6000"
                      value={formData.prix_unitaire}
                      onChange={(e) => setFormData({...formData, prix_unitaire: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      required
                      min="0"
                      step="100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Ar</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <CarIcon />
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <UsersIcon />
                    Chauffeur <span className="text-red-500">*</span>
                  </label>
                  <select                    value={formData.chauffeur}
                    onChange={(e) => setFormData({...formData, chauffeur: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    required
                  >
                    <option value="">-- Sélectionner un chauffeur --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.first_name} {d.last_name} (@{d.username})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Statut avec icônes SVG */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <ClockIcon />
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <ClockIcon />
                    Heure arrivée (optionnel)
                  </label>
                  <input
                    type="time"
                    value={formData.heure_arrivee}
                    onChange={(e) => setFormData({...formData, heure_arrivee: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  />
                </div>
              </div>

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
                    editingTrip ? '✓ Modifier le trajet' : '✓ Enregistrer le trajet'
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

      {/* MODAL SUPPRESSION */}
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
              <p className="text-gray-500 mb-4">Êtes-vous sûr de vouloir supprimer ce trajet ?</p>
              <p className="text-sm font-medium text-gray-700 mb-6 bg-gray-100 p-3 rounded-xl">
                {tripToDelete?.origine} → {tripToDelete?.destination} ({formatDate(tripToDelete?.date)})
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition font-medium">
                  Supprimer
                </button>
                <button onClick={() => { setShowDeleteModal(false); setTripToDelete(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition font-medium">
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

export default TripsPage;
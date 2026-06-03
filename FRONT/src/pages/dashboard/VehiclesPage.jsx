// src/pages/dashboard/VehiclesPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    immatriculation: '',
    type: 'minibus',
    marque: '',
    modele: '',
    annee_fabrication: new Date().getFullYear(),
    nombre_places: 15,
    etat: 'disponible',
    kilometrage: 0,
    date_achat: new Date().toISOString().split('T')[0],
    prix_achat: 0,
  });

  const marques = ['Toyota', 'Mercedes-Benz', 'Nissan', 'Hyundai', 'Renault', 'Mitsubishi', 'Peugeot', 'Citroën', 'Ford', 'Volkswagen', 'Mazda'];
  const modelesParMarque = {
    'Toyota': ['Hiace', 'Dyna', 'Coaster', 'Land Cruiser', 'Hilux'],
    'Mercedes-Benz': ['Sprinter', 'Vito', 'Citan', 'V-Class'],
    'Nissan': ['Navara', 'Urvan', 'Patrol', 'Civilian'],
    'Hyundai': ['Starex', 'H350', 'County', 'Grand Starex'],
    'Renault': ['Trafic', 'Master', 'Kangoo'],
    'Mitsubishi': ['L300', 'Delica', 'Canter', 'Pajero'],
    'Peugeot': ['Boxer', 'Expert', 'Traveller'],
    'Citroën': ['Jumper', 'Jumpy', 'Spacetourer'],
    'Ford': ['Transit', 'Tourneo', 'Ranger'],
    'Volkswagen': ['Crafter', 'Transporter', 'Multivan'],
    'Mazda': ['BT-50', 'CX-5', 'CX-9']
  };
  
  const typeOptions = [
    { value: 'taxi_brousse', label: 'Taxi Brousse' },
    { value: 'bus', label: 'Bus' },
    { value: 'minibus', label: 'Minibus' }
  ];
  
  const etatOptions = [
    { value: 'disponible', label: 'Disponible', icon: '' },
    { value: 'en_trajet', label: 'En trajet', icon: '' },
    { value: 'en_maintenance', label: 'En maintenance', icon: '' }
  ];
  
  const anneeOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const placesOptions = [5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 25, 30, 35, 40, 45, 50];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicules/');
      if (response.data && Array.isArray(response.data)) {
        setVehicles(response.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Erreur fetch vehicles:', error);
      setVehicles([]);
      toast.error('Impossible de charger les véhicules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.immatriculation.trim()) {
      toast.error('Veuillez saisir une immatriculation');
      return;
    }
    if (!formData.marque) {
      toast.error('Veuillez sélectionner une marque');
      return;
    }
    if (!formData.modele) {
      toast.error('Veuillez sélectionner un modèle');
      return;
    }

    setLoading(true);
    try {
      if (editingVehicle) {
        await api.put(`/vehicules/${editingVehicle.id}/`, formData);
        toast.success('✅ Véhicule modifié avec succès');
      } else {
        await api.post('/vehicules/', formData);
        toast.success('✅ Véhicule ajouté avec succès');
      }
      await fetchVehicles();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/vehicules/${vehicleToDelete.id}/`);
      toast.success('✅ Véhicule supprimé avec succès');
      await fetchVehicles();
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      immatriculation: vehicle.immatriculation || '',
      type: vehicle.type || 'minibus',
      marque: vehicle.marque || '',
      modele: vehicle.modele || '',
      annee_fabrication: vehicle.annee_fabrication || new Date().getFullYear(),
      nombre_places: vehicle.nombre_places || 15,
      etat: vehicle.etat || 'disponible',
      kilometrage: vehicle.kilometrage || 0,
      date_achat: vehicle.date_achat || new Date().toISOString().split('T')[0],
      prix_achat: vehicle.prix_achat || 0,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      immatriculation: '',
      type: 'minibus',
      marque: '',
      modele: '',
      annee_fabrication: new Date().getFullYear(),
      nombre_places: 15,
      etat: 'disponible',
      kilometrage: 0,
      date_achat: new Date().toISOString().split('T')[0],
      prix_achat: 0,
    });
  };

  const getTypeLabel = (type) => {
    const option = typeOptions.find(t => t.value === type);
    return option ? option.label : type;
  };

  const getEtatBadge = (etat) => {
    const option = etatOptions.find(e => e.value === etat);
    return option || { label: etat, icon: '📌', className: 'bg-gray-100 text-gray-700' };
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 Ar';
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  const filteredVehicles = vehicles.filter(v =>
    v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modele?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVehicles = vehicles.length;
  const disponibles = vehicles.filter(v => v.etat === 'disponible').length;
  const enTrajet = vehicles.filter(v => v.etat === 'en_trajet').length;
  const enMaintenance = vehicles.filter(v => v.etat === 'en_maintenance').length;

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Chargement des véhicules..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Véhicules
              </h1>
              <p className="text-red-100 mt-1">Gestion du parc automobile</p>
            </div>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-white text-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un véhicule
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <p className="text-red-600 text-sm font-medium">Total véhicules</p>
            <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <p className="text-green-600 text-sm font-medium">Disponibles</p>
            <p className="text-2xl font-bold text-green-600">{disponibles}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <p className="text-blue-600 text-sm font-medium">En trajet</p>
            <p className="text-2xl font-bold text-blue-600">{enTrajet}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <p className="text-yellow-600 text-sm font-medium">En maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{enMaintenance}</p>
          </div>
        </div>

        {/* RECHERCHE - Version compacte */}
<div className="flex justify-between items-center gap-4">
  <div className="relative max-w-sm flex-1">
    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder="Rechercher un véhicule..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm"
    />
  </div>
  {searchTerm && (
    <button 
      onClick={() => setSearchTerm('')} 
      className="text-gray-400 hover:text-red-500 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}
</div>

<p className="text-xs text-gray-400 mt-2">
  {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} trouvé{filteredVehicles.length > 1 ? 's' : ''}
</p>

        {/* TABLEAU DES VÉHICULES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Immatriculation</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Marque / Modèle</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Année</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Places</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Kilométrage</th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Prix d'achat</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">État</th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Aucun véhicule trouvé</p>
                      <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-3 text-red-600 hover:text-red-700">+ Ajouter un véhicule</button>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v) => {
                    const badge = getEtatBadge(v.etat);
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono font-semibold text-gray-900">{v.immatriculation}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800">{v.marque}</span>
                          <span className="text-gray-500"> {v.modele}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{getTypeLabel(v.type)}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{v.annee_fabrication}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{v.nombre_places}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{v.kilometrage?.toLocaleString()} km</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-red-600">{formatCurrency(v.prix_achat)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                            <span>{badge.icon}</span> {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(v)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(v)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
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

      {/* MODAL AJOUT/MODIFICATION - (identique à avant) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-zoomIn" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
                    </h2>
                    <p className="text-red-100 text-sm mt-0.5">Remplissez tous les champs obligatoires *</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90 duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Immatriculation *</label>
                <input type="text" placeholder="Ex: TJ-001-AA" value={formData.immatriculation} onChange={(e) => setFormData({...formData, immatriculation: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de véhicule *</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" required>
                  {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marque *</label>
                <select value={formData.marque} onChange={(e) => setFormData({...formData, marque: e.target.value, modele: ''})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" required>
                  <option value="">Sélectionner une marque</option>
                  {marques.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modèle *</label>
                <select value={formData.modele} onChange={(e) => setFormData({...formData, modele: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" required disabled={!formData.marque}>
                  <option value="">Sélectionner un modèle</option>
                  {formData.marque && modelesParMarque[formData.marque]?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Année *</label>
                  <select value={formData.annee_fabrication} onChange={(e) => setFormData({...formData, annee_fabrication: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition">
                    {anneeOptions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Places *</label>
                  <select value={formData.nombre_places} onChange={(e) => setFormData({...formData, nombre_places: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition">
                    {placesOptions.map(p => <option key={p} value={p}>{p} places</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kilométrage</label>
                  <input type="number" value={formData.kilometrage} onChange={(e) => setFormData({...formData, kilometrage: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'achat</label>
                  <input type="date" value={formData.date_achat} onChange={(e) => setFormData({...formData, date_achat: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix d'achat (Ar)</label>
                <input type="number" placeholder="Ex: 85 000 000" value={formData.prix_achat} onChange={(e) => setFormData({...formData, prix_achat: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition" min="0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">État *</label>
                <select value={formData.etat} onChange={(e) => setFormData({...formData, etat: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition">
                  {etatOptions.map(e => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl transition-all font-semibold shadow-md disabled:opacity-50" disabled={loading}>
                  {loading ? 'Enregistrement...' : (editingVehicle ? '✓ Modifier' : '✓ Enregistrer')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all font-medium">
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
              <p className="text-gray-500 mb-4">Cette action est irréversible.</p>
              <p className="text-sm font-medium text-gray-700 mb-6 bg-gray-100 p-3 rounded-xl">
                {vehicleToDelete?.marque} {vehicleToDelete?.modele} ({vehicleToDelete?.immatriculation})
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition font-medium">Supprimer</button>
                <button onClick={() => { setShowDeleteModal(false); setVehicleToDelete(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition font-medium">Annuler</button>
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

export default VehiclesPage;
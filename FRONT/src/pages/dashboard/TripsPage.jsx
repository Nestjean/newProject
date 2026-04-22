import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    destination: '',
    origine: 'Antananarivo',
    vehicule: '',
    chauffeur: '',
    nombre_passagers: 1,
    prix_unitaire: 0,
    status: 'planifie',
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trajets/');
      setTrips(res.data);
    } catch (error) {
      toast.error('Erreur de chargement');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicules/');
      setVehicles(res.data);
    } catch (error) {
      setVehicles([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/utilisateurs/');
      setDrivers(res.data.filter(u => u.role === 'chauffeur'));
    } catch (error) {
      setDrivers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicule) { toast.error('Sélectionnez un véhicule'); return; }
    if (!formData.chauffeur) { toast.error('Sélectionnez un chauffeur'); return; }
    if (!formData.destination) { toast.error('Entrez une destination'); return; }

    setLoading(true);
    try {
      if (editingTrip) {
        await api.put(`/trajets/${editingTrip.id}/`, formData);
        toast.success('Trajet modifié');
      } else {
        await api.post('/trajets/', formData);
        toast.success('Trajet créé');
      }
      setShowModal(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trip) => {
    if (window.confirm('Supprimer ce trajet ?')) {
      setLoading(true);
      try {
        await api.delete(`/trajets/${trip.id}/`);
        toast.success('Trajet supprimé');
        fetchTrips();
      } catch (error) {
        toast.error('Erreur');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      date: trip.date,
      destination: trip.destination,
      origine: trip.origine || 'Antananarivo',
      vehicule: trip.vehicule?.id || trip.vehicule,
      chauffeur: trip.chauffeur?.id || trip.chauffeur,
      nombre_passagers: trip.nombre_passagers,
      prix_unitaire: trip.prix_unitaire,
      status: trip.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      destination: '',
      origine: 'Antananarivo',
      vehicule: '',
      chauffeur: '',
      nombre_passagers: 1,
      prix_unitaire: 0,
      status: 'planifie',
    });
  };

  const getStatusBadge = (status) => {
    const colors = { planifie: 'bg-yellow-100 text-yellow-700', en_cours: 'bg-blue-100 text-blue-700', termine: 'bg-green-100 text-green-700', annule: 'bg-red-100 text-red-700' };
    const labels = { planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
    return { className: colors[status] || 'bg-gray-100', label: labels[status] || status };
  };

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-96">Chargement...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div><h1 className="text-2xl font-bold">Trajets</h1><p className="text-gray-500">Gestion des trajets</p></div>
          <button onClick={() => { setEditingTrip(null); resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Nouveau trajet</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="text-left py-3 px-4">Date</th><th className="text-left">Destination</th><th className="text-left">Chauffeur</th><th className="text-left">Véhicule</th><th className="text-right">Recette</th><th className="text-center">Statut</th><th className="text-center">Actions</th></tr></thead>
              <tbody>
                {trips.map(t => {
                  const badge = getStatusBadge(t.status);
                  return (<tr key={t.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4">{t.date}</td><td>{t.destination}</td><td>{t.chauffeur?.username || t.chauffeur_nom}</td><td>{t.vehicule?.immatriculation}</td><td className="text-right font-medium">{(t.nombre_passagers * t.prix_unitaire).toLocaleString()} Ar</td><td className="text-center"><span className={`px-2 py-1 rounded-full text-xs ${badge.className}`}>{badge.label}</span></td><td className="text-center"><button onClick={() => handleEdit(t)} className="text-blue-600 mr-2">Modifier</button><button onClick={() => handleDelete(t)} className="text-red-600">Supprimer</button></td></tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingTrip ? 'Modifier' : 'Nouveau trajet'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" placeholder="Destination" value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <select value={formData.vehicule} onChange={(e) => setFormData({...formData, vehicule: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Sélectionner véhicule</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation} - {v.marque}</option>)}
                </select>
                <select value={formData.chauffeur} onChange={(e) => setFormData({...formData, chauffeur: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Sélectionner chauffeur</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                </select>
                <input type="number" placeholder="Nombre passagers" value={formData.nombre_passagers} onChange={(e) => setFormData({...formData, nombre_passagers: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="number" placeholder="Prix unitaire (Ar)" value={formData.prix_unitaire} onChange={(e) => setFormData({...formData, prix_unitaire: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="planifie">Planifié</option><option value="en_cours">En cours</option><option value="termine">Terminé</option><option value="annule">Annulé</option>
                </select>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-blue-800">Recette: {(formData.nombre_passagers * formData.prix_unitaire).toLocaleString()} Ar</p></div>
                <div className="flex gap-3"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Enregistrer</button><button type="button" onClick={() => { setShowModal(false); setEditingTrip(null); }} className="flex-1 bg-gray-200 py-2 rounded-lg">Annuler</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TripsPage;
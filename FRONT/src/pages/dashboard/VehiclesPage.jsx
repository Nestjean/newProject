import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee_fabrication: new Date().getFullYear(),
    nombre_places: 15,
    etat: 'disponible',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicules/');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingVehicle) {
        await api.put(`/vehicules/${editingVehicle.id}/`, formData);
        toast.success('Véhicule modifié');
      } else {
        await api.post('/vehicules/', formData);
        toast.success('Véhicule ajouté');
      }
      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (window.confirm('Supprimer ce véhicule ?')) {
      setLoading(true);
      try {
        await api.delete(`/vehicules/${vehicle.id}/`);
        toast.success('Véhicule supprimé');
        fetchVehicles();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      immatriculation: vehicle.immatriculation,
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee_fabrication: vehicle.annee_fabrication,
      nombre_places: vehicle.nombre_places,
      etat: vehicle.etat,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      immatriculation: '',
      marque: '',
      modele: '',
      annee_fabrication: new Date().getFullYear(),
      nombre_places: 15,
      etat: 'disponible',
    });
  };

  const getEtatBadge = (etat) => {
    const colors = {
      disponible: 'bg-green-100 text-green-700',
      en_trajet: 'bg-blue-100 text-blue-700',
      en_maintenance: 'bg-red-100 text-red-700',
    };
    const labels = {
      disponible: 'Disponible',
      en_trajet: 'En trajet',
      en_maintenance: 'En maintenance',
    };
    return { className: colors[etat] || 'bg-gray-100', label: labels[etat] || etat };
  };

  if (loading && vehicles.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">Chargement...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Véhicules</h1>
            <p className="text-gray-500">Gestion du parc automobile</p>
          </div>
          <button onClick={() => { setEditingVehicle(null); resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const badge = getEtatBadge(v.etat);
            return (
              <div key={v.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{v.marque} {v.modele}</h3>
                    <p className="text-gray-500 text-sm">{v.immatriculation}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>{badge.label}</span>
                </div>
                <div className="mt-3 flex gap-2 text-sm text-gray-600">
                  <span>{v.annee_fabrication}</span>
                  <span>•</span>
                  <span>{v.nombre_places} places</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEdit(v)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded">Modifier</button>
                  <button onClick={() => handleDelete(v)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded">Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingVehicle ? 'Modifier' : 'Ajouter'} un véhicule</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Immatriculation" value={formData.immatriculation} onChange={(e) => setFormData({...formData, immatriculation: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" placeholder="Marque" value={formData.marque} onChange={(e) => setFormData({...formData, marque: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" placeholder="Modèle" value={formData.modele} onChange={(e) => setFormData({...formData, modele: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="number" placeholder="Année" value={formData.annee_fabrication} onChange={(e) => setFormData({...formData, annee_fabrication: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="number" placeholder="Nombre de places" value={formData.nombre_places} onChange={(e) => setFormData({...formData, nombre_places: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" required />
                <select value={formData.etat} onChange={(e) => setFormData({...formData, etat: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="disponible">Disponible</option>
                  <option value="en_trajet">En trajet</option>
                  <option value="en_maintenance">En maintenance</option>
                </select>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingVehicle(null); }} className="flex-1 bg-gray-200 py-2 rounded-lg">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VehiclesPage;
import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';

const DriversPage = () => {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    adresse: '',
    salaire_base: 0,
    mot_de_passe: ''
  });

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const fetchChauffeurs = async () => {
    try {
      const response = await api.get('utilisateurs/?role=chauffeur');
      setChauffeurs(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await api.put(`utilisateurs/${editingDriver.id}/`, formData);
      } else {
        await api.post('utilisateurs/', { ...formData, role: 'chauffeur' });
      }
      fetchChauffeurs();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce chauffeur ?')) {
      try {
        await api.delete(`utilisateurs/${id}/`);
        fetchChauffeurs();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      username: driver.username,
      email: driver.email,
      first_name: driver.first_name,
      last_name: driver.last_name,
      telephone: driver.telephone || '',
      adresse: driver.adresse || '',
      salaire_base: driver.salaire_base || 0,
      mot_de_passe: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      telephone: '',
      adresse: '',
      salaire_base: 0,
      mot_de_passe: ''
    });
  };

  const filteredChauffeurs = chauffeurs.filter(c => 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestion des chauffeurs</h2>
          <p className="text-gray-600 mt-1">Consultez et gérez tous les chauffeurs</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nouveau chauffeur
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un chauffeur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Cartes chauffeurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChauffeurs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun chauffeur trouvé
          </div>
        ) : (
          filteredChauffeurs.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {c.first_name?.[0] || c.username?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{c.first_name} {c.last_name}</h3>
                    <p className="text-gray-500 text-sm">@{c.username}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(c)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit size={18} className="text-blue-500" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📧</span> {c.email}
                </p>
                {c.telephone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span>📱</span> {c.telephone}
                  </p>
                )}
                {c.salaire_base > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <span>💰</span> Salaire: {Number(c.salaire_base).toLocaleString('fr-FR')} Ar
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${c.est_actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.est_actif ? <UserCheck size={12} /> : <UserX size={12} />}
                  {c.est_actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">
                {editingDriver ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire base (Ar)</label>
                  <input
                    type="number"
                    value={formData.salaire_base}
                    onChange={(e) => setFormData({...formData, salaire_base: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  rows="2"
                />
              </div>
              {!editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    required={!editingDriver}
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition">
                  {editingDriver ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;
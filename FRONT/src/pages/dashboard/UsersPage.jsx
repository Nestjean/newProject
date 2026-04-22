import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    role: 'chauffeur',
    est_actif: true,
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/utilisateurs/');
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await api.put(`/utilisateurs/${editingUser.id}/`, formData);
        toast.success('Utilisateur modifié');
      } else {
        await api.post('/utilisateurs/', { ...formData, password: 'default123' });
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', first_name: '', last_name: '', telephone: '', role: 'chauffeur', est_actif: true });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Supprimer ${user.username} ?`)) {
      try {
        await api.delete(`/utilisateurs/${user.id}/`);
        toast.success('Utilisateur supprimé');
        fetchUsers();
      } catch (error) {
        toast.error('Erreur');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      telephone: user.telephone || '',
      role: user.role,
      est_actif: user.est_actif,
    });
    setShowModal(true);
  };

  const getRoleBadge = (role) => {
    const colors = { admin: 'bg-red-100 text-red-700', chauffeur: 'bg-blue-100 text-blue-700', comptable: 'bg-green-100 text-green-700' };
    return colors[role] || 'bg-gray-100';
  };

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-96">Chargement...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div><h1 className="text-2xl font-bold">Utilisateurs</h1><p className="text-gray-500">Gestion des utilisateurs</p></div>
          <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Nouvel utilisateur</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="text-left py-3 px-4">Username</th><th>Nom complet</th><th>Email</th><th>Rôle</th><th>Statut</th><th className="text-center">Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4">{u.username}</td><td>{u.first_name} {u.last_name}</td><td>{u.email}</td><td><span className={`px-2 py-1 rounded-full text-xs ${getRoleBadge(u.role)}`}>{u.role}</span></td><td><span className={`px-2 py-1 rounded-full text-xs ${u.est_actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.est_actif ? 'Actif' : 'Inactif'}</span></td><td className="text-center"><button onClick={() => handleEdit(u)} className="text-blue-600 mr-2">Modifier</button><button onClick={() => handleDelete(u)} className="text-red-600">Supprimer</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nom d'utilisateur" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="px-4 py-2 border rounded-lg" /><input type="text" placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="px-4 py-2 border rounded-lg" /></div>
                <input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="chauffeur">Chauffeur</option><option value="comptable">Comptable</option><option value="admin">Administrateur</option></select>
                <label className="flex items-center"><input type="checkbox" checked={formData.est_actif} onChange={(e) => setFormData({...formData, est_actif: e.target.checked})} className="mr-2" />Compte actif</label>
                <div className="flex gap-3"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Enregistrer</button><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Annuler</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
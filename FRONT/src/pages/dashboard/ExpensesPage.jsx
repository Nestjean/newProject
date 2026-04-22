import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'carburant',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/depenses/');
      setExpenses(response.data);
      setTotalExpenses(response.data.reduce((s, e) => s + (e.montant || 0), 0));
    } catch (error) {
      toast.error('Erreur de chargement');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/depenses/', formData);
      toast.success('Dépense ajoutée');
      setShowModal(false);
      setFormData({ type: 'carburant', montant: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette dépense ?')) {
      try {
        await api.delete(`/depenses/${id}/`);
        toast.success('Dépense supprimée');
        fetchExpenses();
      } catch (error) {
        toast.error('Erreur');
      }
    }
  };

  const categories = {
    carburant: { label: 'Carburant', icon: '⛽', color: 'bg-yellow-100 text-yellow-700' },
    entretien: { label: 'Entretien', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
    assurance: { label: 'Assurance', icon: '📄', color: 'bg-purple-100 text-purple-700' },
    salaire: { label: 'Salaire', icon: '💰', color: 'bg-green-100 text-green-700' },
    autre: { label: 'Autre', icon: '📦', color: 'bg-gray-100 text-gray-700' },
  };

  if (loading) return <DashboardLayout><div className="flex justify-center items-center h-96">Chargement...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div><h1 className="text-2xl font-bold">Dépenses</h1><p className="text-gray-500">Gestion des dépenses</p></div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Nouvelle dépense</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-gray-500">Total des dépenses</p>
          <p className="text-2xl font-bold">{totalExpenses.toLocaleString()} Ar</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="text-left py-3 px-4">Date</th><th className="text-left">Catégorie</th><th className="text-left">Description</th><th className="text-right">Montant</th><th className="text-center">Actions</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4">{e.date}</td><td><span className={`px-2 py-1 rounded-full text-xs ${categories[e.type]?.color || categories.autre.color}`}>{categories[e.type]?.icon} {categories[e.type]?.label}</span></td><td>{e.description}</td><td className="text-right font-medium">{e.montant?.toLocaleString()} Ar</td><td className="text-center"><button onClick={() => handleDelete(e.id)} className="text-red-600">Supprimer</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Ajouter une dépense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="carburant">⛽ Carburant</option><option value="entretien">🔧 Entretien</option><option value="assurance">📄 Assurance</option><option value="salaire">💰 Salaire</option><option value="autre">📦 Autre</option>
                </select>
                <input type="number" placeholder="Montant (Ar)" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                <div className="flex gap-3"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Enregistrer</button><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Annuler</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExpensesPage;
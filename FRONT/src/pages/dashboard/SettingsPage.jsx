import React, { useState } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserCircleIcon, BellIcon, LockClosedIcon, LanguageIcon } from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    first_name: user?.prenom || user?.first_name || '',
    last_name: user?.nom || user?.last_name || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });
  
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [notifications, setNotifications] = useState({ 
    email_notifications: true, 
    push_notifications: true, 
    trip_alerts: true, 
    payment_alerts: true, 
    commission_alerts: true 
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/utilisateurs/${user.id}/`, { 
        first_name: profile.first_name, 
        last_name: profile.last_name, 
        email: profile.email, 
        telephone: profile.telephone 
      });
      toast.success('Profil mis à jour avec succès');
      const updatedUser = { ...user, prenom: profile.first_name, nom: profile.last_name, email: profile.email, telephone: profile.telephone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) { 
      toast.error('Erreur lors de la mise à jour'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password.new_password !== password.confirm_password) { 
      toast.error('Les mots de passe ne correspondent pas'); 
      return; 
    }
    if (password.new_password.length < 6) { 
      toast.error('Le mot de passe doit contenir au moins 6 caractères'); 
      return; 
    }
    setLoading(true);
    try {
      await api.post('/change-password/', { 
        current_password: password.current_password, 
        new_password: password.new_password 
      });
      toast.success('Mot de passe modifié avec succès');
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) { 
      toast.error('Mot de passe actuel incorrect'); 
    } finally { 
      setLoading(false); 
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserCircleIcon, description: 'Gérez vos informations personnelles' },
    { id: 'security', name: 'Sécurité', icon: LockClosedIcon, description: 'Modifiez votre mot de passe' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Configurez vos alertes' },
    { id: 'language', name: 'Langue', icon: LanguageIcon, description: 'Choisissez votre langue' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Rouge */}
        <div className="bg-red-600 rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-red-100 mt-1">Gérez vos préférences et informations personnelles</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu latéral - Noir */}
          <div className="w-full md:w-80 bg-gray-900 rounded-2xl shadow-lg p-4 h-fit">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 mb-2 ${
                  activeTab === tab.id 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-800'}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${activeTab === tab.id ? 'text-white' : 'text-gray-200'}`}>{tab.name}</p>
                  <p className="text-xs text-gray-400">{tab.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* Profil */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.first_name?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h3>
                    <p className="text-gray-500 capitalize">
                      {user?.role === 'admin' ? 'Administrateur' : user?.role === 'chauffeur' ? 'Chauffeur' : 'Utilisateur'}
                    </p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> En ligne
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input 
                      type="text" 
                      value={profile.first_name} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input 
                      type="text" 
                      value={profile.last_name} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input 
                      type="tel" 
                      value={profile.telephone} 
                      onChange={(e) => setProfile({...profile, telephone: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            )}

            {/* Sécurité */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-800">🔐 Pour votre sécurité, choisissez un mot de passe fort d'au moins 6 caractères.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                  <input 
                    type="password" 
                    value={password.current_password} 
                    onChange={(e) => setPassword({...password, current_password: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    value={password.new_password} 
                    onChange={(e) => setPassword({...password, new_password: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    value={password.confirm_password} 
                    onChange={(e) => setPassword({...password, confirm_password: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    required 
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevez des alertes par email</p>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, email_notifications: !notifications.email_notifications})} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email_notifications ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Notifications push</p>
                    <p className="text-sm text-gray-500">Alertes sur votre navigateur</p>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, push_notifications: !notifications.push_notifications})} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push_notifications ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Alertes de trajets</p>
                    <p className="text-sm text-gray-500">Nouveaux trajets planifiés</p>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, trip_alerts: !notifications.trip_alerts})} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.trip_alerts ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.trip_alerts ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Alertes de commission</p>
                    <p className="text-sm text-gray-500">Commission disponible</p>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, commission_alerts: !notifications.commission_alerts})} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.commission_alerts ? 'bg-red-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.commission_alerts ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Langue */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <span className="text-4xl mb-3 block">🇫🇷</span>
                  <p className="font-semibold text-lg text-gray-800">Français</p>
                  <p className="text-sm text-gray-500 mt-1">Langue par défaut de l'application</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Langue active
                  </div>
                </div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    L'interface est actuellement en français. Cette langue est prise en charge par défaut.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
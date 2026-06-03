import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CotisseLogo from './CotisseLogo';
import { 
  HomeIcon, TruckIcon, MapIcon, CurrencyDollarIcon, 
  ChartBarIcon, UserGroupIcon, Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getMenuItems = () => {
    const role = user?.role;
    if (role === 'admin') {
      return [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/vehicles', name: 'Véhicules', icon: TruckIcon },
        { path: '/reports', name: 'Rapports', icon: ChartBarIcon },
        { path: '/commissions', name: 'Commissions', icon: UserGroupIcon },
        { path: '/settings', name: 'Paramètres', icon: Cog6ToothIcon },
      ];
    }
    if (role === 'caissier') {
      return [
        { path: '/trips', name: 'Trajets', icon: MapIcon },
        { path: '/expenses', name: 'Dépenses', icon: CurrencyDollarIcon },
      ];
    }
    if (role === 'chauffeur') {
      return [{ path: '/trips', name: 'Mes Trajets', icon: MapIcon }];
    }
    return [
      { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
      { path: '/vehicles', name: 'Véhicules', icon: TruckIcon },
      { path: '/trips', name: 'Trajets', icon: MapIcon },
      { path: '/expenses', name: 'Dépenses', icon: CurrencyDollarIcon },
      { path: '/reports', name: 'Rapports', icon: ChartBarIcon },
    ];
  };

  const menuItems = getMenuItems();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => { logout(); setShowLogoutModal(false); navigate('/login'); };
  const handleCancelLogout = () => setShowLogoutModal(false);
  const handleProfileClick = () => setShowProfileModal(true);
  const handleGoToSettings = () => { setShowProfileModal(false); navigate('/settings'); };

  const getUserInitials = () => {
    if (user?.prenom && user?.nom) return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return 'U';
  };

  const getFullName = () => user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : user?.username || 'Utilisateur';
  const getRoleLabel = () => {
    const roles = { admin: 'Administrateur', chauffeur: 'Chauffeur', comptable: 'Comptable', caissier: 'Caissier' };
    return roles[user?.role] || user?.role || 'Utilisateur';
  };

  return (
    <>
      <aside className={`bg-[#1A1A1A] text-white flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo - Misy sary Cotisse */}
        <div className={`p-4 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <CotisseLogo className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-white">Cotisse</h1>
                <p className="text-xs text-red-500">TRANSPORT</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <CotisseLogo className="w-8 h-8 rounded-full" />
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
            {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Profil et Déconnexion */}
        <div className="p-4 border-t border-gray-800">
          {!isCollapsed ? (
            <>
              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 mb-4 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="font-semibold text-sm text-white">{getUserInitials()}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-400 truncate">{getRoleLabel()}</p>
                </div>
              </button>
              
              <button 
                onClick={handleLogoutClick} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleProfileClick}
                className="w-full flex justify-center mb-4 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200"
                title={getFullName()}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="font-semibold text-xs text-white">{getUserInitials()}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
              </button>
              <button 
                onClick={handleLogoutClick} 
                className="w-full flex justify-center p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200"
                title="Déconnexion"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Modal Profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-700 p-6 text-white text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                  {getUserInitials()}
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <h2 className="text-xl font-bold mt-3">{getFullName()}</h2>
              <p className="text-gray-300 text-sm">{getRoleLabel()}</p>
              <p className="text-red-400 text-xs mt-1 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span> En ligne
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700">{user?.email || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nom d'utilisateur</p>
                  <p className="text-sm text-gray-700">@{user?.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleGoToSettings}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Paramètres
              </button>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Déconnexion</h3>
              <p className="text-gray-500 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
              <div className="flex gap-3">
                <button onClick={handleConfirmLogout} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Oui</button>
                <button onClick={handleCancelLogout} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default Sidebar;
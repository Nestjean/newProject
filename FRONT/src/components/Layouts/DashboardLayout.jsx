import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const getUserInitials = () => {
    if (user?.prenom && user?.nom) return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header avec barre de recherche */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Tableau de bord</h2>
              <p className="text-sm text-gray-500">Bienvenue, {user?.prenom || user?.username} {user?.nom || ''} !</p>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Rechercher un trajet, véhicule, chauffeur..."
                  className="w-80 px-4 py-2 pl-10 pr-4 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Résultats de recherche */}
              {showSearchResults && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fadeIn">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Résultats pour "{searchQuery}"</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-800">Jean Dupont</p>
                      <p className="text-xs text-gray-500">Chauffeur</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-800">Toyota Hiace</p>
                      <p className="text-xs text-gray-500">Véhicule - 1234-TA</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-800">Trajet Antananarivo → Toamasina</p>
                      <p className="text-xs text-gray-500">18/04/2024 - 15 000 Ar</p>
                    </div>
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-700">Voir tous les résultats</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profil */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  {getUserInitials()}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">{children}</div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
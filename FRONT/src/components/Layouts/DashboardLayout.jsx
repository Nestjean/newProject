// src/components/Layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import NotificationBell from '../NotificationBell';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const getUserInitials = () => {
    if (user?.prenom && user?.nom) return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="flex h-screen bg-gray-50"><Sidebar /><main className="flex-1 ml-64 overflow-y-auto"><div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-6 py-3"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Cotisse Transport</h2><p className="text-sm text-gray-500">Bienvenue, {user?.prenom || user?.username} {user?.nom} !</p></div><div className="flex items-center gap-4"><SearchBar /><NotificationBell /><div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white font-bold shadow-md">{getUserInitials()}</div></div></div></div><div className="p-6">{children}</div></main></div>
  );
};

export default DashboardLayout;
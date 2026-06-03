// src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      // Simuler des notifications
      const mockNotifs = [
        { id: 1, title: 'Nouveau trajet', message: 'Un nouveau trajet a été ajouté', time: 'Il y a 2 min', read: false, type: 'trip' },
        { id: 2, title: 'Bienvenue', message: `Bienvenue ${user?.prenom || user?.username}`, time: 'Aujourd\'hui', read: false, type: 'welcome' }
      ];
      setNotifications(mockNotifs);
      setUnreadCount(mockNotifs.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (id) => {
    try { await api.patch(`/notifications/${id}/`, { read: true }); } catch(e) {}
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = async () => {
    try { await api.post('/notifications/mark-all-read/'); } catch(e) {}
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('Toutes les notifications marquées comme lues');
  };

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {showDropdown && (<><div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div><div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"><div className="p-4 border-b bg-gradient-to-r from-red-50 to-orange-50 flex justify-between items-center"><div><h3 className="font-bold">Notifications</h3><p className="text-xs text-gray-500">{unreadCount} non lue(s)</p></div>{unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-red-600 hover:underline">Tout marquer lu</button>}</div><div className="max-h-96 overflow-y-auto">{notifications.length === 0 ? <div className="p-8 text-center text-gray-500">Aucune notification</div> : notifications.map(n => (<div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-red-50' : ''}`}><div className="flex justify-between"><p className="text-sm font-semibold">{n.title}</p>{!n.read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}</div><p className="text-xs text-gray-500 mt-1">{n.message}</p><p className="text-xs text-gray-400 mt-2">{n.time}</p></div>))}</div></div></>)}
    </div>
  );
};

export default NotificationBell;
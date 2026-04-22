import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
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
      // Données mockées
      const mockNotifs = [
        { id: 1, title: 'Nouveau trajet planifié', message: 'Trajet Antananarivo → Toamasina', time: 'Il y a 5 min', read: false, type: 'trip', icon: '✈️' },
        { id: 2, title: 'Commission payée', message: 'Votre commission d\'avril a été versée', time: 'Il y a 1 heure', read: false, type: 'payment', icon: '💰' },
        { id: 3, title: 'Maintenance véhicule', message: 'Le véhicule 1234-TA nécessite une révision', time: 'Il y a 3 heures', read: true, type: 'alert', icon: '🔧' },
        { id: 4, title: 'Bienvenue !', message: `Bienvenue ${user?.prenom || user?.username} sur CoopTransport`, time: 'Hier', read: true, type: 'welcome', icon: '👋' },
      ];
      setNotifications(mockNotifs);
      setUnreadCount(mockNotifs.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => prev - 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      trip: 'bg-blue-50 border-blue-200',
      payment: 'bg-green-50 border-green-200',
      alert: 'bg-red-50 border-red-200',
      welcome: 'bg-purple-50 border-purple-200',
      default: 'bg-gray-50 border-gray-200',
    };
    return styles[type] || styles.default;
  };

  const formatTime = (timeStr) => {
    if (timeStr.includes('min')) return timeStr;
    if (timeStr.includes('heure')) return timeStr;
    if (timeStr === 'Hier') return timeStr;
    return timeStr;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" /> Tout marquer lu
                  </button>
                )}
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${getTypeStyles(notif.type)}`}>
                        {notif.icon || (notif.type === 'trip' ? '✈️' : notif.type === 'payment' ? '💰' : '🔔')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notif.time)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Voir toutes les notifications</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-pulse { animation: pulse 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotificationBell;
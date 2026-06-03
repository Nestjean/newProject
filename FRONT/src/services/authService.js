// src/services/authService.js
import api from './api';

const authService = {
  // Connexion
  login: async (username, password) => {
    try {
      console.log('[AuthService] Login attempt:', { username });
      const response = await api.post('/login/', { username, password });
      console.log('[AuthService] Login response:', response.data);
      
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      console.log('[AuthService] Register attempt:', userData.username);
      const response = await api.post('/register/', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        telephone: userData.telephone || '',
        role: userData.role || 'chauffeur'
      });
      
      console.log('[AuthService] Register response:', response.data);
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('[AuthService] Register error:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur. Vérifiez que le backend est démarré sur http://localhost:8000' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null' || userStr === '') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erreur lecture utilisateur:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    return !!(token && token !== 'undefined' && token !== 'null' && token !== '');
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  }
};

export default authService;
import api from './api';

const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/login/', { username, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/password-reset/', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  confirmPasswordReset: async (email, code, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/password-reset/confirm/', {
        email,
        code,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
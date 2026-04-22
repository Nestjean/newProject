import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success(`Bienvenue ${data.user.prenom || data.user.username}!`);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur de connexion' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Inscription réussie!');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Erreur d'inscription" 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
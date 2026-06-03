// src/context/AuthContext.jsx
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
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();
        
        if (currentUser && authenticated) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setUserRole(currentUser.role);
          console.log('✅ Auth init - Utilisateur connecté:', currentUser.username);
        } else {
          console.log('ℹ️ Auth init - Aucun utilisateur connecté');
        }
      } catch (error) {
        console.error('Erreur init auth:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      console.log('[AuthContext] Calling login with:', { username });
      const data = await authService.login(username, password);
      console.log('[AuthContext] Login response:', data);
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setUserRole(data.user.role);
        
        const roleMessages = {
          admin: '👑 Bienvenue Administrateur !',
          caissier: '💰 Bienvenue Caissier !',
          chauffeur: '🚗 Bienvenue Chauffeur !'
        };
        toast.success(roleMessages[data.user.role] || 'Connexion réussie');
        
        return { success: true, role: data.user.role, user: data.user };
      }
      
      toast.error(data.error || 'Identifiants incorrects');
      return { success: false, error: data.error };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      toast.error('Erreur de connexion au serveur');
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('[AuthContext] Register called with:', userData.username);
    setLoading(true);
    try {
      const data = await authService.register(userData);
      console.log('[AuthContext] Register response:', data);
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setUserRole(data.user.role);
        
        toast.success('🎉 Inscription réussie ! Bienvenue');
        
        return { success: true, role: data.user.role, user: data.user };
      }
      
      toast.error(data.error || "Erreur lors de l'inscription");
      return { success: false, error: data.error };
    } catch (error) {
      console.error('[AuthContext] Register error:', error);
      toast.error("Erreur de connexion au serveur");
      return { success: false, error: "Erreur de connexion" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    toast.success('Déconnexion réussie');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    isAdmin: userRole === 'admin',
    isCaissier: userRole === 'caissier',
    isChauffeur: userRole === 'chauffeur',
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
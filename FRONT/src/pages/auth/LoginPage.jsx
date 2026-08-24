import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!password) newErrors.password = "Mot de passe requis";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        const role = result.user?.role;
        if (role === 'admin') navigate('/dashboard');
        else navigate('/trips');
      } else {
        const errorMsg = result.error || 'Erreur de connexion';
        
        if (errorMsg.toLowerCase().includes('mot de passe') || errorMsg.toLowerCase().includes('password')) {
          setErrors({ password: errorMsg });
        } else if (errorMsg.toLowerCase().includes('utilisateur') || errorMsg.toLowerCase().includes('username')) {
          setErrors({ username: errorMsg });
        } else {
          setErrors({ general: errorMsg });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const UserIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'username' ? 'text-red-600' : (errors.username ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const LockIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-red-600' : (errors.password ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full">
        
        {/* 2 COLONNES */}
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* COLONNE GAUCHE - SARY MIVELATRA FENO (ambony sy ambany) */}
          <div className="md:w-1/2 relative min-h-[600px] md:min-h-full bg-gray-100">
            <img 
              src="/cotise.jpg" 
              alt="Cotisse Transport" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* COLONNE DROITE - FORMULAIRE */}
          <div className="md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-center min-h-[600px]">
            
            {/* LOGO COTISSE */}
            <div className="text-center mb-6">
              <img 
                src="/cotisse-logo.png" 
                alt="Cotisse Transport" 
                className="w-48 h-auto mx-auto"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center">Connexion</h2>
              <p className="text-gray-500 text-sm text-center mt-2">Bienvenue ! Veuillez vous connecter à votre compte.</p>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'username' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 pl-11 text-base border rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.username 
                        ? 'border-red-500 ring-2 ring-red-200 bg-red-50' 
                        : focusedField === 'username'
                          ? 'border-red-400 shadow-sm bg-white'
                          : 'border-gray-200 bg-gray-50 hover:border-red-300'
                    }`}
                    disabled={loading}
                    placeholder="Entrez votre nom d'utilisateur"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 pl-11 pr-12 text-base border rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-500 ring-2 ring-red-200 bg-red-50' 
                        : focusedField === 'password'
                          ? 'border-red-400 shadow-sm bg-white'
                          : 'border-gray-200 bg-gray-50 hover:border-red-300'
                    }`}
                    disabled={loading}
                    placeholder="Entrez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Cotisse Transport. Tous droits réservés.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .border-red-500.ring-red-200 {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
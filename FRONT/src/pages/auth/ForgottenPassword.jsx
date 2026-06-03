// src/pages/auth/ForgottenPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import CotisseLogo from '../../components/CotisseLogo';

const ForgottenPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // ✅ Effacer erreur email raha manoratra
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  // ✅ Effacer erreur code raha manoratra
  const handleCodeChange = (e) => {
    const value = e.target.value;
    setCode(value);
    if (errors.code) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.code;
        return newErrors;
      });
    }
  };

  // ✅ Effacer erreur password raha manoratra
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (errors.newPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.newPassword;
        return newErrors;
      });
    }
    if (errors.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    // ❌ Tsy mampiasa setErrors({}) intsony!
    
    if (!email) {
      setErrors({ email: 'Veuillez entrer votre email' });
      return;
    }

    setLoading(true);
    const result = await authService.requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setStep(2);
    } else {
      if (result.error) {
        setErrors({ general: result.error });
      }
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    
    // ❌ Tsy mampiasa setErrors({}) intsony!
    
    const newErrors = {};
    if (!code) newErrors.code = 'Code requis';
    if (!newPassword) newErrors.newPassword = 'Nouveau mot de passe requis';
    if (newPassword && newPassword.length < 6) newErrors.newPassword = 'Au moins 6 caractères';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await authService.confirmPasswordReset(email, code, newPassword, confirmPassword);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => window.location.href = '/login', 2000);
    } else {
      if (result.error) setErrors({ general: result.error });
    }
  };

  // ========== ICÔNES ==========
  const MailIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-red-600' : (errors.email ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const CodeIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'code' ? 'text-red-600' : (errors.code ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  );

  const LockIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'newPassword' ? 'text-red-600' : (errors.newPassword ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const ConfirmIcon = () => (
    <svg className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'confirmPassword' ? 'text-red-600' : (errors.confirmPassword ? 'text-red-500' : 'text-gray-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
      <div className="max-w-md w-full">
        {/* Logo Cotisse */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-red-600 shadow-xl overflow-hidden bg-white">
              <CotisseLogo className="w-full h-full" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cotisse</h1>
          <p className="text-red-600 font-bold text-sm tracking-wider mt-1">TRANSPORT</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Erreur générale */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.general}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Mot de passe oublié ?</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Entrez votre email pour recevoir un code de réinitialisation.
              </p>
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.email ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : focusedField === 'email' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'
                      }`}
                      placeholder="Entrez votre email"
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi...
                    </span>
                  ) : (
                    'Envoyer le code'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Code de vérification</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Un code a été envoyé à <span className="text-red-600 font-medium">{email}</span>
              </p>
              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <CodeIcon />
                    </div>
                    <input
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.code ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : focusedField === 'code' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'
                      }`}
                      placeholder="123456"
                      required
                    />
                  </div>
                  {errors.code && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.code}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockIcon />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pl-10 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.newPassword ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : focusedField === 'newPassword' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'
                      }`}
                      placeholder="Entrez votre nouveau mot de passe"
                      required
                    />
                  </div>
                  {errors.newPassword && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.newPassword}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <ConfirmIcon />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 pl-10 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : focusedField === 'confirmPassword' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'
                      }`}
                      placeholder="Confirmez votre mot de passe"
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Réinitialisation...
                    </span>
                  ) : (
                    'Réinitialiser'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          © 2026 Cotisse Transport. Tous droits réservés.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .border-red-500.ring-red-200 { animation: shake 0.3s ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ForgottenPassword;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgottenPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    const result = await authService.requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setStep(2);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const result = await authService.confirmPasswordReset(email, code, newPassword, confirmPassword);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CoopTransport</h1>
          <p className="text-gray-600 mt-2">Réinitialisation du mot de passe</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Mot de passe oublié ?</h2>
              <p className="text-gray-500 mb-6">
                Entrez votre email et nous vous enverrons un code de réinitialisation.
              </p>
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="input-field"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Code de vérification</h2>
              <p className="text-gray-500 mb-6">
                Un code a été envoyé à {email}. Veuillez le saisir ci-dessous.
              </p>
              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgottenPassword;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CotisseLogo from '../../components/CotisseLogo';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    telephone: '',
    role: 'chauffeur',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Prénom requis";
    if (!formData.last_name.trim()) newErrors.last_name = "Nom requis";
    if (!formData.username.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.role) newErrors.role = "Rôle requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Mot de passe requis";
    if (formData.password && formData.password.length < 6) newErrors.password = "Au moins 6 caractères";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep1()) { setStep(2); window.scrollTo(0, 0); } };
  const handleBack = () => { setStep(1); window.scrollTo(0, 0); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const result = await register({
      username: formData.username, email: formData.email, password: formData.password,
      first_name: formData.first_name, last_name: formData.last_name,
      telephone: formData.telephone, role: formData.role,
    });
    setLoading(false);
    if (result.success) {
      const userRole = result.user?.role || formData.role;
      if (userRole === 'admin') navigate('/dashboard');
      else navigate('/trips');
    } else {
      if (result.error) setErrors({ general: result.error });
    }
  };

  // Icônes SVG pour les rôles
  const ChauffeurIcon = ({ active = false }) => (
    <svg className={`w-8 h-8 transition-all duration-200 ${active ? 'text-white' : 'text-gray-500 group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      <circle cx="7" cy="17" r="2" stroke="currentColor" fill="none" />
      <circle cx="17" cy="17" r="2" stroke="currentColor" fill="none" />
    </svg>
  );

  const CaissierIcon = ({ active = false }) => (
    <svg className={`w-8 h-8 transition-all duration-200 ${active ? 'text-white' : 'text-gray-500 group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      <circle cx="9" cy="15" r="1.5" stroke="currentColor" fill="none" />
      <circle cx="15" cy="15" r="1.5" stroke="currentColor" fill="none" />
    </svg>
  );

  const AdminIcon = ({ active = false }) => (
    <svg className={`w-8 h-8 transition-all duration-200 ${active ? 'text-white' : 'text-gray-500 group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v2m0 4h.01" />
    </svg>
  );

  // Icônes formulaire - CENTRÉES correctement
  const UserIcon = () => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <svg className={`w-5 h-5 ${focusedField === 'first_name' || focusedField === 'last_name' || focusedField === 'username' ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );

  const MailIcon = () => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <svg className={`w-5 h-5 ${focusedField === 'email' ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
  );

  const PhoneIcon = () => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </div>
  );

  const LockIcon = () => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2">
      <svg className={`w-5 h-5 ${focusedField === 'password' || focusedField === 'confirmPassword' ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  );

  const EyeIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  const roleOptions = [
    { value: 'chauffeur', label: 'Chauffeur', icon: ChauffeurIcon },
    { value: 'caissier', label: 'Caissier', icon: CaissierIcon },
    { value: 'admin', label: 'Administrateur', icon: AdminIcon },
  ];

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Inscription</h2>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-16 h-0.5 transition-all ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <div className="relative">
                      <UserIcon />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('first_name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.first_name ? 'border-red-500' : focusedField === 'first_name' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                        placeholder="Entrez votre prénom"
                      />
                    </div>
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <div className="relative">
                      <UserIcon />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('last_name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.last_name ? 'border-red-500' : focusedField === 'last_name' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                        placeholder="Entrez votre nom"
                      />
                    </div>
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Nom d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                  <div className="relative">
                    <UserIcon />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.username ? 'border-red-500' : focusedField === 'username' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                      placeholder="Entrez votre nom d'utilisateur"
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <MailIcon />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                      placeholder="Entrez votre email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <PhoneIcon />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Entrez votre numéro"
                    />
                  </div>
                </div>

                {/* Sélection du rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rôle *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {roleOptions.map((role) => {
                      const IconComponent = role.icon;
                      const isActive = formData.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value })}
                          className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-600 shadow-lg scale-105' 
                              : 'border-gray-200 hover:border-red-400 hover:shadow-md hover:scale-105'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-50'
                          }`}>
                            <IconComponent active={isActive} />
                          </div>
                          <span className={`text-sm font-semibold transition-all duration-300 ${
                            isActive ? 'text-white' : 'text-gray-700 group-hover:text-red-600'
                          }`}>
                            {role.label}
                          </span>
                          {isActive && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && <p className="text-red-500 text-xs mt-2">{errors.role}</p>}
                </div>

                <button type="button" onClick={handleNext} className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all font-semibold shadow-md">Suivant</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <div className="relative">
                    <LockIcon />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.password ? 'border-red-500' : focusedField === 'password' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                      placeholder="Entrez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>

                {/* Confirmer mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <LockIcon />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : focusedField === 'confirmPassword' ? 'border-red-400 shadow-md' : 'border-gray-200 hover:border-red-300'}`}
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Résumé du rôle choisi */}
                <div className="p-3 rounded-lg bg-red-50">
                  <p className="text-sm">
                    <strong className="text-red-700">Rôle sélectionné :</strong>{' '}
                    <span className="text-red-600">
                      {formData.role === 'admin' && 'Administrateur'}
                      {formData.role === 'caissier' && 'Caissier'}
                      {formData.role === 'chauffeur' && 'Chauffeur'}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">Retour</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all font-semibold shadow-md disabled:opacity-50">
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Inscription...</span> : "S'inscrire"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Déjà un compte ? <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold">Se connecter</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
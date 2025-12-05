import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Award, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.message });
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card avec effet glassmorphism */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden mb-8 border border-white/20">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-12">
            {/* Motif de fond décoratif */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Avatar avec animation */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl ring-4 ring-white/50 transition-transform group-hover:scale-105">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {user?.full_name || 'Utilisateur'}
                </h1>
                <p className="text-blue-100 text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-5 h-5" />
                  {user?.email}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    {user?.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Administrateur
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Membre
                      </>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    <Award className="w-4 h-4" />
                    Compte vérifié
                  </span>
                </div>
              </div>

              {/* Bouton éditer (version desktop) */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  <Edit2 className="w-5 h-5" />
                  Modifier le profil
                </button>
              )}
            </div>
          </div>

          {/* Bouton éditer (version mobile) */}
          {!isEditing && (
            <div className="md:hidden px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
                <Edit2 className="w-5 h-5" />
                Modifier le profil
              </button>
            </div>
          )}
        </div>

        {/* Messages de notification */}
        {message.text && (
          <div className="mb-6 animate-fade-in">
            <div
              className={`p-5 rounded-2xl shadow-lg border-l-4 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {message.type === 'success' ? '✓' : '✕'}
                </div>
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              Informations personnelles
            </h2>
          </div>

          <div className="px-8 py-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                      placeholder="Votre prénom"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-lg"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-blue-600">Prénom</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-13">{user?.first_name || '-'}</p>
                  </div>

                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-purple-600">Nom</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-13">{user?.last_name || '-'}</p>
                  </div>

                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-green-600">Email</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-13 break-all">{user?.email}</p>
                  </div>

                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-orange-600">Téléphone</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-13">{user?.phone || 'Non renseigné'}</p>
                  </div>

                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 hover:shadow-lg transition-all md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-pink-500 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-pink-600">Membre depuis</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-13">
                      {new Date(user?.date_joined).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
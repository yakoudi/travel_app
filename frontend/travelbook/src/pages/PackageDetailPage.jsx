import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Check, Hotel, Plane, Utensils, User, Heart, Share2, Clock, Star } from 'lucide-react';
import { packageAPI } from '../api/catalog';
import { formatPrice } from '../utils/formatters';

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numParticipants, setNumParticipants] = useState(2);
  const [selectedDate, setSelectedDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadPackage();
  }, [id]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const data = await packageAPI.getById(id);
      setPkg(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement du circuit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Circuit introuvable</h1>
          <button
            onClick={() => navigate('/search')}
            className="text-orange-600 hover:text-orange-700"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = pkg.price * numParticipants;

  const inclusions = [
    { key: 'includes_hotel', icon: Hotel, label: 'Hébergement en hôtel', description: `${pkg.duration_days} nuits incluses` },
    { key: 'includes_flight', icon: Plane, label: 'Vols aller-retour', description: 'Au départ de Tunis' },
    { key: 'includes_meals', icon: Utensils, label: 'Repas', description: 'Pension complète' },
    { key: 'includes_guide', icon: User, label: 'Guide francophone', description: 'Tout au long du séjour' },
  ];

  // Parser l'itinéraire
  const itineraryDays = pkg.itinerary.split('\n').filter(line => line.trim());

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Bouton retour */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Image principale */}
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl mb-8">
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <span className="text-white text-8xl">🎒</span>
            </div>
          )}
          
          {/* Overlay avec info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">{pkg.duration_days} jours</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{pkg.destination_name}</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{pkg.name}</h1>
            </div>
          </div>

          {/* Actions flottantes */}
          <div className="absolute top-8 right-8 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${
                isFavorite
                  ? 'bg-red-500'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Heart className={`w-6 h-6 text-white ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                À propos de ce circuit
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </div>

            {/* Inclusions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ce qui est inclus
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inclusions.map((inclusion) => {
                  if (!pkg[inclusion.key]) return null;
                  const Icon = inclusion.icon;
                  return (
                    <div
                      key={inclusion.key}
                      className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border-2 border-green-200"
                    >
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{inclusion.label}</p>
                        <p className="text-sm text-gray-600">{inclusion.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itinéraire jour par jour */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Itinéraire détaillé
              </h2>
              <div className="space-y-4">
                {itineraryDays.map((day, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        J{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">{day}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points forts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Points forts du circuit
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Découverte des sites incontournables',
                  'Hébergement en hôtels de qualité',
                  'Groupe à taille humaine',
                  'Transport confortable inclus',
                  'Guide expérimenté francophone',
                  'Expériences authentiques',
                ].map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Informations pratiques
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold">Taille du groupe</p>
                    <p className="text-sm">Maximum {pkg.max_participants} participants</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold">Rythme</p>
                    <p className="text-sm">Modéré - Accessible à tous</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold">Niveau</p>
                    <p className="text-sm">Convient aux familles et débutants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">À partir de</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPrice(pkg.price)}
                </p>
                <p className="text-gray-600">par personne</p>
              </div>

              {/* Date de départ */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Nombre de participants */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de participants
                </label>
                <select
                  value={numParticipants}
                  onChange={(e) => setNumParticipants(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(pkg.max_participants, 10) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} participant{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Max {pkg.max_participants} participants
                </p>
              </div>

              {/* Récapitulatif du prix */}
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Prix par personne</span>
                  <span className="font-semibold">{formatPrice(pkg.price)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-semibold">×{numParticipants}</span>
                </div>
                <div className="border-t border-orange-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/booking/package/${pkg.id}`)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all font-semibold text-lg mb-4 shadow-lg"
              >
                Réserver ce circuit
              </button>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Confirmation immédiate
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Annulation gratuite jusqu'à 7 jours avant
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Paiement sécurisé
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Des questions ?</p>
                <button className="text-orange-600 hover:text-orange-700 font-semibold">
                  Contactez-nous
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
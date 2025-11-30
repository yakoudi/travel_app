import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Clock, Calendar, Users, Briefcase, CheckCircle, Coffee, Wifi, Shield, Heart, Share2 } from 'lucide-react';
import { flightAPI } from '../api/catalog';
import { formatPrice, formatDateTime } from '../utils/formatters';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';

export default function FlightDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPassengers, setNumPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState('economy');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFlight();
  }, [id]);

  const loadFlight = async () => {
    try {
      setLoading(true);
      const data = await flightAPI.getById(id);
      setFlight(data);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement du vol');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vol introuvable</h1>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const classPrices = {
    economy: flight.price,
    business: flight.price * 2.5,
    first: flight.price * 4,
  };

  const totalPrice = classPrices[seatClass] * numPassengers;

  const services = [
    { icon: Briefcase, label: 'Bagage en soute inclus', available: flight.baggage_included },
    { icon: Coffee, label: 'Repas à bord', available: true },
    { icon: Wifi, label: 'WiFi gratuit', available: seatClass !== 'economy' },
    { icon: Shield, label: 'Assurance annulation', available: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Bouton retour */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête du vol */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <Plane className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">{flight.airline}</p>
                    <p className="text-2xl font-bold">{flight.flight_number}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-lg transition-colors ${
                      isFavorite
                        ? 'bg-red-500'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {flight.is_direct && (
                <div className="inline-block bg-green-500 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  ✓ Vol direct
                </div>
              )}

              {/* Itinéraire */}
              <div className="grid grid-cols-3 gap-8 items-center">
                {/* Départ */}
                <div>
                  <p className="text-sm opacity-75 mb-2">Départ</p>
                  <p className="text-3xl font-bold mb-2">{flight.origin_name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(flight.departure_time)}</span>
                  </div>
                </div>

                {/* Durée */}
                <div className="flex flex-col items-center">
                  <div className="w-full border-t-2 border-dashed border-white/50 relative mb-2">
                    <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-90 bg-blue-600 p-1 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{flight.duration}</span>
                  </div>
                </div>

                {/* Arrivée */}
                <div className="text-right">
                  <p className="text-sm opacity-75 mb-2">Arrivée</p>
                  <p className="text-3xl font-bold mb-2">{flight.destination_name}</p>
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(flight.arrival_time)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations du vol
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Compagnie</p>
                    <p className="text-gray-600">{flight.airline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Durée du vol</p>
                    <p className="text-gray-600">{flight.duration}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Places disponibles</p>
                    <p className="text-gray-600">{flight.available_seats} sièges</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bagages</p>
                    <p className="text-gray-600">
                      {flight.baggage_included ? '1 bagage inclus (23kg)' : 'Bagage non inclus'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services inclus */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Services & Commodités
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        service.available
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${
                        service.available ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          service.available ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {service.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.available ? 'Inclus' : 'Non disponible'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Politique d'annulation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Politique d'annulation
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>✓ Annulation gratuite jusqu'à 24h avant le départ</p>
                <p>✓ Modification gratuite jusqu'à 48h avant le départ</p>
                <p>✓ Remboursement à 100% en cas d'annulation du vol</p>
                <p className="text-sm text-gray-500 mt-4">
                  * Conditions générales applicables selon la classe tarifaire choisie
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Réserver ce vol
              </h3>

              {/* Classe de siège */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Classe
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'economy', label: 'Économique', multiplier: 1 },
                    { value: 'business', label: 'Affaires', multiplier: 2.5 },
                    { value: 'first', label: 'Première', multiplier: 4 },
                  ].map((cls) => (
                    <button
                      key={cls.value}
                      onClick={() => setSeatClass(cls.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        seatClass === cls.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{cls.label}</span>
                        <span className="text-blue-600 font-bold">
                          {formatPrice(flight.price * cls.multiplier)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de passagers */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de passagers
                </label>
                <select
                  value={numPassengers}
                  onChange={(e) => setNumPassengers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} passager{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Récapitulatif du prix */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Prix par passager</span>
                  <span className="font-semibold">{formatPrice(classPrices[seatClass])}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Nombre de passagers</span>
                  <span className="font-semibold">×{numPassengers}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/booking/flight/${flight.id}`)}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg mb-4"
              >
                Réserver maintenant
              </button>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Confirmation immédiate
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Meilleur prix garanti
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Paiement sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
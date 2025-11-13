import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { hotelAPI, flightAPI, packageAPI } from '../api/catalog';
import { bookingAPI } from '../api/bookings';
import { formatPrice } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function BookingPage() {
  const { type, id } = useParams(); // type: hotel, flight, package
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    start_date: location.state?.checkIn || '',
    end_date: location.state?.checkOut || '',
    num_guests: location.state?.guests || 1,
    special_requests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    loadItem();
  }, [type, id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      let data;
      if (type === 'hotel') {
        data = await hotelAPI.getById(id);
      } else if (type === 'flight') {
        data = await flightAPI.getById(id);
      } else if (type === 'package') {
        data = await packageAPI.getById(id);
      }
      setItem(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) {
      alert('Veuillez remplir toutes les dates');
      return;
    }

    setSubmitting(true);

    try {
      // Préparer les données de réservation
      const bookingData = {
        booking_type: type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        num_guests: parseInt(formData.num_guests),
        special_requests: formData.special_requests,
        unit_price: getUnitPrice(),
      };

      // Ajouter l'ID de l'élément selon le type
      if (type === 'hotel') bookingData.hotel = id;
      else if (type === 'flight') bookingData.flight = id;
      else if (type === 'package') bookingData.package = id;

      // Créer la réservation
      const booking = await bookingAPI.create(bookingData);

      // Rediriger vers la page de paiement
      navigate(`/payment/${booking.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const getUnitPrice = () => {
    if (type === 'hotel') return item.price_per_night;
    if (type === 'flight') return item.price;
    if (type === 'package') return item.price;
    return 0;
  };

  const getTotalPrice = () => {
    return getUnitPrice() * formData.num_guests;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Élément introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Réserver votre {type === 'hotel' ? 'hôtel' : type === 'flight' ? 'vol' : 'circuit'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations de l'élément */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {item.name || `${item.airline} ${item.flight_number}`}
              </h2>
              
              {item.image_main || item.image ? (
                <img
                  src={item.image_main || item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : null}

              <div className="space-y-2 text-gray-700">
                {type === 'hotel' && (
                  <>
                    <p>📍 {item.address}</p>
                    <p>⭐ {item.stars} étoiles</p>
                  </>
                )}
                {type === 'flight' && (
                  <>
                    <p>✈️ {item.origin_name} → {item.destination_name}</p>
                    <p>⏱️ Durée: {item.duration}</p>
                  </>
                )}
                {type === 'package' && (
                  <>
                    <p>📍 {item.destination_name}</p>
                    <p>📅 {item.duration_days} jours</p>
                  </>
                )}
              </div>
            </div>

            {/* Formulaire de réservation */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dates */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nombre de participants */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Nombre de {type === 'flight' ? 'passagers' : 'participants'}
                  </label>
                  <select
                    value={formData.num_guests}
                    onChange={(e) => setFormData({ ...formData, num_guests: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Demandes spéciales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demandes spéciales (optionnel)
                  </label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Chambre avec vue, siège côté fenêtre, régime alimentaire..."
                  />
                </div>

                {/* Résumé du prix */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Prix unitaire</span>
                    <span className="font-semibold">{formatPrice(getUnitPrice())}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Participants</span>
                    <span className="font-semibold">×{formData.num_guests}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continuer vers le paiement
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  En continuant, vous acceptez nos conditions générales de vente
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
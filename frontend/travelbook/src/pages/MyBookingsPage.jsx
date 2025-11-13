import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CreditCard, Eye, XCircle, Download, Clock } from 'lucide-react';
import { bookingAPI } from '../api/bookings';
import { formatPrice } from '../utils/formatters';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des réservations...');
      const data = await bookingAPI.getMyBookings();
      console.log('✅ Données reçues:', data);
      
      // S'assurer que c'est un tableau
      const bookingsArray = Array.isArray(data) ? data : [];
      setBookings(bookingsArray);
      
      console.log('📊 Nombre de réservations:', bookingsArray.length);
    } catch (error) {
      console.error('❌ Erreur détaillée:', error);
      console.error('Response:', error.response?.data);
      setError(error.message || 'Erreur lors du chargement');
      
      // Si erreur 401, rediriger vers login
      if (error.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await bookingAPI.cancel(id);
      alert('✅ Réservation annulée avec succès');
      loadBookings();
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const today = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    switch (filter) {
      case 'upcoming':
        return startDate > today && booking.status !== 'cancelled';
      case 'past':
        return endDate < today;
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => new Date(b.start_date) > new Date() && b.status !== 'cancelled').length,
    past: bookings.filter(b => new Date(b.end_date) < new Date()).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Chargement de vos réservations...</p>
      </div>
    );
  }

  // Afficher l'erreur si présente
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-2">
              <button
                onClick={loadBookings}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mes Réservations
          </h1>
          <p className="text-gray-600">
            Gérez et consultez toutes vos réservations
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: Calendar },
            { label: 'À venir', value: stats.upcoming, color: 'green', icon: Clock },
            { label: 'Passées', value: stats.past, color: 'gray', icon: Calendar },
            { label: 'Annulées', value: stats.cancelled, color: 'red', icon: XCircle },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-10 h-10 text-${stat.color}-500 opacity-50`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Toutes', count: stats.total },
              { id: 'upcoming', label: 'À venir', count: stats.upcoming },
              { id: 'past', label: 'Passées', count: stats.past },
              { id: 'cancelled', label: 'Annulées', count: stats.cancelled },
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === filterOption.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Liste des réservations */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune réservation trouvée</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir nos offres
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {booking.item_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Réservation #{booking.booking_number}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Dates</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.start_date).toLocaleDateString('fr-FR')} →{' '}
                            {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Participants</p>
                          <p className="font-semibold text-gray-900">
                            {booking.num_guests} personne{booking.num_guests > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prix total</p>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(booking.total_price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          booking.payment_status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <CreditCard className={`w-5 h-5 ${
                            booking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Paiement</p>
                          <p className="font-semibold text-gray-900">
                            {booking.payment_status === 'paid' ? 'Payé' : 'En attente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => navigate(`/booking-detail/${booking.id}`)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => alert('📄 Téléchargement du voucher (à implémenter)')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Voucher
                      </button>
                    )}

                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
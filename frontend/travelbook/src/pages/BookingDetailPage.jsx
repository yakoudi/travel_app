import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, CreditCard, MapPin, Phone, Mail, Download, XCircle, CheckCircle } from 'lucide-react';
import { bookingAPI } from '../api/bookings';
import { formatPrice } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getById(id);
      setBooking(data);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirm('Êtes-vous sûr de vouloir annuler cette réservation ?');
    if (!result.isConfirmed) {
      return;
    }

    try {
      await bookingAPI.cancel(id);
      await showSuccess('Réservation annulée avec succès');
      loadBooking();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'from-green-500 to-emerald-500';
      case 'pending': return 'from-yellow-500 to-orange-500';
      case 'cancelled': return 'from-red-500 to-pink-500';
      case 'completed': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Réservation introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à mes réservations
        </button>

        {/* En-tête avec statut */}
        <div className={`bg-gradient-to-r ${getStatusColor(booking.status)} rounded-xl shadow-lg p-8 text-white mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Numéro de réservation</p>
              <p className="text-4xl font-bold">{booking.booking_number}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-lg font-semibold">
                {booking.status === 'confirmed' && '✅ Confirmée'}
                {booking.status === 'pending' && '⏳ En attente'}
                {booking.status === 'cancelled' && '❌ Annulée'}
                {booking.status === 'completed' && '✓ Terminée'}
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{booking.item_name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dates et participants */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Détails de la réservation
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Dates du séjour</p>
                    <p className="text-gray-700">
                      Du {new Date(booking.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-700">
                      Au {new Date(booking.end_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Durée: {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} nuit(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Participants</p>
                    <p className="text-gray-700">
                      {booking.num_guests} personne{booking.num_guests > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">Demandes spéciales</p>
                    <p className="text-gray-700">{booking.special_requests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations de contact */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations de contact
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{booking.user_email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{user?.phone || 'Non renseigné'}</span>
                </div>
              </div>
            </div>

            {/* Paiement */}
            {booking.payment && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de paiement
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Méthode de paiement</span>
                    <span className="font-semibold text-gray-900">
                      {booking.payment.payment_method === 'card' && '💳 Carte bancaire'}
                      {booking.payment.payment_method === 'paypal' && '💰 PayPal'}
                      {booking.payment.payment_method === 'bank_transfer' && '🏦 Virement'}
                      {booking.payment.payment_method === 'cash' && '💵 Espèces'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Date de paiement</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(booking.payment.payment_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {booking.payment.transaction_id && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-900">
                        {booking.payment.transaction_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Récapitulatif prix */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Prix unitaire</span>
                  <span className="font-semibold">{formatPrice(booking.unit_price)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Participants</span>
                  <span className="font-semibold">×{booking.num_guests}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    {booking.payment_status === 'paid' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-semibold">Payé</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-700 font-semibold">En attente de paiement</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => showInfo('📄 Téléchargement (à implémenter)')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger le voucher
                  </button>
                )}

                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={handleCancel}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Annuler la réservation
                  </button>
                )}
              </div>

              {/* Informations importantes */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  ✓ Annulation gratuite jusqu'à 24h avant
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  ✓ Modification possible jusqu'à 48h avant
                </p>
                <p className="text-xs text-gray-600">
                  ✓ Service client disponible 7j/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
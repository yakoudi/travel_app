import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, MapPin, Download, Home } from 'lucide-react';
import { bookingAPI } from '../api/bookings';
import { formatPrice } from '../utils/formatters';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVoucher = () => {
    // Simulation du téléchargement
    showInfo('📄 Le voucher sera téléchargé (fonctionnalité à implémenter)');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animation de succès */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Réservation confirmée ! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Merci pour votre réservation
          </p>
        </div>

        {/* Carte de confirmation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* En-tête coloré */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Numéro de réservation</p>
            <p className="text-3xl font-bold">{booking.booking_number}</p>
          </div>

          {/* Détails de la réservation */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {booking.item_name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.start_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date de fin</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.end_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p className="font-semibold text-gray-900">
                  {booking.num_guests} personne{booking.num_guests > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {booking.special_requests && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">Vos demandes spéciales :</p>
                <p className="text-gray-900">{booking.special_requests}</p>
              </div>
            )}

            {/* Résumé financier */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Prix unitaire</span>
                <span className="font-semibold">{formatPrice(booking.unit_price)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Participants</span>
                <span className="font-semibold">×{booking.num_guests}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-green-600 pt-2 border-t border-gray-200">
                <span>Total payé</span>
                <span>{formatPrice(booking.total_price)}</span>
              </div>
            </div>

            {/* Statuts */}
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Statut réservation</p>
                <p className="font-bold text-green-600 text-lg">
                  {booking.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                </p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Statut paiement</p>
                <p className="font-bold text-blue-600 text-lg">
                  {booking.payment_status === 'paid' ? 'Payé' : 'En attente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleDownloadVoucher}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger le voucher (PDF)
          </button>

          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Voir mes réservations
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>

        {/* Informations importantes */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">📧 Email de confirmation envoyé</h3>
          <p className="text-gray-700 mb-4">
            Un email de confirmation a été envoyé à votre adresse : <strong>{booking.user_email}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Vous y trouverez tous les détails de votre réservation et votre voucher.
          </p>
        </div>
      </div>
    </div>
  );
}
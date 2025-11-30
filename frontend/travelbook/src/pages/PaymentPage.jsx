import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Building, Wallet, DollarSign, Check, Lock } from 'lucide-react';
import { bookingAPI, paymentAPI } from '../api/bookings';
import { formatPrice } from '../utils/formatters';
import { showSuccess, showError, showWarning } from '../utils/sweetAlert';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

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
      showError('Erreur lors du chargement de la réservation');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      showWarning('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setProcessing(true);

    try {
      // Traiter le paiement
      const result = await paymentAPI.processPayment(bookingId, selectedMethod);
      
      // Afficher le message de succès
      await showSuccess('Paiement effectué avec succès !');
      
      // Rediriger vers la page de confirmation
      navigate(`/booking-confirmation/${bookingId}`);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: CreditCard,
      description: 'Paiement sécurisé par carte',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Wallet,
      description: 'Paiement via PayPal',
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: Building,
      description: 'Paiement par virement',
    },
    {
      id: 'cash',
      name: 'En agence',
      icon: DollarSign,
      description: 'Paiement en espèces',
    },
  ];

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
              <p className="text-gray-600">Réservation #{booking.booking_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Récapitulatif de la réservation */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Récapitulatif de votre réservation
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Élément réservé</p>
                  <p className="font-semibold text-gray-900">{booking.item_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-semibold text-gray-900">{booking.num_guests} personne(s)</p>
                </div>

                {booking.special_requests && (
                  <div>
                    <p className="text-sm text-gray-500">Demandes spéciales</p>
                    <p className="text-gray-700 text-sm">{booking.special_requests}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Prix unitaire</span>
                    <span className="font-semibold">{formatPrice(booking.unit_price)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Participants</span>
                    <span className="font-semibold">×{booking.num_guests}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t border-gray-200">
                    <span>Total à payer</span>
                    <span>{formatPrice(booking.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Méthodes de paiement */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Choisissez votre méthode de paiement
              </h2>

              <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {selectedMethod === method.id && (
                          <Check className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || !selectedMethod}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Payer {formatPrice(booking.total_price)}
                  </>
                )}
              </button>

              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Paiement 100% sécurisé
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Confirmation immédiate
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Annulation gratuite sous 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
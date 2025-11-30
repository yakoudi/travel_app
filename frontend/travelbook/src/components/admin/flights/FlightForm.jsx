import React, { useState, useEffect } from 'react';
import { X, Save, Plane } from 'lucide-react';
import { flightAPI, destinationAPI } from '../../../api/catalog';
import { toDateTimeLocal } from '../../../utils/formatters';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../../../utils/sweetAlert';

export default function FlightForm({ flight, onClose }) {
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    available_seats: '',
    is_direct: true,
    baggage_included: true,
    is_available: true,
  });

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDestinations();
    if (flight) {
      setFormData({
        airline: flight.airline || '',
        flight_number: flight.flight_number || '',
        origin: flight.origin || '',
        destination: flight.destination || '',
        departure_time: flight.departure_time ? toDateTimeLocal(flight.departure_time) : '',
        arrival_time: flight.arrival_time ? toDateTimeLocal(flight.arrival_time) : '',
        price: flight.price || '',
        available_seats: flight.available_seats || '',
        is_direct: flight.is_direct !== undefined ? flight.is_direct : true,
        baggage_included: flight.baggage_included !== undefined ? flight.baggage_included : true,
        is_available: flight.is_available !== undefined ? flight.is_available : true,
      });
    }
  }, [flight]);

  const loadDestinations = async () => {
    try {
      const data = await destinationAPI.getAll();
      setDestinations(data);
    } catch (error) {
      console.error('Erreur chargement destinations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: l'arrivée doit être après le départ
    if (new Date(formData.arrival_time) <= new Date(formData.departure_time)) {
      showWarning('L\'heure d\'arrivée doit être après l\'heure de départ');
      return;
    }

    setLoading(true);

    try {
      const data = {
        airline: formData.airline,
        flight_number: formData.flight_number,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        price: parseFloat(formData.price),
        available_seats: parseInt(formData.available_seats),
        is_direct: formData.is_direct,
        baggage_included: formData.baggage_included,
        is_available: formData.is_available,
      };

      if (flight) {
        await flightAPI.update(flight.id, data);
        await showSuccess('Vol modifié avec succès');
      } else {
        await flightAPI.create(data);
        await showSuccess('Vol créé avec succès');
      }

      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Plane className="w-7 h-7 text-blue-600" />
            {flight ? 'Modifier' : 'Nouveau'} Vol
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compagnie aérienne */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compagnie aérienne *
              </label>
              <input
                type="text"
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Air France"
              />
            </div>

            {/* Numéro de vol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de vol *
              </label>
              <input
                type="text"
                name="flight_number"
                value={formData.flight_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AF1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origine *
              </label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une origine</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une destination</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heure de départ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de départ *
              </label>
              <input
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Heure d'arrivée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure d'arrivée *
              </label>
              <input
                type="datetime-local"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (TND) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500.00"
              />
            </div>

            {/* Sièges disponibles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sièges disponibles *
              </label>
              <input
                type="number"
                name="available_seats"
                value={formData.available_seats}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="150"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_direct"
                checked={formData.is_direct}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Vol direct (sans escale)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="baggage_included"
                checked={formData.baggage_included}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Bagage inclus
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Vol disponible
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {flight ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Plane, Clock, Calendar, Users } from 'lucide-react';
import { flightAPI } from '../../../api/catalog';
import FlightForm from './FlightForm';
import { formatPrice, formatDateTime } from '../../../utils/formatters';

export default function FlightList() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await flightAPI.getAll();
      setFlights(data.results || data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des vols');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) {
      return;
    }

    try {
      await flightAPI.delete(id);
      alert('Vol supprimé avec succès');
      loadFlights();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (flight) => {
    setSelectedFlight(flight);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedFlight(null);
    loadFlights();
  };

  if (showForm) {
    return <FlightForm flight={selectedFlight} onClose={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vols</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de vols</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouveau vol
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : flights.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun vol trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                {/* Informations du vol */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  {/* Compagnie et numéro */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-lg text-gray-900">
                        {flight.flight_number}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{flight.airline}</p>
                    {!flight.is_available && (
                      <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        Non disponible
                      </span>
                    )}
                  </div>

                  {/* Origine */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Départ</p>
                    <p className="font-semibold text-gray-900">
                      {flight.origin_name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(flight.departure_time)}
                    </div>
                  </div>

                  {/* Trajet */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      <div className="flex flex-col items-center">
                        <Plane className="w-6 h-6 text-blue-600 transform rotate-90" />
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Clock className="w-3 h-3" />
                          {flight.duration}
                        </div>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    {flight.is_direct ? (
                      <span className="text-xs text-green-600 font-semibold mt-2">
                        Vol direct
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600 font-semibold mt-2">
                        Avec escale
                      </span>
                    )}
                  </div>

                  {/* Destination */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Arrivée</p>
                    <p className="font-semibold text-gray-900">
                      {flight.destination_name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(flight.arrival_time)}
                    </div>
                  </div>

                  {/* Prix et places */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {formatPrice(flight.price)}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {flight.available_seats} places
                    </div>
                    {flight.baggage_included && (
                      <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Bagage inclus
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleEdit(flight)}
                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(flight.id)}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, Calendar, Briefcase, CheckCircle } from 'lucide-react';
import { formatPrice, formatDateTime } from '../../utils/formatters';

export default function FlightCard({ flight }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/flights/${flight.id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* En-tête avec compagnie */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm opacity-90">{flight.airline}</p>
              <p className="font-bold text-lg">{flight.flight_number}</p>
            </div>
          </div>
          {flight.is_direct && (
            <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">
              Vol direct
            </div>
          )}
        </div>
      </div>

      {/* Itinéraire */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          {/* Départ */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Départ</p>
            <p className="font-bold text-lg text-gray-900">{flight.origin_name}</p>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(flight.departure_time)}</span>
            </div>
          </div>

          {/* Durée */}
          <div className="flex flex-col items-center">
            <div className="w-full border-t-2 border-dashed border-gray-300 relative">
              <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 rotate-90 bg-white px-1" />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Clock className="w-3 h-3" />
              <span>{flight.duration}</span>
            </div>
          </div>

          {/* Arrivée */}
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Arrivée</p>
            <p className="font-bold text-lg text-gray-900">{flight.destination_name}</p>
            <div className="flex items-center justify-end gap-1 text-sm text-gray-600 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(flight.arrival_time)}</span>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {flight.baggage_included && (
            <div className="flex items-center gap-1 text-green-600">
              <Briefcase className="w-4 h-4" />
              <span>Bagage inclus</span>
            </div>
          )}
          {flight.available_seats > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <CheckCircle className="w-4 h-4" />
              <span>{flight.available_seats} places</span>
            </div>
          )}
        </div>

        {/* Prix et action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Prix par personne</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(flight.price)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/flights/${flight.id}`);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
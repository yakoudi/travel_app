import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Check, Package } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function PackageCard({ package: pkg }) {
  const navigate = useNavigate();

  const inclusions = [
    { key: 'includes_hotel', label: '🏨 Hôtel' },
    { key: 'includes_flight', label: '✈️ Vol' },
    { key: 'includes_meals', label: '🍽️ Repas' },
    { key: 'includes_guide', label: '👨‍🏫 Guide' },
  ];

  const availableInclusions = inclusions.filter(inc => pkg[inc.key]);

  return (
    <div
      onClick={() => navigate(`/packages/${pkg.id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-56">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Package className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Badge durée */}
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-gray-900">
              {pkg.duration_days} jour{pkg.duration_days > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Badge prix */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-xs opacity-90">À partir de</p>
          <p className="text-lg font-bold">{formatPrice(pkg.price)}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Titre */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {pkg.name}
        </h3>

        {/* Destination */}
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{pkg.destination_name}</span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {pkg.description}
        </p>

        {/* Inclusions */}
        <div className="space-y-2 mb-4">
          {availableInclusions.slice(0, 3).map((inc) => (
            <div key={inc.key} className="flex items-center gap-2 text-sm text-green-700">
              <Check className="w-4 h-4" />
              <span>{inc.label}</span>
            </div>
          ))}
          {availableInclusions.length > 3 && (
            <p className="text-sm text-gray-500">
              +{availableInclusions.length - 3} autres inclusions
            </p>
          )}
        </div>

        {/* Participants max */}
        <div className="flex items-center gap-2 text-gray-600 mb-4 pb-4 border-b border-gray-200">
          <Users className="w-4 h-4" />
          <span className="text-sm">Max {pkg.max_participants} participants</span>
        </div>

        {/* Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/packages/${pkg.id}`);
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all font-semibold"
        >
          Voir le circuit
        </button>
      </div>
    </div>
  );
}
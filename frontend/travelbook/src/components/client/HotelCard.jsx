import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Utensils, Coffee, Sparkles } from 'lucide-react';
import { formatPrice, renderStars } from '../../utils/formatters';

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();

  const amenities = [
    { key: 'has_wifi', icon: Wifi, label: 'WiFi' },
    { key: 'has_parking', icon: Car, label: 'Parking' },
    { key: 'has_restaurant', icon: Utensils, label: 'Restaurant' },
    { key: 'has_spa', icon: Coffee, label: 'Spa' },
    { key: 'has_pool', icon: Sparkles, label: 'Piscine' },
  ];

  const availableAmenities = amenities.filter(amenity => hotel[amenity.key]);

  return (
    <div
      onClick={() => navigate(`/hotels/${hotel.id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-56">
        {hotel.image_main ? (
          <img
            src={hotel.image_main}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-6xl">🏨</span>
          </div>
        )}
        
        {/* Badge étoiles */}
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-lg">
          <span className="text-sm font-semibold">
            {renderStars(hotel.stars)}
          </span>
        </div>

        {/* Badge note */}
        {hotel.average_rating > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{hotel.average_rating}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Titre et localisation */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hotel.destination_name}</span>
        </div>

        {/* Équipements */}
        {availableAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {availableAmenities.slice(0, 4).map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={amenity.key}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs"
                  title={amenity.label}
                >
                  <Icon className="w-3 h-3" />
                  <span>{amenity.label}</span>
                </div>
              );
            })}
            {availableAmenities.length > 4 && (
              <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                +{availableAmenities.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Prix */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">À partir de</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(hotel.price_per_night)}
            </p>
            <p className="text-xs text-gray-500">par nuit</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotels/${hotel.id}`);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Plane, Package, ArrowRight, Star, MapPin } from 'lucide-react';
import { hotelAPI, flightAPI, packageAPI } from '../api/catalog';
import { formatPrice } from '../utils/formatters';

export default function FeaturedOffers() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedOffers();
  }, []);

  const loadFeaturedOffers = async () => {
    try {
      setLoading(true);
      const [hotelsData, flightsData, packagesData] = await Promise.all([
        hotelAPI.getAll({ ordering: '-average_rating' }),
        flightAPI.getAll({ ordering: 'price' }),
        packageAPI.getAll({ ordering: '-created_at' }),
      ]);

      setHotels((hotelsData.results || hotelsData).slice(0, 3));
      setFlights((flightsData.results || flightsData).slice(0, 3));
      setPackages((packagesData.results || packagesData).slice(0, 3));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hôtels populaires */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                🏨 Hôtels populaires
              </h2>
              <p className="text-gray-600">Les meilleurs établissements selon nos clients</p>
            </div>
            <button
              onClick={() => navigate('/search?type=hotels')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tous les hôtels
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  {hotel.image_main ? (
                    <img src={hotel.image_main} alt={hotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  )}
                  {hotel.average_rating > 0 && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{hotel.average_rating}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{hotel.destination_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">À partir de</p>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(hotel.price_per_night)}</p>
                    </div>
                    <span className="text-yellow-500">{'⭐'.repeat(hotel.stars)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vols pas chers */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                ✈️ Vols au meilleur prix
              </h2>
              <p className="text-gray-600">Réservez vos billets d'avion aux meilleurs tarifs</p>
            </div>
            <button
              onClick={() => navigate('/search?type=flights')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tous les vols
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => navigate(`/flights/${flight.id}`)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{flight.flight_number}</p>
                      <p className="text-sm text-gray-600">{flight.airline}</p>
                    </div>
                  </div>
                  {flight.is_direct && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                      Direct
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">De</p>
                    <p className="font-semibold text-gray-900">{flight.origin_name}</p>
                  </div>
                  <div className="flex-1 border-t border-dashed border-gray-300 mx-4"></div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Vers</p>
                    <p className="font-semibold text-gray-900">{flight.destination_name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(flight.price)}</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circuits organisés */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                🎒 Circuits organisés
              </h2>
              <p className="text-gray-600">Découvrez nos séjours tout compris</p>
            </div>
            <button
              onClick={() => navigate('/search?type=packages')}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
            >
              Voir tous les circuits
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => navigate(`/packages/${pkg.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  {pkg.image ? (
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                  )}
                  <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{pkg.duration_days} jours</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{pkg.destination_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">À partir de</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        {formatPrice(pkg.price)}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
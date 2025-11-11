import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, TrendingUp } from 'lucide-react';
import { destinationAPI } from '../api/catalog';

export default function DestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationAPI.getAll();
      setDestinations(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPopular = !showOnlyPopular || dest.is_popular;
    return matchesSearch && matchesPopular;
  });

  const popularDestinations = destinations.filter((d) => d.is_popular);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Découvrez nos destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorez les plus beaux endroits du monde et trouvez votre prochaine aventure
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setShowOnlyPopular(false)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              !showOnlyPopular
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Toutes les destinations ({destinations.length})
          </button>
          <button
            onClick={() => setShowOnlyPopular(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              showOnlyPopular
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Star className="w-5 h-5" fill={showOnlyPopular ? 'currentColor' : 'none'} />
            Destinations populaires ({popularDestinations.length})
          </button>
        </div>

        {/* Destinations populaires - Section spéciale */}
        {!searchTerm && !showOnlyPopular && popularDestinations.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">
                Destinations tendances
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularDestinations.slice(0, 6).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  navigate={navigate}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Toutes les destinations */}
        {!showOnlyPopular && !searchTerm && (
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Toutes les destinations
          </h2>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune destination trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationCard({ destination, navigate, featured = false }) {
  return (
    <div
      onClick={() => navigate(`/search?destination=${destination.id}`)}
      className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
        featured ? 'ring-4 ring-yellow-400' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-64">
        {destination.image ? (
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Badge populaire */}
        {destination.is_popular && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4" fill="currentColor" />
            <span className="text-sm font-semibold">Populaire</span>
          </div>
        )}

        {/* Informations */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-1">
            {destination.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{destination.country}</span>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-300"></div>
    </div>
  );
}
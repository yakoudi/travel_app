import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Hotel, Plane, Package, X } from 'lucide-react';
import { hotelAPI, flightAPI, packageAPI, destinationAPI } from '../api/catalog';
import HotelCard from '../components/client/HotelCard';
import FlightCard from '../components/client/FlightCard';
import PackageCard from '../components/client/PackageCard';
import { formatPrice } from '../utils/formatters';

export default function SearchPage() {
  const [searchType, setSearchType] = useState('hotels'); // hotels, flights, packages
  const [results, setResults] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    destination: '',
    minPrice: '',
    maxPrice: '',
    stars: '',
    sortBy: 'created_at',
  });

  useEffect(() => {
    loadDestinations();
    performSearch();
  }, [searchType]);

  const loadDestinations = async () => {
    try {
      const data = await destinationAPI.getAll();
      setDestinations(data);
    } catch (error) {
      console.error('Erreur chargement destinations:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      let data;
      const params = {
        search: filters.search,
        destination: filters.destination,
        ordering: filters.sortBy,
      };

      if (searchType === 'hotels') {
        if (filters.stars) params.stars = filters.stars;
        data = await hotelAPI.getAll(params);
      } else if (searchType === 'flights') {
        data = await flightAPI.getAll(params);
      } else if (searchType === 'packages') {
        data = await packageAPI.getAll(params);
      }

      let items = data.results || data;

      // Filtrer par prix
      if (filters.minPrice) {
        items = items.filter(item => {
          const price = item.price_per_night || item.price;
          return price >= parseFloat(filters.minPrice);
        });
      }
      if (filters.maxPrice) {
        items = items.filter(item => {
          const price = item.price_per_night || item.price;
          return price <= parseFloat(filters.maxPrice);
        });
      }

      setResults(items);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      destination: '',
      minPrice: '',
      maxPrice: '',
      stars: '',
      sortBy: 'created_at',
    });
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchType === 'hotels' ? <Hotel className="w-16 h-16 mx-auto" /> :
             searchType === 'flights' ? <Plane className="w-16 h-16 mx-auto" /> :
             <Package className="w-16 h-16 mx-auto" />}
          </div>
          <p className="text-gray-600 text-lg">Aucun résultat trouvé</p>
          <button
            onClick={resetFilters}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      );
    }

    return results.map((item) => {
      if (searchType === 'hotels') {
        return <HotelCard key={item.id} hotel={item} />;
      } else if (searchType === 'flights') {
        return <FlightCard key={item.id} flight={item} />;
      } else {
        return <PackageCard key={item.id} package={item} />;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rechercher votre voyage
          </h1>
          <p className="text-gray-600">
            Trouvez les meilleures offres parmi {results.length} résultats
          </p>
        </div>

        {/* Tabs Type de recherche */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setSearchType('hotels')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              searchType === 'hotels'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Hotel className="w-5 h-5" />
            Hôtels
          </button>
          <button
            onClick={() => setSearchType('flights')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              searchType === 'flights'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plane className="w-5 h-5" />
            Vols
          </button>
          <button
            onClick={() => setSearchType('packages')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              searchType === 'packages'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Circuits
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Destination */}
            <select
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les destinations</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>

            {/* Boutons */}
            <button
              onClick={performSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtres
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Prix minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix min (TND)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Prix maximum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix max (TND)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>

                {/* Étoiles (pour hôtels) */}
                {searchType === 'hotels' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Étoiles
                    </label>
                    <select
                      value={filters.stars}
                      onChange={(e) => handleFilterChange('stars', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 étoiles</option>
                      <option value="4">⭐⭐⭐⭐ 4 étoiles</option>
                      <option value="3">⭐⭐⭐ 3 étoiles</option>
                      <option value="2">⭐⭐ 2 étoiles</option>
                      <option value="1">⭐ 1 étoile</option>
                    </select>
                  </div>
                )}

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at">Plus récent</option>
                    <option value="-created_at">Plus ancien</option>
                    <option value="price_per_night">Prix croissant</option>
                    <option value="-price_per_night">Prix décroissant</option>
                    {searchType === 'hotels' && (
                      <>
                        <option value="-average_rating">Mieux notés</option>
                        <option value="-stars">Plus d'étoiles</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Bouton réinitialiser */}
              <button
                onClick={resetFilters}
                className="mt-4 text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderResults()}
        </div>
      </div>
    </div>
  );
}
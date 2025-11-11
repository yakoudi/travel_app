import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Hotel, Star, Wifi, Coffee, Car, Utensils, Sparkles, Power, Search } from 'lucide-react';
import { hotelAPI } from '../../../api/catalog';
import HotelForm from './HotelForm';
import { formatPrice, renderStars } from '../../../utils/formatters';

export default function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    destination: '',
    stars: '',
    is_available: '',
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.destination) params.destination = filters.destination;
      if (filters.stars) params.stars = filters.stars;
      if (filters.is_available !== '') params.is_available = filters.is_available;
      
      const data = await hotelAPI.getAll(params);
      setHotels(data.results || data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) {
      return;
    }

    try {
      await hotelAPI.delete(id);
      alert('Hôtel supprimé avec succès');
      loadHotels();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await hotelAPI.toggleAvailability(id);
      loadHotels();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de disponibilité');
    }
  };

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedHotel(null);
    loadHotels();
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      has_wifi: <Wifi className="w-4 h-4" />,
      has_pool: <Sparkles className="w-4 h-4" />,
      has_parking: <Car className="w-4 h-4" />,
      has_restaurant: <Utensils className="w-4 h-4" />,
      has_spa: <Coffee className="w-4 h-4" />,
    };
    return icons[amenity] || null;
  };

  if (showForm) {
    return <HotelForm hotel={selectedHotel} onClose={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hôtels</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue d'hôtels</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvel hôtel
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.stars}
            onChange={(e) => setFilters({ ...filters, stars: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les étoiles</option>
            <option value="1">⭐ 1 étoile</option>
            <option value="2">⭐⭐ 2 étoiles</option>
            <option value="3">⭐⭐⭐ 3 étoiles</option>
            <option value="4">⭐⭐⭐⭐ 4 étoiles</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 étoiles</option>
          </select>

          <select
            value={filters.is_available}
            onChange={(e) => setFilters({ ...filters, is_available: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Disponible</option>
            <option value="false">Non disponible</option>
          </select>

          <button
            onClick={loadHotels}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun hôtel trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="flex">
                {/* Image */}
                <div className="w-1/3 relative">
                  {hotel.image_main ? (
                    <img
                      src={hotel.image_main}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Hotel className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {!hotel.is_available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Non disponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {hotel.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📍 {hotel.destination_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(hotel.stars)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {hotel.address}
                  </p>

                  {/* Équipements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.has_wifi && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                        <Wifi className="w-3 h-3" />
                        WiFi
                      </div>
                    )}
                    {hotel.has_pool && (
                      <div className="flex items-center gap-1 bg-cyan-50 text-cyan-600 px-2 py-1 rounded text-xs">
                        <Sparkles className="w-3 h-3" />
                        Piscine
                      </div>
                    )}
                    {hotel.has_parking && (
                      <div className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                        <Car className="w-3 h-3" />
                        Parking
                      </div>
                    )}
                    {hotel.has_restaurant && (
                      <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs">
                        <Utensils className="w-3 h-3" />
                        Restaurant
                      </div>
                    )}
                    {hotel.has_spa && (
                      <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs">
                        <Coffee className="w-3 h-3" />
                        Spa
                      </div>
                    )}
                  </div>

                  {/* Prix et infos */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(hotel.price_per_night)}
                      </p>
                      <p className="text-xs text-gray-500">par nuit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {hotel.total_rooms} chambres
                      </p>
                      {hotel.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold">
                            {hotel.average_rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAvailability(hotel.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        hotel.is_available
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      title={hotel.is_available ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
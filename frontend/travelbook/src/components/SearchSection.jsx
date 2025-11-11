import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export default function SearchSection() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Rediriger vers la page de recherche avec les paramètres
    navigate('/search', { state: searchData });
  };

  return (
    <section className="relative -mt-20 z-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Trouvez votre prochain voyage
          </h2>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Où allez-vous ?"
                    value={searchData.destination}
                    onChange={(e) =>
                      setSearchData({ ...searchData, destination: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date d'arrivée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'arrivée
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) =>
                      setSearchData({ ...searchData, checkIn: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date de départ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) =>
                      setSearchData({ ...searchData, checkOut: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Voyageurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voyageurs
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={searchData.guests}
                    onChange={(e) =>
                      setSearchData({ ...searchData, guests: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="1">1 voyageur</option>
                    <option value="2">2 voyageurs</option>
                    <option value="3">3 voyageurs</option>
                    <option value="4">4 voyageurs</option>
                    <option value="5+">5+ voyageurs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bouton de recherche */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </button>
            </div>
          </form>

          {/* Liens rapides */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              🏨 Hôtels populaires
            </button>
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              ✈️ Vols pas chers
            </button>
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              🎒 Circuits organisés
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
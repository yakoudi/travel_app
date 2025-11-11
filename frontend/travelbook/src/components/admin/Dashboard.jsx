import React, { useState, useEffect } from 'react';
import { Hotel, Plane, MapPin, Package, Gift, TrendingUp } from 'lucide-react';
import { destinationAPI, hotelAPI, flightAPI, packageAPI, promotionAPI } from '../../api/catalog';

export default function Dashboard() {
  const [stats, setStats] = useState({
    destinations: 0,
    hotels: 0,
    flights: 0,
    packages: 0,
    promotions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [destinations, hotels, flights, packages, promotions] = await Promise.all([
        destinationAPI.getAll(),
        hotelAPI.getAll(),
        flightAPI.getAll(),
        packageAPI.getAll(),
        promotionAPI.getAll(),
      ]);

      setStats({
        destinations: destinations.length || destinations.count || 0,
        hotels: hotels.results?.length || hotels.length || 0,
        flights: flights.results?.length || flights.length || 0,
        packages: packages.results?.length || packages.length || 0,
        promotions: promotions.length || promotions.count || 0,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Destinations', 
      value: stats.destinations, 
      icon: MapPin, 
      color: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      label: 'Hôtels', 
      value: stats.hotels, 
      icon: Hotel, 
      color: 'bg-green-500',
      gradient: 'from-green-400 to-green-600'
    },
    { 
      label: 'Vols', 
      value: stats.flights, 
      icon: Plane, 
      color: 'bg-purple-500',
      gradient: 'from-purple-400 to-purple-600'
    },
    { 
      label: 'Circuits', 
      value: stats.packages, 
      icon: Package, 
      color: 'bg-orange-500',
      gradient: 'from-orange-400 to-orange-600'
    },
    { 
      label: 'Promotions', 
      value: stats.promotions, 
      icon: Gift, 
      color: 'bg-pink-500',
      gradient: 'from-pink-400 to-pink-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
        <p className="text-blue-100">Vue d'ensemble de votre catalogue</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">Ajouter une destination</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <Hotel className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-700">Ajouter un hôtel</span>
          </button>
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <Plane className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">Ajouter un vol</span>
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, Users, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../utils/formatters';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/bookings/bookings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_URL}/bookings/bookings/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Statut mis à jour');
      loadBookings();
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  // Statistiques
  const stats = {
    total: bookings.length,
    totalRevenue: bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.total_price), 0),
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  // Filtrage
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.item_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
        <p className="text-gray-600 mt-1">Administrez toutes les réservations clients</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Réservations', value: stats.total, icon: Calendar, color: 'blue' },
          { label: 'Revenus Totaux', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'green' },
          { label: 'Confirmées', value: stats.confirmed, icon: CheckCircle, color: 'emerald' },
          { label: 'En attente', value: stats.pending, icon: TrendingUp, color: 'yellow' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <Icon className={`w-10 h-10 text-${stat.color}-500 opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par numéro, email ou élément..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
            <option value="completed">Terminées</option>
          </select>
        </div>
      </div>

      {/* Table des réservations */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élément
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">
                        {booking.booking_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.user_name}</p>
                        <p className="text-xs text-gray-500">{booking.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{booking.item_name}</p>
                      <span className="text-xs text-gray-500">{booking.booking_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        → {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(booking.total_price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.payment_status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/booking/${booking.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800"
                            title="Confirmer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800"
                            title="Annuler"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
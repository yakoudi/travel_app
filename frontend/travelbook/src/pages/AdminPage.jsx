import React, { useState } from 'react';
import { Home, MapPin, Hotel, Plane, Package, Gift, Menu, X, LogOut, Calendar } from 'lucide-react';
import Dashboard from '../components/admin/Dashboard';
import DestinationList from '../components/admin/destinations/DestinationList';
import HotelList from '../components/admin/hotels/HotelList';
import FlightList from '../components/admin/flights/FlightList';
import PackageList from '../components/admin/packages/PackageList';
import PromotionList from '../components/admin/promotions/PromotionList';
import AdminBookingsPage from '../components/admin/AdminBookingsPage';
import { showConfirm } from '../utils/sweetAlert';

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'hotels', label: 'Hôtels', icon: Hotel },
    { id: 'flights', label: 'Vols', icon: Plane },
    { id: 'packages', label: 'Circuits', icon: Package },
    { id: 'promotions', label: 'Promotions', icon: Gift },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'bookings':
        return <AdminBookingsPage />;
      case 'destinations':
        return <DestinationList />;
      case 'hotels':
        return <HotelList />;
      case 'flights':
        return <FlightList />;
      case 'packages':
        return <PackageList />;
      case 'promotions':
        return <PromotionList />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = async () => {
    const result = await showConfirm('Êtes-vous sûr de vouloir vous déconnecter ?', 'Confirmer la déconnexion');
    if (result.isConfirmed) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-all duration-300 fixed h-full z-50 shadow-xl`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-blue-600">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold">TravelTodo</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'hover:bg-blue-600 text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-white"
            title={!isSidebarOpen ? 'Déconnexion' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        } transition-all duration-300 p-8`}
      >
        {renderPage()}
      </main>
    </div>
  );
}
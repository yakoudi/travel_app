import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages existantes
import Hero from './components/Hero';
import SearchSection from './components/SearchSection';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Pages Admin (Sprint 2)
import AdminPage from './pages/AdminPage';

// Pages Client (Sprint 3)
import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import FlightDetailPage from './pages/FlightDetailPage';
import PackageDetailPage from './pages/PackageDetailPage';
import DestinationsPage from './pages/DestinationsPage';

import './App.css';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Composant pour protéger les routes admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">⛔ Accès refusé</h1>
          <p className="text-gray-600 mb-6">Vous n'avez pas les permissions pour accéder à cette page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Composant pour rediriger si déjà connecté
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Page d'accueil avec tous les composants
function HomePage() {
  return (
    <>
      <Hero />
      <SearchSection />
      <Features />
      <Testimonials />
      <CTA />
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* N'afficher le Header que si on n'est pas dans l'admin */}
      {!window.location.pathname.startsWith('/admin') && <Header />}
      
      <main className="flex-grow">
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<HomePage />} />
          
          {/* Routes publiques - Authentification */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          
          {/* Routes protégées - Profil */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Routes Client - Sprint 3 */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/flights/:id" element={<FlightDetailPage />} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />

          {/* Routes Admin - Sprint 2 */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          
          {/* 404 - Page non trouvée */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page non trouvée</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>
      
      {/* N'afficher le Footer que si on n'est pas dans l'admin */}
      {!window.location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
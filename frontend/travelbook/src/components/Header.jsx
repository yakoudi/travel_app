import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ListTodo, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✈</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">TravelTodo</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Accueil
            </button>
            <button 
              onClick={() => navigate('/destinations')}
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Destinations
            </button>
        
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>{user?.first_name || user?.email}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          👑 Administrateur
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </button>
                    
                    
                    {user?.role === 'admin' && (
                      <>
                        <hr className="my-2" />
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
                        >
                          <span>⚙️</span>
                          Administration
                        </button>
                      </>
                    )}
                    
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <span>🚪</span>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Connexion
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <button 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-blue-600"
            >
              Accueil
            </button>
            <button 
              onClick={() => {
                navigate('/destinations');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-blue-600"
            >
              Destinations
            </button>
            {isAuthenticated && (
              <button 
                onClick={() => {
                  navigate('/travel-todo');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-blue-600"
              >
                Ma Travel Todo
              </button>
            )}
            
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-2 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 text-sm">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                  >
                    Mon profil
                  </button>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setMobileMenuOpen(false);
                      }}
                      className="text-left bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition"
                    >
                      ⚙️ Administration
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
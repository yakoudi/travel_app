import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Wifi, Car, Utensils, Coffee, Sparkles, Heart, Share2 } from 'lucide-react';
import { hotelAPI } from '../api/catalog';
import { formatPrice, renderStars } from '../utils/formatters';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomType, setRoomType] = useState('standard');
  const [numGuests, setNumGuests] = useState(2);

  useEffect(() => {
    loadHotel();
  }, [id]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const data = await hotelAPI.getById(id);
      setHotel(data);
      setSelectedImage(0);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du chargement de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  // Calculer le prix selon le type de chambre
  const getRoomPrice = () => {
    if (!hotel) return 0;
    const basePrice = hotel.price_per_night;
    
    // Multiplicateurs de prix selon le type de chambre
    const priceMultipliers = {
      'standard': 1,      // Prix de base
      'deluxe': 1.3,      // +30%
      'suite': 1.8,       // +80%
      'family': 1.5       // +50%
    };
    
    return basePrice * (priceMultipliers[roomType] || 1);
  };

  // Calculer le nombre de nuits
  const getNumberOfNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculer le prix total (prix par nuit × nombre de nuits)
  const getTotalPrice = () => {
    const nights = getNumberOfNights();
    const pricePerNight = getRoomPrice();
    return nights * pricePerNight;
  };

  const amenities = [
    { key: 'has_wifi', icon: Wifi, label: 'WiFi gratuit', color: 'blue' },
    { key: 'has_pool', icon: Sparkles, label: 'Piscine', color: 'cyan' },
    { key: 'has_parking', icon: Car, label: 'Parking', color: 'gray' },
    { key: 'has_restaurant', icon: Utensils, label: 'Restaurant', color: 'orange' },
    { key: 'has_spa', icon: Coffee, label: 'Spa & Bien-être', color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Hôtel introuvable</h1>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const allImages = [hotel.image_main, ...(hotel.images?.map(img => img.image) || [])];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Bouton retour */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Galerie d'images */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Image principale */}
            <div className="lg:col-span-2">
              <img
                src={allImages[selectedImage]}
                alt={hotel.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Miniatures */}
            <div className="lg:col-span-2 grid grid-cols-4 gap-2">
              {allImages.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${hotel.name} ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`h-24 object-cover rounded-lg cursor-pointer transition-all ${
                    selectedImage === index
                      ? 'ring-4 ring-blue-500'
                      : 'hover:opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600">{hotel.address}</span>
                    </div>
                    <span className="text-lg">{renderStars(hotel.stars)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-lg transition-colors ${
                      isFavorite
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {hotel.average_rating > 0 && (
                <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {hotel.average_rating} / 5
                  </span>
                  <span className="text-gray-600">Excellent</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {hotel.description}
              </p>
            </div>

            {/* Équipements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Équipements & Services
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => {
                  if (!hotel[amenity.key]) return null;
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={amenity.key}
                      className={`flex items-center gap-3 p-4 bg-${amenity.color}-50 rounded-lg`}
                    >
                      <Icon className={`w-6 h-6 text-${amenity.color}-600`} />
                      <span className="font-medium text-gray-900">
                        {amenity.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Localisation
              </h2>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{hotel.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Carte interactive à venir
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">À partir de</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatPrice(hotel.price_per_night)}
                </p>
                <p className="text-gray-600">par nuit</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de chambre
                  </label>
                  <select 
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Chambre Standard - {formatPrice(hotel.price_per_night)}</option>
                    <option value="deluxe">Chambre Deluxe - {formatPrice(hotel.price_per_night * 1.3)}</option>
                    <option value="suite">Suite - {formatPrice(hotel.price_per_night * 1.8)}</option>
                    <option value="family">Chambre Familiale - {formatPrice(hotel.price_per_night * 1.5)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de participants
                  </label>
                  <select 
                    value={numGuests}
                    onChange={(e) => setNumGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} {num > 1 ? 'personnes' : 'personne'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Affichage du prix calculé */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Prix par nuit</span>
                  <span className="font-semibold text-blue-600">{formatPrice(getRoomPrice())}</span>
                </div>
                {getNumberOfNights() > 0 && (
                  <>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-600">Nombre de nuits</span>
                      <span className="text-gray-800">×{getNumberOfNights()}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Prix total</span>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Type: {roomType === 'standard' ? 'Standard' : roomType === 'deluxe' ? 'Deluxe' : roomType === 'suite' ? 'Suite' : 'Familiale'}</span>
                  <span>{numGuests} {numGuests > 1 ? 'personnes' : 'personne'}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/booking/hotel/${hotel.id}`, {
                  state: {
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    roomType: roomType,
                    guests: numGuests,
                    roomPrice: getRoomPrice(),
                    totalPrice: getTotalPrice(),
                    numberOfNights: getNumberOfNights()
                  }
                })}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Réserver maintenant
              </button>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  ✓ Annulation gratuite sous 24h
                </p>
                <p className="text-sm text-gray-600">
                  ✓ Confirmation immédiate
                </p>
                <p className="text-sm text-gray-600">
                  ✓ Meilleur prix garanti
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {hotel.total_rooms} chambres disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

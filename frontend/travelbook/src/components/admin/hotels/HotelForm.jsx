import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { hotelAPI, destinationAPI } from '../../../api/catalog';
import { showSuccess, showError } from '../../../utils/sweetAlert';

export default function HotelForm({ hotel, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    description: '',
    address: '',
    stars: 3,
    price_per_night: '',
    price_single_room: '',
    price_double_room: '',
    price_suite: '',
    price_family_room: '',
    has_wifi: true,
    has_pool: false,
    has_parking: false,
    has_restaurant: false,
    has_spa: false,
    is_available: true,
    total_rooms: 10,
    image_main: null,
    uploaded_images: [],
  });

  const [destinations, setDestinations] = useState([]);
  const [imageMainPreview, setImageMainPreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDestinations();
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        destination: hotel.destination || '',
        description: hotel.description || '',
        address: hotel.address || '',
        stars: hotel.stars || 3,
        price_per_night: hotel.price_per_night || '',
        price_single_room: hotel.price_single_room || '',
        price_double_room: hotel.price_double_room || '',
        price_suite: hotel.price_suite || '',
        price_family_room: hotel.price_family_room || '',
        has_wifi: hotel.has_wifi || false,
        has_pool: hotel.has_pool || false,
        has_parking: hotel.has_parking || false,
        has_restaurant: hotel.has_restaurant || false,
        has_spa: hotel.has_spa || false,
        is_available: hotel.is_available !== undefined ? hotel.is_available : true,
        total_rooms: hotel.total_rooms || 10,
        image_main: null,
        uploaded_images: [],
      });
      if (hotel.image_main) setImageMainPreview(hotel.image_main);
    }
  }, [hotel]);

  const loadDestinations = async () => {
    try {
      const data = await destinationAPI.getAll();
      setDestinations(data);
    } catch (error) {
      console.error('Erreur chargement destinations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageMainChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_main: file });
      setImageMainPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAdditionalPreviews([...additionalPreviews, ...newPreviews]);
      setFormData({
        ...formData,
        uploaded_images: [...formData.uploaded_images, ...files],
      });
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = formData.uploaded_images.filter((_, i) => i !== index);
    const newPreviews = additionalPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, uploaded_images: newImages });
    setAdditionalPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculer le prix minimum pour price_per_night
      const prices = [
        formData.price_single_room,
        formData.price_double_room,
        formData.price_suite,
        formData.price_family_room
      ].filter(p => p && parseFloat(p) > 0);
      
      const minPrice = prices.length > 0 ? Math.min(...prices.map(p => parseFloat(p))) : formData.price_per_night;

      const data = new FormData();
      data.append('name', formData.name);
      data.append('destination', formData.destination);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('stars', formData.stars);
      data.append('price_per_night', minPrice || formData.price_per_night);
      data.append('has_wifi', formData.has_wifi);
      data.append('has_pool', formData.has_pool);
      data.append('has_parking', formData.has_parking);
      data.append('has_restaurant', formData.has_restaurant);
      data.append('has_spa', formData.has_spa);
      data.append('is_available', formData.is_available);
      data.append('total_rooms', formData.total_rooms);

      if (formData.image_main) {
        data.append('image_main', formData.image_main);
      }

      formData.uploaded_images.forEach((file) => {
        data.append('uploaded_images', file);
      });

      if (hotel) {
        await hotelAPI.update(hotel.id, data);
        await showSuccess('Hôtel modifié avec succès');
      } else {
        await hotelAPI.create(data);
        await showSuccess('Hôtel créé avec succès');
      }

      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {hotel ? 'Modifier' : 'Nouvel'} Hôtel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'hôtel *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Grand Hôtel Paris"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une destination</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez l'hôtel..."
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Rue de la Paix, Paris"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Étoiles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'étoiles *
              </label>
              <select
                name="stars"
                value={formData.stars}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {'⭐'.repeat(num)} {num} étoile{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de chambres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de chambres *
              </label>
              <input
                type="number"
                name="total_rooms"
                value={formData.total_rooms}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          {/* Prix par type de chambre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prix par type de chambre (TND) *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chambre Simple</label>
                <input
                  type="number"
                  name="price_single_room"
                  value={formData.price_single_room}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chambre Double</label>
                <input
                  type="number"
                  name="price_double_room"
                  value={formData.price_double_room}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Suite</label>
                <input
                  type="number"
                  name="price_suite"
                  value={formData.price_suite}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="300.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chambre Familiale</label>
                <input
                  type="number"
                  name="price_family_room"
                  value={formData.price_family_room}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200.00"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Le prix minimum sera utilisé comme prix de base
            </p>
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Équipements
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'has_wifi', label: 'WiFi' },
                { name: 'has_pool', label: 'Piscine' },
                { name: 'has_parking', label: 'Parking' },
                { name: 'has_restaurant', label: 'Restaurant' },
                { name: 'has_spa', label: 'Spa' },
              ].map((amenity) => (
                <div key={amenity.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={amenity.name}
                    checked={formData[amenity.name]}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Hôtel disponible
            </label>
          </div>

          {/* Image principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image principale {!hotel && '*'}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-5 h-5" />
                Choisir une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageMainChange}
                  className="hidden"
                  required={!hotel}
                />
              </label>
              {imageMainPreview && (
                <img
                  src={imageMainPreview}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Images supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images supplémentaires (galerie)
            </label>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
              <ImageIcon className="w-5 h-5" />
              Ajouter des images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="hidden"
              />
            </label>
            
            {additionalPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {additionalPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Aperçu ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {hotel ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
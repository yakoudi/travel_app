import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Package } from 'lucide-react';
import { packageAPI, destinationAPI } from '../../../api/catalog';

export default function PackageForm({ package: pkg, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    description: '',
    duration_days: '',
    price: '',
    includes_hotel: true,
    includes_flight: true,
    includes_meals: false,
    includes_guide: false,
    itinerary: '',
    max_participants: '',
    image: null,
    is_available: true,
  });

  const [destinations, setDestinations] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDestinations();
    if (pkg) {
      setFormData({
        name: pkg.name || '',
        destination: pkg.destination || '',
        description: pkg.description || '',
        duration_days: pkg.duration_days || '',
        price: pkg.price || '',
        includes_hotel: pkg.includes_hotel || false,
        includes_flight: pkg.includes_flight || false,
        includes_meals: pkg.includes_meals || false,
        includes_guide: pkg.includes_guide || false,
        itinerary: pkg.itinerary || '',
        max_participants: pkg.max_participants || '',
        image: null,
        is_available: pkg.is_available !== undefined ? pkg.is_available : true,
      });
      if (pkg.image) setImagePreview(pkg.image);
    }
  }, [pkg]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('destination', formData.destination);
      data.append('description', formData.description);
      data.append('duration_days', formData.duration_days);
      data.append('price', formData.price);
      data.append('includes_hotel', formData.includes_hotel);
      data.append('includes_flight', formData.includes_flight);
      data.append('includes_meals', formData.includes_meals);
      data.append('includes_guide', formData.includes_guide);
      data.append('itinerary', formData.itinerary);
      data.append('max_participants', formData.max_participants);
      data.append('is_available', formData.is_available);

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (pkg) {
        await packageAPI.update(pkg.id, data);
        alert('Circuit modifié avec succès');
      } else {
        await packageAPI.create(data);
        alert('Circuit créé avec succès');
      }

      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-orange-600" />
            {pkg ? 'Modifier' : 'Nouveau'} Circuit Touristique
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
                Nom du circuit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Circuit Découverte Paris"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Décrivez le circuit touristique..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (jours) *
              </label>
              <input
                type="number"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="7"
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (TND) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="1500.00"
              />
            </div>

            {/* Max participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max participants *
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="20"
              />
            </div>
          </div>

          {/* Itinéraire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Itinéraire détaillé *
            </label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Jour 1: Arrivée et installation&#10;Jour 2: Visite de la ville&#10;Jour 3: Excursion..."
            />
          </div>

          {/* Inclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Inclusions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'includes_hotel', label: 'Hôtel' },
                { name: 'includes_flight', label: 'Vol' },
                { name: 'includes_meals', label: 'Repas' },
                { name: 'includes_guide', label: 'Guide' },
              ].map((inclusion) => (
                <div key={inclusion.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={inclusion.name}
                    checked={formData[inclusion.name]}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {inclusion.label}
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
              className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Circuit disponible
            </label>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image {!pkg && '*'}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-5 h-5" />
                Choisir une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!pkg}
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
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
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {pkg ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
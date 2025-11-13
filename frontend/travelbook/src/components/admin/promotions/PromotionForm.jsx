import React, { useState, useEffect } from 'react';
import { X, Save, Gift } from 'lucide-react';
import { promotionAPI } from '../../../api/catalog';
import { toDateTimeLocal } from '../../../utils/formatters';

export default function PromotionForm({ promotion, onClose }) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_uses: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code || '',
        description: promotion.description || '',
        discount_type: promotion.discount_type || 'percentage',
        discount_value: promotion.discount_value || '',
        start_date: promotion.start_date ? toDateTimeLocal(promotion.start_date) : '',
        end_date: promotion.end_date ? toDateTimeLocal(promotion.end_date) : '',
        is_active: promotion.is_active !== undefined ? promotion.is_active : true,
        max_uses: promotion.max_uses || '',
      });
    }
  }, [promotion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: la date de fin doit être après la date de début
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      alert('La date de fin doit être après la date de début');
      return;
    }

    // Validation: valeur de réduction
    if (formData.discount_type === 'percentage' && (formData.discount_value <= 0 || formData.discount_value > 100)) {
      alert('La réduction en pourcentage doit être entre 1 et 100');
      return;
    }

    setLoading(true);

    try {
      const data = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      };

      if (promotion) {
        await promotionAPI.update(promotion.id, data);
        alert('Promotion modifiée avec succès');
      } else {
        await promotionAPI.create(data);
        alert('Promotion créée avec succès');
      }

      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.code) {
          alert('Ce code promo existe déjà');
        } else {
          alert('Erreur lors de l\'enregistrement');
        }
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="w-7 h-7 text-pink-600" />
            {promotion ? 'Modifier' : 'Nouvelle'} Promotion
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
            {/* Code promo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code promo *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase"
                placeholder="SUMMER2024"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Le code sera automatiquement en majuscules
              </p>
            </div>

            {/* Type de réduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de réduction *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (TND)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Offre d'été - 20% de réduction sur tous les séjours"
              maxLength={200}
            />
          </div>

          {/* Valeur de réduction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valeur de la réduction *
            </label>
            <div className="relative">
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={formData.discount_type === 'percentage' ? '20' : '50.00'}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.discount_type === 'percentage' ? '%' : 'TND'}
              </span>
            </div>
            {formData.discount_type === 'percentage' && (
              <p className="text-xs text-gray-500 mt-1">
                Entre 1 et 100%
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Utilisations maximales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre d'utilisations maximum (optionnel)
            </label>
            <input
              type="number"
              name="max_uses"
              value={formData.max_uses}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Illimité si vide"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour un nombre d'utilisations illimité
            </p>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3 bg-pink-50 p-4 rounded-lg">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Promotion active
            </label>
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
              className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {promotion ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
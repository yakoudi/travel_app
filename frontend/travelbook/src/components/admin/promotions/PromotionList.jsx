import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Gift, Calendar, Tag, TrendingUp } from 'lucide-react';
import { promotionAPI } from '../../../api/catalog';
import PromotionForm from './PromotionForm';
import { formatDate } from '../../../utils/formatters';

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionAPI.getAll();
      setPromotions(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      return;
    }

    try {
      await promotionAPI.delete(id);
      alert('Promotion supprimée avec succès');
      loadPromotions();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPromotion(null);
    loadPromotions();
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discount_type === 'percentage') {
      return `-${promo.discount_value}%`;
    }
    return `-${promo.discount_value} TND`;
  };

  const getStatusColor = (promo) => {
    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);

    if (!promo.is_active) return 'bg-gray-100 text-gray-700';
    if (now < startDate) return 'bg-blue-100 text-blue-700';
    if (now > endDate) return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (promo) => {
    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);

    if (!promo.is_active) return 'Désactivée';
    if (now < startDate) return 'À venir';
    if (now > endDate) return 'Expirée';
    return 'Active';
  };

  if (showForm) {
    return <PromotionForm promotion={selectedPromotion} onClose={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600 mt-1">Gérez vos codes promo et réductions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvelle promotion
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucune promotion trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-pink-500"
            >
              {/* En-tête de la carte */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-100 rounded-lg">
                    <Gift className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {promo.code}
                    </h3>
                    <p className="text-sm text-gray-600">{promo.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(promo)}`}>
                  {getStatusText(promo)}
                </span>
              </div>

              {/* Réduction */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Réduction</p>
                    <p className="text-3xl font-bold text-pink-600">
                      {getDiscountDisplay(promo)}
                    </p>
                  </div>
                  <Tag className="w-12 h-12 text-pink-400" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Début
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(promo.start_date)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Fin
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(promo.end_date)}
                  </p>
                </div>
              </div>

              {/* Utilisation */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Utilisations</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {promo.times_used}
                  {promo.max_uses && ` / ${promo.max_uses}`}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(promo)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '../utils/sweetAlert';

export default function SweetAlertDemo() {
  const handleSuccess = async () => {
    await showSuccess('Opération réussie !', 'Bravo !');
  };

  const handleError = () => {
    showError('Une erreur est survenue', 'Oups !');
  };

  const handleWarning = () => {
    showWarning('Attention à cette action', 'Avertissement');
  };

  const handleInfo = () => {
    showInfo('Ceci est une information importante', 'Info');
  };

  const handleConfirm = async () => {
    const result = await showConfirm(
      'Voulez-vous vraiment continuer ?',
      'Confirmation'
    );
    
    if (result.isConfirmed) {
      showToast('Action confirmée !', 'success');
    } else {
      showToast('Action annulée', 'info');
    }
  };

  const handleToastSuccess = () => {
    showToast('Toast de succès !', 'success');
  };

  const handleToastError = () => {
    showToast('Toast d\'erreur !', 'error');
  };

  const handleToastInfo = () => {
    showToast('Toast d\'info !', 'info');
  };

  const handleToastWarning = () => {
    showToast('Toast d\'avertissement !', 'warning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            🎨 SweetAlert2 Demo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Testez toutes les fonctionnalités de SweetAlert2
          </p>

          {/* Alertes principales */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Alertes principales</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleSuccess}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                ✅ Succès
              </button>
              <button
                onClick={handleError}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                ❌ Erreur
              </button>
              <button
                onClick={handleWarning}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                ⚠️ Warning
              </button>
              <button
                onClick={handleInfo}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                ℹ️ Info
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmation</h2>
            <button
              onClick={handleConfirm}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl w-full"
            >
              ❓ Dialogue de confirmation
            </button>
          </div>

          {/* Toasts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications Toast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleToastSuccess}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-green-300"
              >
                🎉 Success
              </button>
              <button
                onClick={handleToastError}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-red-300"
              >
                🔥 Error
              </button>
              <button
                onClick={handleToastInfo}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-blue-300"
              >
                💡 Info
              </button>
              <button
                onClick={handleToastWarning}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-yellow-300"
              >
                ⚡ Warning
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              📚 Documentation
            </h3>
            <p className="text-gray-700 mb-2">
              Tous les anciens <code className="bg-gray-200 px-2 py-1 rounded">alert()</code> ont été remplacés par SweetAlert2 !
            </p>
            <p className="text-gray-600 text-sm">
              Consultez le fichier <code className="bg-gray-200 px-2 py-1 rounded">SWEETALERT_GUIDE.md</code> pour plus d'informations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

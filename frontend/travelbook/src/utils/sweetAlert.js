import Swal from 'sweetalert2';

// Configuration par défaut pour toutes les alertes
const defaultConfig = {
  confirmButtonText: 'OK',
  cancelButtonText: 'Annuler',
  buttonsStyling: false, // Désactive les styles par défaut pour utiliser Tailwind
  customClass: {
    confirmButton: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-2 font-medium',
    cancelButton: 'bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors mx-2 font-medium',
    popup: 'rounded-xl shadow-2xl border border-gray-100',
    title: 'text-xl font-bold text-gray-800',
    htmlContainer: 'text-gray-600'
  }
};

// Alerte de succès
export const showSuccess = (message, title = 'Succès!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    ...defaultConfig,
  });
};

// Alerte d'erreur
export const showError = (message, title = 'Erreur!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    ...defaultConfig,
  });
};

// Alerte d'information
export const showInfo = (message, title = 'Information') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    ...defaultConfig,
  });
};

// Alerte d'avertissement
export const showWarning = (message, title = 'Attention!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    ...defaultConfig,
  });
};

// Confirmation avec boutons Oui/Non
export const showConfirm = (message, title = 'Êtes-vous sûr?') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    ...defaultConfig,
  });
};

// Toast (notification discrète)
export const showToast = (message, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: icon,
    title: message
  });
};

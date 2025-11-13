import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Obtenir le token d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ========== RÉSERVATIONS ==========
export const bookingAPI = {
  // Obtenir toutes les réservations de l'utilisateur
  getMyBookings: async () => {
    const response = await axios.get(`${API_URL}/bookings/bookings/my_bookings/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Obtenir une réservation par ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/bookings/bookings/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Créer une nouvelle réservation
  create: async (data) => {
    const response = await axios.post(`${API_URL}/bookings/bookings/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Annuler une réservation
  cancel: async (id) => {
    const response = await axios.post(
      `${API_URL}/bookings/bookings/${id}/cancel/`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Réservations à venir
  getUpcoming: async () => {
    const response = await axios.get(`${API_URL}/bookings/bookings/upcoming/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Réservations passées
  getPast: async () => {
    const response = await axios.get(`${API_URL}/bookings/bookings/past/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// ========== PAIEMENTS ==========
export const paymentAPI = {
  // Traiter un paiement
  processPayment: async (bookingId, paymentMethod) => {
    const response = await axios.post(
      `${API_URL}/bookings/payments/process_payment/`,
      {
        booking_id: bookingId,
        payment_method: paymentMethod,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Obtenir un reçu
  getReceipt: async (paymentId) => {
    const response = await axios.get(
      `${API_URL}/bookings/payments/${paymentId}/receipt/`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Obtenir tous les paiements
  getAll: async () => {
    const response = await axios.get(`${API_URL}/bookings/payments/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
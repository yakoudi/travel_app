import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Instance axios avec token
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ========== DESTINATIONS ==========
export const destinationAPI = {
  getAll: async (params) => {
    const response = await axios.get(`${API_URL}/catalog/destinations/`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/catalog/destinations/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (formData) => {
    const response = await axios.post(`${API_URL}/catalog/destinations/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await axios.put(`${API_URL}/catalog/destinations/${id}/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/catalog/destinations/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// ========== HOTELS ==========
export const hotelAPI = {
  getAll: async (params) => {
    const response = await axios.get(`${API_URL}/catalog/hotels/`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/catalog/hotels/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (formData) => {
    const response = await axios.post(`${API_URL}/catalog/hotels/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await axios.put(`${API_URL}/catalog/hotels/${id}/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/catalog/hotels/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  toggleAvailability: async (id) => {
    const response = await axios.post(
      `${API_URL}/catalog/hotels/${id}/toggle_availability/`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};

// ========== FLIGHTS ==========
export const flightAPI = {
  getAll: async (params) => {
    const response = await axios.get(`${API_URL}/catalog/flights/`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/catalog/flights/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/catalog/flights/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/catalog/flights/${id}/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/catalog/flights/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// ========== PACKAGES ==========
export const packageAPI = {
  getAll: async (params) => {
    const response = await axios.get(`${API_URL}/catalog/packages/`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/catalog/packages/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (formData) => {
    const response = await axios.post(`${API_URL}/catalog/packages/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await axios.put(`${API_URL}/catalog/packages/${id}/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/catalog/packages/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// ========== PROMOTIONS ==========
export const promotionAPI = {
  getAll: async (params) => {
    const response = await axios.get(`${API_URL}/catalog/promotions/`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/catalog/promotions/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/catalog/promotions/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/catalog/promotions/${id}/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/catalog/promotions/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  validateCode: async (id) => {
    const response = await axios.post(
      `${API_URL}/catalog/promotions/${id}/validate_code/`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};
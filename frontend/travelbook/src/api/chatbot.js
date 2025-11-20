import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const chatbotAPI = {
  // Créer une nouvelle conversation
  newConversation: async () => {
    const response = await axios.post(`${API_URL}/chatbot/chatbot/new_conversation/`);
    return response.data;
  },

  // Envoyer un message
  sendMessage: async (sessionId, message) => {
    const response = await axios.post(`${API_URL}/chatbot/chatbot/send_message/`, {
      session_id: sessionId,
      message: message,
    });
    return response.data;
  },

  // Récupérer l'historique
  getConversation: async (sessionId) => {
    const response = await axios.get(`${API_URL}/chatbot/chatbot/get_conversation/`, {
      params: { session_id: sessionId },
    });
    return response.data;
  },

  // Récupérer la FAQ
  getFAQ: async () => {
    const response = await axios.get(`${API_URL}/chatbot/chatbot/faq/`);
    return response.data;
  },
};
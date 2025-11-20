import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Minimize2, Hotel, Plane, Package } from 'lucide-react';
import { chatbotAPI } from '../api/chatbot';
import { formatPrice } from '../utils/formatters';

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser la conversation
  const initConversation = async () => {
    try {
      const data = await chatbotAPI.newConversation();
      setSessionId(data.session_id);
      
      // Ajouter le message de bienvenue
      if (data.welcome_message) {
        setMessages([{
          id: data.welcome_message.id,
          sender: 'bot',
          message: data.welcome_message.message,
          timestamp: data.welcome_message.timestamp,
        }]);
      }
    } catch (error) {
      console.error('Erreur init conversation:', error);
    }
  };

  // Ouvrir le chatbot
  const handleOpen = () => {
    setIsOpen(true);
    if (!sessionId) {
      initConversation();
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');

    // Ajouter le message utilisateur immédiatement
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: userMsg,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(sessionId, userMsg);
      
      // Mettre à jour le message utilisateur avec l'ID réel
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMsg.id ? response.user_message : msg
      ));

      // Ajouter la réponse du bot
      setMessages(prev => [...prev, {
        ...response.bot_message,
        sender: 'bot',
      }]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        message: "Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Suggestions rapides
  const quickSuggestions = [
    "Hôtel pas cher à Paris",
    "Vol pour Rome",
    "Circuit en Tunisie",
    "Hôtel avec piscine",
  ];

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  // Rendu d'une carte de recommandation
  const RecommendationCard = ({ rec }) => {
    const handleClick = () => {
      setIsMinimized(true);
      navigate(`/${rec.type}s/${rec.id}`);
    };

    return (
      <div
        onClick={handleClick}
        className="bg-white border-2 border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-3">
          {rec.image && (
            <img
              src={rec.image}
              alt={rec.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm mb-1">{rec.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {rec.type === 'hotel' && (
                <>
                  <span>⭐ {rec.stars}</span>
                  <span>•</span>
                  <span>{rec.destination}</span>
                </>
              )}
              {rec.type === 'flight' && (
                <>
                  <span>{rec.origin} → {rec.destination}</span>
                  <span>•</span>
                  <span>{rec.duration}</span>
                </>
              )}
              {rec.type === 'package' && (
                <>
                  <span>{rec.duration} jours</span>
                  <span>•</span>
                  <span>{rec.destination}</span>
                </>
              )}
            </div>
            <p className="text-blue-600 font-bold mt-1">
              {formatPrice(rec.price)}
              {rec.type === 'hotel' && <span className="text-xs text-gray-500">/nuit</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 animate-bounce"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold">Assistant Voyage</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Assistant Voyage</h3>
            <p className="text-xs opacity-90">En ligne</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.message}</p>
              
              {/* Recommandations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.recommendations.map((rec, idx) => (
                    <RecommendationCard key={idx} rec={rec} />
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions rapides */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
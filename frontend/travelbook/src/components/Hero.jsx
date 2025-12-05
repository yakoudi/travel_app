import React from 'react';

export default function Hero() {
  return (
    <div className="relative text-white py-20 md:py-32 overflow-hidden">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/preparation-voyage.jpg)',
        }}
      />
      
      {/* Overlay gradient pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-purple-900/80" />
      
      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            Découvrez le monde avec Saferni
          </h1>
          <p className="text-lg md:text-xl text-blue-50 mb-8 drop-shadow-md">
            Réservez vos vols, hôtels et activités en un seul endroit. Les meilleures offres, toujours à votre portée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-xl">
              Explorez maintenant
            </button>
            <button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-bold text-lg transition shadow-xl">
              Voir les offres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
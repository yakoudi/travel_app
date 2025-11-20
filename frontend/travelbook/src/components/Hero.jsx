import React from 'react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Découvrez le monde avec Saferni</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Réservez vos vols, hôtels et activités en un seul endroit. Les meilleures offres, toujours à votre portée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105">Explorez maintenant</button>
            <button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-bold text-lg transition">Voir les offres</button>
          </div>
        </div>
      </div>
    </div>
  );
}
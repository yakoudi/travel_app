import React from 'react';

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt pour votre prochain voyage?</h2>
        <p className="text-lg text-blue-100 mb-8">
          Rejoignez des milliers de voyageurs satisfaits et trouvez vos meilleures offres de voyage dès aujourd'hui!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105">Commencer à explorer</button>
          <button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-bold text-lg transition">Télécharger l'app</button>
        </div>
      </div>
    </section>
  );
}
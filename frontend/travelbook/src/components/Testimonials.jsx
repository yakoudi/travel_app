import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    { name: 'Sophie Martin', role: 'Voyageuse fréquente', text: "TravelBook m'a fait économiser plus de 500€ sur ma dernière réservation. L'interface est très simple à utiliser!", rating: 5 },
    { name: 'Jean Dupont', role: 'Businessman', text: "Je réserve tous mes voyages d'affaires avec TravelBook. C'est rapide, fiable et les prix sont imbattables.", rating: 5 },
    { name: 'Maria García', role: 'Famille de 4', text: 'Nous avons planifié nos vacances en famille en quelques minutes. Excellent service client aussi!', rating: 5 },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce que nos clients disent</h2>
          <p className="text-lg text-gray-600">Plus de 100,000 clients satisfaits font confiance à TravelBook</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{testimonial.text}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
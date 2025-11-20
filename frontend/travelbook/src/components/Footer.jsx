import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✈</span>
              </div>
              <span className="text-xl font-bold text-white">Saferni</span>
            </div>
            <p className="text-sm text-gray-400">Votre partenaire de voyage de confiance depuis 2024.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Vols</a></li>
              <li><a href="#" className="hover:text-white transition">Hôtels</a></li>
              <li><a href="#" className="hover:text-white transition">Activités</a></li>
              <li><a href="#" className="hover:text-white transition">Forfaits</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">À propos</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Carrières</a></li>
              <li><a href="#" className="hover:text-white transition">Presse</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>+33 1 23 45 67 89</span></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>info@Saferni.fr</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1" /><span>Paris, France</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2025 Saferni. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Politique de confidentialité</a>
            <a href="#" className="hover:text-white transition">Conditions d'utilisation</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
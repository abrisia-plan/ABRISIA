import React from 'react';
import { MapPin, Phone, Mail, Home as HomeIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">ABRISIA</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Des espaces sur mesure, une vie à votre rythme. 
              Spécialistes en dessins de plans pour tous vos projets de construction.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-400">Nos Services</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Plans de fondation</li>
              <li>Plans de bâtiment</li>
              <li>Plans d'extension</li>
              <li>Plans de plomberie</li>
              <li>Plans d'électricité</li>
              <li>Plans de ventilation</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-400">Contact</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>Québec, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>+1 (514) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>info@abrisia-plan.ca</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Abrisia Plan. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
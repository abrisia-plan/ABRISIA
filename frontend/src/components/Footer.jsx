import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Home as HomeIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">ABRISIA</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Des espaces sur mesure, une vie à votre rythme. 
              Spécialistes en dessins de plans pour tous vos projets de construction. 
              Accompagnement personnalisé du concept à la réalisation.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-400">Navigation</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Accueil</Link></li>
              <li><Link to="/inspiration" className="hover:text-amber-400 transition-colors">Inspiration</Link></li>
              <li><Link to="/devis" className="hover:text-amber-400 transition-colors">Demander un devis</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
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
                <a href="tel:+15145550123" className="hover:text-amber-400 transition-colors">
                  +1 (514) 555-0123
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@abrisia-plan.ca" className="hover:text-amber-400 transition-colors">
                  info@abrisia-plan.ca
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">Nos spécialités</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
              <span className="bg-slate-700 px-3 py-1 rounded-full">Mini-maisons</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Chalets</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Abris sur mesure</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Roulottes de chantier</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Plans techniques</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Accompagnement construction</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-slate-400">
              <p>&copy; 2025 Abrisia Plan. Tous droits réservés.</p>
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <Link to="/mentions-legales" className="hover:text-amber-400 transition-colors">
                Mentions légales
              </Link>
              <Link to="/politique-confidentialite" className="hover:text-amber-400 transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-slate-500">
            <p>Fonctionnement flexible — on s'adapte à vos disponibilités • Zone desservie : Province de Québec</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
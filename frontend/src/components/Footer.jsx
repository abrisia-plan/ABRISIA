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
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">ABRISIA</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Des espaces sur mesure, une vie à votre rythme. 
              Spécialistes en dessins de plans pour tous vos projets de construction. 
              <strong className="text-green-400">Maisons jusqu'à 6000m² de plancher</strong> - accompagnement personnalisé du concept à la réalisation.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-400">Navigation</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/" className="hover:text-green-400 transition-colors">Accueil</Link></li>
              <li><Link to="/inspiration" className="hover:text-green-400 transition-colors">Inspiration</Link></li>
              <li><Link to="/devis" className="hover:text-green-400 transition-colors">Demander un devis</Link></li>
              <li><Link to="/about" className="hover:text-green-400 transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-400">Contact</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Québec, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a href="tel:+15145550123" className="hover:text-green-400 transition-colors">
                  +1 (514) 555-0123
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a href="mailto:abrisia0plan@gmail.com" className="hover:text-green-400 transition-colors">
                  abrisia0plan@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Tarifs compétitifs</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
              <span className="bg-slate-700 px-3 py-1 rounded-full">Plans fondation dès 300$</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Extensions dès 600$</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Mini-maisons dès 800$</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Chalets dès 1200$</span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">Maisons complètes dès 1500$</span>
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
              <Link to="/mentions-legales" className="hover:text-green-400 transition-colors">
                Mentions légales
              </Link>
              <Link to="/politique-confidentialite" className="hover:text-green-400 transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-slate-500">
            <p>Fonctionnement flexible — on s'adapte à vos disponibilités • Zone desservie : Province de Québec</p>
            <p className="mt-1"><strong>Limite légale :</strong> Dessins de maisons jusqu'à 6000m² de plancher (incluant sous-sol et étages)</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/9faf0wxc_Screenshot_20250814-012530.png" 
                  alt="Logo Abrisia" 
                  className="w-full h-full object-cover scale-150 invert"
                />
              </div>
              <span className="text-2xl font-bold">ABRISIA PLAN</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Service de plans architecturaux au Québec. Mini-maisons, chalets, maisons, extensions.
              Plans conformes au Code du bâtiment du Québec, jusqu'à 600m² de plancher.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Navigation</h3>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => handleNavigation('/')} className="hover:text-teal-400 transition-colors">Accueil</button></li>
              <li><button onClick={() => handleNavigation('/inspiration')} className="hover:text-teal-400 transition-colors">Inspiration</button></li>
              <li><button onClick={() => handleNavigation('/kit')} className="hover:text-teal-400 transition-colors">Kits de plans</button></li>
              <li><button onClick={() => handleNavigation('/devis')} className="hover:text-teal-400 transition-colors">Demander un devis</button></li>
              <li><button onClick={() => handleNavigation('/contact')} className="hover:text-teal-400 transition-colors">Contact</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Contact</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span>Québec, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <a href="mailto:abrisia0plan@gmail.com" className="hover:text-teal-400 transition-colors">
                  abrisia0plan@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400">&copy; 2025 Abrisia Plan. Tous droits réservés.</p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <button onClick={() => handleNavigation('/mentions-legales')} className="hover:text-teal-400 transition-colors">
                Mentions légales
              </button>
              <button onClick={() => handleNavigation('/politique-confidentialite')} className="hover:text-teal-400 transition-colors">
                Politique de confidentialité
              </button>
              <button onClick={() => handleNavigation('/admin')} className="hover:text-teal-400 transition-colors font-medium">
                Espace équipe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

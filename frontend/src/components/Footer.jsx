import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
  };

  return (
    <footer className="bg-foret-dark text-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-beige/20">
                <img 
                  src="https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/9faf0wxc_Screenshot_20250814-012530.png" 
                  alt="Logo Abrisia" 
                  className="w-full h-full object-cover scale-150 invert"
                />
              </div>
              <span className="text-2xl font-bold text-white">ABRISIA PLAN</span>
            </div>
            <p className="text-beige/70 leading-relaxed text-sm">
              Service de plans architecturaux au Québec. Mini-maisons, chalets, maisons, extensions.
              Plans conformes au Code du bâtiment du Québec.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-bois-light">Navigation</h3>
            <ul className="space-y-2 text-beige/70 text-sm">
              <li><button onClick={() => handleNavigation('/')} className="hover:text-white transition-colors">Accueil</button></li>
              <li><button onClick={() => handleNavigation('/inspiration')} className="hover:text-white transition-colors">Inspiration</button></li>
              <li><button onClick={() => handleNavigation('/kit')} className="hover:text-white transition-colors">Kits de plans</button></li>
              <li><button onClick={() => handleNavigation('/devis')} className="hover:text-white transition-colors">Demander un devis</button></li>
              <li><button onClick={() => handleNavigation('/contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-bois-light">Contact</h3>
            <div className="space-y-3 text-beige/70 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-bois-light flex-shrink-0" />
                <span>Québec, Canada</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-bois-light flex-shrink-0" />
                <a href="mailto:abrisia0plan@gmail.com" className="hover:text-white transition-colors">abrisia0plan@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-foret-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-beige/50 text-sm">&copy; 2025 Abrisia Plan. Tous droits réservés.</p>
            <div className="flex space-x-6 text-sm text-beige/50">
              <button onClick={() => handleNavigation('/mentions-legales')} className="hover:text-white transition-colors">Mentions légales</button>
              <button onClick={() => handleNavigation('/politique-confidentialite')} className="hover:text-white transition-colors">Confidentialité</button>
              <button onClick={() => handleNavigation('/admin')} className="hover:text-bois-light transition-colors font-medium text-bois">Espace équipe</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

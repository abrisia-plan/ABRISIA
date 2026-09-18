import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultFooterNav = [
  { name: 'Accueil', href: '/' },
  { name: 'Kits de plans', href: '/kit' },
  { name: 'Demander un devis', href: '/devis' },
  { name: 'Contact', href: '/contact' }
];

const Footer = () => {
  const navigate = useNavigate();
  const [navigation, setNavigation] = useState(defaultFooterNav);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/navigation/menu`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pages?.length > 0) {
          setNavigation(data.pages.map(p => ({ name: p.name, href: p.href })));
        }
      })
      .catch(() => {});
  }, []);

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
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-white">
                <img 
                  src="/logo-abrisia.jpg" 
                  alt="Logo Abrisia" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold">ABRISIA PLAN</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Service de plans architecturaux au Québec. Mini-maisons, chalets, maisons, extensions.
              Plans conformes au Code du bâtiment du Québec et du Canada, jusqu'à 600m² de plancher.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Navigation</h3>
            <ul className="space-y-2 text-slate-300" data-testid="footer-navigation">
              {navigation.map((item) => (
                <li key={item.href}>
                  <button 
                    onClick={() => handleNavigation(item.href)} 
                    className="hover:text-teal-400 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
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
            <p className="text-slate-400">&copy; 2027 Abrisia Plan. Tous droits réservés.</p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <button onClick={() => handleNavigation('/mentions-legales')} className="hover:text-teal-400 transition-colors">
                Mentions légales
              </button>
              <button onClick={() => handleNavigation('/politique-confidentialite')} className="hover:text-teal-400 transition-colors">
                Politique de confidentialité
              </button>
              <button 
                onClick={() => handleNavigation('/admin')} 
                className="hover:text-teal-400 transition-colors font-medium flex items-center gap-1"
                data-testid="footer-team-link"
              >
                <Users className="w-3.5 h-3.5" />
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

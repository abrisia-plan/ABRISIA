import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Users } from 'lucide-react';
import SERVICE_PAGES from '../data/servicePages.json';
import useSiteSettings from '../hooks/useSiteSettings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultFooterNav = [
  { name: 'Accueil', href: '/' },
  { name: 'Collection de plans', href: '/collection' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Demander un devis', href: '/devis' },
  { name: 'Contact', href: '/contact' }
];

const Footer = () => {
  const site = useSiteSettings();
  const [navigation, setNavigation] = useState(defaultFooterNav);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/navigation/menu`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pages?.length > 0) {
          setNavigation(data.pages.map(p => ({ name: p.name, href: p.href })));
        }
      })
      .catch((err) => console.error('Erreur nav:', err));
  }, []);

  // Vrais liens (<a href>) : Google peut les suivre pour découvrir les pages
  const scrollTop = () => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-white">
                <img 
                  src={site.logo_url || "/logo-abrisia.jpg"} 
                  alt="Logo Abrisia" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold">ABRISIA PLAN</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Service de plans architecturaux au Québec. Mini-maisons, chalets, maisons, extensions.
              Plans conçus selon le Code de construction du Québec et le Code national du bâtiment du Canada, dans les limites de la Loi sur les architectes.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Navigation</h3>
            <ul className="space-y-2 text-slate-300" data-testid="footer-navigation">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/faq" onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <Link to="/plans-maison-saguenay-lac-saint-jean" onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                  Plans de maison au Saguenay–Lac-Saint-Jean
                </Link>
              </li>
              <li>
                <Link to="/carrieres" onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                  Carrières : envoyer un CV
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Nos plans</h3>
            <ul className="space-y-2 text-slate-300">
              {SERVICE_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link to={`/${p.slug}`} onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                    {p.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-teal-400">Contact</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span>{site.contact_address || 'Saguenay–Lac-Saint-Jean, Québec'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <a href={`mailto:${site.contact_email || 'abrisia0plan@gmail.com'}`} className="hover:text-teal-400 transition-colors">
                  {site.contact_email || 'abrisia0plan@gmail.com'}
                </a>
              </div>
              {site.contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <a href={`tel:${site.contact_phone}`} className="hover:text-teal-400 transition-colors">{site.contact_phone}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 pb-16 md:pb-0">
          <div className="flex flex-col items-center text-center space-y-4">
            <div>
              <p className="text-slate-400">&copy; {new Date().getFullYear()} Abrisia Plan. Tous droits réservés.</p>
              <p className="text-slate-400 text-sm mt-1">Services offerts en français.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <Link to="/mentions-legales" onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                Mentions légales
              </Link>
              <Link to="/politique-confidentialite" onClick={scrollTop} className="hover:text-teal-400 transition-colors">
                Politique de confidentialité
              </Link>
              <Link 
                to="/admin"
                rel="nofollow"
                className="hover:text-teal-400 transition-colors font-medium flex items-center gap-1"
                data-testid="footer-team-link"
              >
                <Users className="w-3.5 h-3.5" />
                Espace équipe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

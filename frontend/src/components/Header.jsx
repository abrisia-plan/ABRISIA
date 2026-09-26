import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Users } from 'lucide-react';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultNav = [
  { name: 'Accueil', href: '/' },
  { name: 'Collection', href: '/collection' },
  { name: 'Espace Pro', href: '/espace-pro' },
  { name: 'Demander un devis', href: '/devis' },
  { name: 'Contact', href: '/contact' }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState(defaultNav);
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-white">
              <img 
                src="/logo-abrisia.jpg" 
                alt="Logo Abrisia" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
              ABRISIA
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-lg font-medium transition-colors hover:text-teal-700 ${
                  isActive(item.href) 
                    ? 'text-teal-700 border-b-2 border-teal-700 pb-1' 
                    : 'text-slate-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors border border-slate-300 hover:border-teal-400 rounded-full px-3 py-1.5"
              data-testid="team-space-link"
            >
              <Users className="w-3.5 h-3.5" />
              Espace équipe
            </Link>
          </nav>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700"
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-teal-100/20">
            <nav className="flex flex-col space-y-3" data-testid="mobile-nav">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-lg font-medium transition-colors hover:text-teal-700 py-2 ${
                    isActive(item.href) ? 'text-teal-700' : 'text-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700 py-2 border-t border-slate-200 pt-3 mt-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                Espace équipe
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

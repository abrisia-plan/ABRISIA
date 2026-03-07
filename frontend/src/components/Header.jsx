import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultNav = [
  { name: 'Accueil', href: '/' },
  { name: 'Kits', href: '/kit' },
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
      .catch(() => {});
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/9faf0wxc_Screenshot_20250814-012530.png" 
              alt="Logo Abrisia" 
              className="w-12 h-12 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

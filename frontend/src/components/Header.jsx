import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home as HomeIcon } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Inspiration', href: '/inspiration' },
    { name: 'Demander un devis', href: '/devis' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/9faf0wxc_Screenshot_20250814-012530.png" 
                alt="Logo Abrisia" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
              ABRISIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
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
            <Link to="/admin">
              <Button variant="outline" className="ml-4 border-teal-600 text-teal-700 hover:bg-teal-50">
                Connexion Admin
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-amber-100/20">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-lg font-medium transition-colors hover:text-amber-700 py-2 ${
                    isActive(item.href) ? 'text-amber-700' : 'text-slate-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="mt-3 border-amber-600 text-amber-700 hover:bg-amber-50 w-full">
                  Connexion Admin
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
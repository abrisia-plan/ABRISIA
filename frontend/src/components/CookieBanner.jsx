import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Cookie } from 'lucide-react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Afficher après un petit délai pour une meilleure UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-teal-600 shadow-2xl animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 rounded-full flex-shrink-0">
              <Cookie className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                🍪 Ce site utilise des cookies
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
                analyser le trafic et personnaliser le contenu. En continuant à naviguer, 
                vous acceptez notre utilisation des cookies.
              </p>
              <a 
                href="/politique-confidentialite" 
                className="text-sm text-teal-600 hover:underline mt-1 inline-block"
              >
                En savoir plus →
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={declineCookies}
              className="border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Refuser
            </Button>
            <Button
              onClick={acceptCookies}
              className="bg-teal-700 hover:bg-teal-800 text-white px-6"
            >
              Accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Logo, image d'accueil et coordonnées choisis dans l'admin (Design & Images).
// Chargés une seule fois pour tout le site ; chaque page garde ses valeurs par défaut.
let cache = null;
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(`${BACKEND_URL}/api/site-settings`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { cache = data?.settings || {}; return cache; })
      .catch(() => { pending = null; return {}; });
  }
  return pending;
};

const useSiteSettings = () => {
  const [settings, setSettings] = useState(cache || {});
  useEffect(() => {
    let alive = true;
    load().then(s => { if (alive) setSettings(s); });
    return () => { alive = false; };
  }, []);
  return settings;
};

export default useSiteSettings;

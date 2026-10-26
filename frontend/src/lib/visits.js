// Compte un visiteur par jour (anonyme). Le navigateur de la propriétaire n'est jamais compté :
// il est marqué dès qu'on se connecte à l'admin (marquerAppareilAdmin).
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const KEY_ID = 'abrisia_visitor_id';
const KEY_DAY = 'abrisia_visit_day';
const KEY_ADMIN = 'abrisia_admin_device';

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* navigation privée */ } },
};

export const marquerAppareilAdmin = () => store.set(KEY_ADMIN, '1');

export const enregistrerVisite = (path) => {
  if (store.get(KEY_ADMIN) || store.get('authToken')) return;
  const today = new Date().toISOString().slice(0, 10);
  if (store.get(KEY_DAY) === today) return;
  let id = store.get(KEY_ID);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    store.set(KEY_ID, id);
  }
  store.set(KEY_DAY, today);
  fetch(`${BACKEND_URL}/api/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitor_id: id, path: path || '/' }),
  }).catch(() => {});
};

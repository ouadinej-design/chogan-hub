// Sauvegarde universelle — par userId dans Supabase
// PREFIX localStorage = 'chogan_hub_' (voir storage.js)

const PREFIX = 'chogan_hub_';

// Récupère la session depuis le localStorage (clé = chogan_hub_session)
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'session') || 'null');
  } catch { return null; }
}

// Construit un userId depuis prénom+nom
function makeUserId(firstName, lastName) {
  return `${firstName||''}_${lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase().replace(/[^a-z0-9_]/g,'');
}

// Récupère l'userId courant
export function getCurrentUserId() {
  const s = getSession();
  if (s?.firstName) return makeUserId(s.firstName, s.lastName);
  return null;
}

// Clé Supabase : le_sales__marie_ouadi
function userKey(baseKey, userId) {
  if (!userId) return baseKey;
  return `${baseKey}__${userId}`;
}

export function cloudSave(baseKey, value, userId) {
  const uid = userId !== undefined ? userId : getCurrentUserId();
  const key = userKey(baseKey, uid);

  // 1. localStorage clé globale (pour lecture locale immédiate)
  try { localStorage.setItem(baseKey, JSON.stringify(value)); } catch {}
  // 2. localStorage clé utilisateur
  if (uid && key !== baseKey) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  // 3. Supabase via API serveur — clé utilisateur
  const body = JSON.stringify({ key, value });
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  }).catch(() => {});

  // 4. Si clé différente de globale, aussi sauvegarder la clé globale pour compatibilité
  if (key !== baseKey) {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: baseKey, value })
    }).catch(() => {});
  }
}

export async function cloudLoad(baseKey, defaultValue = [], userId) {
  const uid = userId !== undefined ? userId : getCurrentUserId();
  const key = userKey(baseKey, uid);

  // 1. Essayer la clé utilisateur
  if (key !== baseKey) {
    try {
      const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
      if (res.ok) {
        const d = await res.json();
        if (d?.value !== undefined && d?.value !== null) {
          const v = d.value;
          if ((Array.isArray(v) && v.length > 0) || (v && typeof v === 'object' && Object.keys(v).length > 0)) {
            localStorage.setItem(baseKey, JSON.stringify(v));
            return v;
          }
        }
      }
    } catch {}
  }

  // 2. Clé globale
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(baseKey)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.value !== undefined && d?.value !== null) {
        const v = d.value;
        if ((Array.isArray(v) && v.length > 0) || (v && typeof v === 'object' && Object.keys(v).length > 0)) {
          localStorage.setItem(baseKey, JSON.stringify(v));
          return v;
        }
      }
    }
  } catch {}

  // 3. Fallback localStorage
  try {
    const local = JSON.parse(localStorage.getItem(baseKey) || 'null');
    if (local !== null) return local;
  } catch {}

  return defaultValue;
}

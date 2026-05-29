// Sauvegarde universelle — par userId dans Supabase
const SB_URL = 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

// Récupère l'userId courant depuis la session
function getCurrentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('store_session') || 'null');
    if (session?.firstName) {
      return `${session.firstName}_${session.lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase();
    }
  } catch {}
  return 'anonymous';
}

// Clé de stockage : le_sales → le_sales__marie_ouadi (par utilisateur)
function userKey(baseKey, userId) {
  if (!userId || userId === 'anonymous') return baseKey;
  return `${baseKey}__${userId}`;
}

export function cloudSave(baseKey, value, userId) {
  const uid = userId || getCurrentUserId();
  const key = userKey(baseKey, uid);

  // 1. localStorage local (clé globale pour compatibilité lecture)
  try { localStorage.setItem(baseKey, JSON.stringify(value)); } catch {}
  // 2. localStorage clé utilisateur
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}

  // 3. Supabase via API — clé utilisateur
  const saveToApi = (k) => fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: k, value })
  }).catch(() => {});
  saveToApi(key);

  // 4. Fallback direct Supabase
  fetch(`${SB_URL}/rest/v1/app_data?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, value })
  }).catch(() => {});
}

export async function cloudLoad(baseKey, defaultValue = [], userId) {
  const uid = userId || getCurrentUserId();
  const key = userKey(baseKey, uid);

  // 1. Essayer la clé utilisateur via API
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.value !== undefined && d?.value !== null) {
        const v = d.value;
        if (Array.isArray(v) && v.length > 0) {
          localStorage.setItem(baseKey, JSON.stringify(v));
          localStorage.setItem(key, JSON.stringify(v));
          return v;
        }
      }
    }
  } catch {}

  // 2. Essayer l'ancienne clé globale (migration)
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(baseKey)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.value !== undefined && Array.isArray(d.value) && d.value.length > 0) {
        return d.value;
      }
    }
  } catch {}

  // 3. Fallback localStorage
  try {
    const local = JSON.parse(localStorage.getItem(key) || localStorage.getItem(baseKey) || 'null');
    if (Array.isArray(local) && local.length > 0) return local;
  } catch {}

  return defaultValue;
}

// Charge les données de TOUS les membres d'une équipe et les fusionne
export async function cloudLoadTeam(baseKey, teamUserIds = []) {
  const allItems = [];
  const seen = new Set();

  // Charger toutes les clés en parallèle
  const results = await Promise.allSettled(
    teamUserIds.map(uid =>
      fetch(`/api/data?key=${encodeURIComponent(userKey(baseKey, uid))}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )
  );

  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value?.value) {
      const items = r.value.value;
      if (Array.isArray(items)) {
        items.forEach(item => {
          const id = item?.id || JSON.stringify(item);
          if (!seen.has(id)) { seen.add(id); allItems.push(item); }
        });
      }
    }
  });

  // Aussi charger la clé globale (ancienne migration)
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(baseKey)}`);
    if (res.ok) {
      const d = await res.json();
      if (Array.isArray(d?.value)) {
        d.value.forEach(item => {
          const id = item?.id || JSON.stringify(item);
          if (!seen.has(id)) { seen.add(id); allItems.push(item); }
        });
      }
    }
  } catch {}

  return allItems;
}

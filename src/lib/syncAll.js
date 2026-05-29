// Synchronise toutes les clés depuis Supabase
// La marraine/admin charge les données de toute l'équipe

const PREFIX = 'chogan_hub_';
const KEYS = ['le_sales', 'le_cevents', 'le_clients', 'le_fidelite'];

function getSession() {
  try { return JSON.parse(localStorage.getItem(PREFIX + 'session') || 'null'); } catch { return null; }
}

function makeUserId(fn, ln) {
  return `${fn||''}_${ln||''}`.trim().replace(/\s+/g,'_').toLowerCase().replace(/[^a-z0-9_]/g,'');
}

async function apiGet(key) {
  try {
    const r = await fetch(`/api/data?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.value ?? null;
  } catch { return null; }
}

function mergeArrays(arrays) {
  const seen = new Set();
  const result = [];
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const id = item?.id || JSON.stringify(item);
      if (!seen.has(id)) { seen.add(id); result.push(item); }
    }
  }
  return result;
}

function mergeObjects(objects) {
  const result = {};
  for (const obj of objects) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.assign(result, obj);
    }
  }
  return result;
}

export async function syncFromServer() {
  const session = getSession();
  if (!session?.firstName) return; // pas connecté
  
  const role = session.role || 'consultante';
  const myId = makeUserId(session.firstName, session.lastName);

  // Récupérer les IDs de tous les membres de l'équipe
  let teamIds = [];
  if (role === 'marraine' || role === 'admin') {
    try {
      const consultants = JSON.parse(localStorage.getItem(PREFIX + 'consultants') || '[]');
      teamIds = consultants
        .filter(c => c?.firstName)
        .map(c => makeUserId(c.firstName, c.lastName))
        .filter(id => id && id !== myId);
    } catch {}
    
    // Aussi essayer depuis Supabase (comptes créés sur d'autres appareils)
    try {
      const remoteAccounts = await apiGet('chogan_hub_consultants');
      if (Array.isArray(remoteAccounts)) {
        remoteAccounts.forEach(c => {
          if (!c?.firstName) return;
          const id = makeUserId(c.firstName, c.lastName);
          if (id && id !== myId && !teamIds.includes(id)) teamIds.push(id);
        });
        // Mettre à jour le localStorage avec les comptes distants
        const local = JSON.parse(localStorage.getItem(PREFIX + 'consultants') || '[]');
        const merged = [...local];
        remoteAccounts.forEach(rc => {
          if (!merged.find(lc => lc.id === rc.id)) merged.push(rc);
        });
        localStorage.setItem(PREFIX + 'consultants', JSON.stringify(merged));
      }
    } catch {}
  }

  const allIds = role === 'marraine' || role === 'admin'
    ? [myId, ...teamIds]
    : [myId];

  await Promise.all(KEYS.map(async (baseKey) => {
    try {
      const isObj = baseKey === 'le_fidelite'; // fidelite = objet, pas tableau
      
      // Charger toutes les clés utilisateur + clé globale
      const keysToLoad = [
        baseKey, // clé globale (migration ancienne)
        ...allIds.map(uid => `${baseKey}__${uid}`)
      ];
      
      const results = await Promise.allSettled(keysToLoad.map(k => apiGet(k)));
      const values = results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      if (values.length === 0) return;

      // Merger avec localStorage local
      const localRaw = localStorage.getItem(baseKey);
      const local = localRaw ? JSON.parse(localRaw) : (isObj ? {} : []);
      
      let merged;
      if (isObj) {
        merged = mergeObjects([local, ...values]);
      } else {
        merged = mergeArrays([local, ...values]);
      }

      if (isObj ? Object.keys(merged).length > 0 : merged.length > 0) {
        localStorage.setItem(baseKey, JSON.stringify(merged));
      }
    } catch {}
  }));
}

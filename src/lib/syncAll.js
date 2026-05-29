// Synchronise toutes les clés importantes depuis le serveur
// Supporte le chargement multi-utilisateur pour la marraine/admin

const KEYS = ['le_sales', 'le_cevents', 'le_clients', 'le_fidelite'];

function getSession() {
  try { return JSON.parse(localStorage.getItem('store_session') || 'null'); } catch { return null; }
}

function getCurrentUserId(session) {
  const s = session || getSession();
  if (s?.firstName) return `${s.firstName}_${s.lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase();
  return null;
}

async function loadKey(key) {
  try {
    const r = await fetch(`/api/data?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d?.value) ? d.value : [];
  } catch { return []; }
}

export async function syncFromServer() {
  const session = getSession();
  const role = session?.role || 'consultante';
  const myId = getCurrentUserId(session);

  try {
    await Promise.all(KEYS.map(async (baseKey) => {
      try {
        let allItems = [];
        const seen = new Set();

        const addItems = (items) => {
          if (!Array.isArray(items)) return;
          items.forEach(item => {
            const id = item?.id || JSON.stringify(item);
            if (!seen.has(id)) { seen.add(id); allItems.push(item); }
          });
        };

        if (role === 'marraine' || role === 'admin') {
          // Utiliser l'API team-data qui charge toutes les données de l'équipe
          try {
            const r = await fetch(`/api/team-data?baseKey=${encodeURIComponent(baseKey)}`, { cache: 'no-store' });
            if (r.ok) {
              const d = await r.json();
              addItems(d?.value);
            }
          } catch {}
          // Fallback: aussi charger ma propre clé
          if (myId) addItems(await loadKey(`${baseKey}__${myId}`));

        } else {
          // Consultante: charger sa propre clé utilisateur
          if (myId) addItems(await loadKey(`${baseKey}__${myId}`));
          // Fallback clé globale
          addItems(await loadKey(baseKey));
        }

        if (allItems.length === 0) return;

        // Merger avec localStorage local
        try {
          const local = JSON.parse(localStorage.getItem(baseKey) || '[]');
          if (Array.isArray(local)) {
            local.forEach(item => {
              const id = item?.id || JSON.stringify(item);
              if (!seen.has(id)) { seen.add(id); allItems.push(item); }
            });
          }
        } catch {}

        localStorage.setItem(baseKey, JSON.stringify(allItems));
      } catch {}
    }));
  } catch {}
}

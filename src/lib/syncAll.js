// Synchronise toutes les clés importantes depuis le serveur
const KEYS = ['le_sales', 'le_cevents', 'le_clients', 'le_fidelite'];

export async function syncFromServer() {
  try {
    await Promise.all(KEYS.map(async (key) => {
      try {
        const res = await fetch(`/api/data?key=${key}`, { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json();
        const cloud = d?.value;
        if (!cloud || (Array.isArray(cloud) && cloud.length === 0)) return;

        // Merger avec les données locales
        const localRaw = localStorage.getItem(key);
        const local = localRaw ? JSON.parse(localRaw) : null;

        if (Array.isArray(cloud) && Array.isArray(local)) {
          const merged = [...cloud];
          local.forEach(item => {
            if (!item?.id || !merged.find(x => x.id === item.id)) merged.push(item);
          });
          localStorage.setItem(key, JSON.stringify(merged));
        } else if (cloud) {
          localStorage.setItem(key, JSON.stringify(cloud));
        }
      } catch {}
    }));
  } catch {}
}

// Charge toutes les données depuis Supabase au montage
// Clés globales — filtrage par consultant géré côté client

const KEYS = ['le_sales', 'le_cevents', 'le_clients', 'le_fidelite'];

export async function syncFromServer() {
  await Promise.all(KEYS.map(async (key) => {
    try {
      const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      const cloud = d?.value;
      if (!cloud) return;

      const isArr = Array.isArray(cloud);
      const isObj = !isArr && typeof cloud === 'object';
      if (isArr && cloud.length === 0) return;
      if (isObj && Object.keys(cloud).length === 0) return;

      // Merger avec local
      const localRaw = localStorage.getItem(key);
      const local = localRaw ? JSON.parse(localRaw) : (isArr ? [] : {});

      if (isArr && Array.isArray(local)) {
        const seen = new Set(cloud.map(i => i?.id || JSON.stringify(i)));
        const merged = [...cloud, ...local.filter(i => !seen.has(i?.id || JSON.stringify(i)))];
        localStorage.setItem(key, JSON.stringify(merged));
      } else if (isObj) {
        localStorage.setItem(key, JSON.stringify({ ...local, ...cloud }));
      }
    } catch {}
  }));
}

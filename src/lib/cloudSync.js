// Sauvegarde universelle — localStorage + Supabase + API serveur

const SB_URL = 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

export function cloudSave(key, value) {
  // 1. Sauvegarder en localStorage (toujours)
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {
    console.warn('localStorage.setItem failed:', e.message);
  }
  // 2. Sauvegarder via API serveur (Supabase côté serveur)
  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  } catch {}
  // 3. Fallback Supabase direct
  try {
    fetch(`${SB_URL}/rest/v1/app_data?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  } catch {}
}

export async function cloudLoad(key, defaultValue = []) {
  // 1. Essayer via API serveur
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.value !== undefined && d?.value !== null) {
        const v = d.value;
        if (Array.isArray(v) && v.length > 0) {
          localStorage.setItem(key, JSON.stringify(v));
          return v;
        }
      }
    }
  } catch {}
  // 2. Fallback localStorage
  try {
    const local = JSON.parse(localStorage.getItem(key) || 'null');
    if (local !== null) return local;
  } catch {}
  return defaultValue;
}

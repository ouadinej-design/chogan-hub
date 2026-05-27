// Sauvegarde dans localStorage ET Supabase automatiquement
const SB_URL = 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

export function cloudSave(key, value) {
  // 1. Sauvegarder localement
  localStorage.setItem(key, JSON.stringify(value));
  // 2. Envoyer à Supabase (fire & forget)
  fetch(`${SB_URL}/rest/v1/app_data?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, value })
  }).catch(() => {});
}

export async function cloudLoad(key, defaultValue = []) {
  // Charger depuis Supabase et merger avec localStorage
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_data?key=eq.${key}&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue;
    const data = await res.json();
    const cloud = data?.[0]?.value;
    if (cloud !== undefined && cloud !== null) {
      localStorage.setItem(key, JSON.stringify(cloud));
      return cloud;
    }
  } catch {}
  return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue;
}

// Vercel serverless — données générales avec merge intelligent
const SB_URL = process.env.VITE_SUPABASE_URL || 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';
const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

async function sbGet(key) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`, { headers });
    const d = await r.json();
    return d?.[0]?.value ?? null;
  } catch { return null; }
}

async function sbSet(key, value) {
  const r = await fetch(`${SB_URL}/rest/v1/app_data`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, value })
  });
  if (!r.ok) throw new Error(await r.text());
}

function mergeArrays(cloud, incoming) {
  const map = new Map();
  // Cloud d'abord (données existantes)
  if (Array.isArray(cloud)) cloud.forEach(i => { const id = i?.id || JSON.stringify(i); map.set(id, i); });
  // Incoming ensuite (nouvelles données — écrase si même id)
  if (Array.isArray(incoming)) incoming.forEach(i => { const id = i?.id || JSON.stringify(i); map.set(id, i); });
  return Array.from(map.values());
}

function mergeObjects(cloud, incoming) {
  if (!cloud || typeof cloud !== 'object') return incoming;
  if (!incoming || typeof incoming !== 'object') return cloud;
  return { ...cloud, ...incoming };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: 'key required' });
      const value = await sbGet(key);
      return res.status(200).json({ value });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key required' });

      // Lire la valeur existante et merger
      const existing = await sbGet(key);
      let merged;
      if (Array.isArray(value)) {
        merged = mergeArrays(existing, value);
      } else if (value && typeof value === 'object') {
        merged = mergeObjects(existing, value);
      } else {
        merged = value;
      }

      await sbSet(key, merged);
      return res.status(200).json({ ok: true, count: Array.isArray(merged) ? merged.length : 1 });
    }
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
  return res.status(405).end();
}

// API pour charger les données fusionnées d'une équipe
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { baseKey } = req.query;
      if (!baseKey) return res.status(400).json({ error: 'baseKey required' });

      // 1. Récupérer tous les comptes
      const accounts = await sbGet('chogan_hub_consultants') || [];
      
      // 2. Construire tous les userIds
      const userIds = accounts
        .filter(a => a?.firstName)
        .map(a => `${a.firstName}_${a.lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase());

      // 3. Charger toutes les clés en parallèle
      const allKeys = [baseKey, ...userIds.map(uid => `${baseKey}__${uid}`)];
      const results = await Promise.allSettled(allKeys.map(k => sbGet(k)));

      // 4. Fusionner
      const merged = [];
      const seen = new Set();
      results.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          r.value.forEach(item => {
            const id = item?.id || JSON.stringify(item);
            if (!seen.has(id)) { seen.add(id); merged.push(item); }
          });
        }
      });

      return res.status(200).json({ value: merged, count: merged.length, keys: allKeys.length });
    }
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
  return res.status(405).end();
}

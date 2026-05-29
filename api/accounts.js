// Vercel serverless — gestion comptes multi-appareils
// Stockage dans Supabase via REST serveur (contourne CORS/RLS)

const SB_URL = process.env.VITE_SUPABASE_URL || 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

async function sbGet() {
  try {
    // Charger depuis les deux clés possibles (migration)
    const [r1, r2] = await Promise.all([
      fetch(`${SB_URL}/rest/v1/app_data?key=eq.chogan_hub_consultants&select=value`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
      }),
      fetch(`${SB_URL}/rest/v1/app_data?key=eq.consultants&select=value`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
      })
    ]);
    const d1 = r1.ok ? await r1.json() : [];
    const d2 = r2.ok ? await r2.json() : [];
    const list1 = Array.isArray(d1?.[0]?.value) ? d1[0].value : [];
    const list2 = Array.isArray(d2?.[0]?.value) ? d2[0].value : [];
    // Merger les deux listes sans doublons
    const merged = [...list1];
    list2.forEach(c => {
      if (!merged.find(m => m.id === c.id || (m.firstName === c.firstName && m.lastName === c.lastName))) {
        merged.push(c);
      }
    });
    // Dédoublonner par nom complet normalisé (évite "Nej Ouadi" + "Ouadi Nej")
    const deduped = new Map();
    merged.forEach(c => {
      const key = [c.firstName||'', c.lastName||''].map(s=>s.trim().toLowerCase()).sort().join('_');
      if (!deduped.has(key)) deduped.set(key, c);
    });
    return Array.from(deduped.values());
  } catch { return []; }
}

async function sbSet(accounts) {
  try {
    await fetch(`${SB_URL}/rest/v1/app_data`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key: 'chogan_hub_consultants', value: accounts })
    });
  } catch {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const accounts = await sbGet();
    return res.status(200).json({ accounts, count: accounts.length });
  }

  if (req.method === 'POST') {
    const { accounts } = req.body || {};
    if (!Array.isArray(accounts)) return res.status(400).json({ error: 'accounts array required' });
    await sbSet(accounts);
    return res.status(200).json({ ok: true, saved: accounts.length });
  }

  return res.status(405).end();
}

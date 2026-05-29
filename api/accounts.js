// Vercel serverless — gestion comptes multi-appareils
// Stockage dans Supabase via REST serveur (contourne CORS/RLS)

const SB_URL = process.env.VITE_SUPABASE_URL || 'https://fwcauakszxjrzcexjlvt.supabase.co';
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

async function sbGet() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/app_data?key=eq.chogan_hub_consultants&select=value`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    const d = await r.json();
    return Array.isArray(d?.[0]?.value) ? d[0].value : [];
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

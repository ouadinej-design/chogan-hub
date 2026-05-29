// Vercel serverless function — gestion des comptes (contourne CORS + RLS)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SB_URL = process.env.VITE_SUPABASE_URL || 'https://fwcauakszxjrzcexjlvt.supabase.co';
  const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';

  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    // GET — lire les comptes
    if (req.method === 'GET') {
      const r = await fetch(`${SB_URL}/rest/v1/app_data?key=eq.consultants&select=value`, { headers });
      const data = await r.json();
      const accounts = data?.[0]?.value || [];
      return res.status(200).json({ accounts });
    }

    // POST — sauvegarder les comptes
    if (req.method === 'POST') {
      const { accounts } = req.body;
      if (!Array.isArray(accounts)) return res.status(400).json({ error: 'accounts must be array' });

      const r = await fetch(`${SB_URL}/rest/v1/app_data`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'consultants', value: accounts })
      });

      if (!r.ok) {
        const err = await r.text();
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

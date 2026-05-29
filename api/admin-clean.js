// API de nettoyage admin — supprime les doublons de comptes
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
  await fetch(`${SB_URL}/rest/v1/app_data`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, value })
  });
}

function normalize(s) { return (s||'').trim().toLowerCase(); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Charger comptes depuis les deux clés
  const [a1, a2] = await Promise.all([
    sbGet('chogan_hub_consultants'),
    sbGet('consultants')
  ]);

  const all = [...(Array.isArray(a1) ? a1 : []), ...(Array.isArray(a2) ? a2 : [])];

  // Dédoublonner : clé = mots du nom triés
  const seen = new Map();
  const removed = [];
  all.forEach(c => {
    const key = [normalize(c.firstName), normalize(c.lastName||'')]
      .filter(Boolean).sort().join('_');
    if (!seen.has(key)) {
      seen.set(key, c);
    } else {
      removed.push(`${c.firstName} ${c.lastName}`);
    }
  });

  const clean = Array.from(seen.values());

  // Sauvegarder proprement
  await sbSet('chogan_hub_consultants', clean);
  // Vider l'ancienne clé
  await sbSet('consultants', []);

  return res.status(200).json({
    ok: true,
    before: all.length,
    after: clean.length,
    removed,
    accounts: clean.map(c => `${c.firstName} ${c.lastName} (${c.role})`)
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const SB_URL = process.env.VITE_SUPABASE_URL || 'https://fwcauakszxjrzcexjlvt.supabase.co';
  const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';
  
  // Test 1: Read from Supabase
  try {
    const r = await fetch(`${SB_URL}/rest/v1/app_data?key=eq.le_sales&select=value`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    const text = await r.text();
    return res.status(200).json({
      status: 'ok',
      supabase_status: r.status,
      supabase_ok: r.ok,
      data_preview: text.substring(0, 200),
      env_url_set: !!process.env.VITE_SUPABASE_URL,
      env_key_set: !!process.env.VITE_SUPABASE_ANON_KEY,
    });
  } catch(e) {
    return res.status(200).json({ status: 'error', message: e.message });
  }
}

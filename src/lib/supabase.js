import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const isEnabled = !!(SUPABASE_URL && SUPABASE_KEY);

// ── Lire une clé ──────────────────────────────────────────────────
export async function dbGet(key) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data').select('value').eq('key', key).single();
    if (error) return null;
    return data?.value ?? null;
  } catch { return null; }
}

// ── Écrire une clé ────────────────────────────────────────────────
export async function dbSet(key, value) {
  if (!supabase) return;
  try {
    await supabase.from('app_data')
      .upsert({ key, value, updated_at: new Date().toISOString() });
  } catch {}
}

// ── Écouter les changements en temps réel ─────────────────────────
export function dbSubscribe(key, callback) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`realtime:${key}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'app_data',
      filter: `key=eq.${key}`
    }, payload => {
      callback(payload.new?.value ?? null);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Safe initialization - never crash the app
let _supabase = null;
let _enabled  = false;

try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    _enabled  = true;
  }
} catch (e) {
  console.warn('Supabase init failed:', e?.message);
}

export const supabase  = _supabase;
export const isEnabled = _enabled;

export async function dbGet(key) {
  if (!_supabase) return null;
  try {
    const { data, error } = await _supabase
      .from('app_data').select('value').eq('key', key).single();
    if (error) return null;
    return data?.value ?? null;
  } catch { return null; }
}

export async function dbSet(key, value) {
  if (!_supabase) return;
  try {
    await _supabase.from('app_data')
      .upsert({ key, value, updated_at: new Date().toISOString() });
  } catch {}
}

export function dbSubscribe(key, callback) {
  if (!_supabase) return () => {};
  try {
    const channel = _supabase
      .channel(`realtime:${key}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'app_data',
        filter: `key=eq.${key}`
      }, payload => { try { callback(payload.new?.value ?? null); } catch {} })
      .subscribe();
    return () => { try { _supabase.removeChannel(channel); } catch {} };
  } catch { return () => {}; }
}

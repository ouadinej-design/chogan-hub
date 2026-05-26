import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const isSupabaseEnabled = !!(SUPABASE_URL && SUPABASE_KEY);

export async function loadTree() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('reseau_tree').select('data').eq('id', 1).single();
    if (error) return null;
    return data?.data || null;
  } catch { return null; }
}

export async function saveTreeToCloud(tree) {
  if (!supabase) return;
  try {
    await supabase.from('reseau_tree').upsert({ id: 1, data: tree, updated_at: new Date().toISOString() });
  } catch {}
}

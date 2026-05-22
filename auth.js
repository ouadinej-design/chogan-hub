import { supabase } from './supabase';

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getConsultant() {
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data;
}

export async function logAction(consultantId, action, module, details = {}) {
  if (!consultantId) return;
  await supabase.from('usage_logs').insert({
    consultant_id: consultantId,
    action,
    module,
    details,
  });
}

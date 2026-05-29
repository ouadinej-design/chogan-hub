// Sauvegarde universelle — clé globale unique dans Supabase
// Le filtrage par consultant se fait côté client via le champ "consultant"

export function cloudSave(key, value) {
  // 1. localStorage
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}

  // 2. Supabase via API serveur
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value })
  }).catch(() => {});
}

export async function cloudLoad(key, defaultValue = []) {
  // 1. API serveur
  try {
    const res = await fetch(`/api/data?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.value !== undefined && d?.value !== null) {
        const v = d.value;
        const notEmpty = Array.isArray(v) ? v.length > 0 : (v && typeof v === 'object' && Object.keys(v).length > 0);
        if (notEmpty) {
          localStorage.setItem(key, JSON.stringify(v));
          return v;
        }
      }
    }
  } catch {}

  // 2. Fallback localStorage
  try {
    const local = JSON.parse(localStorage.getItem(key) || 'null');
    if (local !== null) return local;
  } catch {}

  return defaultValue;
}

// Compatibilité — anciens appels avec userId ignorent le paramètre
export function getCurrentUserId() { return null; }

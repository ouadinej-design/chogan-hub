import { useState, useEffect, useCallback } from 'react';
import { cloudSave, cloudLoad } from './cloudSync';

// Récupère l'userId depuis la session
function getCurrentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('store_session') || 'null');
    if (session?.firstName) {
      return `${session.firstName}_${session.lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase();
    }
  } catch {}
  return null;
}

/**
 * Hook universel — lit/écrit dans Supabase + localStorage
 * Écrit avec la clé utilisateur, lit depuis le localStorage (déjà syncé par syncFromServer)
 */
export function useCloudData(key, defaultValue = []) {
  const [data, setData_] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue; }
    catch { return defaultValue; }
  });

  // Écrire partout (localStorage + Supabase clé utilisateur)
  const setData = useCallback((newData) => {
    setData_(newData);
    const userId = getCurrentUserId();
    cloudSave(key, newData, userId);
  }, [key]);

  // Recharger depuis localStorage quand les données changent (après sync)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const local = JSON.parse(localStorage.getItem(key) || 'null');
        if (local && Array.isArray(local) && local.length > (Array.isArray(data) ? data.length : 0)) {
          setData_(local);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [key, data]);

  return [data, setData, true];
}

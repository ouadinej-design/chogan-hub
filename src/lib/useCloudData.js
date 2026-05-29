import { useState, useEffect, useCallback } from 'react';
import { cloudSave, getCurrentUserId } from './cloudSync';

/**
 * Hook universel — lit localStorage (déjà syncé par syncFromServer), écrit avec userId
 */
export function useCloudData(key, defaultValue = []) {
  const [data, setData_] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue; }
    catch { return defaultValue; }
  });

  const setData = useCallback((newData) => {
    setData_(newData);
    const userId = getCurrentUserId();
    cloudSave(key, newData, userId);
  }, [key]);

  // Rafraîchir depuis localStorage si syncFromServer l'a mis à jour
  useEffect(() => {
    const check = () => {
      try {
        const local = JSON.parse(localStorage.getItem(key) || 'null');
        if (local === null) return;
        const localLen = Array.isArray(local) ? local.length : Object.keys(local).length;
        const curLen  = Array.isArray(data)   ? data.length  : Object.keys(data || {}).length;
        if (localLen > curLen) setData_(local);
      } catch {}
    };
    const iv = setInterval(check, 1500);
    return () => clearInterval(iv);
  }, [key, data]);

  return [data, setData, true];
}

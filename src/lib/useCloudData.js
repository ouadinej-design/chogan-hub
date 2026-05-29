import { useState, useEffect, useCallback } from 'react';
import { cloudSave } from './cloudSync';

export function useCloudData(key, defaultValue = []) {
  const [data, setData_] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue; }
    catch { return defaultValue; }
  });

  const setData = useCallback((newData) => {
    setData_(newData);
    cloudSave(key, newData);
  }, [key]);

  // Rafraîchir si syncFromServer a mis à jour le localStorage
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        const local = JSON.parse(localStorage.getItem(key) || 'null');
        if (!local) return;
        const localLen = Array.isArray(local) ? local.length : Object.keys(local).length;
        const curLen   = Array.isArray(data)   ? data.length  : Object.keys(data || {}).length;
        if (localLen > curLen) setData_(local);
      } catch {}
    }, 1500);
    return () => clearInterval(iv);
  }, [key, data]);

  return [data, setData, true];
}

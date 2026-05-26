import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, dbSubscribe, isEnabled } from './supabase';

/**
 * Hook universel — lit/écrit dans Supabase + localStorage
 * Utilisation : const [data, setData] = useCloudData('le_sales', [])
 */
export function useCloudData(key, defaultValue = []) {
  const [data, setData_]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue; }
    catch { return defaultValue; }
  });
  const [synced, setSynced] = useState(!isEnabled);

  // Écrire partout
  const setData = useCallback((newData) => {
    setData_(newData);
    localStorage.setItem(key, JSON.stringify(newData));
    if (isEnabled) dbSet(key, newData);
  }, [key]);

  // Charger depuis Supabase au montage
  useEffect(() => {
    if (!isEnabled) return;
    dbGet(key).then(cloudData => {
      if (cloudData !== null) {
        setData_(cloudData);
        localStorage.setItem(key, JSON.stringify(cloudData));
      }
      setSynced(true);
    });
  }, [key]);

  // Abonnement temps réel
  useEffect(() => {
    if (!isEnabled) return;
    const unsub = dbSubscribe(key, (newVal) => {
      if (newVal !== null) {
        setData_(newVal);
        localStorage.setItem(key, JSON.stringify(newVal));
      }
    });
    return unsub;
  }, [key]);

  return [data, setData, synced];
}

import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet, dbSubscribe, isEnabled } from './supabase';

/**
 * Hook universel — lit/écrit dans Supabase + localStorage
 * Règle : on garde TOUJOURS les données les plus complètes (locale ou cloud)
 */
export function useCloudData(key, defaultValue = []) {
  const [data, setData_] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue; }
    catch { return defaultValue; }
  });
  const [synced, setSynced] = useState(!isEnabled);

  // Écrire partout (localStorage + Supabase)
  const setData = useCallback((newData) => {
    setData_(newData);
    localStorage.setItem(key, JSON.stringify(newData));
    if (isEnabled) dbSet(key, newData);
  }, [key]);

  // Charger depuis Supabase au montage — FUSIONNER, jamais écraser
  useEffect(() => {
    if (!isEnabled) return;
    dbGet(key).then(cloudData => {
      const local = (() => {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
      })();

      // Choisir la source la plus riche
      const localArr  = Array.isArray(local)     ? local     : null;
      const cloudArr  = Array.isArray(cloudData) ? cloudData : null;

      if (cloudArr && localArr) {
        // Merger : garder tous les éléments uniques (par id)
        const merged = [...cloudArr];
        localArr.forEach(item => {
          if (!item?.id || !merged.find(x => x.id === item.id)) {
            merged.push(item);
          }
        });
        // Utiliser le merged seulement si cloud > local OU local est vide
        const best = merged.length > localArr.length ? merged : localArr;
        setData_(best);
        localStorage.setItem(key, JSON.stringify(best));
        if (merged.length > cloudArr.length) dbSet(key, merged); // sync cloud si local avait plus
      } else if (cloudArr && cloudArr.length > 0 && !localArr) {
        // Cloud a des données, local non
        setData_(cloudArr);
        localStorage.setItem(key, JSON.stringify(cloudArr));
      } else if (localArr && localArr.length > 0 && (!cloudArr || cloudArr.length === 0)) {
        // Local a des données, cloud non → pousser vers cloud
        if (isEnabled) dbSet(key, localArr);
      }
      setSynced(true);
    });
  }, [key]);

  // Temps réel Supabase
  useEffect(() => {
    if (!isEnabled) return;
    const unsub = dbSubscribe(key, (newVal) => {
      if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) return;
      const local = (() => {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
      })();
      const merged = Array.isArray(newVal) ? [...newVal] : [newVal];
      if (Array.isArray(local)) {
        local.forEach(item => {
          if (!item?.id || !merged.find(x => x.id === item.id)) merged.push(item);
        });
      }
      setData_(merged);
      localStorage.setItem(key, JSON.stringify(merged));
    });
    return unsub;
  }, [key]);

  return [data, setData, synced];
}

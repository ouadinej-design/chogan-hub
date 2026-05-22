// Storage utility — all data keyed by consultant username

const PREFIX = 'chogan_hub_';

export const store = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
  },
  remove: (key) => localStorage.removeItem(PREFIX + key),
};

export const userStore = (username) => ({
  get: (key, fallback = null) => store.get(`${username}_${key}`, fallback),
  set: (key, val) => store.set(`${username}_${key}`, val),
  push: (key, item) => {
    const arr = store.get(`${username}_${key}`, []);
    arr.push(item);
    store.set(`${username}_${key}`, arr);
    return arr;
  },
  update: (key, id, updater) => {
    const arr = store.get(`${username}_${key}`, []);
    const idx = arr.findIndex(i => i.id === id);
    if (idx !== -1) arr[idx] = { ...arr[idx], ...updater(arr[idx]) };
    store.set(`${username}_${key}`, arr);
    return arr;
  },
  remove: (key) => store.remove(`${username}_${key}`),
});

export const logActivity = (username, section, action) => {
  const today = new Date().toISOString().split('T')[0];
  const logs = store.get(`logs_${username}_${today}`, []);
  logs.push({ section, action, ts: new Date().toISOString() });
  store.set(`logs_${username}_${today}`, logs);
};

export const getTodayLogs = (username) => {
  const today = new Date().toISOString().split('T')[0];
  return store.get(`logs_${username}_${today}`, []);
};

import { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../utils/storage';

const AuthContext = createContext(null);
const AUTH_VERSION = 'v3';

export const ROLES = {
  admin: {
    label: 'Admin', icon: '👑', color: '#B89A6A',
    bg: 'rgba(184,154,106,0.12)', border: 'rgba(184,154,106,0.4)',
    apps: ['commandes','orders','inspirations','clients','fidelite','agenda','planner','wallet','reseau','catalogue','coach','objections','stats','settings','formation','familles','catalogues','checklist'],
  },
  marraine: {
    label: 'Marraine', icon: '🌸', color: '#9e5a7a',
    bg: 'rgba(158,90,122,0.12)', border: 'rgba(158,90,122,0.4)',
    apps: ['commandes','orders','inspirations','clients','fidelite','planner','wallet','reseau','coach','objections','stats','formation','familles','catalogues','checklist'],
  },
  consultante: {
    label: 'Consultante', icon: '💼', color: '#3d6b9e',
    bg: 'rgba(61,107,158,0.12)', border: 'rgba(61,107,158,0.4)',
    apps: ['commandes','orders','inspirations','clients','fidelite','planner','wallet','coach','objections','stats','formation','familles','catalogues','checklist'],
  },
};

// Seul compte admin fixe — les autres sont créés dynamiquement
const ADMIN_ACCOUNT = {
  id: 'admin-root',
  firstName: 'Admin',
  lastName: '',
  displayName: 'Administratrice',
  role: 'admin',
  password: 'Admin#2025',
  locked: false,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store.get('auth_version') !== AUTH_VERSION) {
      store.set('consultants', []);
      store.set('auth_version', AUTH_VERSION);
      store.remove('session');
    }
    const saved = store.get('session');
    if (saved) {
      const u = findUser(saved.firstName, saved.lastName, saved.role);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const findUser = (firstName, lastName, role) => {
    const fn = firstName.trim().toLowerCase();
    const ln = lastName.trim().toLowerCase();
    if (role === 'admin' && fn === ADMIN_ACCOUNT.firstName.toLowerCase() && ln === '') return ADMIN_ACCOUNT;
    if (role === 'admin') return ADMIN_ACCOUNT; // admin peut se connecter juste avec prénom
    const consultants = store.get('consultants', []);
    return consultants.find(c =>
      c.firstName.toLowerCase() === fn &&
      c.lastName.toLowerCase() === ln &&
      c.role === role
    ) || null;
  };

  const login = (firstName, lastName, password, role) => {
    const u = findUser(firstName, lastName, role);
    if (!u) return { ok: false, error: 'Compte introuvable. Vérifiez votre prénom et nom.' };
    if (u.locked) return { ok: false, error: 'Compte verrouillé. Contactez votre administratrice.' };
    if (u.password !== password) return { ok: false, error: 'Mot de passe incorrect.' };
    setUser(u);
    store.set('session', { firstName: u.firstName, lastName: u.lastName, role: u.role });
    const today = new Date().toISOString().split('T')[0];
    const logs  = store.get(`logs_${u.id}_${today}`, []);
    logs.push({ section: 'Connexion', action: 'Connexion au Hub', ts: new Date().toISOString() });
    store.set(`logs_${u.id}_${today}`, logs);
    return { ok: true };
  };

  const logout = () => { setUser(null); store.remove('session'); };

  const changePassword = (userId, newPassword) => {
    if (userId === 'admin-root') {
      ADMIN_ACCOUNT.password = newPassword;
      store.set('admin_password', newPassword);
      return { ok: true };
    }
    const list = store.get('consultants', []);
    const idx  = list.findIndex(c => c.id === userId);
    if (idx === -1) return { ok: false };
    list[idx].password = newPassword;
    store.set('consultants', list);
    if (user?.id === userId) setUser({ ...user, password: newPassword });
    return { ok: true };
  };

  // ── Admin only ──────────────────────────────────────────────────
  const createConsultant = (data) => {
    const list = store.get('consultants', []);
    const exists = list.find(c =>
      c.firstName.toLowerCase() === data.firstName.trim().toLowerCase() &&
      c.lastName.toLowerCase()  === data.lastName.trim().toLowerCase()  &&
      c.role === data.role
    );
    if (exists) return { ok: false, error: 'Ce compte existe déjà.' };
    const newUser = {
      id: Date.now().toString(),
      firstName:   data.firstName.trim(),
      lastName:    data.lastName.trim(),
      displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
      role:        data.role,
      email:       data.email || '',
      password:    data.password,
      locked:      false,
      createdAt:   new Date().toISOString(),
    };
    const newList = [...list, newUser];
    store.set('consultants', newList);
    // Sauvegarder dans Supabase pour accès multi-appareils
    const SB_URL = 'https://fwcauakszxjrzcexjlvt.supabase.co';
    const SB_KEY = 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';
    fetch(`${SB_URL}/rest/v1/app_data?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key: 'consultants', value: newList })
    }).catch(() => {});
    return { ok: true, user: newUser };
  };

  const resetPassword = (userId, newPassword) => {
    const list = store.get('consultants', []);
    const idx  = list.findIndex(c => c.id === userId);
    if (idx === -1) return { ok: false };
    list[idx].password = newPassword;
    list[idx].locked   = false;
    store.set('consultants', list);
    return { ok: true };
  };

  const toggleLock = (userId) => {
    const list = store.get('consultants', []);
    const idx  = list.findIndex(c => c.id === userId);
    if (idx === -1) return;
    list[idx].locked = !list[idx].locked;
    store.set('consultants', list);
  };

  const deleteConsultant = (userId) => {
    store.set('consultants', store.get('consultants', []).filter(c => c.id !== userId));
  };

  const getAllConsultants = () => store.get('consultants', []);
  const canAccess = (appId) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has access to everything
    // Check dynamic permissions from Settings
    try {
      const dynPerms = JSON.parse(localStorage.getItem('chogan_permissions') || 'null');
      if (dynPerms && dynPerms[user.role]) {
        return dynPerms[user.role].includes(appId);
      }
    } catch {}
    // Fallback to default role apps
    return ROLES[user.role]?.apps.includes(appId) ?? false;
  };

  // Filtrer les ventes selon le rôle
  const getFilteredSales = () => {
    try {
      const all = JSON.parse(localStorage.getItem('le_sales')||'[]');
      if (!user || user.role === 'admin') return all;
      const name = (user.firstName||'').toLowerCase();
      if (user.role === 'consultante') {
        return all.filter(s => {
          const cons = (s.consultant||'').toLowerCase();
          return !cons || cons === name || cons.includes(name) || name.includes(cons);
        });
      }
      if (user.role === 'marraine') {
        try {
          const treeRaw1 = JSON.parse(localStorage.getItem('le_tree')||'{"nodes":[]}').nodes || [];
          const treeRaw2 = JSON.parse(localStorage.getItem('limitless_team_tree_v5')||'{"nodes":[]}').nodes || [];
          const tree = [...treeRaw1, ...treeRaw2];
          const teamNames = tree.map(n => (n.name||'').toLowerCase());
          const fullName  = `${user.firstName||''} ${user.lastName||''}`.trim().toLowerCase();
          return all.filter(s => {
            const cons = (s.consultant||'').toLowerCase();
            // Ventes sans consultant OU ventes de la marraine OU ventes de l'équipe
            return !cons ||
              cons.includes(name) || name.includes(cons) ||
              cons.includes(fullName) || fullName.includes(cons) ||
              teamNames.some(t => t && (t === cons || t.includes(cons) || cons.includes(t)));
          });
        } catch { return all; }
      }
      return all;
    } catch { return []; }
  };

  // Filtrer les événements selon le rôle
  const getFilteredEvents = () => {
    try {
      const all = JSON.parse(localStorage.getItem('le_cevents')||'[]');
      if (!user || user.role === 'admin') return all;
      const name = (user.firstName||'').toLowerCase();
      if (user.role === 'consultante') {
        return all.filter(e => {
          const cons = (e.consultant||'').toLowerCase();
          return !cons || cons === name || cons.includes(name);
        });
      }
      if (user.role === 'marraine') {
        try {
          // Lire depuis les deux clés possibles
          const treeRaw1 = JSON.parse(localStorage.getItem('le_tree')||'{"nodes":[]}').nodes || [];
          const treeRaw2 = JSON.parse(localStorage.getItem('limitless_team_tree_v5')||'{"nodes":[]}').nodes || [];
          const tree = [...treeRaw1, ...treeRaw2];
          const teamNames = tree.map(n => (n.name||'').toLowerCase());
          return all.filter(e => {
            const cons = (e.consultant||'').toLowerCase();
            return !cons || cons === name || teamNames.some(t => t===cons || t.includes(cons));
          });
        } catch { return all; }
      }
      return all;
    } catch { return []; }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, changePassword,
      createConsultant, resetPassword, toggleLock, deleteConsultant,
      getAllConsultants, canAccess, ROLES, getFilteredSales, getFilteredEvents,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

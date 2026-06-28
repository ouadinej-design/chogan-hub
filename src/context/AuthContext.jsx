import { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../utils/storage';
import { syncFromServer } from '../lib/syncAll';

const AuthContext = createContext(null);
const AUTH_VERSION = 'v3';

export const ROLES = {
  admin: {
    label: 'Admin', icon: '👑', color: '#B89A6A',
    bg: 'rgba(184,154,106,0.12)', border: 'rgba(184,154,106,0.4)',
    apps: ['commandes','orders','inspirations','clients','fidelite','agenda','planner','wallet','reseau','catalogue','coach','objections','stats','settings','formation','prospection','familles','catalogues','checklist'],
  },
  marraine: {
    label: 'Marraine', icon: '🌸', color: '#9e5a7a',
    bg: 'rgba(158,90,122,0.12)', border: 'rgba(158,90,122,0.4)',
    apps: ['commandes','orders','ventes','inspirations','clients','fidelite','planner','wallet','reseau','coach','objections','stats','formation','prospection','familles','catalogues','checklist'],
  },
  consultante: {
    label: 'Consultante', icon: '💼', color: '#3d6b9e',
    bg: 'rgba(61,107,158,0.12)', border: 'rgba(61,107,158,0.4)',
    apps: ['commandes','orders','ventes','inspirations','clients','fidelite','planner','wallet','coach','objections','formation','prospection','familles','catalogues','checklist'],
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
    const initApp = async () => {
      if (saved) {
        // Charger les comptes depuis le serveur (pour marraine sur nouvel appareil)
        try {
          const r = await fetch('/api/accounts');
          if (r.ok) {
            const d = await r.json();
            if (Array.isArray(d?.accounts) && d.accounts.length > 0) {
              const local = store.get('consultants', []);
              const merged = [...local];
              d.accounts.forEach(rc => {
                if (!merged.find(lc => lc.id === rc.id)) merged.push(rc);
              });
              store.set('consultants', merged);
            }
          }
        } catch {}
        const u = findUser(saved.firstName, saved.lastName, saved.role);
        if (u) {
          setUser(u);
          // Sync données si marraine ou admin
          if (u.role === 'marraine' || u.role === 'admin') {
            syncFromServer().catch(() => {});
          }
        }
      }
      setLoading(false);
    };
    initApp();
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
    const u = findUser(firstName, lastName, role, password);
    if (!u) return { ok: false, error: 'Compte introuvable. Vérifiez votre prénom et nom.' };
    if (u.locked) return { ok: false, error: 'Compte verrouillé. Contactez votre administratrice.' };
    if (u.password !== password) return { ok: false, error: 'Mot de passe incorrect.' };
    setUser(u);
    store.set('session', { firstName: u.firstName, lastName: u.lastName, role: u.role });
    const today = new Date().toISOString().split('T')[0];
    const logs  = store.get(`logs_${u.id}_${today}`, []);
    logs.push({ section: 'Connexion', action: 'Connexion au Hub', ts: new Date().toISOString() });
    store.set(`logs_${u.id}_${today}`, logs);
    // Sync données après login
    if (u.role === 'marraine' || u.role === 'admin') {
      setTimeout(() => syncFromServer().catch(() => {}), 500);
    }
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
    // Sauvegarder via API serveur pour accès multi-appareils
    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts: newList })
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

  // Ventes avec indicateur d'appartenance (pour la Marraine)
  const getFilteredSalesWithOwner = () => {
    const sales = getFilteredSales();
    if (!user || user.role !== 'marraine') return sales.map(s => ({...s, _owner:'mine'}));
    const name     = (user.firstName||'').toLowerCase();
    const fullName = `${user.firstName||''} ${user.lastName||''}`.trim().toLowerCase();
    return sales.map(s => {
      const cons = (s.consultant||'').toLowerCase();
      const isMine = !cons || cons === name || cons === fullName ||
                     cons.includes(name) || fullName.includes(cons);
      return { ...s, _owner: isMine ? 'mine' : 'team' };
    });
  };
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
        const fullName = `${user.firstName||''} ${user.lastName||''}`.trim().toLowerCase();
        return all.filter(s => {
          const cons = (s.consultant||'').toLowerCase();
          if (!cons) return false; // Ne pas montrer les ventes sans consultant assigné
          return cons === name || cons === fullName ||
                 cons.includes(name) || name.includes(cons) ||
                 cons.includes(fullName) || fullName.includes(cons);
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
        const fullNameE = `${user.firstName||''} ${user.lastName||''}`.trim().toLowerCase();
        return all.filter(e => {
          const cons = (e.consultant||'').toLowerCase();
          if (!cons) return false;
          return cons === name || cons === fullNameE ||
                 cons.includes(name) || name.includes(cons);
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
      getAllConsultants, canAccess, ROLES, getFilteredSales, getFilteredEvents, getFilteredSalesWithOwner,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

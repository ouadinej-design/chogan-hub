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
    apps: ['commandes','orders','inspirations','clients','fidelite','planner','wallet','reseau','coach','objections','formation','familles','catalogues','checklist'],
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
    store.set('consultants', [...list, newUser]);
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
  const canAccess = (appId) => ROLES[user?.role]?.apps.includes(appId) ?? false;

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, changePassword,
      createConsultant, resetPassword, toggleLock, deleteConsultant,
      getAllConsultants, canAccess, ROLES,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

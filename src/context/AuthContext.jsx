import { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../utils/storage';

const AuthContext = createContext(null);

export const ROLES = {
  admin: {
    label: 'Admin',
    icon: '👑',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.12)',
    border: 'rgba(201,168,76,0.4)',
    apps: ['orders','clients','fidelite','agenda','wallet','reseau','catalogue','coach','objections','stats','settings'],
  },
  marraine: {
    label: 'Marraine',
    icon: '🌸',
    color: '#e05584',
    bg: 'rgba(224,85,132,0.12)',
    border: 'rgba(224,85,132,0.4)',
    apps: ['orders','clients','fidelite','agenda','wallet','reseau','catalogue','coach','objections','stats'],
  },
  consultante: {
    label: 'Consultante',
    icon: '💼',
    color: '#5584e0',
    bg: 'rgba(85,132,224,0.12)',
    border: 'rgba(85,132,224,0.4)',
    apps: ['orders','clients','fidelite','agenda','wallet','reseau','catalogue','coach','objections'],
  },
};

const DEFAULT_USERS = [
  { id:'1', username:'admin',      password:'Admin#2025',      name:'Administratrice', email:'', role:'admin' },
  { id:'2', username:'marraine',   password:'Marraine#2025',   name:'Marraine',        email:'', role:'marraine' },
  { id:'3', username:'consultante',password:'Consultante#2025',name:'Consultante',     email:'', role:'consultante' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = store.get('users', []);
    if (users.length === 0) store.set('users', DEFAULT_USERS);
    const saved = store.get('session');
    if (saved) {
      const all = store.get('users', DEFAULT_USERS);
      const u = all.find(u => u.username === saved);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = store.get('users', DEFAULT_USERS);
    const u = users.find(u => u.username === username && u.password === password);
    if (u) {
      setUser(u);
      store.set('session', username);
      const today = new Date().toISOString().split('T')[0];
      const logs = store.get(`logs_${username}_${today}`, []);
      logs.push({ section:'Connexion', action:'Connexion au Hub', ts: new Date().toISOString() });
      store.set(`logs_${username}_${today}`, logs);
      return { ok: true };
    }
    return { ok: false, error: 'Identifiant ou mot de passe incorrect.' };
  };

  const logout = () => { setUser(null); store.remove('session'); };

  const updateUser = (username, updates) => {
    const users = store.get('users', DEFAULT_USERS);
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      store.set('users', users);
      if (user?.username === username) setUser(users[idx]);
    }
  };

  const addUser = (data) => {
    const users = store.get('users', DEFAULT_USERS);
    if (users.find(u => u.username === data.username)) return { ok: false, error: 'Identifiant déjà utilisé.' };
    store.set('users', [...users, { id: Date.now().toString(), ...data }]);
    return { ok: true };
  };

  const getByRole = (role) => store.get('users', DEFAULT_USERS).filter(u => u.role === role);
  const getAllUsers = () => store.get('users', DEFAULT_USERS);
  const canAccess = (appId) => ROLES[user?.role]?.apps.includes(appId) ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, addUser, getByRole, getAllUsers, canAccess, ROLES }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

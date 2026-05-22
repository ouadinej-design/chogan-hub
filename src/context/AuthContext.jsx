import { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../utils/storage';

const AuthContext = createContext(null);

// Default admin account — change after first login in Settings
const DEFAULT_ADMIN = {
  id: 'admin',
  username: 'admin',
  password: 'Chogan2025!',
  name: 'Administratrice',
  email: '',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure admin exists
    const users = store.get('users', []);
    if (!users.find(u => u.username === 'admin')) {
      store.set('users', [DEFAULT_ADMIN, ...users]);
    }
    // Restore session
    const saved = store.get('session');
    if (saved) {
      const users = store.get('users', []);
      const u = users.find(u => u.username === saved);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = store.get('users', []);
    const u = users.find(u => u.username === username && u.password === password);
    if (u) {
      setUser(u);
      store.set('session', username);
      // Log connection
      const today = new Date().toISOString().split('T')[0];
      const logs = store.get(`logs_${username}_${today}`, []);
      logs.push({ section: 'Connexion', action: 'Connexion au Hub', ts: new Date().toISOString() });
      store.set(`logs_${username}_${today}`, logs);
      return { ok: true };
    }
    return { ok: false, error: 'Identifiant ou mot de passe incorrect.' };
  };

  const logout = () => {
    setUser(null);
    store.remove('session');
  };

  const updateUser = (username, updates) => {
    const users = store.get('users', []);
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      store.set('users', users);
      if (user.username === username) setUser(users[idx]);
    }
  };

  const addConsultant = (data) => {
    const users = store.get('users', []);
    if (users.find(u => u.username === data.username)) return { ok: false, error: 'Identifiant déjà utilisé.' };
    const newUser = {
      id: Date.now().toString(),
      role: 'consultant',
      createdAt: new Date().toISOString(),
      ...data,
    };
    store.set('users', [...users, newUser]);
    return { ok: true };
  };

  const getConsultants = () => store.get('users', []).filter(u => u.role === 'consultant');
  const getAllUsers = () => store.get('users', []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, addConsultant, getConsultants, getAllUsers }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

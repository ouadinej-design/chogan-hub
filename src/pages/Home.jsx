import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getTodayLogs, store } from '../utils/storage';
import Logo from '../components/Logo';

const APPS = [
  { id: 'orders',    label: 'Commandes',    icon: '🛒', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)',   path: '/app/orders' },
  { id: 'clients',   label: 'Clients',      icon: '👥', color: '#5584e0', bg: 'rgba(85,132,224,0.15)',  path: '/app/clients' },
  { id: 'fidelite',  label: 'Fidélité',     icon: '🎁', color: '#e05584', bg: 'rgba(224,85,132,0.15)',  path: '/app/fidelite' },
  { id: 'agenda',    label: 'Agenda',       icon: '📅', color: '#4caf7d', bg: 'rgba(76,175,125,0.15)',  path: '/app/agenda' },
  { id: 'wallet',    label: 'Wallet',       icon: '💰', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  path: '/app/wallet' },
  { id: 'reseau',    label: 'Mon Réseau',   icon: '🌐', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  path: '/app/reseau' },
  { id: 'catalogue', label: 'Catalogue',    icon: '💎', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)', path: '/app/catalogue' },
  { id: 'coach',     label: 'Coach Vocal',  icon: '🎤', color: '#e05555', bg: 'rgba(224,85,85,0.15)',   path: '/app/coach-vocal' },
  { id: 'objections',label: 'Coach Obj.',   icon: '💬', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   path: '/app/objections' },
  { id: 'stats',     label: 'Statistiques', icon: '📊', color: '#10b981', bg: 'rgba(16,185,129,0.15)',  path: '/app/stats' },
  { id: 'settings',  label: 'Paramètres',   icon: '⚙️', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', path: '/app/settings' },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { getOrders, getClients } = useData();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [notifCount] = useState(() => getTodayLogs(user?.username).length);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const todayStr = time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const orders = getOrders();
  const clients = getClients();
  const todayOrders = orders.filter(o => o.createdAt?.startsWith(new Date().toISOString().split('T')[0]));

  return (
    <div style={styles.phone}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        <span style={styles.timeSmall}>{timeStr}</span>
        <div style={styles.statusRight}>
          <span style={{ fontSize: 11, color: 'var(--gold)', opacity: 0.7 }}>●●●</span>
        </div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.heroTime}>
          <div style={styles.bigTime}>{timeStr}</div>
          <div style={styles.bigDate}>{todayStr}</div>
        </div>
        <div style={styles.headerUser}>
          <div style={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <div>
            <div style={styles.userName}>{user?.name || user?.username}</div>
            <div style={styles.userRole}>{user?.role === 'admin' ? 'Administratrice' : 'Consultante'}</div>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Se déconnecter">⎋</button>
        </div>

        {/* Quick stats */}
        <div style={styles.quickStats}>
          <div style={styles.stat}>
            <span style={styles.statN}>{todayOrders.length}</span>
            <span style={styles.statL}>Commandes<br/>aujourd'hui</span>
          </div>
          <div style={styles.statDiv} />
          <div style={styles.stat}>
            <span style={styles.statN}>{clients.length}</span>
            <span style={styles.statL}>Clients<br/>total</span>
          </div>
          <div style={styles.statDiv} />
          <div style={styles.stat}>
            <span style={styles.statN}>{notifCount}</span>
            <span style={styles.statL}>Actions<br/>today</span>
          </div>
        </div>
      </div>

      {/* App grid */}
      <div style={styles.grid}>
        {APPS.map((app, i) => (
          <AppIcon key={app.id} app={app} delay={i * 40} onClick={() => navigate(app.path)} />
        ))}
      </div>

      {/* Bottom bar */}
      <div style={styles.dock}>
        <DockIcon icon="🛒" label="Commandes" onClick={() => navigate('/app/orders')} />
        <DockIcon icon="👥" label="Clients" onClick={() => navigate('/app/clients')} />
        <div style={styles.dockCenter} onClick={() => navigate('/app/orders')}>
          <Logo size={28} />
        </div>
        <DockIcon icon="📅" label="Agenda" onClick={() => navigate('/app/agenda')} />
        <DockIcon icon="💰" label="Wallet" onClick={() => navigate('/app/wallet')} />
      </div>
    </div>
  );
}

function AppIcon({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        ...styles.appWrap,
        animation: `fadeIn 0.4s ease ${delay}ms both`,
        transform: pressed ? 'scale(0.88)' : 'scale(1)',
        transition: 'transform 0.15s ease',
      }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div style={{ ...styles.appIcon, background: app.bg, borderColor: app.color + '44' }}>
        <span style={{ fontSize: 26 }}>{app.icon}</span>
        <div style={{ ...styles.iconShine, background: `radial-gradient(circle at 30% 30%, ${app.color}22, transparent 70%)` }} />
      </div>
      <div style={styles.appLabel}>{app.label}</div>
    </div>
  );
}

function DockIcon({ icon, label, onClick }) {
  return (
    <div style={styles.dockItem} onClick={onClick}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{label}</span>
    </div>
  );
}

const styles = {
  phone: {
    minHeight: '100vh',
    background: 'var(--bg-deep)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  statusBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 20px 4px',
    background: 'transparent',
  },
  timeSmall: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' },
  statusRight: { display: 'flex', gap: 6, alignItems: 'center' },
  header: {
    padding: '4px 20px 20px',
    background: 'linear-gradient(180deg, rgba(201,168,76,0.05) 0%, transparent 100%)',
    borderBottom: '1px solid var(--border)',
    marginBottom: 20,
  },
  heroTime: { textAlign: 'center', marginBottom: 16 },
  bigTime: {
    fontFamily: 'var(--font-display)',
    fontSize: 48,
    fontWeight: 400,
    color: 'var(--text)',
    letterSpacing: '0.05em',
    lineHeight: 1,
  },
  bigDate: { fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'capitalize', marginTop: 4 },
  headerUser: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '10px 14px',
    marginBottom: 12,
  },
  avatar: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#07070f',
    flexShrink: 0,
  },
  userName: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  userRole: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  logoutBtn: { marginLeft: 'auto', background: 'none', color: 'var(--text-muted)', fontSize: 18, padding: '4px 8px' },
  quickStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '12px 20px',
  },
  stat: { textAlign: 'center' },
  statN: { display: 'block', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', lineHeight: 1 },
  statL: { display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.04em', lineHeight: 1.4 },
  statDiv: { width: 1, height: 30, background: 'var(--border)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px 10px',
    padding: '0 16px',
    flex: 1,
  },
  appWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    cursor: 'pointer', userSelect: 'none',
  },
  appIcon: {
    width: 62, height: 62,
    borderRadius: 18,
    border: '1px solid transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  iconShine: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
  },
  appLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textAlign: 'center',
    letterSpacing: '0.02em',
    maxWidth: 64,
    lineHeight: 1.2,
  },
  dock: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    padding: '12px 20px 24px',
    background: 'rgba(13,13,30,0.8)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border)',
    marginTop: 20,
  },
  dockItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    cursor: 'pointer', padding: '4px 10px', borderRadius: 12,
    transition: 'background 0.2s',
  },
  dockCenter: {
    width: 52, height: 52,
    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
    border: '1px solid var(--border-strong)',
    borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(201,168,76,0.15)',
  },
};

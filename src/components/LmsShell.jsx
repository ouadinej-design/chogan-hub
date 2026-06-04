import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import Logo from './Logo';

// Navigation principale (bottom nav + sidebar)
const NAV_ITEMS = [
  { id: 'home',    label: 'Accueil',  icon: '🏠', path: '/' },
  { id: 'ventes',  label: 'Ventes',   icon: '💰', path: '/app/ventes' },
  { id: 'clients', label: 'Clients',  icon: '👥', path: '/app/clients' },
  { id: 'agenda',  label: 'Agenda',   icon: '📅', path: '/app/agenda' },
  { id: 'apps',    label: 'Apps',     icon: '⚏',  path: '/?tab=apps' },
];

// Toutes les apps groupées par catégorie pour la sidebar
const SIDEBAR_GROUPS = [
  {
    label: 'Gestion',
    items: [
      { icon: '🛒', label: 'Commandes',    path: '/app/orders' },
      { icon: '💰', label: 'Ventes',       path: '/app/ventes' },
      { icon: '👥', label: 'Clients',      path: '/app/clients' },
      { icon: '⭐', label: 'Fidélité',     path: '/app/fidelite' },
    ]
  },
  {
    label: 'Organisation',
    items: [
      { icon: '📅', label: 'Agenda',       path: '/app/agenda' },
      { icon: '🗓', label: 'Planner',      path: '/app/planner' },
      { icon: '📊', label: 'Statistiques', path: '/app/stats' },
      { icon: '🌳', label: 'Mon Réseau',   path: '/app/reseau' },
    ]
  },
  {
    label: 'Ressources',
    items: [
      { icon: '🌹', label: 'Inspirations', path: '/app/inspirations' },
      { icon: '🎓', label: 'Formation',    path: '/app/formation' },
      { icon: '📖', label: 'Catalogues',   path: '/app/catalogues' },
      { icon: '💐', label: 'Familles',     path: '/app/familles' },
      { icon: '✅', label: 'Check-list',   path: '/app/checklist' },
      { icon: '💎', label: 'Chogan Élite', path: '/app/catalogue' },
    ]
  },
  {
    label: 'Premium ★',
    items: [
      { icon: '💼', label: 'Wallet',          path: '/app/wallet' },
      { icon: '🎤', label: 'Coach Vocal',     path: '/app/coach-vocal' },
      { icon: '💬', label: 'Objections',      path: '/app/objections' },
    ]
  },
  {
    label: 'Compte',
    items: [
      { icon: '⚙️', label: 'Paramètres',     path: '/app/settings' },
    ]
  },
];

export default function LmsShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const roleInfo = ROLES[user?.role] || { label:'', icon:'', bg:'transparent', border:'transparent', color:'#4E463F' };
  
  // Guard — si pas de user, juste afficher les enfants
  if (!user) return <>{children}</>;

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  const goTo = (path) => {
    setDrawerOpen(false);
    if (path === '/?tab=apps') {
      navigate('/');
      // Déclencher le changement d'onglet via un event custom
      setTimeout(() => window.dispatchEvent(new CustomEvent('lms-goto-apps')), 50);
    } else {
      navigate(path);
    }
  };

  // Fermer drawer sur navigation
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="lms-sidebar-logo">
        <Logo size={28} />
        <div>
          <div className="lms-sidebar-logo-text">Chogan Hub</div>
          <div className="lms-sidebar-logo-sub">Espace Consultant</div>
        </div>
      </div>

      {/* User */}
      <div className="lms-sidebar-user">
        <div className="lms-sidebar-avatar">{initials}</div>
        <div>
          <div className="lms-sidebar-uname">{user?.firstName} {user?.lastName}</div>
          <div className="lms-sidebar-urole">{roleInfo.icon} {roleInfo.label}</div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="lms-sidebar-nav">
        {/* Accueil */}
        <div
          className={`lms-nav-item${isActive('/') && location.pathname === '/' ? ' active' : ''}`}
          onClick={() => goTo('/')}
        >
          <span className="lms-nav-icon">🏠</span>
          <span className="lms-nav-label">Accueil & News</span>
        </div>

        {SIDEBAR_GROUPS.map(group => (
          <div key={group.label} className="lms-nav-section">
            <div className="lms-nav-section-label">{group.label}</div>
            {group.items.map(item => (
              <div
                key={item.path}
                className={`lms-nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => goTo(item.path)}
              >
                <span className="lms-nav-icon">{item.icon}</span>
                <span className="lms-nav-label">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="lms-sidebar-footer">
        <div className="lms-nav-item" onClick={logout} style={{ color: 'rgba(192,57,43,0.7)' }}>
          <span className="lms-nav-icon">⎋</span>
          <span className="lms-nav-label" style={{ color: 'rgba(247,235,225,0.5)', fontSize: 12 }}>Se déconnecter</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="lms-shell">
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="lms-sidebar">
        <SidebarContent />
      </aside>

      {/* ── DRAWER MOBILE ── */}
      <div
        className={`lms-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`lms-drawer${drawerOpen ? ' open' : ''}`}>
        <SidebarContent />
      </div>

      {/* ── MAIN ── */}
      <div className="lms-main">
        {/* Topbar */}
        <header className="lms-topbar">
          {/* Burger mobile */}
          <button className="lms-burger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>

          {/* Back btn sur pages apps */}
          {location.pathname !== '/' && (
            <button className="lms-topbar-back" onClick={() => navigate(-1)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Logo sur home uniquement (desktop: dans sidebar) */}
          {location.pathname === '/' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Logo size={24} />
              <span className="lms-topbar-title">Chogan Hub</span>
            </div>
          )}

          {/* Titre dynamique injecté via data attribute */}
          {location.pathname !== '/' && (
            <span className="lms-topbar-title" id="lms-page-title">—</span>
          )}

          {/* User pill */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: roleInfo.bg,
              border: `1px solid ${roleInfo.border}`,
              borderRadius: 20,
              padding: '4px 10px 4px 6px',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--or), var(--or-deep))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'var(--taupe)',
              }}>{initials}</div>
              <span style={{ fontSize: 11, color: roleInfo.color, fontWeight: 600 }}>
                {user?.firstName}
              </span>
            </div>

            {/* Logout desktop */}
            <button
              onClick={logout}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-dim)', fontSize: 16,
                padding: '4px 6px', cursor: 'pointer',
              }}
              title="Se déconnecter"
            >⎋</button>
          </div>
        </header>

        {/* Contenu */}
        <main className="lms-content">
          {children}
        </main>

        {/* ── BOTTOM NAV MOBILE ── */}
        <nav className="lms-bottom-nav">
          <div className="lms-bottom-nav-inner">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`lms-bnav-item${isActive(item.path.split('?')[0]) && (item.path !== '/?tab=apps') ? ' active' : ''}`}
                onClick={() => goTo(item.path)}
              >
                <span className="lms-bnav-icon">{item.icon}</span>
                <span className="lms-bnav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

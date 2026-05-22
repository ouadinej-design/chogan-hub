import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { getTodayLogs, store } from '../utils/storage';
import Logo from '../components/Logo';

const ALL_APPS = [
  { id:'orders',    label:'Commandes',    icon:'🛒', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/orders' },
  { id:'clients',   label:'Clients',      icon:'👥', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/clients' },
  { id:'fidelite',  label:'Fidélité',     icon:'🎁', color:'#9e5a7a', bg:'rgba(158,90,122,0.12)',  path:'/app/fidelite' },
  { id:'agenda',    label:'Agenda',       icon:'📅', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/agenda' },
  { id:'wallet',    label:'Wallet',       icon:'💰', color:'#9e7a3d', bg:'rgba(158,122,61,0.12)',  path:'/app/wallet' },
  { id:'reseau',    label:'Mon Réseau',   icon:'🌐', color:'#6b4d8a', bg:'rgba(107,77,138,0.12)',  path:'/app/reseau' },
  { id:'catalogue', label:'Chogan Élite', icon:'💎', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/catalogue' },
  { id:'coach',     label:'Coach Vocal',  icon:'🎤', color:'#8a4d4d', bg:'rgba(138,77,77,0.12)',   path:'/app/coach-vocal' },
  { id:'objections',label:'Coach Obj.',   icon:'💬', color:'#3d7a8a', bg:'rgba(61,122,138,0.12)',  path:'/app/objections' },
  { id:'stats',     label:'Statistiques', icon:'📊', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/stats' },
  { id:'settings',  label:'Paramètres',   icon:'⚙️', color:'#7a7069', bg:'rgba(122,112,105,0.12)', path:'/app/settings' },
];

export default function Home() {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const roleInfo = ROLES[user?.role];

  // Annonces et succès depuis le store partagé
  const [anns] = useState(() => store.get('mur_anns', [
    { id:1, text:"🌸 Bienvenue dans l'espace Chogan Hub ! Retrouvez toutes vos applications ici.", date: new Date().toLocaleDateString('fr-FR') },
    { id:2, text:"✨ Nouvelle mise à jour — Wallet, Agenda et Coach Vocal intégrés !", date: new Date().toLocaleDateString('fr-FR') },
  ]));
  const [sucs] = useState(() => store.get('mur_sucs', [
    { id:1, name:"Amira B.",  ach:"Première vente ✨" },
    { id:2, name:"Nour K.",   ach:"Statut Or atteint 🥇" },
  ]));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const apps = ALL_APPS.filter(a => canAccess(a.id));
  const todayLogs = getTodayLogs(user?.username);
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logoRow}>
          <Logo size={36} />
          <div>
            <div style={S.brand}>CHOGAN HUB</div>
            <div style={S.dateStr}>{dateStr}</div>
          </div>
          <div style={S.userPill}>
            <span style={{ fontSize: 16 }}>{roleInfo.icon}</span>
            <span style={{ fontSize: 12, color: roleInfo.color, fontWeight: 700 }}>{roleInfo.label}</span>
          </div>
          <button onClick={logout} style={S.logoutBtn}>⎋</button>
        </div>

        {/* Bonjour */}
        <div style={S.greet}>
          <span style={S.bigTime}>{timeStr}</span>
          <span style={S.greetName}>Bonjour, {user?.name || user?.username} 👋</span>
        </div>
      </div>

      {/* Mur d'annonces */}
      <div style={S.murSection}>
        <div style={S.murTitle}>📣 Annonces</div>
        <div style={S.murScroll}>
          {anns.map(a => (
            <div key={a.id} style={S.annCard}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>{a.text}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{a.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mur des succès */}
      <div style={S.murSection}>
        <div style={S.murTitle}>🏆 Succès de l'équipe</div>
        <div style={S.murScroll}>
          {sucs.map(s => (
            <div key={s.id} style={{ ...S.annCard, minWidth: 160 }}>
              <span style={{ fontSize: 22 }}>🌟</span>
              <p style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{s.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.ach}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App grid */}
      <div style={S.gridTitle}>Mes Applications</div>
      <div style={S.grid}>
        {apps.map((app, i) => (
          <AppIcon key={app.id} app={app} delay={i * 35} onClick={() => navigate(app.path)} />
        ))}
      </div>

      {/* Stats rapides */}
      <div style={S.statsRow}>
        <div style={S.statItem}>
          <span style={S.statN}>{todayLogs.length}</span>
          <span style={S.statL}>Actions aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}

function AppIcon({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div style={{ ...S.appWrap, animation: `fadeIn 0.4s ease ${delay}ms both`, transform: pressed ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.15s' }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div style={{ ...S.appIcon, background: app.bg, borderColor: app.color + '55' }}>
        <span style={{ fontSize: 24 }}>{app.icon}</span>
      </div>
      <div style={S.appLabel}>{app.label}</div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 40 },
  header: { background: 'rgba(247,235,225,0.95)', borderBottom: '1px solid var(--or-border)', padding: '16px 18px 12px', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  brand: { fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.2em', color: 'var(--taupe)' },
  dateStr: { fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' },
  userPill: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--or-pale)', border: '1px solid var(--or-border)', borderRadius: 20, padding: '4px 12px' },
  logoutBtn: { background: 'none', color: 'var(--text-muted)', fontSize: 18, padding: '4px 6px', flexShrink: 0 },
  greet: { display: 'flex', alignItems: 'baseline', gap: 12 },
  bigTime: { fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--taupe)', letterSpacing: '0.05em' },
  greetName: { fontSize: 14, color: 'var(--text-muted)' },
  murSection: { padding: '16px 18px 0' },
  murTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--or-deep)', marginBottom: 10 },
  murScroll: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
  annCard: { minWidth: 220, background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 14, padding: '14px', flexShrink: 0, boxShadow: 'var(--shadow)' },
  gridTitle: { padding: '18px 18px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--or-deep)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 8px', padding: '0 16px' },
  appWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
  appIcon: { width: 58, height: 58, borderRadius: 16, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, boxShadow: '0 2px 8px rgba(78,70,63,0.1)' },
  appLabel: { fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, maxWidth: 58 },
  statsRow: { display: 'flex', justifyContent: 'center', margin: '20px 18px 0', background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 14, padding: '12px' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  statN: { fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--or-deep)' },
  statL: { fontSize: 11, color: 'var(--text-muted)' },
};

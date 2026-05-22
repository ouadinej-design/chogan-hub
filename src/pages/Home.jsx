import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
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
  const [page, setPage] = useState('news'); // 'news' | 'apps'
  const [time, setTime] = useState(new Date());
  const roleInfo = ROLES[user?.role];
  const tickerRef = useRef(null);

  const anns = store.get('mur_anns', [
    { id:1, text:"🌸 Bienvenue dans votre espace Chogan Hub ! Retrouvez toutes vos outils ici.", date: new Date().toLocaleDateString('fr-FR') },
    { id:2, text:"✨ Nouvelle mise à jour — Wallet, Agenda et Coach Vocal sont maintenant intégrés !", date: new Date().toLocaleDateString('fr-FR') },
    { id:3, text:"💎 Catalogue Chogan mis à jour avec les dernières collections.", date: new Date().toLocaleDateString('fr-FR') },
    { id:4, text:"🎯 Objectif du mois : 10 nouvelles clientes. Vous pouvez le faire !", date: new Date().toLocaleDateString('fr-FR') },
  ]);

  const sucs = store.get('mur_sucs', [
    { id:1, name:"Amira B.",   ach:"Première vente ✨" },
    { id:2, name:"Nour K.",    ach:"Statut Or atteint 🥇" },
    { id:3, name:"Yasmine M.", ach:"10 clientes ce mois 🎯" },
    { id:4, name:"Sara D.",    ach:"Recrutement réussi 🌱" },
  ]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const apps = ALL_APPS.filter(a => canAccess(a.id));
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={S.root}>
      {/* ── HEADER fixe ── */}
      <div style={S.header}>
        <Logo size={30} />
        <div style={{ flex: 1 }}>
          <div style={S.brand}>CHOGAN HUB</div>
          <div style={S.dateStr}>{dateStr}</div>
        </div>
        <div style={{ ...S.userPill, background: roleInfo.bg, borderColor: roleInfo.border }}>
          <span>{roleInfo.icon}</span>
          <span style={{ fontSize: 11, color: roleInfo.color, fontWeight: 700 }}>{roleInfo.label}</span>
        </div>
        <button onClick={logout} style={S.logoutBtn} title="Se déconnecter">⎋</button>
      </div>

      {/* ── PAGE NEWS ── */}
      {page === 'news' && (
        <div style={S.newsPage} className="fade-in">

          {/* Bonjour + heure */}
          <div style={S.greetBlock}>
            <div style={S.bigTime}>{timeStr}</div>
            <div style={S.greetLine}>
              Bonjour, <strong>{user?.firstName || user?.displayName}</strong> {roleInfo.icon}
            </div>
          </div>

          {/* Annonces — grande zone scroll vertical */}
          <div style={S.annSection}>
            <div style={S.sectionLabel}>📣 Annonces</div>
            <div style={S.annZone}>
              {anns.map((a, i) => (
                <div key={a.id} style={{ ...S.annCard, animationDelay: `${i * 0.08}s` }} className="fade-in">
                  <p style={S.annText}>{a.text}</p>
                  <p style={S.annDate}>{a.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Succès équipe */}
          <div style={S.sucSection}>
            <div style={S.sectionLabel}>🏆 Succès de l'équipe</div>
            <div style={S.sucZone}>
              {sucs.map((s, i) => (
                <div key={s.id} style={{ ...S.sucCard, animationDelay: `${i * 0.08}s` }} className="fade-in">
                  <span style={S.sucStar}>🌟</span>
                  <div>
                    <div style={S.sucName}>{s.name}</div>
                    <div style={S.sucAch}>{s.ach}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Padding bas pour le bouton flottant */}
          <div style={{ height: 90 }} />
        </div>
      )}

      {/* ── PAGE APPS ── */}
      {page === 'apps' && (
        <div style={S.appsPage} className="fade-in">
          <div style={S.appsTitle}>Mes Applications</div>
          <div style={S.grid}>
            {apps.map((app, i) => (
              <AppIcon key={app.id} app={app} delay={i * 35} onClick={() => navigate(app.path)} />
            ))}
          </div>
          <div style={{ height: 90 }} />
        </div>
      )}

      {/* ── BOUTON FLOTTANT bas-droite ── */}
      <button
        style={{ ...S.fab, background: page === 'news' ? 'linear-gradient(135deg, #D2B795, #B89A6A)' : 'linear-gradient(135deg, #B89A6A, #D2B795)' }}
        onClick={() => setPage(page === 'news' ? 'apps' : 'news')}
      >
        {page === 'news' ? (
          <span style={S.fabInner}>
            <span style={{ fontSize: 20 }}>⚏</span>
            <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>APPS</span>
          </span>
        ) : (
          <span style={S.fabInner}>
            <span style={{ fontSize: 20 }}>🏠</span>
            <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>ACCUEIL</span>
          </span>
        )}
      </button>
    </div>
  );
}

function AppIcon({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{ ...S.appWrap, animation: `fadeIn 0.4s ease ${delay}ms both`, transform: pressed ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.15s' }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div style={{ ...S.appIcon, background: app.bg, borderColor: app.color + '55' }}>
        <span style={{ fontSize: 26 }}>{app.icon}</span>
      </div>
      <div style={S.appLabel}>{app.label}</div>
    </div>
  );
}

const S = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' },

  // Header
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(247,235,225,0.95)', borderBottom: '1px solid var(--or-border)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
  brand: { fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.2em', color: 'var(--taupe)' },
  dateStr: { fontSize: 10, color: 'var(--text-muted)', marginTop: 1, textTransform: 'capitalize' },
  userPill: { display: 'flex', alignItems: 'center', gap: 5, border: '1px solid', borderRadius: 20, padding: '4px 10px', flexShrink: 0 },
  logoutBtn: { background: 'none', color: 'var(--text-muted)', fontSize: 17, padding: '4px 6px', flexShrink: 0, border: 'none', cursor: 'pointer' },

  // News page
  newsPage: { flex: 1, overflowY: 'auto' },

  greetBlock: { padding: '20px 18px 16px', borderBottom: '1px solid var(--or-border)' },
  bigTime: { fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--taupe)', letterSpacing: '0.04em', lineHeight: 1 },
  greetLine: { fontSize: 15, color: 'var(--text-muted)', marginTop: 8 },

  // Annonces
  annSection: { padding: '18px 16px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--or-deep)', marginBottom: 12 },
  annZone: { display: 'flex', flexDirection: 'column', gap: 10 },
  annCard: { background: 'rgba(255,255,255,0.85)', border: '1px solid var(--or-border)', borderRadius: 14, padding: '16px', boxShadow: '0 2px 12px rgba(78,70,63,0.06)' },
  annText: { fontSize: 14, lineHeight: 1.7, color: 'var(--text)' },
  annDate: { fontSize: 10, color: 'var(--text-muted)', marginTop: 8 },

  // Succès
  sucSection: { padding: '20px 16px 0' },
  sucZone: { display: 'flex', flexDirection: 'column', gap: 8 },
  sucCard: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.75)', border: '1px solid var(--or-border)', borderRadius: 12, padding: '12px 14px' },
  sucStar: { fontSize: 24, flexShrink: 0 },
  sucName: { fontSize: 14, fontWeight: 700, color: 'var(--taupe)' },
  sucAch: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },

  // Apps page
  appsPage: { flex: 1, overflowY: 'auto', padding: '18px 16px 0' },
  appsTitle: { fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.12em', color: 'var(--taupe)', marginBottom: 18, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px 8px' },
  appWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
  appIcon: { width: 60, height: 60, borderRadius: 18, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7, boxShadow: '0 2px 10px rgba(78,70,63,0.08)' },
  appLabel: { fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, maxWidth: 62 },

  // FAB
  fab: { position: 'fixed', bottom: 28, right: 20, width: 62, height: 62, borderRadius: 20, border: 'none', cursor: 'pointer', boxShadow: '0 6px 24px rgba(184,154,106,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fabInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#fff' },
};

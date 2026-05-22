import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { getTodayLogs } from '../utils/storage';
import Logo from '../components/Logo';

const ALL_APPS = [
  { id:'orders',    label:'Commandes',    icon:'🛒', color:'#C9A84C', bg:'rgba(201,168,76,0.15)',  path:'/app/orders' },
  { id:'clients',   label:'Clients',      icon:'👥', color:'#5584e0', bg:'rgba(85,132,224,0.15)', path:'/app/clients' },
  { id:'fidelite',  label:'Fidélité',     icon:'🎁', color:'#e05584', bg:'rgba(224,85,132,0.15)', path:'/app/fidelite' },
  { id:'agenda',    label:'Agenda',       icon:'📅', color:'#4caf7d', bg:'rgba(76,175,125,0.15)', path:'/app/agenda' },
  { id:'wallet',    label:'Wallet',       icon:'💰', color:'#f59e0b', bg:'rgba(245,158,11,0.15)', path:'/app/wallet' },
  { id:'reseau',    label:'Mon Réseau',   icon:'🌐', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)', path:'/app/reseau' },
  { id:'catalogue', label:'Chogan Élite', icon:'💎', color:'#C9A84C', bg:'rgba(201,168,76,0.15)', path:'/app/catalogue' },
  { id:'coach',     label:'Coach Vocal',  icon:'🎤', color:'#e05555', bg:'rgba(224,85,85,0.15)',  path:'/app/coach-vocal' },
  { id:'objections',label:'Coach Obj.',   icon:'💬', color:'#06b6d4', bg:'rgba(6,182,212,0.15)',  path:'/app/objections' },
  { id:'stats',     label:'Statistiques', icon:'📊', color:'#10b981', bg:'rgba(16,185,129,0.15)', path:'/app/stats' },
  { id:'settings',  label:'Paramètres',   icon:'⚙️', color:'#94a3b8', bg:'rgba(148,163,184,0.15)',path:'/app/settings' },
];

export default function Home() {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const roleInfo = ROLES[user?.role];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const apps = ALL_APPS.filter(a => canAccess(a.id));
  const todayLogs = getTodayLogs(user?.username);
  const timeStr = time.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  const dateStr = time.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });

  return (
    <div style={S.phone}>
      {/* Status bar */}
      <div style={S.statusBar}>
        <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{timeStr}</span>
        <span style={{ fontSize:11, color:'var(--gold)', opacity:0.7 }}>●●●</span>
      </div>

      {/* Header */}
      <div style={S.header}>
        <div style={S.heroTime}>
          <div style={S.bigTime}>{timeStr}</div>
          <div style={S.bigDate}>{dateStr}</div>
        </div>

        {/* User card */}
        <div style={S.userCard}>
          <div style={{ ...S.avatar, background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)` }}>
            {roleInfo.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={S.userName}>{user?.name || user?.username}</div>
            <div style={{ ...S.userRole, color: roleInfo.color }}>{roleInfo.label}</div>
          </div>
          <div style={S.activityBadge}>
            <span style={{ fontSize:16, fontWeight:700, color:'var(--gold)' }}>{todayLogs.length}</span>
            <span style={{ fontSize:9, color:'var(--text-muted)' }}>actions</span>
          </div>
          <button onClick={logout} style={S.logoutBtn} title="Se déconnecter">⎋</button>
        </div>
      </div>

      {/* App grid */}
      <div style={{ ...S.grid, gridTemplateColumns: apps.length <= 4 ? 'repeat(2,1fr)' : 'repeat(4,1fr)' }}>
        {apps.map((app, i) => (
          <AppIcon key={app.id} app={app} delay={i * 40} onClick={() => navigate(app.path)} />
        ))}
      </div>

      {/* Dock */}
      <div style={S.dock}>
        {apps.slice(0,2).map(a => (
          <DockIcon key={a.id} icon={a.icon} label={a.label} onClick={() => navigate(a.path)} />
        ))}
        <div style={S.dockCenter} onClick={() => navigate('/')}>
          <Logo size={28} />
        </div>
        {apps.slice(2,4).map(a => (
          <DockIcon key={a.id} icon={a.icon} label={a.label} onClick={() => navigate(a.path)} />
        ))}
      </div>
    </div>
  );
}

function AppIcon({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div style={{ ...S.appWrap, animation:`fadeIn 0.4s ease ${delay}ms both`, transform: pressed?'scale(0.88)':'scale(1)', transition:'transform 0.15s ease' }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div style={{ ...S.appIcon, background: app.bg, borderColor: app.color + '44' }}>
        <span style={{ fontSize:26 }}>{app.icon}</span>
        <div style={{ ...S.iconShine, background:`radial-gradient(circle at 30% 30%, ${app.color}22, transparent 70%)` }} />
      </div>
      <div style={S.appLabel}>{app.label}</div>
    </div>
  );
}

function DockIcon({ icon, label, onClick }) {
  return (
    <div style={S.dockItem} onClick={onClick}>
      <span style={{ fontSize:22 }}>{icon}</span>
      <span style={{ fontSize:9, color:'var(--text-muted)', marginTop:2 }}>{label}</span>
    </div>
  );
}

const S = {
  phone: { minHeight:'100vh', background:'var(--bg-deep)', display:'flex', flexDirection:'column', overflow:'hidden' },
  statusBar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 20px 4px' },
  header: { padding:'4px 20px 20px', background:'linear-gradient(180deg, rgba(201,168,76,0.05) 0%, transparent 100%)', borderBottom:'1px solid var(--border)', marginBottom:20 },
  heroTime: { textAlign:'center', marginBottom:16 },
  bigTime: { fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'var(--text)', letterSpacing:'0.05em', lineHeight:1 },
  bigDate: { fontSize:12, color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'capitalize', marginTop:4 },
  userCard: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'10px 14px' },
  avatar: { width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
  userName: { fontSize:14, fontWeight:600 },
  userRole: { fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:2 },
  activityBadge: { display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'4px 10px', background:'var(--gold-pale)', borderRadius:10, border:'1px solid var(--border)' },
  logoutBtn: { background:'none', color:'var(--text-muted)', fontSize:18, padding:'4px 8px', flexShrink:0, border:'none', cursor:'pointer' },
  grid: { display:'grid', gap:'16px 10px', padding:'0 16px', flex:1 },
  appWrap: { display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', userSelect:'none' },
  appIcon: { width:62, height:62, borderRadius:18, border:'1px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', marginBottom:6, boxShadow:'0 4px 12px rgba(0,0,0,0.3)' },
  iconShine: { position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none' },
  appLabel: { fontSize:10, color:'var(--text-muted)', textAlign:'center', letterSpacing:'0.02em', maxWidth:64, lineHeight:1.2 },
  dock: { display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 20px 24px', background:'rgba(13,13,30,0.8)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)', marginTop:20 },
  dockItem: { display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', padding:'4px 10px', borderRadius:12 },
  dockCenter: { width:52, height:52, background:'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border:'1px solid var(--border-strong)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 20px rgba(201,168,76,0.15)' },
};

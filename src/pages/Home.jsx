import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { store } from '../utils/storage';
import Logo from '../components/Logo';

const ALL_APPS = [
  { id:'commandes',   label:'Commandes',     desc:'Bon de commande auto',     icon:'🛒', color:'#B89A6A', bg:'rgba(184,154,106,0.13)', path:'/app/orders' },
  { id:'ventes',      label:'Ventes',        desc:"Suivi chiffre d'affaires", icon:'💰', color:'#2d7a4a', bg:'rgba(45,122,74,0.12)',   path:'/app/ventes' },
  { id:'clients',     label:'Clients',       desc:'Fiches & historique',       icon:'👥', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/clients' },
  { id:'fidelite',    label:'Fidélité',      desc:'Programme points Chogan',   icon:'⭐', color:'#9e7a3d', bg:'rgba(158,122,61,0.12)',  path:'/app/fidelite' },
  { id:'agenda',      label:'Agenda',        desc:'Calendrier & événements',   icon:'📅', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/agenda' },
  { id:'planner',     label:'Planner',       desc:'Organisation personnelle',  icon:'🗓', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/planner' },
  { id:'stats',       label:'Statistiques',  desc:'Tableaux de bord & CA',     icon:'📊', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/stats' },
  { id:'reseau',      label:'Mon Réseau',    desc:'Équipe & arbre Chogan',     icon:'🌳', color:'#6b4d8a', bg:'rgba(107,77,138,0.12)',  path:'/app/reseau' },
  { id:'inspirations',label:'Inspirations',  desc:'Motivation & contenu',      icon:'🌹', color:'#9e5a7a', bg:'rgba(158,90,122,0.12)', path:'/app/inspirations' },
  { id:'formation',   label:'Formation',     desc:'Modules de formation',      icon:'🎓', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/formation' },
  { id:'catalogue',   label:'Chogan Élite',  desc:'Collection exclusive',      icon:'💎', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/catalogue' },
  { id:'catalogues',  label:'Catalogues',    desc:'Produits & références',     icon:'📖', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/catalogues' },
  { id:'familles',    label:'Familles',      desc:'Familles olfactives',       icon:'💐', color:'#9e5a7a', bg:'rgba(158,90,122,0.12)',  path:'/app/familles' },
  { id:'checklist',   label:'Check-list',    desc:'Promotions & actions',      icon:'✅', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/checklist' },
  { id:'wallet',      label:'Wallet',        desc:'Portefeuille financier',    icon:'💼', color:'#9e7a3d', bg:'rgba(158,122,61,0.12)',  path:'/app/wallet' },
  { id:'coach',       label:'Coach Vocal',   desc:'Entraînement objections',   icon:'🎤', color:'#8a4d4d', bg:'rgba(138,77,77,0.12)',   path:'/app/coach-vocal' },
  { id:'objections',  label:'Objections',    desc:'Réponses aux objections',   icon:'💬', color:'#3d7a8a', bg:'rgba(61,122,138,0.12)',  path:'/app/objections' },
  { id:'settings',    label:'Paramètres',    desc:'Comptes & configuration',   icon:'⚙️', color:'#7a7069', bg:'rgba(122,112,105,0.12)', path:'/app/settings' },
];

const DEFAULT_ANNS = [
  { id:1, text:"🌸 Bienvenue dans votre espace Chogan Hub ! Retrouvez tous vos outils ici.", date: new Date().toLocaleDateString('fr-FR'), author: "Admin" },
  { id:2, text:"✨ Nouvelle mise à jour — Wallet, Agenda et Coach Vocal sont maintenant intégrés !", date: new Date().toLocaleDateString('fr-FR'), author: "Admin" },
];
const DEFAULT_SUCS = [
  { id:1, name:"Amira B.",   ach:"Première vente ✨", date: new Date().toLocaleDateString('fr-FR'), author: "Admin" },
  { id:2, name:"Nour K.",    ach:"Statut Or atteint 🥇", date: new Date().toLocaleDateString('fr-FR'), author: "Admin" },
];

const MONTHLY_TARGET = 500; // Objectif € mensuel configurable

const APP_GROUPS = [
  { label: '💼 Gestion commerciale', items: [
    { id:'commandes', label:'Commandes',    desc:'Bon de commande auto',      icon:'🛒', color:'#B89A6A', bg:'rgba(184,154,106,0.13)', path:'/app/orders' },
    { id:'ventes',    label:'Ventes',       desc:"Chiffre d'affaires",        icon:'💰', color:'#2d7a4a', bg:'rgba(45,122,74,0.12)',   path:'/app/ventes' },
    { id:'clients',   label:'Clients',      desc:'Fiches & historique',        icon:'👥', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/clients' },
    { id:'fidelite',  label:'Fidélité',     desc:'Programme points Chogan',    icon:'⭐', color:'#9e7a3d', bg:'rgba(158,122,61,0.12)',  path:'/app/fidelite' },
  ]},
  { label: '📅 Organisation', items: [
    { id:'agenda',    label:'Agenda',       desc:'Calendrier & événements',    icon:'📅', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/agenda' },
    { id:'planner',   label:'Planner',      desc:'Organisation personnelle',   icon:'🗓', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/planner' },
    { id:'stats',     label:'Statistiques', desc:'Tableaux de bord & CA',      icon:'📊', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/stats' },
    { id:'reseau',    label:'Mon Réseau',   desc:'Équipe & arbre Chogan',      icon:'🌳', color:'#6b4d8a', bg:'rgba(107,77,138,0.12)',  path:'/app/reseau' },
  ]},
  { label: '🎓 Apprentissage', items: [
    { id:'formation',   label:'Formation',    desc:'Modules de formation',     icon:'🎓', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/formation',   duration:'~15 min' },
    { id:'inspirations',label:'Inspirations', desc:'Motivation & contenu',     icon:'🌹', color:'#9e5a7a', bg:'rgba(158,90,122,0.12)',  path:'/app/inspirations' },
    { id:'catalogues',  label:'Catalogues',   desc:'Produits & références',    icon:'📖', color:'#3d6b9e', bg:'rgba(61,107,158,0.12)',  path:'/app/catalogues' },
    { id:'familles',    label:'Familles',     desc:'Familles olfactives',      icon:'💐', color:'#9e5a7a', bg:'rgba(158,90,122,0.12)',  path:'/app/familles' },
    { id:'checklist',   label:'Check-list',   desc:'Promotions & actions',     icon:'✅', color:'#4a7c59', bg:'rgba(74,124,89,0.12)',   path:'/app/checklist' },
    { id:'catalogue',   label:'Chogan Élite', desc:'Collection exclusive',     icon:'💎', color:'#B89A6A', bg:'rgba(184,154,106,0.12)', path:'/app/catalogue' },
  ]},
  { label: '★ Premium VIP', items: [
    { id:'wallet',     label:'Wallet',       desc:'Portefeuille financier',    icon:'💼', color:'#9e7a3d', bg:'rgba(158,122,61,0.12)',  path:'/app/wallet',      vip:true },
    { id:'coach',      label:'Coach Vocal',  desc:'Entraînement objections',   icon:'🎤', color:'#8a4d4d', bg:'rgba(138,77,77,0.12)',   path:'/app/coach-vocal', vip:true, duration:'30 sec' },
    { id:'objections', label:'Objections',   desc:'Réponses aux objections',   icon:'💬', color:'#3d7a8a', bg:'rgba(61,122,138,0.12)',  path:'/app/objections',  vip:true },
  ]},
  { label: '⚙️ Compte', items: [
    { id:'settings',   label:'Paramètres',   desc:'Comptes & configuration',   icon:'⚙️', color:'#7a7069', bg:'rgba(122,112,105,0.12)', path:'/app/settings' },
  ]},
];

export default function Home() {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState('news');

  // Écouter l'event du LmsShell (bouton Apps dans bottom nav)
  useEffect(() => {
    const handler = () => setPage('apps');
    window.addEventListener('lms-goto-apps', handler);
    return () => window.removeEventListener('lms-goto-apps', handler);
  }, []);
  const roleInfo = ROLES[user?.role];
  const canEdit = user?.role === 'admin' || user?.role === 'marraine';

  // Stats pour hero
  const monthlySales = (() => {
    try {
      const now = new Date();
      const sales = JSON.parse(localStorage.getItem('le_sales') || '[]');
      const myFirst = (user?.firstName||'').toLowerCase();
      return sales
        .filter(s => {
          const d = new Date(s.date || s.createdAt || '');
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
          if (user?.role === 'marraine' || user?.role === 'admin') return true;
          const cons = (s.consultant||'').toLowerCase();
          return cons.split(' ').some(w => w === myFirst);
        })
        .filter(s => (s.currency||s.cur||'€') === '€')
        .reduce((t,s) => t + (parseFloat(s.amount||s.amt)||0), 0);
    } catch { return 0; }
  })();

  const totalPoints = (() => {
    try {
      const sales = JSON.parse(localStorage.getItem('le_sales') || '[]');
      const myFirst = (user?.firstName||'').toLowerCase();
      return sales
        .filter(s => {
          if (user?.role === 'marraine' || user?.role === 'admin') return true;
          const cons = (s.consultant||'').toLowerCase();
          return cons.split(' ').some(w => w === myFirst);
        })
        .filter(s => (s.currency||s.cur||'€') === '€')
        .reduce((t,s) => t + Math.floor((parseFloat(s.amount||s.amt)||0) * 10), 0);
    } catch { return 0; }
  })();
  const authorName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.displayName || 'Marraine';

  const [anns, setAnns] = useState(() => store.get('mur_anns', DEFAULT_ANNS));
  const [sucs, setSucs] = useState(() => store.get('mur_sucs', DEFAULT_SUCS));

  const [newAnn, setNewAnn] = useState('');
  const [newSucName, setNewSucName] = useState('');
  const [newSucAch, setNewSucAch] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showSucForm, setShowSucForm] = useState(false);

  const saveAnns = (list) => { setAnns(list); store.set('mur_anns', list); };
  const saveSucs = (list) => { setSucs(list); store.set('mur_sucs', list); };

  const addAnn = () => {
    if (!newAnn.trim()) return;
    const item = { id: Date.now(), text: newAnn.trim(), date: new Date().toLocaleDateString('fr-FR'), author: authorName };
    saveAnns([item, ...anns]);
    setNewAnn(''); setShowAnnForm(false);
  };

  const addSuc = () => {
    if (!newSucName.trim()) return;
    const item = { id: Date.now(), name: newSucName.trim(), ach: newSucAch.trim(), date: new Date().toLocaleDateString('fr-FR'), author: authorName };
    saveSucs([item, ...sucs]);
    setNewSucName(''); setNewSucAch(''); setShowSucForm(false);
  };

  const apps = ALL_APPS.filter(a => canAccess(a.id));

  return (
    <div style={S.root}>
      {/* Header géré par LmsShell */}

      {/* PAGE NEWS */}
      {page === 'news' && (
        <div style={S.newsPage} className="fade-in">

          {/* Bonjour */}
          <div style={S.greetBlock}>
            <div style={S.greetLine}>
              Bonjour, <strong>{user?.firstName || user?.displayName}</strong> {roleInfo.icon}
            </div>
          </div>

          {/* Annonces */}
          <div style={S.section}>
            <div style={S.sectionRow}>
              <span style={S.sectionLabel}>📣 Annonces</span>
              {canEdit && (
                <button style={S.addBtn} onClick={() => setShowAnnForm(!showAnnForm)}>
                  {showAnnForm ? '✕' : '＋'}
                </button>
              )}
            </div>

            {showAnnForm && canEdit && (
              <div style={S.form} className="slide-up">
                <textarea
                  placeholder="Écrivez votre annonce..."
                  value={newAnn}
                  onChange={e => setNewAnn(e.target.value)}
                  rows={3}
                  style={{ marginBottom: 8 }}
                />
                <button className="btn-gold" onClick={addAnn}>PUBLIER</button>
              </div>
            )}

            <div style={S.annZone}>
              {anns.map((a, i) => (
                <div key={a.id} style={S.annCard} className="fade-in">
                  {canEdit && (
                    <button style={S.deleteBtn} onClick={() => saveAnns(anns.filter(x => x.id !== a.id))}>✕</button>
                  )}
                  <p style={S.annText}>{a.text}</p>
                  <div style={S.cardMeta}>
                    <span>{a.date}</span>
                    {a.author && <span style={S.authorTag}>✍️ {a.author}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Succès */}
          <div style={S.section}>
            <div style={S.sectionRow}>
              <span style={S.sectionLabel}>🏆 Succès de l'équipe</span>
              {canEdit && (
                <button style={S.addBtn} onClick={() => setShowSucForm(!showSucForm)}>
                  {showSucForm ? '✕' : '＋'}
                </button>
              )}
            </div>

            {showSucForm && canEdit && (
              <div style={S.form} className="slide-up">
                <input placeholder="Prénom Nom de la consultante" value={newSucName}
                  onChange={e => setNewSucName(e.target.value)} style={{ marginBottom: 8 }} />
                <input placeholder="Son succès (ex: Première vente 🎉)" value={newSucAch}
                  onChange={e => setNewSucAch(e.target.value)} style={{ marginBottom: 8 }} />
                <button className="btn-gold" onClick={addSuc}>PUBLIER</button>
              </div>
            )}

            <div style={S.sucZone}>
              {sucs.map(s => (
                <div key={s.id} style={S.sucCard} className="fade-in">
                  {canEdit && (
                    <button style={S.deleteBtn} onClick={() => saveSucs(sucs.filter(x => x.id !== s.id))}>✕</button>
                  )}
                  <span style={S.sucStar}>🌟</span>
                  <div style={{ flex: 1 }}>
                    <div style={S.sucName}>{s.name}</div>
                    <div style={S.sucAch}>{s.ach}</div>
                    <div style={S.cardMeta}>
                      {s.date && <span>{s.date}</span>}
                      {s.author && <span style={S.authorTag}>✍️ {s.author}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 90 }} />
        </div>
      )}

      {/* PAGE APPS */}
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

      {/* FAB */}
      <button
        style={{ ...S.fab, background: page === 'news' ? 'linear-gradient(135deg, #D2B795, #B89A6A)' : 'linear-gradient(135deg, #B89A6A, #D2B795)' }}
        onClick={() => setPage(page === 'news' ? 'apps' : 'news')}
      >
        <span style={S.fabInner}>
          <span style={{ fontSize: 20 }}>{page === 'news' ? '⚏' : '🏠'}</span>
          <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>{page === 'news' ? 'APPS' : 'ACCUEIL'}</span>
        </span>
      </button>
    </div>
  );
}

/* ── Section component ── */
function Section({ label, children, onAdd, addOpen }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:3, height:16, background:'linear-gradient(to bottom, var(--or), var(--or-deep))', borderRadius:2 }} />
          <span style={{ fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--taupe)' }}>{label}</span>
        </div>
        {onAdd && (
          <button onClick={onAdd} style={{ width:28,height:28,borderRadius:8,background:'var(--or-pale)',border:'1px solid var(--or-border)',color:'var(--or-deep)',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontWeight:700 }}>
            {addOpen ? '✕' : '＋'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── App Capsule card ── */
function AppCapsule({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        minWidth: 130, maxWidth: 130,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.92)',
        border: `1.5px solid ${app.color}33`,
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        animation: `fadeIn 0.35s ease ${delay}ms both`,
        boxShadow: `0 2px 12px rgba(78,70,63,0.07)`,
        flexShrink: 0,
      }}
    >
      {/* Bande colorée */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${app.color}66, ${app.color})` }} />
      {/* Thumbnail */}
      <div style={{
        height: 72,
        background: app.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        position: 'relative',
      }}>
        {app.icon}
        {app.vip && (
          <div style={{ position:'absolute',top:6,right:6,background:'linear-gradient(135deg,var(--or),var(--or-deep))',borderRadius:6,padding:'2px 6px',fontSize:8,fontWeight:700,color:'#fff',letterSpacing:'0.05em' }}>VIP</div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontSize:11,fontWeight:700,color:'#4E463F',lineHeight:1.2,marginBottom:4 }}>{app.label}</div>
        <div style={{ fontSize:9,color:'#9A8E85',lineHeight:1.3 }}>{app.desc}</div>
        {app.duration && (
          <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:6 }}>
            <div style={{ width:14,height:14,borderRadius:'50%',border:'1.5px solid var(--or)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'var(--or-deep)' }}>⏱</div>
            <span style={{ fontSize:9,color:'var(--or-deep)',fontWeight:600 }}>{app.duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}
function AppIcon({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        animation: `fadeIn 0.4s ease ${delay}ms both`,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.9)',
        border: `1.5px solid ${app.color}33`,
        boxShadow: `0 3px 14px rgba(78,70,63,0.08)`,
        position: 'relative',
      }}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      {/* Bande colorée top */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${app.color}88, ${app.color})`,
      }} />
      {/* Corps */}
      <div style={{ padding: '14px 10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
        {/* Icône */}
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: app.bg,
          border: `1px solid ${app.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${app.color}22`,
        }}>
          <span style={{ fontSize: 24 }}>{app.icon}</span>
        </div>
        {/* Nom */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#4E463F',
          textAlign: 'center', lineHeight: 1.2, letterSpacing: '0.02em',
        }}>{app.label}</div>
        {/* Description */}
        {app.desc && (
          <div style={{
            fontSize: 9, color: '#9A8E85', textAlign: 'center',
            lineHeight: 1.3, letterSpacing: '0.01em',
          }}>{app.desc}</div>
        )}
      </div>
    </div>
  );
}

const S = {
  root: { minHeight:'100%', background:'var(--bg)', display:'flex', flexDirection:'column', position:'relative' },
  page: { flex:1, overflowY:'auto', paddingBottom:20 },

  /* Hero */
  hero: { background:'linear-gradient(135deg, var(--taupe) 0%, #2E2822 100%)', padding:'20px 16px 18px', margin:'0 0 4px' },
  heroInner: { display:'flex', alignItems:'center', gap:14, marginBottom:16 },
  heroPoints: { background:'linear-gradient(135deg,var(--or),var(--or-deep))', borderRadius:14, padding:'10px 14px', textAlign:'center', flexShrink:0, minWidth:64 },
  heroPointsNum: { display:'block', fontSize:22, fontWeight:700, color:'#fff', lineHeight:1 },
  heroPointsLabel: { fontSize:9, color:'rgba(255,255,255,0.75)', letterSpacing:'0.1em', textTransform:'uppercase' },
  heroName: { fontFamily:'var(--font-display)', fontSize:20, color:'var(--champagne)', fontWeight:600 },
  heroSub: { fontSize:11, color:'rgba(210,183,149,0.7)', marginTop:2 },
  progressWrap: { background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'10px 12px' },
  progressRow: { display:'flex', justifyContent:'space-between', marginBottom:6 },
  progressLabel: { fontSize:10, color:'rgba(210,183,149,0.7)', fontWeight:500 },
  progressVal: { fontSize:10, color:'var(--or)', fontWeight:700 },
  progressBar: { height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,var(--or),var(--or-deep))', borderRadius:3, transition:'width 0.5s ease' },

  /* Horizontal scroll */
  hScroll: { display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:8, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' },

  /* Capsule card (annonces/succès) */
  capsule: { minWidth:240, maxWidth:280, background:'rgba(255,255,255,0.9)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden', flexShrink:0, position:'relative' },
  capThumb: { height:44, background:'var(--or-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 },
  capBody: { padding:'10px 12px 12px' },
  capText: { fontSize:12, color:'var(--text)', lineHeight:1.5 },
  capMeta: { display:'flex', alignItems:'center', gap:8, marginTop:6 },
  capDate: { fontSize:10, color:'var(--text-dim)' },
  capAuthor: { fontSize:10, color:'var(--or-deep)', fontWeight:600 },
  capDel: { position:'absolute', top:6, right:8, background:'none', border:'none', color:'var(--text-dim)', fontSize:11, cursor:'pointer' },

  /* Form */
  formCard: { margin:'0 16px 10px', background:'rgba(255,255,255,0.85)', border:'1px solid var(--or-border)', borderRadius:14, padding:14 },
  empty: { fontSize:12, color:'var(--text-dim)', fontStyle:'italic', paddingLeft:4, paddingBottom:4 },

  /* FAB */
  fab: { position:'fixed', bottom:24, right:18, width:58, height:58, borderRadius:18, border:'none', cursor:'pointer', background:'linear-gradient(135deg,var(--taupe),#2E2822)', boxShadow:'0 6px 24px rgba(78,70,63,0.3)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' },
  fabIn: { display:'flex', flexDirection:'column', alignItems:'center', gap:2, color:'var(--or)' },
};

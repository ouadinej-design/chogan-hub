import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { store } from '../utils/storage';
import Logo from '../components/Logo';
import { OnboardingTutorial, useOnboarding } from '../components/Tutorial';

const MONTHLY_TARGET = 500;

const APP_GROUPS = [
  { label: '💼 Gestion commerciale', items: [
    { id:'commandes',   label:'Commandes',    desc:'Bon de commande auto',     icon:'🛒', color:'#B89A6A', bg:'rgba(184,154,106,0.15)', path:'/app/orders' },
    { id:'ventes',      label:'Ventes',       desc:"Chiffre d'affaires",       icon:'💰', color:'#2d7a4a', bg:'rgba(45,122,74,0.13)',   path:'/app/ventes' },
    { id:'clients',     label:'Clients',      desc:'Fiches & historique',      icon:'👥', color:'#3d6b9e', bg:'rgba(61,107,158,0.13)',  path:'/app/clients' },
    { id:'fidelite',    label:'Fidélité',     desc:'Programme Chogan',         icon:'⭐', color:'#9e7a3d', bg:'rgba(158,122,61,0.13)',  path:'/app/fidelite' },
  ]},
  { label: '📅 Organisation', items: [
    { id:'agenda',      label:'Agenda',       desc:'Calendrier & événements',  icon:'📅', color:'#4a7c59', bg:'rgba(74,124,89,0.13)',   path:'/app/agenda' },
    { id:'planner',     label:'Planner',      desc:'Organisation perso',       icon:'🗓', color:'#3d6b9e', bg:'rgba(61,107,158,0.13)',  path:'/app/planner' },
    { id:'stats',       label:'Statistiques', desc:'Tableaux de bord',         icon:'📊', color:'#4a7c59', bg:'rgba(74,124,89,0.13)',   path:'/app/stats' },
    { id:'reseau',      label:'Mon Réseau',   desc:'Équipe & arbre',           icon:'🌳', color:'#6b4d8a', bg:'rgba(107,77,138,0.13)',  path:'/app/reseau' },
  ]},
  { label: '🎓 Apprentissage', items: [
    { id:'formation',   label:'Formation',    desc:'Modules',    icon:'🎓', color:'#B89A6A', bg:'rgba(184,154,106,0.13)', path:'/app/formation',   duration:'~15 min' },
    { id:'inspirations',label:'Inspirations', desc:'Motivation', icon:'🌹', color:'#9e5a7a', bg:'rgba(158,90,122,0.13)',  path:'/app/inspirations' },
    { id:'catalogues',  label:'Catalogues',   desc:'Produits',   icon:'📖', color:'#3d6b9e', bg:'rgba(61,107,158,0.13)',  path:'/app/catalogues' },
    { id:'familles',    label:'Familles',     desc:'Olfactif',   icon:'💐', color:'#9e5a7a', bg:'rgba(158,90,122,0.13)',  path:'/app/familles' },
    { id:'checklist',   label:'Check-list',   desc:'Promos',     icon:'✅', color:'#4a7c59', bg:'rgba(74,124,89,0.13)',   path:'/app/checklist' },
    { id:'catalogue',   label:'Élite',        desc:'Exclusif',   icon:'💎', color:'#B89A6A', bg:'rgba(184,154,106,0.13)', path:'/app/catalogue' },
  ]},
  { label: '★ Premium VIP', items: [
    { id:'wallet',     label:'Wallet',      desc:'Finances', icon:'💼', color:'#9e7a3d', bg:'rgba(158,122,61,0.13)',  path:'/app/wallet',      vip:true },
    { id:'coach',      label:'Coach Vocal', desc:'Objections 30s', icon:'🎤', color:'#8a4d4d', bg:'rgba(138,77,77,0.13)',   path:'/app/coach-vocal', vip:true, duration:'30 sec' },
    { id:'objections', label:'Objections',  desc:'Réponses',  icon:'💬', color:'#3d7a8a', bg:'rgba(61,122,138,0.13)',  path:'/app/objections',  vip:true },
  ]},
  { label: '⚙️ Compte', items: [
    { id:'settings',   label:'Paramètres', desc:'Config & comptes', icon:'⚙️', color:'#7a7069', bg:'rgba(122,112,105,0.13)', path:'/app/settings' },
  ]},
];

const ALL_IDS = APP_GROUPS.flatMap(g => g.items.map(i => i.id));

const DEFAULT_ANNS = [
  { id:1, text:'🌸 Bienvenue dans votre espace Chogan Hub ! Retrouvez tous vos outils ici.', date: new Date().toLocaleDateString('fr-FR'), author:'Admin' },
  { id:2, text:'✨ Nouvelle mise à jour — Wallet, Agenda et Coach Vocal sont maintenant intégrés !', date: new Date().toLocaleDateString('fr-FR'), author:'Admin' },
];
const DEFAULT_SUCS = [
  { id:1, name:'Amira B.',  ach:'Première vente ✨', date: new Date().toLocaleDateString('fr-FR'), author:'Admin' },
  { id:2, name:'Nour K.',   ach:'Statut Or atteint 🥇', date: new Date().toLocaleDateString('fr-FR'), author:'Admin' },
];

export default function Home() {
  const { show: showTuto, close: closeTuto, reset: resetTuto } = useTutorial('home');
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState('news');
  const roleInfo = ROLES[user?.role] || {};
  const canEdit = user?.role === 'admin' || user?.role === 'marraine';
  const { show: showOnboarding, complete: completeOnboarding } = useOnboarding();
  const authorName = `${user?.firstName||''} ${user?.lastName||''}`.trim() || 'Admin';

  const [anns, setAnns] = useState(() => store.get('mur_anns', DEFAULT_ANNS));
  const [sucs, setSucs] = useState(() => store.get('mur_sucs', DEFAULT_SUCS));
  const [newAnn, setNewAnn] = useState('');
  const [newSucName, setNewSucName] = useState('');
  const [newSucAch, setNewSucAch] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showSucForm, setShowSucForm] = useState(false);

  // Écouter l'event LMS pour switcher sur Apps
  useEffect(() => {
    const handler = () => setPage('apps');
    window.addEventListener('lms-goto-apps', handler);
    return () => window.removeEventListener('lms-goto-apps', handler);
  }, []);

  const saveAnns = l => { setAnns(l); store.set('mur_anns', l); };
  const saveSucs = l => { setSucs(l); store.set('mur_sucs', l); };

  const addAnn = () => {
    if (!newAnn.trim()) return;
    saveAnns([{ id:Date.now(), text:newAnn.trim(), date:new Date().toLocaleDateString('fr-FR'), author:authorName }, ...anns]);
    setNewAnn(''); setShowAnnForm(false);
  };
  const addSuc = () => {
    if (!newSucName.trim()) return;
    saveSucs([{ id:Date.now(), name:newSucName.trim(), ach:newSucAch.trim(), date:new Date().toLocaleDateString('fr-FR'), author:authorName }, ...sucs]);
    setNewSucName(''); setNewSucAch(''); setShowSucForm(false);
  };

  // Stats hero
  const monthlySales = (() => {
    try {
      const now = new Date();
      const sales = JSON.parse(localStorage.getItem('le_sales') || '[]');
      const myFirst = (user?.firstName||'').toLowerCase();
      return sales
        .filter(s => {
          const d = new Date(s.date||s.createdAt||'');
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
          if (user?.role === 'marraine' || user?.role === 'admin') return true;
          return (s.consultant||'').toLowerCase().split(' ').some(w => w === myFirst);
        })
        .filter(s => (s.currency||s.cur||'€') === '€')
        .reduce((t,s) => t + (parseFloat(s.amount||s.amt)||0), 0);
    } catch { return 0; }
  })();

  const totalPoints = Math.floor(monthlySales * 10);
  const progressPct = Math.min(100, (monthlySales / MONTHLY_TARGET) * 100);

  // Apps filtrées par rôle
  const accessibleIds = new Set(canAccess ? ALL_IDS.filter(id => canAccess(id)) : ALL_IDS);

  return (
    <div style={{ minHeight:'100%', background:'#F7EBE1', display:'flex', flexDirection:'column', position:'relative' }}>

      {/* ══ PAGE FLUX ══ */}
      {page === 'news' && (
        <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }} className="fade-in">

          {/* Hero */}
          <div style={{
            background:'linear-gradient(135deg, #4E463F 0%, #2E2822 100%)',
            padding:'20px 16px 20px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              {/* Points badge */}
              <div style={{
                background:'linear-gradient(135deg,#D2B795,#B89A6A)',
                borderRadius:14, padding:'10px 14px', textAlign:'center', flexShrink:0, minWidth:68,
              }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#fff', lineHeight:1, fontFamily:'Jost,sans-serif' }}>{totalPoints}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', letterSpacing:'0.1em', textTransform:'uppercase' }}>pts</div>
              </div>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'#F7EBE1', fontWeight:600 }}>
                  Bonjour, {user?.firstName} {roleInfo.icon}
                </div>
                <div style={{ fontSize:11, color:'rgba(210,183,149,0.7)', marginTop:2 }}>Prêt·e pour aujourd'hui ?</div>
              </div>
            </div>
            {/* Barre objectif */}
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'10px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                <span style={{ fontSize:10, color:'rgba(210,183,149,0.7)', fontWeight:500 }}>Objectif mensuel</span>
                <span style={{ fontSize:10, color:'#D2B795', fontWeight:700 }}>{monthlySales.toFixed(0)} € / {MONTHLY_TARGET} €</span>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progressPct.toFixed(1)}%`, background:'linear-gradient(90deg,#D2B795,#B89A6A)', borderRadius:3, transition:'width 0.6s ease' }} />
              </div>
            </div>
          </div>

          {/* Annonces */}
          <RowSection label="📣 Annonces" onAdd={canEdit ? () => setShowAnnForm(v=>!v) : null} addOpen={showAnnForm}>
            {showAnnForm && (
              <div style={{ margin:'0 16px 12px', background:'rgba(255,255,255,0.9)', border:'1px solid rgba(210,183,149,0.3)', borderRadius:14, padding:14 }}>
                <textarea placeholder="Écrivez votre annonce..." value={newAnn} onChange={e=>setNewAnn(e.target.value)} rows={3} style={{ marginBottom:8 }} />
                <button className="btn-gold" onClick={addAnn}>PUBLIER</button>
              </div>
            )}
            <div style={{ display:'flex', gap:10, overflowX:'auto', padding:'0 16px 8px', scrollbarWidth:'none' }}>
              {anns.map(a => (
                <div key={a.id} style={{ minWidth:240, maxWidth:280, background:'#fff', border:'1px solid rgba(210,183,149,0.3)', borderRadius:14, overflow:'hidden', flexShrink:0, position:'relative', boxShadow:'0 2px 12px rgba(78,70,63,0.06)' }}>
                  <div style={{ height:3, background:'linear-gradient(90deg,#D2B795,#B89A6A)' }} />
                  <div style={{ height:44, background:'rgba(210,183,149,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📣</div>
                  <div style={{ padding:'10px 12px 12px' }}>
                    {canEdit && <button onClick={()=>saveAnns(anns.filter(x=>x.id!==a.id))} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'rgba(78,70,63,0.3)', fontSize:12, cursor:'pointer', padding:'2px 5px' }}>✕</button>}
                    <p style={{ fontSize:12, color:'#4E463F', lineHeight:1.6 }}>{a.text}</p>
                    <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, color:'rgba(78,70,63,0.4)' }}>{a.date}</span>
                      {a.author && <span style={{ fontSize:10, color:'#B89A6A', fontWeight:600 }}>✍ {a.author}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {anns.length === 0 && <p style={{ fontSize:12, color:'rgba(78,70,63,0.4)', fontStyle:'italic' }}>Aucune annonce</p>}
            </div>
          </RowSection>

          {/* Succès */}
          <RowSection label="🏆 Succès de l'équipe" onAdd={canEdit ? () => setShowSucForm(v=>!v) : null} addOpen={showSucForm}>
            {showSucForm && (
              <div style={{ margin:'0 16px 12px', background:'rgba(255,255,255,0.9)', border:'1px solid rgba(210,183,149,0.3)', borderRadius:14, padding:14 }}>
                <input placeholder="Prénom Nom" value={newSucName} onChange={e=>setNewSucName(e.target.value)} style={{ marginBottom:8 }} />
                <input placeholder="Son succès 🎉" value={newSucAch} onChange={e=>setNewSucAch(e.target.value)} style={{ marginBottom:8 }} />
                <button className="btn-gold" onClick={addSuc}>PUBLIER</button>
              </div>
            )}
            <div style={{ display:'flex', gap:10, overflowX:'auto', padding:'0 16px 8px', scrollbarWidth:'none' }}>
              {sucs.map(s => (
                <div key={s.id} style={{ minWidth:200, maxWidth:240, background:'#fff', border:'1px solid rgba(210,183,149,0.3)', borderRadius:14, overflow:'hidden', flexShrink:0, position:'relative', boxShadow:'0 2px 12px rgba(78,70,63,0.06)' }}>
                  <div style={{ height:3, background:'linear-gradient(90deg,#D2B795,#B89A6A)' }} />
                  <div style={{ height:44, background:'rgba(210,183,149,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🌟</div>
                  <div style={{ padding:'10px 12px 12px' }}>
                    {canEdit && <button onClick={()=>saveSucs(sucs.filter(x=>x.id!==s.id))} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'rgba(78,70,63,0.3)', fontSize:12, cursor:'pointer', padding:'2px 5px' }}>✕</button>}
                    <p style={{ fontSize:13, fontWeight:700, color:'#4E463F' }}>{s.name}</p>
                    <p style={{ fontSize:11, color:'rgba(78,70,63,0.6)', marginTop:3 }}>{s.ach}</p>
                    <span style={{ fontSize:10, color:'rgba(78,70,63,0.4)', marginTop:6, display:'block' }}>{s.date}</span>
                  </div>
                </div>
              ))}
              {sucs.length === 0 && <p style={{ fontSize:12, color:'rgba(78,70,63,0.4)', fontStyle:'italic' }}>Aucun succès</p>}
            </div>
          </RowSection>
        </div>
      )}

      {/* ══ PAGE APPS ══ */}
      {page === 'apps' && (
        <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }} className="fade-in">
          {APP_GROUPS.map(group => {
            const items = group.items.filter(a => accessibleIds.has(a.id));
            if (items.length === 0) return null;
            return (
              <RowSection key={group.label} label={group.label}>
                <div style={{ display:'flex', gap:10, overflowX:'auto', padding:'0 16px 8px', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
                  {items.map((app, i) => <AppCard key={app.id} app={app} delay={i*30} onClick={() => navigate(app.path)} />)}
                </div>
              </RowSection>
            );
          })}
          <div style={{ height:20 }} />
        </div>
      )}

      {/* ══ ONBOARDING ══ */}
      {showOnboarding && <OnboardingTutorial onDone={completeOnboarding} />}

      {/* ══ BOUTON QUITTER ══ */}
      <button
        onClick={() => {
          if (window.confirm('Quitter Chogan Hub ?\nVos données sont automatiquement sauvegardées.')) {
            logout();
          }
        }}
        style={{
          position:'fixed', bottom:24, left:18,
          height:44, borderRadius:14, border:'1px solid rgba(192,57,43,0.25)',
          background:'rgba(255,255,255,0.92)',
          boxShadow:'0 4px 16px rgba(78,70,63,0.1)',
          zIndex:100, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          padding:'0 16px',
        }}
      >
        <span style={{ fontSize:16 }}>⎋</span>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:'rgba(192,57,43,0.8)' }}>QUITTER</span>
      </button>

      {/* ══ FAB ══ */}
      <button
        onClick={() => setPage(p => p === 'news' ? 'apps' : 'news')}
        style={{
          position:'fixed', bottom:24, right:18,
          width:62, height:62, borderRadius:18, border:'none',
          background:'linear-gradient(135deg,#4E463F,#2E2822)',
          boxShadow:'0 6px 24px rgba(78,70,63,0.35)',
          zIndex:100, cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
        }}
      >
        <span style={{ fontSize:20, color:'#D2B795' }}>{page === 'news' ? '⚏' : '🏠'}</span>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.08em', color:'#D2B795' }}>{page === 'news' ? 'APPS' : 'FLUX'}</span>
      </button>
    </div>
  );
}

/* ── Section avec label + scroll horizontal ── */
function RowSection({ label, children, onAdd, addOpen }) {
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 16px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:3, height:16, background:'linear-gradient(180deg,#D2B795,#B89A6A)', borderRadius:2, flexShrink:0 }} />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4E463F', fontFamily:'Jost,sans-serif' }}>{label}</span>
        </div>
        {onAdd && (
          <button onClick={onAdd} style={{ width:28, height:28, borderRadius:8, background:'rgba(210,183,149,0.15)', border:'1px solid rgba(210,183,149,0.3)', color:'#B89A6A', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontWeight:700 }}>
            {addOpen ? '✕' : '＋'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── App Card (style capsule LizzyPlay) ── */
function AppCard({ app, delay, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        minWidth:120, maxWidth:120, flexShrink:0,
        borderRadius:16,
        background:'rgba(255,255,255,0.95)',
        border:`1.5px solid ${app.color}33`,
        overflow:'hidden',
        cursor:'pointer', userSelect:'none',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition:'transform 0.15s ease',
        animation:`fadeIn 0.35s ease ${delay}ms both`,
        boxShadow:'0 2px 12px rgba(78,70,63,0.08)',
        position:'relative',
      }}
    >
      {/* Bande couleur top */}
      <div style={{ height:3, background:`linear-gradient(90deg,${app.color}77,${app.color})` }} />
      {/* Icône */}
      <div style={{ height:68, background:app.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, position:'relative' }}>
        {app.icon}
        {app.vip && (
          <div style={{ position:'absolute', top:6, right:6, background:'linear-gradient(135deg,#D2B795,#B89A6A)', borderRadius:5, padding:'2px 5px', fontSize:8, fontWeight:700, color:'#fff', letterSpacing:'0.04em' }}>VIP</div>
        )}
      </div>
      {/* Texte */}
      <div style={{ padding:'9px 9px 11px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#4E463F', lineHeight:1.2, marginBottom:3 }}>{app.label}</div>
        <div style={{ fontSize:9, color:'#9A8E85', lineHeight:1.4 }}>{app.desc}</div>
        {app.duration && (
          <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:6 }}>
            <span style={{ fontSize:9, color:'#B89A6A', fontWeight:700 }}>⏱ {app.duration}</span>
          </div>
        )}
      </div>
      <Tutorial appId="home" show={showTuto} onClose={closeTuto} />
    </div>
  );
}

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

export default function Home() {
  const { user, logout, canAccess } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState('news');
  const roleInfo = ROLES[user?.role];
  const canEdit = user?.role === 'admin' || user?.role === 'marraine';
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
      {/* Header */}
      <div style={S.header}>
        <Logo size={30} />
        <div style={{ flex: 1 }}>
          <div style={S.brand}>CHOGAN HUB</div>
        </div>
        <div style={{ ...S.userPill, background: roleInfo.bg, borderColor: roleInfo.border }}>
          <span>{roleInfo.icon}</span>
          <span style={{ fontSize: 11, color: roleInfo.color, fontWeight: 700 }}>{roleInfo.label}</span>
        </div>
        <button onClick={logout} style={S.logoutBtn}>⎋</button>
      </div>

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
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(247,235,225,0.95)', borderBottom: '1px solid var(--or-border)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 },
  brand: { fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.2em', color: 'var(--taupe)' },
  userPill: { display: 'flex', alignItems: 'center', gap: 5, border: '1px solid', borderRadius: 20, padding: '4px 10px', flexShrink: 0 },
  logoutBtn: { background: 'none', color: 'var(--text-muted)', fontSize: 17, padding: '4px 6px', flexShrink: 0, border: 'none', cursor: 'pointer' },
  newsPage: { flex: 1, overflowY: 'auto' },
  greetBlock: { padding: '20px 18px 16px', borderBottom: '1px solid var(--or-border)' },
  greetLine: { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--taupe)', letterSpacing: '0.05em' },
  section: { padding: '18px 16px 0' },
  sectionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--or-deep)' },
  addBtn: { width: 30, height: 30, borderRadius: 8, background: 'var(--or-pale)', border: '1px solid var(--or-border)', color: 'var(--or-deep)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 },
  form: { background: 'rgba(255,255,255,0.85)', border: '1px solid var(--or-border)', borderRadius: 14, padding: 14, marginBottom: 12 },
  annZone: { display: 'flex', flexDirection: 'column', gap: 10 },
  annCard: { position: 'relative', background: 'rgba(255,255,255,0.85)', border: '1px solid var(--or-border)', borderRadius: 14, padding: '14px 14px 12px', boxShadow: '0 2px 10px rgba(78,70,63,0.06)' },
  annText: { fontSize: 14, lineHeight: 1.7, color: 'var(--text)', paddingRight: 20 },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  authorTag: { fontSize: 11, color: 'var(--or-deep)', fontWeight: 600 },
  deleteBtn: { position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', padding: '2px 5px' },
  sucZone: { display: 'flex', flexDirection: 'column', gap: 8 },
  sucCard: { position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(255,255,255,0.75)', border: '1px solid var(--or-border)', borderRadius: 12, padding: '12px 14px' },
  sucStar: { fontSize: 22, flexShrink: 0, marginTop: 2 },
  sucName: { fontSize: 14, fontWeight: 700, color: 'var(--taupe)', paddingRight: 20 },
  sucAch: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  appsPage: { flex: 1, overflowY: 'auto', padding: '18px 16px 0' },
  appsTitle: { fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.12em', color: 'var(--taupe)', marginBottom: 18, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  appWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
  appIcon: { width: 60, height: 60, borderRadius: 18, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7, boxShadow: '0 2px 10px rgba(78,70,63,0.08)' },
  appLabel: { fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, maxWidth: 62 },
  fab: { position: 'fixed', bottom: 28, right: 20, width: 62, height: 62, borderRadius: 20, border: 'none', cursor: 'pointer', boxShadow: '0 6px 24px rgba(184,154,106,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fabInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#fff' },
};

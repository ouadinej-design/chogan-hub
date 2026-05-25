import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/storage';
import AppLayout from '../../components/AppLayout';
import { sendDailyReport } from '../../utils/emailReport';
import { getTodayLogs } from '../../utils/storage';
import { useData } from '../../context/DataContext';

const GENERATE_PASSWORD = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function Settings() {
  const { user, changePassword, createConsultant, resetPassword, toggleLock, deleteConsultant, getAllConsultants, ROLES } = useAuth();
  const { getOrders, getClients } = useData();
  const [tab, setTab] = useState('profile');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const notify = (m, isErr = false) => {
    if (isErr) setErr(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setErr(''); }, 3500);
  };

  // ── Profil
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const handleChangePw = () => {
    if (pw.current !== user.password) { notify('Mot de passe actuel incorrect.', true); return; }
    if (pw.newPw.length < 6) { notify('Nouveau mot de passe trop court (6 min).', true); return; }
    if (pw.newPw !== pw.confirm) { notify('Les mots de passe ne correspondent pas.', true); return; }
    changePassword(user.id, pw.newPw);
    setPw({ current: '', newPw: '', confirm: '' });
    notify('✓ Mot de passe modifié avec succès.');
  };

  // ── Créer consultante
  const [form, setForm] = useState({ firstName: '', lastName: '', role: 'consultante', email: '', password: GENERATE_PASSWORD() });
  const [createdUser, setCreatedUser] = useState(null);

  const handleCreate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { notify('Prénom et nom requis.', true); return; }
    if (form.password.length < 6) { notify('Mot de passe trop court.', true); return; }
    const result = createConsultant(form);
    if (!result.ok) { notify(result.error, true); return; }
    setCreatedUser({ ...form, displayName: `${form.firstName} ${form.lastName}` });
    setForm({ firstName: '', lastName: '', role: 'consultante', email: '', password: GENERATE_PASSWORD() });
  };

  // ── Email
  const [emailConf, setEmailConf] = useState({
    serviceId:  store.get('emailjs_service') || '',
    templateId: store.get('emailjs_template') || '',
    publicKey:  store.get('emailjs_key') || '',
    adminEmail: store.get('admin_email') || '',
  });
  const saveEmail = () => {
    store.set('emailjs_service',  emailConf.serviceId);
    store.set('emailjs_template', emailConf.templateId);
    store.set('emailjs_key',      emailConf.publicKey);
    store.set('admin_email',      emailConf.adminEmail);
    notify('✓ Configuration email sauvegardée.');
  };
  const testEmail = async () => {
    const ok = await sendDailyReport({
      consultantName:  user.displayName,
      consultantEmail: user.email || '',
      adminEmail:      emailConf.adminEmail,
      logs:            getTodayLogs(user.id),
      stats:           { orders: getOrders().length, clients: getClients().length, revenue: 0 },
    });
    notify(ok ? '✓ Email test envoyé !' : 'Erreur envoi. Vérifiez votre config EmailJS.', !ok);
  };

  const consultants = getAllConsultants();
  const TABS_ADMIN    = ['profile', 'create', 'manage', 'permissions', 'email'];
  const TABS_CONSULTANT = ['profile'];
  const tabs = user?.role === 'admin' ? TABS_ADMIN : TABS_CONSULTANT;
  const tabLabels = { profile: '👤 Profil', create: '➕ Créer', manage: '👥 Comptes', permissions: '🔐 Accès', email: '✉ Email' };

  return (
    <AppLayout title="Paramètres" icon="⚙️">
      <div style={S.tabs}>
        {tabs.map(t => (
          <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}
            onClick={() => { setTab(t); setMsg(''); setErr(''); setCreatedUser(null); }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {msg && <div style={S.success}>{msg}</div>}
        {err && <div style={S.error}>{err}</div>}

        {/* ── PROFIL ── */}
        {tab === 'profile' && (
          <div>
            <div style={S.infoBox}>
              <InfoRow label="Nom" value={user?.displayName || `${user?.firstName} ${user?.lastName}`} />
              <InfoRow label="Rôle" value={ROLES[user?.role]?.label} />
              {user?.email && <InfoRow label="Email" value={user.email} />}
            </div>
            <div style={S.divider}>Changer mon mot de passe</div>
            {[['current','Mot de passe actuel'],['newPw','Nouveau mot de passe'],['confirm','Confirmer']].map(([k,l]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input type="password" value={pw[k]} onChange={e => setPw(p => ({...p,[k]:e.target.value}))} placeholder="••••••••" />
              </div>
            ))}
            <button className="btn-gold" onClick={handleChangePw}>CHANGER MON MOT DE PASSE</button>
          </div>
        )}

        {/* ── CRÉER CONSULTANTE ── */}
        {tab === 'create' && user?.role === 'admin' && (
          <div>
            {createdUser && (
              <div style={S.createdBox}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{createdUser.displayName} — compte créé !</div>
                <div style={S.credBox}>
                  <div style={S.credRow}><span style={S.credLabel}>Prénom</span><span style={S.credVal}>{createdUser.firstName}</span></div>
                  <div style={S.credRow}><span style={S.credLabel}>Nom</span><span style={S.credVal}>{createdUser.lastName}</span></div>
                  <div style={S.credRow}><span style={S.credLabel}>Rôle</span><span style={S.credVal}>{ROLES[createdUser.role]?.label}</span></div>
                  <div style={S.credRow}><span style={S.credLabel}>Mot de passe</span><span style={{ ...S.credVal, color: 'var(--or-deep)', fontWeight: 700 }}>{createdUser.password}</span></div>
                </div>
                <button className="btn-outline" style={{ marginTop: 12 }}
                  onClick={() => navigator.clipboard?.writeText(
                    `Prénom : ${createdUser.firstName}\nNom : ${createdUser.lastName}\nMot de passe : ${createdUser.password}`
                  ).then(() => notify('✓ Identifiants copiés !'))}
                >📋 Copier les identifiants</button>
                <button className="btn-gold" style={{ marginTop: 8 }} onClick={() => setCreatedUser(null)}>
                  CRÉER UN AUTRE COMPTE
                </button>
              </div>
            )}

            {!createdUser && (
              <div>
                <div style={S.sectionTitle}>Nouveau compte</div>
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Prénom *</label>
                    <input value={form.firstName} onChange={e => setForm(p=>({...p,firstName:e.target.value}))} placeholder="Prénom" />
                  </div>
                  <div className="field">
                    <label className="label">Nom *</label>
                    <input value={form.lastName} onChange={e => setForm(p=>({...p,lastName:e.target.value}))} placeholder="Nom" />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Rôle</label>
                  <select value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}>
                    <option value="consultante">💼 Consultante</option>
                    <option value="marraine">🌸 Marraine</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Email (optionnel)</label>
                  <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="email@exemple.com" />
                </div>
                <div className="field">
                  <label className="label">Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="Mot de passe" />
                    <button type="button" style={S.genBtn}
                      onClick={() => setForm(p => ({...p, password: GENERATE_PASSWORD()}))}
                      title="Générer un mot de passe">🎲</button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                    Vous pourrez le communiquer à la consultante. Elle pourra le modifier dans ses paramètres.
                  </div>
                </div>
                <button className="btn-gold" onClick={handleCreate}>CRÉER LE COMPTE</button>
              </div>
            )}
          </div>
        )}

        {/* ── GÉRER COMPTES ── */}
        {tab === 'manage' && user?.role === 'admin' && (
          <div>
            <div style={S.sectionTitle}>{consultants.length} compte(s)</div>
            {consultants.length === 0 && (
              <div style={S.empty}>Aucun compte créé. Allez dans "Créer" pour en ajouter.</div>
            )}
            {consultants.map(c => (
              <ConsultantCard key={c.id} c={c} ROLES={ROLES}
                onReset={() => {
                  const newPw = GENERATE_PASSWORD();
                  resetPassword(c.id, newPw);
                  notify(`✓ Nouveau mot de passe pour ${c.firstName} : ${newPw}`);
                }}
                onToggleLock={() => { toggleLock(c.id); notify(`✓ Compte ${c.locked ? 'déverrouillé' : 'verrouillé'}.`); }}
                onDelete={() => { if (window.confirm(`Supprimer le compte de ${c.displayName} ?`)) { deleteConsultant(c.id); notify('✓ Compte supprimé.'); }}}
              />
            ))}
          </div>
        )}

        {/* ── EMAIL ── */}
        {tab === 'permissions' && user?.role === 'admin' && (
          <PermissionsTab />
        )}

        {tab === 'email' && user?.role === 'admin' && (
          <div>
            <div style={S.helpBox}>
              <div style={{ fontWeight: 700, color: 'var(--or-deep)', marginBottom: 8 }}>📧 EmailJS (gratuit — 200/mois)</div>
              <ol style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2, paddingLeft: 16 }}>
                <li>Créez un compte sur <strong>emailjs.com</strong></li>
                <li>Créez un Service (Gmail, Outlook...)</li>
                <li>Créez un Template avec : <code>{'{{consultant_name}}'}</code>, <code>{'{{date}}'}</code>, <code>{'{{sections_detail}}'}</code></li>
                <li>Copiez vos IDs ci-dessous</li>
              </ol>
            </div>
            {[['serviceId','Service ID','service_xxx'],['templateId','Template ID','template_xxx'],['publicKey','Clé publique','xxxxxx'],['adminEmail','Email destinataire','votre@email.com']].map(([k,l,ph]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input value={emailConf[k]} onChange={e => setEmailConf(p=>({...p,[k]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
            <button className="btn-gold" onClick={saveEmail} style={{ marginBottom: 10 }}>SAUVEGARDER</button>
            <button className="btn-outline" onClick={testEmail} style={{ width: '100%' }}>✉ Envoyer un rapport test</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ConsultantCard({ c, ROLES, onReset, onToggleLock, onDelete }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={S.cCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={S.avatar}>{c.firstName.charAt(0)}{c.lastName.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{c.displayName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ROLES[c.role]?.icon} {ROLES[c.role]?.label}{c.email ? ` • ${c.email}` : ''}</div>
        </div>
        {c.locked && <span style={S.lockedBadge}>🔒 Verrouillé</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>
          Mdp : {showPw ? c.password : '••••••••'}
        </span>
        <button style={S.iconBtn} onClick={() => setShowPw(!showPw)}>{showPw ? '🙈' : '👁'}</button>
        <button style={S.iconBtn} onClick={() => navigator.clipboard?.writeText(c.password).then(() => alert('Copié !'))}>📋</button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={S.actionBtn} onClick={onReset}>🔄 Réinitialiser mdp</button>
        <button style={{ ...S.actionBtn, color: c.locked ? 'var(--green)' : 'var(--red)', borderColor: c.locked ? 'rgba(74,124,89,0.3)' : 'rgba(192,57,43,0.3)' }} onClick={onToggleLock}>
          {c.locked ? '🔓 Débloquer' : '🔒 Bloquer'}
        </button>
        <button style={{ ...S.actionBtn, color: 'var(--red)', borderColor: 'rgba(192,57,43,0.3)' }} onClick={onDelete}>🗑</button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--or-border)', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ── PERMISSIONS TAB ───────────────────────────────────────────────
const ALL_APPS = [
  { id:'commandes',  label:'🛒 Commandes' },
  { id:'inspirations',label:'🌹 Inspirations' },
  { id:'clients',    label:'👥 Clients' },
  { id:'fidelite',   label:'💳 Fidélité' },
  { id:'planner',    label:'🗓 Planner' },
  { id:'wallet',     label:'💰 Wallet' },
  { id:'reseau',     label:'🌐 Mon Réseau' },
  { id:'stats',      label:'📊 Statistiques' },
  { id:'coach',      label:'🎙 Coach Vocal' },
  { id:'objections', label:'💬 Coach Obj.' },
  { id:'formation',  label:'🚀 Formation' },
  { id:'familles',   label:'💐 Familles' },
  { id:'catalogues', label:'📖 Catalogues' },
  { id:'checklist',  label:'✨ Check-list' },
  { id:'agenda',     label:'📅 Agenda', adminOnly: true },
  { id:'catalogue',  label:'💎 Chogan Élite', adminOnly: true },
  { id:'settings',   label:'⚙️ Paramètres', adminOnly: true },
];

const DEFAULT_PERMS = {
  marraine:    ['commandes','orders','inspirations','clients','fidelite','planner','wallet','reseau','coach','objections','stats','formation','familles','catalogues','checklist'],
  consultante: ['commandes','orders','inspirations','clients','fidelite','planner','wallet','reseau','coach','objections','formation','familles','catalogues','checklist'],
};

function PermissionsTab() {
  const [perms, setPerms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chogan_permissions')) || DEFAULT_PERMS; }
    catch { return DEFAULT_PERMS; }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (role, appId) => {
    setPerms(p => {
      const current = p[role] || [];
      const updated = current.includes(appId)
        ? current.filter(x => x !== appId)
        : [...current, appId];
      return { ...p, [role]: updated };
    });
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem('chogan_permissions', JSON.stringify(perms));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const reset = () => {
    setPerms(DEFAULT_PERMS);
    localStorage.removeItem('chogan_permissions');
    setSaved(false);
  };

  const apps = ALL_APPS.filter(a => !a.adminOnly);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--taupe)', fontFamily:'var(--font-display)' }}>🔐 Gestion des accès</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>L'Admin a accès à tout. Cochez pour donner accès.</p>
        </div>
        <button style={{ background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:8, padding:'5px 10px', fontSize:10, color:'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font-body)' }} onClick={reset}>Réinitialiser</button>
      </div>

      {/* Tableau */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden', marginBottom:12 }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px', background:'rgba(210,183,149,0.12)', padding:'10px 14px', borderBottom:'1px solid var(--or-border)' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Application</span>
          <span style={{ fontSize:11, fontWeight:700, color:'#9e5a7a', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' }}>Marraine</span>
          <span style={{ fontSize:11, fontWeight:700, color:'#3d6b9e', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' }}>Consultante</span>
        </div>

        {/* Rows */}
        {apps.map((app, i) => (
          <div key={app.id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px', padding:'11px 14px', borderBottom:i<apps.length-1?'1px solid rgba(210,183,149,0.1)':'none', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--taupe)', fontWeight:500 }}>{app.label}</span>
            {['marraine','consultante'].map(role => (
              <div key={role} style={{ display:'flex', justifyContent:'center' }}>
                <label style={{ position:'relative', display:'inline-block', cursor:'pointer' }}>
                  <input type="checkbox"
                    checked={perms[role]?.includes(app.id) || false}
                    onChange={() => toggle(role, app.id)}
                    style={{ display:'none' }}
                  />
                  <div style={{
                    width:24, height:24, borderRadius:6,
                    background: perms[role]?.includes(app.id) ? (role==='marraine'?'#9e5a7a':'#3d6b9e') : 'rgba(210,183,149,0.1)',
                    border: `2px solid ${perms[role]?.includes(app.id) ? (role==='marraine'?'#9e5a7a':'#3d6b9e') : 'var(--or-border)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, transition:'all 0.15s',
                  }}>
                    {perms[role]?.includes(app.id) && <span style={{ color:'white', fontSize:13, lineHeight:1 }}>✓</span>}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ))}

        {/* Admin only section */}
        <div style={{ padding:'10px 14px', background:'rgba(184,154,106,0.06)', borderTop:'1px solid var(--or-border)' }}>
          <p style={{ fontSize:10, color:'var(--or-deep)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>👑 Admin uniquement (non modifiable)</p>
          {ALL_APPS.filter(a => a.adminOnly).map(a => (
            <div key={a.id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px', padding:'8px 0', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{a.label}</span>
              <div style={{ display:'flex', justifyContent:'center' }}><span style={{ fontSize:14 }}>🔒</span></div>
              <div style={{ display:'flex', justifyContent:'center' }}><span style={{ fontSize:14 }}>🔒</span></div>
            </div>
          ))}
        </div>
      </div>

      {saved
        ? <div style={{ background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'10px 14px', color:'var(--green)', fontSize:13, fontWeight:600, textAlign:'center', marginBottom:10 }}>✅ Permissions enregistrées !</div>
        : <button className="btn-gold" onClick={save}>💾 Enregistrer les permissions</button>
      }
    </div>
  );
}


const S = {
  tabs: { display: 'flex', borderBottom: '1px solid var(--or-border)', overflowX: 'auto' },
  tab: { flex: 1, padding: '12px 8px', background: 'none', color: 'var(--text-muted)', fontSize: 12, borderBottom: '2px solid transparent', whiteSpace: 'nowrap' },
  tabActive: { color: 'var(--or-deep)', borderBottom: '2px solid var(--or-deep)' },
  success: { background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.25)', borderRadius: 10, padding: '12px', color: 'var(--green)', fontSize: 13, marginBottom: 14, wordBreak: 'break-all' },
  error: { background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 10, padding: '12px', color: 'var(--red)', fontSize: 13, marginBottom: 14 },
  infoBox: { background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 12, padding: '14px', marginBottom: 16 },
  divider: { fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '16px 0 12px', textAlign: 'center', borderTop: '1px solid var(--or-border)', paddingTop: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--or-deep)', marginBottom: 14 },
  genBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', fontSize: 18, border: 'none', cursor: 'pointer', padding: '4px' },
  createdBox: { background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 16, padding: 20, textAlign: 'center' },
  credBox: { background: 'rgba(210,183,149,0.1)', border: '1px solid var(--or-border)', borderRadius: 12, padding: 14, textAlign: 'left', marginTop: 8 },
  credRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--or-border)' },
  credLabel: { fontSize: 11, color: 'var(--text-muted)' },
  credVal: { fontSize: 13, fontWeight: 600 },
  empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontSize: 13 },
  cCard: { background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 14, padding: 14, marginBottom: 12 },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--or), var(--or-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 },
  lockedBadge: { fontSize: 10, background: 'rgba(192,57,43,0.1)', color: 'var(--red)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 10, padding: '3px 8px' },
  iconBtn: { background: 'var(--surface)', border: '1px solid var(--or-border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 14 },
  actionBtn: { flex: 1, background: 'transparent', border: '1px solid var(--or-border)', color: 'var(--text-muted)', borderRadius: 8, padding: '7px 4px', fontSize: 11, cursor: 'pointer', textAlign: 'center' },
  helpBox: { background: 'rgba(210,183,149,0.08)', border: '1px solid var(--or-border)', borderRadius: 12, padding: 14, marginBottom: 16 },
};

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../utils/storage';
import AppLayout from '../../components/AppLayout';
import { sendDailyReport, shouldSendReport, EMAIL_CONFIG } from '../../utils/emailReport';
import { getTodayLogs } from '../../utils/storage';
import { useData } from '../../context/DataContext';

export default function Settings() {
  const { user, updateUser, addConsultant, getConsultants } = useAuth();
  const { getOrders, getClients } = useData();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailConf, setEmailConf] = useState({
    serviceId: store.get('emailjs_service') || '',
    templateId: store.get('emailjs_template') || '',
    publicKey: store.get('emailjs_key') || '',
    adminEmail: store.get('admin_email') || '',
  });

  const [newConsultant, setNewConsultant] = useState({ name:'', username:'', password:'', email:'' });
  const consultants = getConsultants();

  const saveProfile = () => {
    setError('');
    const updates = { name: profile.name, email: profile.email, phone: profile.phone };
    if (profile.newPassword) {
      if (profile.newPassword !== profile.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
      if (profile.newPassword.length < 6) { setError('Mot de passe trop court (6 caractères min).'); return; }
      updates.password = profile.newPassword;
    }
    updateUser(user.username, updates);
    setSaved('✓ Profil sauvegardé.'); setTimeout(() => setSaved(''), 2500);
  };

  const saveEmailConf = () => {
    store.set('emailjs_service', emailConf.serviceId);
    store.set('emailjs_template', emailConf.templateId);
    store.set('emailjs_key', emailConf.publicKey);
    store.set('admin_email', emailConf.adminEmail);
    setSaved('✓ Configuration email sauvegardée.'); setTimeout(() => setSaved(''), 2500);
  };

  const testEmail = async () => {
    const logs = getTodayLogs(user.username);
    const orders = getOrders();
    const clients = getClients();
    const ok = await sendDailyReport({
      consultantName: user.name || user.username,
      consultantEmail: user.email || '',
      adminEmail: emailConf.adminEmail,
      logs,
      stats: { orders: orders.length, clients: clients.length, revenue: orders.reduce((s,o)=>s+o.total,0) },
    });
    if (ok) setSaved('✓ Email test envoyé !');
    else setError('Erreur envoi — vérifiez votre configuration EmailJS.');
    setTimeout(() => { setSaved(''); setError(''); }, 4000);
  };

  const handleAddConsultant = () => {
    setError('');
    if (!newConsultant.username || !newConsultant.password || !newConsultant.name) {
      setError('Nom, identifiant et mot de passe requis.'); return;
    }
    const result = addConsultant(newConsultant);
    if (result.ok) {
      setSaved(`✓ Consultante ${newConsultant.name} ajoutée.`);
      setNewConsultant({ name:'', username:'', password:'', email:'' });
      setTimeout(() => setSaved(''), 3000);
    } else setError(result.error);
  };

  return (
    <AppLayout title="Paramètres" icon="⚙️">
      <div style={S.tabs}>
        {(user?.role==='admin'?['profile','email','consultants']:['profile','email']).map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>{ setSaved(''); setError(''); setTab(t); }}>
            {t==='profile'?'👤 Profil':t==='email'?'✉ Email':'👥 Consultantes'}
          </button>
        ))}
      </div>

      <div style={{ padding:16 }}>
        {saved && <div style={S.success}>{saved}</div>}
        {error && <div style={S.error}>{error}</div>}

        {tab === 'profile' && (
          <div>
            <div style={S.infoBox}>
              <div style={S.infoRow}><span>Identifiant</span><span style={{ color:'var(--gold)' }}>{user?.username}</span></div>
              <div style={S.infoRow}><span>Rôle</span><span>{user?.role === 'admin' ? 'Administratrice' : 'Consultante'}</span></div>
            </div>
            {[['name','Nom affiché','text'],['email','Email','email'],['phone','Téléphone','tel']].map(([k,l,t]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input type={t} value={profile[k]} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))} placeholder={l} />
              </div>
            ))}
            <div style={S.divider}>Changer le mot de passe (optionnel)</div>
            {[['newPassword','Nouveau mot de passe'],['confirmPassword','Confirmer']].map(([k,l]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input type="password" value={profile[k]} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))} placeholder="••••••••" />
              </div>
            ))}
            <button className="btn-gold" onClick={saveProfile}>SAUVEGARDER</button>
          </div>
        )}

        {tab === 'email' && (
          <div>
            <div style={S.helpBox}>
              <div style={{ fontWeight:700, color:'var(--gold)', marginBottom:8 }}>📧 Configuration EmailJS (gratuit)</div>
              <ol style={{ fontSize:12, color:'var(--text-muted)', lineHeight:2, paddingLeft:16 }}>
                <li>Créez un compte sur <strong style={{color:'var(--gold)'}}>emailjs.com</strong></li>
                <li>Créez un service email (Gmail, Outlook...)</li>
                <li>Créez un template avec les variables du rapport</li>
                <li>Copiez vos IDs ci-dessous</li>
                <li>200 emails/mois gratuits ✓</li>
              </ol>
            </div>
            {[
              ['serviceId','Service ID','service_xxxxxx'],
              ['templateId','Template ID','template_xxxxxx'],
              ['publicKey','Clé publique','xxxxxxxxxxxxxxx'],
              ['adminEmail','Email admin (destinataire)','votre@email.com'],
            ].map(([k,l,ph]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input value={emailConf[k]} onChange={e=>setEmailConf(p=>({...p,[k]:e.target.value}))} placeholder={ph} />
              </div>
            ))}
            <button className="btn-gold" onClick={saveEmailConf} style={{ marginBottom:10 }}>SAUVEGARDER</button>
            <button className="btn-outline" onClick={testEmail} style={{ width:'100%' }}>✉ Envoyer un rapport test</button>
            <p style={S.note}>Le rapport quotidien est envoyé automatiquement à la première connexion de chaque jour.</p>
          </div>
        )}

        {tab === 'consultants' && user?.role === 'admin' && (
          <div>
            <div style={S.sectionTitle}>Ajouter une consultante</div>
            {[['name','Nom complet *','text'],['username','Identifiant *','text'],['password','Mot de passe *','password'],['email','Email','email']].map(([k,l,t]) => (
              <div className="field" key={k}>
                <label className="label">{l}</label>
                <input type={t} value={newConsultant[k]} onChange={e=>setNewConsultant(p=>({...p,[k]:e.target.value}))} placeholder={l.replace(' *','')} />
              </div>
            ))}
            <button className="btn-gold" onClick={handleAddConsultant} style={{ marginBottom:20 }}>AJOUTER</button>

            <div style={S.sectionTitle}>Consultantes ({consultants.length})</div>
            {consultants.length === 0 && <div style={S.empty}>Aucune consultante ajoutée.</div>}
            {consultants.map(c => (
              <div key={c.id} style={S.consultantRow}>
                <div style={S.cAvatar}>{c.name.charAt(0)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>@{c.username} {c.email && `• ${c.email}`}</div>
                </div>
                <span className="badge badge-blue">Consultant</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' },
  tab: { flex:1, padding:'12px 8px', background:'none', color:'var(--text-muted)', fontSize:12, borderBottom:'2px solid transparent', whiteSpace:'nowrap' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  success: { background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, marginBottom:14 },
  error: { background:'rgba(224,85,85,0.1)', border:'1px solid rgba(224,85,85,0.3)', borderRadius:10, padding:'12px', color:'var(--red)', fontSize:13, marginBottom:14 },
  infoBox: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px', marginBottom:16 },
  infoRow: { display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' },
  divider: { fontSize:11, color:'var(--text-dim)', letterSpacing:'0.1em', textTransform:'uppercase', margin:'16px 0 12px', textAlign:'center', borderTop:'1px solid var(--border)', paddingTop:12 },
  helpBox: { background:'rgba(201,168,76,0.06)', border:'1px solid var(--border)', borderRadius:12, padding:'14px', marginBottom:16 },
  note: { fontSize:11, color:'var(--text-dim)', textAlign:'center', marginTop:10, lineHeight:1.6 },
  sectionTitle: { fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12, fontWeight:700 },
  consultantRow: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px', marginBottom:10 },
  cAvatar: { width:36, height:36, borderRadius:'50%', background:'rgba(85,132,224,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--blue)', flexShrink:0 },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'20px 0', fontSize:13 },
};

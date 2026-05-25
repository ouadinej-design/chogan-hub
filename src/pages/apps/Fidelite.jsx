import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';

const THEMES = [
  { label:'Luxe Or',    c1:'#2a2016', c2:'#3d3020', acc:'#D4AF37' },
  { label:'Nude Rose',  c1:'#2d1f1f', c2:'#3d2828', acc:'#c97070' },
  { label:'Émeraude',  c1:'#0f2318', c2:'#1a3a28', acc:'#4ade80' },
  { label:'Saphir',    c1:'#0f1a2d', c2:'#1a2a42', acc:'#60a5fa' },
  { label:'Améthyste', c1:'#1f1030', c2:'#2d1a44', acc:'#c084fc' },
  { label:'Taupe',     c1:'#1a1614', c2:'#2d2520', acc:'#B89A6A' },
  { label:'Rubis',     c1:'#2d0f0f', c2:'#4a1010', acc:'#f43f5e' },
  { label:'Corail',    c1:'#2d1a0f', c2:'#3d2510', acc:'#fb923c' },
  { label:'Lavande',   c1:'#1a1530', c2:'#252040', acc:'#a78bfa' },
  { label:'Mint',      c1:'#0f1e1a', c2:'#152e28', acc:'#2dd4bf' },
  { label:'Champagne', c1:'#1e1a0f', c2:'#2e2815', acc:'#fbbf24' },
  { label:'Nuit',      c1:'#050510', c2:'#0d0d20', acc:'#818cf8' },
];
const ICONS = [
  { k:'fa-crown', l:'Couronne' },{ k:'fa-star', l:'Étoile' },
  { k:'fa-gem', l:'Diamant' },{ k:'fa-heart', l:'Cœur' },
  { k:'fa-leaf', l:'Feuille' },{ k:'fa-bolt', l:'Éclair' },
];

export default function Fidelite() {
  const { user } = useAuth();
  const [tab, setTab] = useState('clients');

  // Config carte
  const CARD_KEY = `le_card_cfg_${user?.firstName || 'admin'}`;
  const DEFAULT_CFG = {
    type:'points', color1:'#2a2016', color2:'#3d3020', accent:'#D4AF37',
    icon:'fa-crown', cardName:'Chogan Card', stampGoal:10, rewardLabel:'1 cadeau offert'
  };
  const [cfg, setCfg] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CARD_KEY)) || DEFAULT_CFG; }
    catch { return DEFAULT_CFG; }
  });

  const updCfg = (k, v) => {
    const n = { ...cfg, [k]:v };
    setCfg(n);
    localStorage.setItem(CARD_KEY, JSON.stringify(n));
  };

  return (
    <AppLayout title="Fidélité" icon="💳">
      <div style={S.tabs}>
        {[['clients','💳 Clients'],['design','🎨 Ma carte'],['qr','📱 QR Code'],['notifs','🔔 Notifs']].map(([k,l]) => (
          <button key={k} style={{ ...S.tab, ...(tab===k?S.tabActive:{}) }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'clients' && <ClientsTab cfg={cfg} userName={user?.firstName} />}
      {tab === 'design'  && <DesignTab cfg={cfg} updCfg={updCfg} />}
      {tab === 'qr'      && <QRTab cfg={cfg} userName={user?.firstName} />}
      {tab === 'notifs'  && <NotifsTab cfg={cfg} userName={user?.firstName} />}
    </AppLayout>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────
function ClientsTab({ cfg, userName }) {
  const [search, setSearch]           = useState('');
  const [selectedClient, setSelected] = useState(null);
  const [bonusAmt, setBonusAmt]       = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [addingBonus, setAddingBonus] = useState(null);

  const { getFilteredSales } = useAuth();
  const sales = getFilteredSales();
  const [bonusPoints, setBonusPoints] = useState(() => {
    try { return JSON.parse(localStorage.getItem('le_fidelite')||'{}'); } catch { return {}; }
  });

  const saveBP = (bp) => { setBonusPoints(bp); localStorage.setItem('le_fidelite', JSON.stringify(bp)); };

  const calcPts = (s) => s.currency==='€' ? Math.floor(s.amount*10) : Math.floor((s.amount/245)*10);

  const getLevel = (pts) => {
    if (pts>=3000) return { name:'Gold ✨',   color:'#D4AF37', next:null,  needed:0 };
    if (pts>=1000) return { name:'Silver 🥈', color:'#9ca3af', next:3000, needed:3000-pts };
    if (pts>=300)  return { name:'Bronze 🥉', color:'#c2410c', next:1000, needed:1000-pts };
    return             { name:'Starter',   color:'#6b7280', next:300,  needed:300-pts };
  };

  const clientsMap = {};
  sales.forEach(s => {
    if (!s.client) return;
    if (!clientsMap[s.client]) clientsMap[s.client] = { name:s.client, sales:[], email:s.email||'', tel:s.tel||'' };
    clientsMap[s.client].sales.push(s);
  });

  let clients = Object.values(clientsMap).map(c => {
    const base  = c.sales.reduce((t,s) => t + calcPts(s), 0);
    const bonus = (bonusPoints[c.name]||[]).reduce((t,b) => t + (b.pts||0), 0);
    const total = base + bonus;
    return { ...c, base, bonus, total, level:getLevel(total) };
  }).sort((a,b) => b.total - a.total);

  if (search) clients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const addBonus = (clientName) => {
    const pts = parseInt(bonusAmt)||0;
    if (!pts) return;
    const bp = { ...bonusPoints };
    if (!bp[clientName]) bp[clientName] = [];
    bp[clientName].push({ pts, reason:bonusReason||'Bonus manuel', date:new Date().toISOString().split('T')[0] });
    saveBP(bp);
    setBonusAmt(''); setBonusReason(''); setAddingBonus(null);
  };

  const validateStamp = (clientName) => {
    const bp = { ...bonusPoints };
    if (!bp[clientName]) bp[clientName] = [];
    bp[clientName].push({ pts:0, reason:'Tampon validé', date:new Date().toISOString().split('T')[0], stamp:true });
    saveBP(bp);
  };

  const sendCard = (client) => {
    const txt = `Bonjour ${client.name.split(' ')[0]} 👋\n✦ Votre carte Chogan : ${client.total} pts (${client.level.name})\nMerci pour votre fidélité !`;
    if (navigator.share) navigator.share({ title:'Votre carte fidélité', text:txt });
    else navigator.clipboard?.writeText(txt).then(() => alert('✅ Message copié ! Collez dans WhatsApp.'));
  };

  // Détail client
  if (selectedClient) {
    const c = clients.find(x => x.name === selectedClient);
    if (!c) { setSelected(null); return null; }
    const stampsEarned = (bonusPoints[c.name]||[]).filter(b=>b.stamp).length + c.sales.length;
    const stamps = Math.min(stampsEarned, cfg.stampGoal);
    const pct = c.level.next ? Math.min(Math.round(((c.total-(c.level.next-c.level.needed))/c.level.needed)*100),100) : 100;
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={() => setSelected(null)}>← Retour</button>
        {/* Carte fidélité visuelle */}
        <div style={{ background:`linear-gradient(135deg,${cfg.color1},${cfg.color2})`, borderRadius:16, padding:'18px 16px 14px', marginBottom:14, border:`2px solid ${cfg.accent}44`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:90, height:90, borderRadius:'50%', background:`radial-gradient(circle,${cfg.accent}20,transparent)` }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, position:'relative', zIndex:1 }}>
            <div>
              <p style={{ fontSize:8, color:cfg.accent, fontWeight:700, letterSpacing:2, textTransform:'uppercase' }}>{cfg.cardName}</p>
              <p style={{ fontSize:15, fontWeight:700, color:'white', marginTop:4 }}>{c.name}</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${cfg.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${cfg.accent}44` }}>
                <span style={{ color:cfg.accent, fontSize:14 }}>{cfg.icon==='fa-crown'?'👑':cfg.icon==='fa-star'?'⭐':cfg.icon==='fa-gem'?'💎':cfg.icon==='fa-heart'?'❤️':cfg.icon==='fa-leaf'?'🌿':'⚡'}</span>
              </div>
              {cfg.type==='points' && <span style={{ background:c.level.color, color:'white', fontSize:8, fontWeight:800, padding:'2px 8px', borderRadius:20 }}>{c.level.name}</span>}
            </div>
          </div>
          {cfg.type === 'points' && (
            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ fontSize:30, fontWeight:800, color:cfg.accent, lineHeight:1 }}>{c.total.toLocaleString()}</p>
              <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Points · {c.sales.length} achat(s)</p>
              {c.level.next && <>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)' }}>→ {getLevel(c.level.next).name}</span>
                  <span style={{ fontSize:8, color:cfg.accent, fontWeight:700 }}>{c.level.needed} pts</span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, height:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:`linear-gradient(90deg,${cfg.accent},${cfg.accent}88)`, width:pct+'%', borderRadius:10 }}/>
                </div>
              </>}
            </div>
          )}
          {cfg.type === 'stamps' && (
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
                {Array.from({length:cfg.stampGoal}).map((_,i) => (
                  <div key={i} style={{ width:26, height:26, borderRadius:'50%', border:`1.5px solid ${i<stamps?cfg.accent:'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', background:i<stamps?`${cfg.accent}22`:'transparent', fontSize:11 }}>
                    {i<stamps ? '⭐' : ''}
                  </div>
                ))}
              </div>
              <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)' }}>{stamps}/{cfg.stampGoal} tampons · {cfg.rewardLabel}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
          {[
            { v:cfg.type==='stamps'?`${stamps}/${cfg.stampGoal}`:c.base, l:'Pts achats' },
            { v:c.bonus, l:'Pts bonus' },
            { v:(() => {
                const daT = c.sales.filter(s=>(s.currency||s.cur||'€')==='DA').reduce((t,s)=>t+(parseFloat(s.amount)||0),0);
                const euT = c.sales.filter(s=>(s.currency||s.cur||'€')==='€').reduce((t,s)=>t+(parseFloat(s.amount)||0),0);
                if (daT>0&&euT>0) return `${Math.round(daT).toLocaleString('fr-FR')}DA + ${euT.toFixed(0)}€`;
                if (daT>0) return `${Math.round(daT).toLocaleString('fr-FR')} DA`;
                return `${euT.toFixed(0)} €`;
              })(), l:'CA total' },
          ].map((x,i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:10, padding:'8px', textAlign:'center' }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)' }}>{x.v}</p>
              <p style={{ fontSize:9, color:'var(--text-muted)' }}>{x.l}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        {(c.email||c.tel) && (
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            {c.email && <a href={`mailto:${c.email}`} style={{ fontSize:11, color:'var(--blue)', textDecoration:'none' }}>✉ {c.email}</a>}
            {c.tel   && <a href={`tel:${c.tel}`}     style={{ fontSize:11, color:'var(--green)', textDecoration:'none' }}>📞 {c.tel}</a>}
          </div>
        )}

        {/* Actions */}
        {/* Mode opératoire */}
        <div style={{ background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
            📖 Comment gagner des {cfg.type==='stamps'?'tampons':'points'} ?
          </p>
          {cfg.type==='points' ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['🛍', '1 achat = 10 pts par euro dépensé', 'Chaque euro dépensé rapporte 10 points'],
                ['⭐', 'Bonus parrainage = +50 pts', 'Parrainez une amie et recevez 50 points'],
                ['🎂', 'Anniversaire = +100 pts', 'Double points le mois de votre anniversaire'],
                ['📱', 'Partage réseaux = +20 pts', 'Partagez une publication et gagnez 20 pts'],
              ].map(([icon,title,desc]) => (
                <div key={title} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--taupe)' }}>{title}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{desc}</p>
                  </div>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--or-border)', paddingTop:8, marginTop:4 }}>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)', marginBottom:4 }}>Niveaux de fidélité :</p>
                {[['Starter','0 pts'],['Bronze 🥉','300 pts'],['Silver 🥈','1 000 pts'],['Gold ✨','3 000 pts']].map(([n,p])=>(
                  <div key={n} style={{ display:'flex', justifyContent:'space-between', fontSize:10, padding:'3px 0' }}>
                    <span style={{ color:'var(--taupe)', fontWeight:500 }}>{n}</span>
                    <span style={{ color:'var(--or-deep)', fontWeight:700 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['🛍', '1 achat = 1 tampon', 'Chaque achat vous rapporte un tampon'],
                ['🎁', `Carte complète = ${cfg.rewardLabel}`, `À ${cfg.stampGoal} tampons, profitez de votre récompense`],
                ['⭐', 'Parrainage = +1 tampon bonus', 'Parrainez une amie pour un tampon offert'],
              ].map(([icon,title,desc]) => (
                <div key={title} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--taupe)' }}>{title}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-gold" onClick={() => sendCard(c)} style={{ marginBottom:8 }}>
          📤 Envoyer la carte à {c.name.split(' ')[0]} {cfg.type==='stamps'?`(${Math.min(stampsEarned,cfg.stampGoal)}/${cfg.stampGoal} tampons)`:`(${c.total} pts)`}
        </button>

        {cfg.type==='stamps' && (
          <button className="btn-outline" style={{ width:'100%', marginBottom:8 }} onClick={() => validateStamp(c.name)}>
            ⭐ Valider un tampon (+1 tampon)
          </button>
        )}

        <button className="btn-outline" style={{ width:'100%', marginBottom:8 }} onClick={() => setAddingBonus(addingBonus===c.name?null:c.name)}>
          ✦ Ajouter des points bonus
        </button>

        {addingBonus === c.name && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:8 }}>
            <div className="grid-2">
              <div className="field"><label className="label">Points</label>
                <input type="number" placeholder="50" value={bonusAmt} onChange={e=>setBonusAmt(e.target.value)} /></div>
              <div className="field"><label className="label">Raison</label>
                <input placeholder="Parrainage..." value={bonusReason} onChange={e=>setBonusReason(e.target.value)} /></div>
            </div>
            <button className="btn-gold" onClick={() => addBonus(c.name)}>✦ Valider</button>
          </div>
        )}

        {/* Historique bonus */}
        {(bonusPoints[c.name]||[]).length > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px 14px' }}>
            <p style={S.secLabel}>Historique bonus</p>
            {(bonusPoints[c.name]||[]).map((b,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 0', borderBottom:'1px solid rgba(210,183,149,0.1)' }}>
                <span style={{ color:'var(--text-muted)' }}>{b.reason} · {b.date}</span>
                <span style={{ color:'var(--or-deep)', fontWeight:700 }}>{b.stamp ? '⭐' : `+${b.pts} pts`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stats globales
  const gold   = clients.filter(c=>c.total>=3000).length;
  const silver = clients.filter(c=>c.total>=1000&&c.total<3000).length;

  return (
    <div style={S.pad}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
        {[
          { v:clients.length, l:'Clients', c:'var(--or-deep)' },
          { v:gold,           l:'Gold ✨', c:'#D4AF37' },
          { v:silver,         l:'Silver 🥈',c:'#9ca3af' },
        ].map((x,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px', textAlign:'center' }}>
            <p style={{ fontSize:20, fontWeight:700, color:x.c, fontFamily:'var(--font-display)' }}>{x.v}</p>
            <p style={{ fontSize:10, color:'var(--text-muted)' }}>{x.l}</p>
          </div>
        ))}
      </div>

      <input placeholder="🔍 Rechercher un client..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:12 }} />

      {clients.length === 0
        ? <div style={S.empty}>Aucun client. Les clients apparaissent automatiquement après une vente enregistrée dans l'Agenda.</div>
        : clients.map(c => {
          const initials = c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
          return (
            <div key={c.name} style={{ ...S.clientCard, borderLeft:`3px solid ${c.level.color}` }} onClick={() => setSelected(c.name)}>
              <div style={{ ...S.avatar, background:`linear-gradient(135deg,${cfg.color1},${cfg.color2})`, color:cfg.accent }}>{initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--taupe)' }}>{c.name}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{c.sales.length} achat(s) · {c.level.name}</p>
                <div style={{ height:4, background:'rgba(210,183,149,0.2)', borderRadius:2, marginTop:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:`linear-gradient(90deg,${c.level.color},${c.level.color}88)`, width:`${Math.min(100,(c.total/(c.level.next||c.total||1))*100)}%`, borderRadius:2 }}/>
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)' }}>{c.total.toLocaleString()}</p>
                <p style={{ fontSize:9, color:'var(--text-muted)' }}>pts</p>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── DESIGN MA CARTE ───────────────────────────────────────────────
function DesignTab({ cfg, updCfg }) {
  return (
    <div style={S.pad}>
      {/* Aperçu */}
      <div style={{ background:`linear-gradient(135deg,${cfg.color1},${cfg.color2})`, borderRadius:16, padding:'20px 18px', marginBottom:16, border:`1px solid ${cfg.accent}44`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-25, right:-25, width:90, height:90, borderRadius:'50%', background:`radial-gradient(circle,${cfg.accent}15,transparent)` }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, position:'relative', zIndex:1 }}>
          <div>
            <p style={{ fontSize:8, color:cfg.accent, fontWeight:700, letterSpacing:2, textTransform:'uppercase' }}>{cfg.cardName}</p>
            <p style={{ fontSize:13, fontWeight:700, color:'white', marginTop:4 }}>Prénom Nom</p>
          </div>
          <div style={{ width:34, height:34, borderRadius:10, background:`${cfg.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${cfg.accent}44`, fontSize:16 }}>
            {cfg.icon==='fa-crown'?'👑':cfg.icon==='fa-star'?'⭐':cfg.icon==='fa-gem'?'💎':cfg.icon==='fa-heart'?'❤️':cfg.icon==='fa-leaf'?'🌿':'⚡'}
          </div>
        </div>
        {cfg.type==='points' && (
          <div style={{ position:'relative', zIndex:1 }}>
            <p style={{ fontSize:28, fontWeight:800, color:cfg.accent, lineHeight:1 }}>1 250</p>
            <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1 }}>Points fidélité · Silver 🥈</p>
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:8, height:4, marginTop:8, overflow:'hidden' }}>
              <div style={{ height:'100%', background:`linear-gradient(90deg,${cfg.accent},${cfg.accent}88)`, width:'55%', borderRadius:8 }}/>
            </div>
          </div>
        )}
        {cfg.type==='stamps' && (
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              {Array.from({length:cfg.stampGoal}).map((_,i) => (
                <div key={i} style={{ width:28, height:28, borderRadius:'50%', border:`1.5px solid ${i<6?cfg.accent:'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', background:i<6?`${cfg.accent}22`:'transparent', fontSize:12 }}>
                  {i<6?'⭐':''}
                </div>
              ))}
            </div>
            <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)' }}>6/{cfg.stampGoal} tampons · {cfg.rewardLabel}</p>
          </div>
        )}
      </div>

      {/* Type */}
      <div style={S.section}>
        <p style={S.secLabel}>Type de carte</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[['points','📈 Points','Niveaux Bronze → Silver → Gold'],['stamps','⭐ Tampons','Cadeau à la fin de la carte']].map(([k,l,d]) => (
            <div key={k} onClick={() => updCfg('type',k)} style={{ padding:12, borderRadius:12, cursor:'pointer', border:`2px solid ${cfg.type===k?cfg.accent:'var(--or-border)'}`, background:cfg.type===k?`${cfg.accent}10`:'var(--bg-card)', textAlign:'center' }}>
              <p style={{ fontSize:14, marginBottom:4 }}>{l.split(' ')[0]}</p>
              <p style={{ fontSize:11, fontWeight:700, color:cfg.type===k?cfg.accent:'var(--taupe)' }}>{l.split(' ').slice(1).join(' ')}</p>
              <p style={{ fontSize:9, color:'var(--text-muted)', marginTop:3, lineHeight:1.3 }}>{d}</p>
            </div>
          ))}
        </div>
        {cfg.type==='stamps' && (
          <div style={{ marginTop:12 }}>
            <p style={S.secLabel}>Nombre de tampons</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {[5,8,10,12,15].map(n => (
                <button key={n} onClick={() => updCfg('stampGoal',n)} style={{ padding:'6px 14px', borderRadius:20, cursor:'pointer', border:`1.5px solid ${cfg.stampGoal===n?cfg.accent:'var(--or-border)'}`, background:cfg.stampGoal===n?`${cfg.accent}15`:'transparent', fontSize:11, fontWeight:700, color:cfg.stampGoal===n?cfg.accent:'var(--text-muted)', fontFamily:'var(--font-body)' }}>{n}</button>
              ))}
            </div>
            <div className="field"><label className="label">Récompense</label>
              <input placeholder="Ex: 1 produit offert, -20%..." value={cfg.rewardLabel} onChange={e=>updCfg('rewardLabel',e.target.value)} /></div>
          </div>
        )}
      </div>

      {/* Nom */}
      <div style={S.section}>
        <p style={S.secLabel}>Nom de la carte</p>
        <input placeholder="Chogan Card, VIP Club..." value={cfg.cardName} onChange={e=>updCfg('cardName',e.target.value)} />
      </div>

      {/* Thème */}
      <div style={S.section}>
        <p style={S.secLabel}>Thème de couleur</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
          {THEMES.map(t => {
            const active = cfg.color1===t.c1 && cfg.accent===t.acc;
            return (
              <div key={t.label} onClick={() => { updCfg('color1',t.c1); setCfgMulti({ color2:t.c2, accent:t.acc }); }} style={{ height:44, borderRadius:10, background:`linear-gradient(135deg,${t.c1},${t.c2})`, border:`2px solid ${active?t.acc:'transparent'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:9, color:t.acc, fontWeight:700 }}>{t.label}</span>
              </div>
            );
          })}
        </div>
        <p style={S.secLabel}>Icône</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {ICONS.map(ic => (
            <button key={ic.k} onClick={() => updCfg('icon',ic.k)} style={{ padding:'8px 12px', borderRadius:10, border:`1.5px solid ${cfg.icon===ic.k?cfg.accent:'var(--or-border)'}`, background:cfg.icon===ic.k?`${cfg.accent}15`:'transparent', cursor:'pointer', fontSize:14, fontFamily:'var(--font-body)' }}>
              {ic.k==='fa-crown'?'👑':ic.k==='fa-star'?'⭐':ic.k==='fa-gem'?'💎':ic.k==='fa-heart'?'❤️':ic.k==='fa-leaf'?'🌿':'⚡'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  function setCfgMulti(obj) {
    // This is called inside DesignTab which has cfg/updCfg from parent
    Object.entries(obj).forEach(([k,v]) => updCfg(k,v));
  }
}

// ── QR CODE ───────────────────────────────────────────────────────
function QRTab({ cfg, userName }) {
  const enrollUrl = `${window.location.origin}/?c=${encodeURIComponent(userName||'')}&card=1`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=4E463F&bgcolor=F7EBE1&data=${encodeURIComponent(enrollUrl)}`;

  const share = () => {
    const txt = `✦ Rejoignez mon programme fidélité Chogan !\nScannez ou cliquez : ${enrollUrl}`;
    if (navigator.share) navigator.share({ title:'Carte fidélité Chogan', text:txt, url:enrollUrl });
    else navigator.clipboard?.writeText(enrollUrl).then(() => alert('✅ Lien copié !'));
  };

  return (
    <div style={S.pad}>
      <div style={S.section}>
        <p style={{ ...S.secLabel, marginBottom:14 }}>QR Code d'inscription</p>
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <img src={qrUrl} alt="QR Code fidélité" style={{ width:200, height:200, borderRadius:12, border:'1px solid var(--or-border)' }} />
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:12, lineHeight:1.6 }}>
            Faites scanner ce QR code à vos clientes pour les inscrire à votre programme fidélité.
          </p>
        </div>
        <button className="btn-gold" onClick={share}>📤 Partager le lien d'inscription</button>
      </div>
      <div style={S.section}>
        <p style={S.secLabel}>Comment ça marche ?</p>
        {[
          ['1', 'La cliente scanne le QR code ou clique le lien'],
          ['2', 'Elle rejoint votre programme fidélité'],
          ['3', 'Vous cumulez des points à chaque vente enregistrée'],
          ['4', 'Envoyez sa carte mise à jour depuis l\'onglet Clients'],
        ].map(([n,t]) => (
          <div key={n} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
            <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--or-pale)', border:'1px solid var(--or-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--or-deep)', flexShrink:0 }}>{n}</span>
            <p style={{ fontSize:12, color:'var(--taupe)', lineHeight:1.5, paddingTop:2 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────
function NotifsTab({ userName }) {
  const [msg, setMsg]   = useState('');
  const [sent, setSent] = useState(false);
  const TEMPLATES = [
    '🎁 Votre carte fidélité est mise à jour ! Consultez vos points.',
    '✨ Nouveaux parfums disponibles ! Profitez de -10% sur votre prochain achat.',
    '🌹 Merci pour votre fidélité ! Un cadeau vous attend à partir de 1000 pts.',
    '💌 Offre exclusive VIP : -15% ce week-end pour nos meilleures clientes !',
  ];

  const send = () => {
    if (!msg.trim()) return;
    const txt = msg;
    if (navigator.share) navigator.share({ title:'Message Chogan', text:txt });
    else navigator.clipboard?.writeText(txt).then(() => alert('✅ Message copié ! Collez dans WhatsApp ou SMS.'));
    setSent(true); setTimeout(() => setSent(false), 3000);
    setMsg('');
  };

  return (
    <div style={S.pad}>
      <div style={S.section}>
        <p style={S.secLabel}>Envoyer un message à vos clientes</p>
        <div className="field">
          <label className="label">Message</label>
          <textarea rows={4} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Rédigez votre message..." style={{ resize:'none' }}/>
        </div>
        {sent
          ? <div style={{ background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'10px', color:'var(--green)', fontSize:13, fontWeight:600, textAlign:'center' }}>✅ Message prêt à envoyer !</div>
          : <button className="btn-gold" onClick={send} disabled={!msg.trim()}>📤 Envoyer / Partager</button>
        }
      </div>
      <div style={S.section}>
        <p style={S.secLabel}>Messages prêts à l'emploi</p>
        {TEMPLATES.map((t,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:10, padding:'10px 12px', marginBottom:8, cursor:'pointer' }} onClick={() => setMsg(t)}>
            <p style={{ fontSize:12, color:'var(--taupe)', lineHeight:1.5 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const S = {
  tabs:      { display:'flex', borderBottom:'1px solid var(--or-border)', overflowX:'auto', scrollbarWidth:'none' },
  tab:       { flex:1, padding:'11px 4px', background:'none', color:'var(--text-muted)', fontSize:11, borderBottom:'2px solid transparent', whiteSpace:'nowrap', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  pad:       { padding:16 },
  back:      { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block', fontFamily:'var(--font-body)' },
  section:   { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:12 },
  secLabel:  { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  clientCard:{ display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px', marginBottom:8, cursor:'pointer' },
  avatar:    { width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 },
  empty:     { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
};

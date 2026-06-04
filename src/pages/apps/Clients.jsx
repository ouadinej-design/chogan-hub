import { syncFromServer } from '../../lib/syncAll';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cloudSave } from '../../lib/cloudSync';
import { useTeamFilter } from '../../lib/useTeamFilter.jsx';
import AppLayout from '../../components/AppLayout';

// ── Couleurs par consultant ───────────────────────────────────────
const CONSULT_COLORS = [
  { bg:'rgba(80,130,200,0.12)',  border:'#5082C8', text:'#2d5a9e' },
  { bg:'rgba(100,180,100,0.12)', border:'#64B464', text:'#2d7a2d' },
  { bg:'rgba(180,100,200,0.12)', border:'#B464C8', text:'#7a2d9e' },
  { bg:'rgba(210,160,50,0.12)',  border:'#D2A032', text:'#8C6D00' },
  { bg:'rgba(50,190,180,0.12)',  border:'#32BEB4', text:'#1a7a74' },
  { bg:'rgba(220,120,60,0.12)',  border:'#DC783C', text:'#9e4a1a' },
];
const OWNER_C = { bg:'rgba(220,80,120,0.10)', border:'#DC5078', text:'#a03060' };
const _cc = {}; let _ci = 0;
function cColor(name, ownerFirst) {
  if (!name) return CONSULT_COLORS[0];
  const n = name.toLowerCase().trim();
  const o = (ownerFirst||'').toLowerCase().trim();
  if (o && (n.includes(o) || o.includes(n.split(' ')[0]))) return OWNER_C;
  if (!_cc[n]) { _cc[n] = CONSULT_COLORS[_ci % CONSULT_COLORS.length]; _ci++; }
  return _cc[n];
}
function ColorBadge({ consultant, ownerFirst }) {
  if (!consultant) return null;
  const col = cColor(consultant, ownerFirst);
  const isMine = col === OWNER_C;
  return (
    <span style={{ display:'inline-block', background:col.bg, border:`1px solid ${col.border}`,
      color:col.text, borderRadius:12, padding:'2px 10px', fontSize:11, fontWeight:700, marginTop:4 }}>
      {isMine ? '🌸 Moi' : `👤 ${consultant}`}
    </span>
  );
}

const COLORS = ['#B89A6A','#9e5a7a','#3d6b9e','#4a7c59','#6b4d8a','#8a4d4d','#3d7a8a'];

export default function Clients() {
  // Sync depuis serveur puis forcer rechargement
  const [syncKey, setSyncKey] = useState(0);
  useEffect(() => {
    syncFromServer().then(() => setSyncKey(k => k + 1));
  }, []);

  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const { getFilteredSales, user } = useAuth();
  const { filterByConsultant, FilterDropdown } = useTeamFilter(user);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allSales = useMemo(() => getFilteredSales(), [syncKey]);
  const sales = filterByConsultant(allSales);

  const now = useMemo(() => { const d=new Date(); d.setHours(0,0,0,0); return d; }, []);

  const map = useMemo(() => {
    const m = {};
    sales.forEach(s => {
      if (!s.client) return;
      if (!m[s.client]) m[s.client] = { name:s.client, purchases:[], total:0, lastDate:'', topProd:{}, email:s.email||'', tel:s.tel||'', currency:s.currency||s.cur||'DA' };
      m[s.client].purchases.push(s);
      m[s.client].total += parseFloat(s.amount)||0;
      const date = s.date||s.createdAt||'';
      if (!m[s.client].lastDate || date > m[s.client].lastDate) m[s.client].lastDate = date;
      if (s.email && !m[s.client].email) m[s.client].email = s.email;
      if (s.tel && !m[s.client].tel) m[s.client].tel = s.tel;
      const prod = s.product||s.prod||'';
      if (prod) m[s.client].topProd[prod] = (m[s.client].topProd[prod]||0)+1;
    });
    return m;
  }, [sales]);

  const maxT = Math.max(...Object.values(map).map(c=>c.total), 1);
  const daysSince = (c) => Math.floor((now - new Date(c.lastDate)) / 86400000);

  let clients = Object.values(map);
  if (search) clients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  clients = clients.filter(c => {
    const d = daysSince(c);
    if (filter==='recent') return d < 30;
    if (filter==='warn')   return d >= 30 && d < 60;
    if (filter==='urgent') return d >= 60;
    return true;
  }).sort((a,b) => new Date(b.lastDate) - new Date(a.lastDate));

  const grR = clients.filter(c => daysSince(c) <  30);
  const grW = clients.filter(c => { const d=daysSince(c); return d>=30&&d<60; });
  const grU = clients.filter(c => daysSince(c) >= 60);

  // Vue détail client
  if (selected) {
    const c = map[selected];
    if (!c) { setSelected(null); return null; }
    const d  = daysSince(c);
    const sC = d<30?'var(--green)':d<60?'#d97706':'var(--red)';
    const sL = d<30?'✅ Client récent':d<60?'⚠️ À relancer':'🚨 Relance urgente !';
    const top = Object.entries(c.topProd).sort((a,b)=>b[1]-a[1])[0];
    return (
      <AppLayout appId="clients" onHelp={resetTuto} title="Clients" icon="👥">
        <div style={S.pad}>
          <button style={S.back} onClick={() => setSelected(null)}>← Retour</button>
          <div style={S.section}>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ ...S.avatar, width:50, height:50, fontSize:16, margin:'0 auto 10px', background:'linear-gradient(135deg,var(--or),var(--or-deep))' }}>
                {c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <p style={{ fontSize:17, fontWeight:700, color:'var(--taupe)' }}>{c.name}</p>
              <p style={{ fontSize:12, color:sC, fontWeight:700, marginTop:4 }}>{sL}</p>
              {c.consultant && user?.role !== 'consultante' && <ColorBadge consultant={c.consultant} ownerFirst={user?.firstName} />}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
              {[{v:c.purchases.length,l:'Achats'},{v:`${c.total.toFixed(0)}`,l:c.currency},{v:`${d}j`,l:'Dernier achat'}].map((k,i) => (
                <div key={i} style={{ background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:10, padding:'8px', textAlign:'center' }}>
                  <p style={{ fontSize:15, fontWeight:700, color:'var(--or-deep)' }}>{k.v}</p>
                  <p style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.l}</p>
                </div>
              ))}
            </div>
            {(c.email||c.tel) && (
              <div style={{ display:'flex', gap:12, marginBottom:12 }}>
                {c.email && <a href={`mailto:${c.email}`} style={{ fontSize:11, color:'var(--blue)', textDecoration:'none' }}>✉ {c.email}</a>}
                {c.tel   && <a href={`tel:${c.tel}`}     style={{ fontSize:11, color:'var(--green)', textDecoration:'none' }}>📞 {c.tel}</a>}
              </div>
            )}
            {top && <p style={{ fontSize:11, color:'var(--text-muted)' }}>🏆 Produit préféré : <strong>{top[0]}</strong></p>}
          </div>
          <div style={S.section}>
            <p style={S.secLabel}>Historique des achats</p>
            {c.purchases.slice(0,10).map((p,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(210,183,149,0.12)', fontSize:12 }}>
                <span style={{ color:'var(--taupe)', flex:1, paddingRight:8 }}>{p.product||p.prod||'—'}</span>
                <span style={{ color:'var(--text-muted)', marginRight:8 }}>{p.date||''}</span>
                <span style={{ fontWeight:700, color:'var(--or-deep)', flexShrink:0 }}>{parseFloat(p.amount||0).toFixed(0)} {p.currency||p.cur||'DA'}</span>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const ClientRow = ({ c, i }) => {
    const d  = daysSince(c);
    const sC = d<30?'var(--green)':d<60?'#d97706':'var(--red)';
    const sL = d<30?'Récent':d<60?'À relancer':'Urgent !';
    const init = c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const top  = Object.entries(c.topProd).sort((a,b)=>b[1]-a[1])[0];
    return (
      <div style={S.row} onClick={() => setSelected(c.name)}>
        <div style={{ ...S.avatar, background:COLORS[i%COLORS.length] }}>{init}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--taupe)' }}>{c.name}</p>
          <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{top?top[0].substring(0,28):'—'} · {c.purchases.length} achat(s)</p>
          <div style={{ height:3, background:'rgba(210,183,149,0.2)', borderRadius:2, marginTop:5, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'linear-gradient(90deg,var(--or),var(--or-deep))', width:Math.round((c.total/maxT)*100)+'%', borderRadius:2 }}/>
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--or-deep)' }}>{c.total.toFixed(0)} {c.currency}</p>
          <p style={{ fontSize:9, color:sC, fontWeight:600, marginTop:2 }}>{sL}</p>
        </div>
      </div>
    );
  };

  const Group = ({ title, color, items, offset=0 }) => {
    if (!items.length) return null;
    return (
      <>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 2px 4px' }}>
          <div style={{ width:10, height:10, borderRadius:3, background:color }}/>
          <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, color }}>{title}</span>
          <span style={{ marginLeft:'auto', background:'rgba(210,183,149,0.15)', borderRadius:20, padding:'1px 8px', fontSize:8, color:'var(--text-muted)' }}>{items.length}</span>
        </div>
        {items.map((c,i) => <ClientRow key={c.name} c={c} i={i+offset}/>)}
      </>
    );
  };

  return (
    <AppLayout title="Clients" icon="👥">
      <div style={S.pad}>
        <FilterDropdown />
        {/* Stats rapides */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[{v:grR.length,l:'Récents',c:'var(--green)'},{v:grW.length,l:'À relancer',c:'#d97706'},{v:grU.length,l:'Urgents',c:'var(--red)'}].map((x,i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:`1px solid ${x.c}30`, borderRadius:12, padding:'10px', textAlign:'center' }}>
              <p style={{ fontSize:20, fontWeight:700, color:x.c, fontFamily:'var(--font-display)' }}>{x.v}</p>
              <p style={{ fontSize:9, color:'var(--text-muted)' }}>{x.l}</p>
            </div>
          ))}
        </div>
        <input placeholder="🔍 Rechercher un client..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
        <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', scrollbarWidth:'none' }}>
          {[['all','Tous'],['recent','Récents'],['warn','À relancer'],['urgent','Urgents']].map(([k,l]) => (
            <button key={k} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filter===k?'var(--or-deep)':'var(--or-border)'}`, background:filter===k?'var(--or-deep)':'transparent', color:filter===k?'#fff':'var(--text-muted)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)', whiteSpace:'nowrap', flexShrink:0 }} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        {filter === 'all' ? (
          <>
            <Group title="Clients récents"   color="var(--green)" items={grR}/>
            <Group title="À relancer"         color="#d97706"      items={grW} offset={grR.length}/>
            <Group title="Relance urgente"    color="var(--red)"   items={grU} offset={grR.length+grW.length}/>
          </>
        ) : clients.map((c,i) => <ClientRow key={c.name} c={c} i={i}/>)}
        {!clients.length && <div style={S.empty}>Aucun client trouvé. Les clients apparaissent automatiquement après une vente dans l'Agenda.</div>}
      </div>
    </AppLayout>
  );
}

const S = {
  pad:     { padding:16 },
  back:    { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block', fontFamily:'var(--font-body)' },
  section: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:12 },
  secLabel:{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  row:     { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer' },
  avatar:  { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 },
  empty:   { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
};

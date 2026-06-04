import { useState, useEffect } from 'react';

import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';

export default function Stats() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');

  return (
    <AppLayout appId="stats" onHelp={resetTuto} title="Statistiques" icon="📊">
      <div style={{ display:'flex', borderBottom:'1px solid var(--or-border)', overflowX:'auto', scrollbarWidth:'none' }}>
        {[['stats','📈 Stats'],['dashboard','🏠 Dashboard'],['activite','📅 Activité']].map(([k,l]) => (
          <button key={k} style={{ flex:1, padding:'12px 6px', background:'none', color:tab===k?'var(--or-deep)':'var(--text-muted)', fontSize:11, borderBottom:tab===k?'2px solid var(--or-deep)':'2px solid transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'stats'     && <StatsTab user={user} />}
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'activite'  && <ActiviteTab />}
    </AppLayout>
  );
}

// ── STATS ─────────────────────────────────────────────────────────
function StatsTab({ user }) {
  const { getFilteredSales } = useAuth();
  const sales = getFilteredSales();
  const objs_raw = (() => { try { return JSON.parse(localStorage.getItem('le_objectives')||'{}'); } catch { return {}; } })();
  const [objs, setObjs]       = useState(objs_raw);
  const [editObj, setEditObj] = useState(false);
  const [tmp, setTmp]         = useState({da:'',eu:'',ada:'',aeu:''});

  const mySales = sales; // show all sales for now
  const now = new Date();

  const saveObjs = () => {
    const key = user?.firstName || 'admin';
    const o = { ...objs, [key]: { monthDA:parseFloat(tmp.da)||0, monthEU:parseFloat(tmp.eu)||0, yearDA:parseFloat(tmp.ada)||0, yearEU:parseFloat(tmp.aeu)||0 }};
    setObjs(o);
    localStorage.setItem('le_objectives', JSON.stringify(o));
    setEditObj(false);
  };
  const openEdit = () => {
    const key = user?.firstName || 'admin';
    const o = objs[key] || {};
    setTmp({ da:o.monthDA||'', eu:o.monthEU||'', ada:o.yearDA||'', aeu:o.yearEU||'' });
    setEditObj(true);
  };

  const Block = ({ cur }) => {
    const s     = mySales.filter(x => (x.currency||x.cur) === cur);
    const thisM = s.filter(x => { const d=new Date(x.date||x.createdAt); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); });
    const lastM = s.filter(x => { const d=new Date(x.date||x.createdAt),lm=new Date(now.getFullYear(),now.getMonth()-1,1); return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear(); });
    const total  = s.reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);
    const thisCA = thisM.reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);
    const lastCA = lastM.reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);
    const trend  = lastCA>0 ? Math.round(((thisCA-lastCA)/lastCA)*100) : null;
    const yearCA = s.filter(x=>new Date(x.date||x.createdAt).getFullYear()===now.getFullYear()).reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);

    const monthly = {};
    for (let i=5;i>=0;i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      monthly[k] = { label:d.toLocaleDateString('fr-FR',{month:'short'}), val:0 };
    }
    s.forEach(x => {
      // Essayer plusieurs formats de date
      const raw = x.date || x.createdAt || '';
      let k = '';
      if (raw.match(/^\d{4}-\d{2}/)) k = raw.substring(0,7); // YYYY-MM-DD
      else if (raw.match(/^\d{2}\/\d{2}\/\d{4}/)) { const parts=raw.split('/'); k=`${parts[2]}-${parts[1]}`; } // DD/MM/YYYY
      else if (raw.match(/^\d{2}\/\d{2}\/\d{2}/)) { const parts=raw.split('/'); k=`20${parts[2]}-${parts[1]}`; } // DD/MM/YY
      if (k && monthly[k]) monthly[k].val += parseFloat(x.amount||x.amt)||0;
    });
    const mVals = Object.values(monthly);
    const maxM  = Math.max(...mVals.map(m=>m.val), 1);
    const CHART_H = 52;
    const isEU = cur === '€';
    const ac   = isEU ? '#3d6b9e' : 'var(--or-deep)';
    const key  = user?.firstName || 'admin';
    const myObj = objs[key] || {};
    const objM = isEU ? (myObj.monthEU||0) : (myObj.monthDA||0);
    const objY = isEU ? (myObj.yearEU||0)  : (myObj.yearDA||0);

    const byCat = {};
    s.forEach(x => { const cat=x.category||x.cat||'Autre'; byCat[cat]=(byCat[cat]||0)+(parseFloat(x.amount||x.amt)||0); });
    const maxCat = Math.max(...Object.values(byCat), 1);

    const topMap = {};
    s.forEach(x => { if(!topMap[x.client])topMap[x.client]={name:x.client,total:0}; topMap[x.client].total+=parseFloat(x.amount||x.amt)||0; });
    const topC = Object.values(topMap).sort((a,b)=>b.total-a.total).slice(0,3);

    if (!s.length) return null;

    return (
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:700, color:ac, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 10px', padding:'6px 0', borderBottom:'1px solid var(--or-border)' }}>
          {isEU ? '🇪🇺 Euros (€)' : '🇩🇿 Dinars (DA)'}
        </p>
        {/* CA Total */}
        <div style={{ background:`linear-gradient(135deg,${ac}15,${ac}05)`, border:`1px solid ${ac}25`, borderRadius:14, padding:'14px', marginBottom:10 }}>
          <p style={{ fontSize:9, textTransform:'uppercase', letterSpacing:2, color:'var(--text-muted)', marginBottom:5 }}>CA Total {cur}</p>
          <p style={{ fontSize:30, fontWeight:700, color:ac, fontFamily:'var(--font-display)' }}>{total.toLocaleString('fr-FR')} {cur}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
            Ce mois : {thisCA.toFixed(isEU?2:0)} {cur}{trend!==null ? ` · ${trend>=0?'↑':'↓'} ${Math.abs(trend)}% vs M-1` : ''}
          </p>
        </div>
        {/* Objectif mensuel */}
        {objM > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:6 }}>
              <span style={{ fontWeight:600 }}>Objectif mensuel</span>
              <span style={{ color:ac, fontWeight:700 }}>{thisCA.toFixed(0)} / {objM.toFixed(0)} {cur}</span>
            </div>
            <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:4, height:6, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, width:Math.min(Math.round((thisCA/objM)*100),100)+'%', background:`linear-gradient(90deg,${ac},${ac}99)` }}/>
            </div>
            <p style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{Math.min(Math.round((thisCA/objM)*100),100)}% atteint</p>
          </div>
        )}
        {/* Objectif annuel */}
        {objY > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:6 }}>
              <span style={{ fontWeight:600 }}>Objectif annuel</span>
              <span style={{ color:ac, fontWeight:700 }}>{yearCA.toFixed(0)} / {objY.toFixed(0)} {cur}</span>
            </div>
            <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:4, height:6, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, width:Math.min(Math.round((yearCA/objY)*100),100)+'%', background:`linear-gradient(90deg,${ac},${ac}99)` }}/>
            </div>
            <p style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{Math.min(Math.round((yearCA/objY)*100),100)}% atteint</p>
          </div>
        )}
        {/* Graphique 6 mois */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:8 }}>
          <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:10 }}>CA 6 mois</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:72, position:'relative' }}>
            {objM > 0 && (() => {
              const lineY = CHART_H - Math.min(Math.round((objM/maxM)*CHART_H), CHART_H);
              return <div style={{ position:'absolute', top:lineY+'px', left:0, right:0, zIndex:2, pointerEvents:'none' }}>
                <div style={{ borderTop:`1.5px dashed ${ac}`, width:'100%', opacity:0.6 }}/>
                <span style={{ position:'absolute', right:0, top:-9, fontSize:7, color:ac, fontWeight:700, background:'var(--bg)', padding:'0 3px', borderRadius:3 }}>Obj</span>
              </div>;
            })()}
            {mVals.map((m,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <span style={{ fontSize:7, color:ac, fontWeight:700 }}>{m.val>0?m.val.toFixed(0):''}</span>
                <div style={{ width:'100%', borderRadius:'3px 3px 0 0', minHeight:3, background:`linear-gradient(180deg,${ac},${ac}88)`, height:Math.max(Math.round((m.val/maxM)*CHART_H),m.val>0?6:2)+'px' }}/>
                <span style={{ fontSize:7, color:'var(--text-muted)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Par catégorie */}
        {Object.keys(byCat).length > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:8 }}>
            <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Par catégorie</p>
            {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat,val]) => (
              <div key={cat} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ fontWeight:500, color:'var(--taupe)' }}>{cat}</span>
                  <span style={{ color:ac, fontWeight:700 }}>{val.toFixed(isEU?2:0)} {cur}</span>
                </div>
                <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:3, height:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, width:Math.round((val/maxCat)*100)+'%', background:`linear-gradient(90deg,${ac},${ac}88)` }}/>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Top clients */}
        {topC.length > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14 }}>
            <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>🏆 Top Clients {cur}</p>
            {topC.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:8, marginBottom:8, borderBottom:i<topC.length-1?'1px solid rgba(210,183,149,0.12)':'none' }}>
                <div style={{ width:20, height:20, borderRadius:5, background:i===0?'linear-gradient(135deg,var(--or),var(--or-deep))':'rgba(210,183,149,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:i===0?'#fff':'var(--text-muted)' }}>{i+1}</div>
                <span style={{ flex:1, fontSize:12, fontWeight:500, color:'var(--taupe)' }}>{c.name}</span>
                <span style={{ fontSize:11, fontWeight:700, color:ac }}>{c.total.toFixed(isEU?2:0)} {cur}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.pad}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {[{v:mySales.length,l:'Total ventes'},{v:new Set(mySales.map(s=>s.client)).size,l:'Clients'}].map((k,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, textAlign:'center', padding:'13px 8px' }}>
            <p style={{ fontSize:22, fontWeight:800, color:'var(--or-deep)', fontFamily:'var(--font-display)' }}>{k.v}</p>
            <p style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginTop:2 }}>{k.l}</p>
          </div>
        ))}
      </div>
      <button style={S.btnGoal} onClick={openEdit}>🎯 Définir mes objectifs de CA</button>
      <Block cur="DA"/>
      <Block cur="€"/>
      {!mySales.length && <div style={S.empty}>Aucune vente enregistrée. Enregistrez des ventes dans l'Agenda pour voir vos statistiques.</div>}

      {/* Modal objectifs */}
      {editObj && (
        <div style={S.modal} onClick={e=>{if(e.target===e.currentTarget)setEditObj(false);}}>
          <div style={S.modalBox}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:15, color:'var(--taupe)' }}>Mes objectifs CA</p>
              <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--text-muted)' }} onClick={()=>setEditObj(false)}>✕</button>
            </div>
            <p style={S.secLabel}>Dinars Algériens (DA)</p>
            <div className="grid-2">
              <div className="field"><label className="label">Mensuel DA</label><input type="number" placeholder="50000" value={tmp.da} onChange={e=>setTmp(p=>({...p,da:e.target.value}))}/></div>
              <div className="field"><label className="label">Annuel DA</label><input type="number" placeholder="500000" value={tmp.ada} onChange={e=>setTmp(p=>({...p,ada:e.target.value}))}/></div>
            </div>
            <p style={S.secLabel}>Euros (€)</p>
            <div className="grid-2">
              <div className="field"><label className="label">Mensuel €</label><input type="number" placeholder="1000" value={tmp.eu} onChange={e=>setTmp(p=>({...p,eu:e.target.value}))}/></div>
              <div className="field"><label className="label">Annuel €</label><input type="number" placeholder="10000" value={tmp.aeu} onChange={e=>setTmp(p=>({...p,aeu:e.target.value}))}/></div>
            </div>
            <button className="btn-gold" onClick={saveObjs}>Enregistrer les objectifs</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function DashboardTab() {
  const { getFilteredSales } = useAuth();
  const sales = getFilteredSales();
  const now   = new Date();
  const nowM  = new Date(); nowM.setHours(0,0,0,0);

  const totalCA = sales.reduce((t,s) => t+(parseFloat(s.amount||s.amt)||0), 0);
  const byC = {};
  sales.forEach(s => {
    const n = s.consultant || 'Moi';
    if (!byC[n]) byC[n] = { name:n, sales:0, ca:0 };
    byC[n].sales++;
    byC[n].ca += parseFloat(s.amount||s.amt)||0;
  });
  const topC = Object.values(byC).sort((a,b)=>b.ca-a.ca);
  const maxCA = Math.max(...topC.map(c=>c.ca), 1);

  let rec=0,warn=0,urg=0;
  const cMap = {};
  sales.forEach(s => { if(!cMap[s.client]||((s.date||s.createdAt||'')>cMap[s.client])) cMap[s.client] = s.date||s.createdAt||''; });
  Object.values(cMap).forEach(d => {
    const days = Math.floor((nowM - new Date(d)) / 86400000);
    if (days<30) rec++; else if (days<60) warn++; else urg++;
  });

  const monthly = {};
  for (let i=5;i>=0;i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthly[k] = { label:d.toLocaleDateString('fr-FR',{month:'short'}), val:0 };
  }
  sales.forEach(s => { const k=(s.date||s.createdAt||'').substring(0,7); if(monthly[k]) monthly[k].val += parseFloat(s.amount||s.amt)||0; });
  const mVals = Object.values(monthly);
  const maxM  = Math.max(...mVals.map(m=>m.val), 1);

  return (
    <div style={S.pad}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        {[{v:sales.length,l:'Ventes'},{v:new Set(sales.map(s=>s.client)).size,l:'Clients'},{v:new Set(sales.map(s=>s.consultant||'Moi')).size,l:'Consultantes'},{v:totalCA.toFixed(0)+' DA',l:'CA Total'}].map((k,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, textAlign:'center', padding:'12px 8px' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'var(--or-deep)', fontFamily:'var(--font-display)' }}>{k.v}</p>
            <p style={{ fontSize:8, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginTop:2 }}>{k.l}</p>
          </div>
        ))}
      </div>

      {/* Graphique équipe */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:10 }}>
        <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:10 }}>CA Équipe — 6 mois</p>
        <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:64 }}>
          {mVals.map((m,i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span style={{ fontSize:7, color:'var(--or-deep)', fontWeight:700 }}>{m.val>0?m.val.toFixed(0):''}</span>
              <div style={{ width:'100%', borderRadius:'3px 3px 0 0', minHeight:3, background:'linear-gradient(180deg,var(--or),var(--or-deep))', height:Math.max(Math.round((m.val/maxM)*48),3)+'px' }}/>
              <span style={{ fontSize:7, color:'var(--text-muted)' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Classement consultantes */}
      {topC.length > 0 && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:10 }}>
          <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:10 }}>Classement consultantes</p>
          {topC.map((c,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4, alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:18, height:18, borderRadius:4, background:i===0?'linear-gradient(135deg,var(--or),var(--or-deep))':'rgba(210,183,149,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:i===0?'#fff':'var(--text-muted)' }}>{i+1}</div>
                  <span style={{ fontWeight:600, color:'var(--taupe)' }}>{c.name}</span>
                </div>
                <span style={{ color:'var(--or-deep)', fontWeight:700 }}>{c.ca.toFixed(0)} DA · {c.sales}v</span>
              </div>
              <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:3, height:4, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, width:Math.round((c.ca/maxCA)*100)+'%', background:'linear-gradient(90deg,var(--or),var(--or-deep))' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Santé portefeuille */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14 }}>
        <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:10 }}>Santé portefeuille</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[{v:rec,l:'Récents',c:'var(--green)'},{v:warn,l:'À relancer',c:'#d97706'},{v:urg,l:'Urgents',c:'var(--red)'}].map((k,i) => (
            <div key={i} style={{ background:`${k.c}0D`, border:`1px solid ${k.c}25`, borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
              <p style={{ fontSize:20, fontWeight:800, color:k.c, fontFamily:'var(--font-display)' }}>{k.v}</p>
              <p style={{ fontSize:8, color:'var(--text-muted)', marginTop:2 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ACTIVITÉ (depuis l'Agenda) ────────────────────────────────────
function ActiviteTab() {
  const { getFilteredEvents, getFilteredSales, user } = useAuth();
  const [filter, setFilter] = useState('all');

  const events = (() => {
    try { return JSON.parse(localStorage.getItem('le_cevents') || '[]'); } catch { return []; }
  })();
  const sales = getFilteredSales();
  const now = new Date();

  // Fusionner events + ventes dans un seul fil chronologique
  const allActivity = [
    ...events.map(e => ({ ...e, _type: 'event', _date: new Date(e.date || e.createdAt || now) })),
    ...sales.map(s => ({ ...s, _type: 'sale', _date: new Date(s.date || s.createdAt || now) })),
  ].sort((a, b) => b._date - a._date);

  const filtered = allActivity.filter(a => {
    if (filter === 'events') return a._type === 'event';
    if (filter === 'sales') return a._type === 'sale';
    return true;
  });

  const byMonth = {};
  filtered.forEach(a => {
    const key = a._date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(a);
  });

  return (
    <div style={{ padding: 16 }}>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['all', 'Tout'], ['events', '📅 Événements'], ['sales', '💰 Ventes']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid var(--or-border)', background: filter === k ? 'var(--or)' : 'var(--bg-card)', color: filter === k ? '#fff' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{l}</button>
        ))}
      </div>

      {/* Résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[{ v: events.length, l: 'Événements' }, { v: sales.length, l: 'Ventes' }].map((k, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--or-border)', borderRadius: 12, textAlign: 'center', padding: '11px 8px' }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--or-deep)', fontFamily: 'var(--font-display)' }}>{k.v}</p>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>{k.l}</p>
          </div>
        ))}
      </div>

      {Object.keys(byMonth).length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: 13 }}>
          Aucune activité enregistrée.
        </div>
      )}

      {Object.entries(byMonth).map(([month, items]) => (
        <div key={month} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--or-deep)', marginBottom: 8, padding: '4px 0', borderBottom: '1px solid var(--or-border)' }}>
            {month} · {items.length} activité{items.length > 1 ? 's' : ''}
          </div>
          {items.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(210,183,149,0.08)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: a._type === 'sale' ? 'rgba(45,122,74,0.12)' : 'rgba(61,107,158,0.12)', border: `1px solid ${a._type === 'sale' ? '#2d7a4a' : '#3d6b9e'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {a._type === 'sale' ? '💰' : '📅'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--taupe)' }}>
                  {a._type === 'sale' ? (a.client || a.product || 'Vente') : (a.title || a.type || 'Événement')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a._type === 'sale' && `${a.amount || a.amt || 0} ${a.currency || a.cur || 'DA'} · ${a.product || ''}`}
                  {a._type === 'event' && (a.loc || a.location || a.type || '')}
                </div>
                {a.consultant && <div style={{ fontSize: 10, color: 'var(--or-deep)', marginTop: 2 }}>👤 {a.consultant}</div>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                {a._date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const S = {
  pad:      { padding:16 },
  back:     { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block', fontFamily:'var(--font-body)' },
  secLabel: { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:8 },
  btnGoal:  { width:'100%', background:'var(--or-pale)', border:'1px solid var(--or-border)', borderRadius:12, padding:'11px', fontSize:11, fontWeight:700, color:'var(--or-deep)', cursor:'pointer', marginBottom:14, fontFamily:'var(--font-body)' },
  empty:    { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
  modal:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(4px)' },
  modalBox: { width:'100%', background:'var(--bg)', border:'1px solid var(--or-border)', borderRadius:'20px 20px 0 0', padding:20, maxHeight:'90vh', overflowY:'auto' },
};

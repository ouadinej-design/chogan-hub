import { useState } from 'react';
import AppLayout from '../../components/AppLayout';

export default function Agenda() {
  const [tab, setTab] = useState('agenda');

  return (
    <AppLayout title="Agenda" icon="📅">
      <div style={S.tabs}>
        <button style={{ ...S.tab, ...(tab==='agenda'?S.tabActive:{}) }} onClick={() => setTab('agenda')}>
          📅 Agenda
        </button>
        <button style={{ ...S.tab, ...(tab==='ventes'?S.tabActive:{}) }} onClick={() => setTab('ventes')}>
          💰 Ventes
        </button>
      </div>

      {tab === 'agenda' && (
        <div style={{ height:'calc(100vh - 110px)' }}>
          <iframe src="/agenda-app.html" style={{ width:'100%', height:'100%', border:'none' }} title="Agenda Chogan" />
        </div>
      )}

      {tab === 'ventes' && <VentesTab />}
    </AppLayout>
  );
}

const CATS_AG = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];
function VentesTab() {
  const [sales, setSales]   = useState(() => { try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; } });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({});

  const save    = (upd) => { localStorage.setItem('le_sales', JSON.stringify(upd)); setSales(upd); };
  const refresh = () => { try { setSales(JSON.parse(localStorage.getItem('le_sales')||'[]')); } catch {} };
  const deleteSale = (id) => { if (!window.confirm('Supprimer cette vente ?')) return; save(sales.filter(s=>s.id!==id)); };

  const openEdit = (v) => {
    setEditing(v.id);
    setForm({
      client: v.client||'', email: v.email||'', tel: v.tel||'',
      product: v.product||v.prod||'', qty: String(v.qty||1),
      category: v.category||v.cat||'Parfum',
      amount: String(v.amount||v.amt||''), currency: v.currency||v.cur||'€',
      date: v.date||new Date().toISOString().split('T')[0],
      note: v.note||'', consultant: v.consultant||'',
    });
  };
  const saveEdit = () => {
    save(sales.map(s => s.id !== editing ? s : {
      ...s, client:form.client, email:form.email, tel:form.tel,
      product:form.product, prod:form.product, qty:parseInt(form.qty)||1,
      category:form.category, cat:form.category,
      amount:parseFloat(form.amount)||0, amt:form.amount,
      currency:form.currency, cur:form.currency,
      date:form.date, note:form.note, consultant:form.consultant,
    }));
    setEditing(null);
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'2-digit'}) : '—';
  const totalEur = sales.filter(v=>(v.currency||v.cur)==='€').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);
  const totalDa  = sales.filter(v=>(v.currency||v.cur)==='DA').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);
  const filtered = sales.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.client||'').toLowerCase().includes(q)||(s.product||s.prod||'').toLowerCase().includes(q);
  });

  // ── Modal edit ──
  if (editing) return (
    <div style={A.pad}>
      <button style={A.back} onClick={() => setEditing(null)}>← Annuler</button>
      <div style={A.fiche}>
        <p style={A.ficheTitle}>✏️ Modifier la vente</p>
        {[['client','Cliente *','text'],['email','E-mail','email'],['tel','Téléphone','tel'],['product','Produit','text'],['note','Notes','text']].map(([k,l,t])=>(
          <div className="field" key={k}><label className="label">{l}</label>
            <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
        ))}
        <div className="grid-2">
          <div className="field"><label className="label">Quantité</label><input type="number" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} /></div>
          <div className="field"><label className="label">Catégorie</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATS_AG.map(c=><option key={c}>{c}</option>)}
            </select></div>
        </div>
        <div className="field"><label className="label">Montant</label>
          <div style={{display:'flex',gap:8}}>
            <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} style={{flex:1}} />
            <div style={{display:'flex',background:'var(--bg-dark)',border:'1px solid var(--or-border)',borderRadius:10,overflow:'hidden',flexShrink:0}}>
              {['DA','€'].map(cur=><button key={cur} style={{padding:'9px 12px',cursor:'pointer',fontSize:12,fontWeight:700,background:form.currency===cur?'linear-gradient(135deg,var(--or),var(--or-deep))':'transparent',color:form.currency===cur?'#fff':'var(--text-muted)',border:'none',fontFamily:'var(--font-body)'}} onClick={()=>setForm(p=>({...p,currency:cur}))}>{cur}</button>)}
            </div>
          </div></div>
        <div className="field"><label className="label">Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
        <div className="field"><label className="label">Consultante</label><input value={form.consultant} onChange={e=>setForm(p=>({...p,consultant:e.target.value}))} /></div>
      </div>
      <button className="btn-gold" onClick={saveEdit}>ENREGISTRER LES MODIFICATIONS</button>
    </div>
  );

  return (
    <div style={A.pad}>
      <div style={A.statsRow}>
        <div style={A.statBox}><span style={A.statN}>{sales.length}</span><span style={A.statL}>Ventes</span></div>
        <div style={A.statDiv}/>
        <div style={A.statBox}><span style={{...A.statN,fontSize:16}}>{totalEur.toFixed(2)}€</span><span style={A.statL}>CA €</span></div>
        {totalDa > 0 && <><div style={A.statDiv}/><div style={A.statBox}><span style={{...A.statN,fontSize:13}}>{totalDa.toLocaleString('fr-FR')}</span><span style={A.statL}>CA DA</span></div></>}
        <button style={A.refreshBtn} onClick={refresh}>↺</button>
      </div>
      <input placeholder="🔍 Cliente ou produit..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}} />
      {filtered.length === 0
        ? <div style={A.empty}><p style={{fontSize:32,marginBottom:8}}>💰</p><p>Aucune vente enregistrée.</p></div>
        : filtered.map(v => {
          const amount = parseFloat(v.amount||v.amt)||0;
          const currency = v.currency||v.cur||'€';
          const product  = v.product||v.prod||'';
          const items    = v.items||[];
          return (
            <div key={v.id} style={A.venteCard} className="fade-in">
              <div style={A.venteHeader}>
                <div style={{flex:1}}>
                  <p style={A.clientName}>{v.client||'—'}</p>
                  <div style={{display:'flex',gap:8,marginTop:3,flexWrap:'wrap'}}>
                    {v.email && <span style={A.meta}>✉ {v.email}</span>}
                    {v.tel   && <span style={A.meta}>📞 {v.tel}</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={A.venteAmt}>{amount} {currency}</p>
                  <p style={A.venteDate}>{fmt(v.date||v.createdAt)}</p>
                </div>
              </div>
              {items.length > 0
                ? <div style={A.itemsBlock}>{items.map((it,i)=>(
                    <div key={i} style={A.itemRow}>
                      <span style={{flex:1,fontSize:11}}>{it.prod} <span style={{color:'var(--text-muted)'}}>×{it.qty}</span></span>
                      <span className="badge badge-gold" style={{fontSize:9}}>{it.cat}</span>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginLeft:6}}>{it.amt} {currency}</span>
                    </div>))}</div>
                : product ? <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6,lineHeight:1.5}}>{product}</p> : null
              }
              {v.note && <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6,fontStyle:'italic'}}>📝 {v.note}</p>}
              {v.consultant && <p style={{fontSize:10,color:'var(--text-dim)',marginTop:4}}>Consultante : {v.consultant}</p>}
              <div style={A.actionRow}>
                <button style={A.editBtn} onClick={() => openEdit(v)}>✏️ Modifier</button>
                <button style={A.resetBtn} onClick={() => deleteSale(v.id)}>🗑 Réinitialiser</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

const A = {
  pad: { padding:16 },
  back: { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block' },
  fiche: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:16, marginBottom:12 },
  ficheTitle: { fontFamily:'var(--font-display)', fontSize:13, color:'var(--or-deep)', letterSpacing:'0.08em', marginBottom:14, paddingBottom:10, borderBottom:'1px solid var(--or-border)' },
  statsRow: { display:'flex', alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 16px', marginBottom:14, gap:8 },
  statBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 },
  statN: { fontFamily:'var(--font-display)', fontSize:20, color:'var(--or-deep)', lineHeight:1 },
  statL: { fontSize:9, color:'var(--text-muted)', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' },
  statDiv: { width:1, height:30, background:'var(--or-border)' },
  refreshBtn: { background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:14, fontFamily:'var(--font-body)' },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
  venteCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 14px', marginBottom:10 },
  venteHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  clientName: { fontSize:14, fontWeight:700, color:'var(--taupe)' },
  meta: { fontSize:10, color:'var(--text-muted)' },
  venteAmt: { fontSize:15, fontWeight:700, color:'var(--or-deep)' },
  venteDate: { fontSize:10, color:'var(--text-muted)', marginTop:2 },
  itemsBlock: { background:'rgba(210,183,149,0.06)', borderRadius:8, padding:'8px 10px', marginTop:6 },
  itemRow: { display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'1px solid rgba(210,183,149,0.12)' },
  noteText: { fontSize:11, color:'var(--text-muted)', marginTop:6, fontStyle:'italic' },
  consulText: { fontSize:10, color:'var(--text-dim)', marginTop:4 },
  actionRow: { display:'flex', gap:8, marginTop:10, paddingTop:8, borderTop:'1px solid var(--or-border)' },
  editBtn: { flex:1, padding:'7px', background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  resetBtn: { flex:1, padding:'7px', background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', color:'var(--red)', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
};

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--or-border)' },
  tab: { flex:1, padding:'12px', background:'none', color:'var(--text-muted)', fontSize:13, borderBottom:'2px solid transparent', cursor:'pointer', border:'none', fontFamily:'var(--font-body)' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  pad: { padding:16 },
  statsRow: { display:'flex', alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 16px', marginBottom:14, gap:8 },
  statBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 },
  statN: { fontFamily:'var(--font-display)', fontSize:20, color:'var(--or-deep)', lineHeight:1 },
  statL: { fontSize:9, color:'var(--text-muted)', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' },
  statDiv: { width:1, height:30, background:'var(--or-border)' },
  refreshBtn: { background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:14, fontFamily:'var(--font-body)' },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
  venteCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 14px', marginBottom:10 },
  venteHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  clientName: { fontSize:14, fontWeight:700, color:'var(--taupe)' },
  meta: { fontSize:10, color:'var(--text-muted)' },
  venteAmt: { fontSize:15, fontWeight:700, color:'var(--or-deep)' },
  venteDate: { fontSize:10, color:'var(--text-muted)', marginTop:2 },
  itemsBlock: { background:'rgba(210,183,149,0.06)', borderRadius:8, padding:'8px 10px', marginTop:6 },
  itemRow: { display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'1px solid rgba(210,183,149,0.12)' },
  noteText: { fontSize:11, color:'var(--text-muted)', marginTop:6, fontStyle:'italic' },
  consulText: { fontSize:10, color:'var(--text-dim)', marginTop:4 },
};

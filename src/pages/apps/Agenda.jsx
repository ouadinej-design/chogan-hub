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

function VentesTab() {
  const [sales, setSales] = useState(() => {
    try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');

  const refresh = () => {
    try { setSales(JSON.parse(localStorage.getItem('le_sales')||'[]')); } catch {}
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'2-digit'}) : '—';

  const totalEur = sales.filter(v=>(v.currency||v.cur)==='€').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);
  const totalDa  = sales.filter(v=>(v.currency||v.cur)==='DA').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);

  const filtered = sales.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.client||'').toLowerCase().includes(q) || (s.product||s.prod||'').toLowerCase().includes(q);
  });

  return (
    <div style={S.pad}>
      {/* Stats rapides */}
      <div style={S.statsRow}>
        <div style={S.statBox}>
          <span style={S.statN}>{sales.length}</span>
          <span style={S.statL}>Ventes</span>
        </div>
        <div style={S.statDiv}/>
        <div style={S.statBox}>
          <span style={{ ...S.statN, fontSize:16 }}>{totalEur.toFixed(2)}€</span>
          <span style={S.statL}>CA en €</span>
        </div>
        {totalDa > 0 && <>
          <div style={S.statDiv}/>
          <div style={S.statBox}>
            <span style={{ ...S.statN, fontSize:14 }}>{totalDa.toLocaleString('fr-FR')}</span>
            <span style={S.statL}>CA en DA</span>
          </div>
        </>}
        <button style={S.refreshBtn} onClick={refresh}>↺</button>
      </div>

      <input
        placeholder="🔍 Cliente ou produit..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom:12 }}
      />

      {filtered.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize:32, marginBottom:8 }}>💰</p>
          <p>Aucune vente enregistrée.</p>
          <p style={{ fontSize:12, marginTop:4 }}>Créez un bon de commande dans l'app Commandes ou ajoutez une vente dans l'Agenda.</p>
        </div>
      ) : (
        filtered.map(v => {
          const amount   = parseFloat(v.amount || v.amt) || 0;
          const currency = v.currency || v.cur || '€';
          const product  = v.product || v.prod || '';
          const items    = v.items || [];
          return (
            <div key={v.id} style={S.venteCard} className="fade-in">
              <div style={S.venteHeader}>
                <div style={{ flex:1 }}>
                  <p style={S.clientName}>{v.client || '—'}</p>
                  <div style={{ display:'flex', gap:8, marginTop:3, flexWrap:'wrap' }}>
                    {v.email && <span style={S.meta}>✉ {v.email}</span>}
                    {v.tel   && <span style={S.meta}>📞 {v.tel}</span>}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={S.venteAmt}>{amount} {currency}</p>
                  <p style={S.venteDate}>{fmt(v.date || v.createdAt)}</p>
                </div>
              </div>

              {/* Détail multi-produits */}
              {items.length > 0 ? (
                <div style={S.itemsBlock}>
                  {items.map((it, i) => (
                    <div key={i} style={S.itemRow}>
                      <span style={{ flex:1, fontSize:11, color:'var(--taupe)' }}>
                        {it.prod} <span style={{ color:'var(--text-muted)' }}>×{it.qty}</span>
                      </span>
                      <span className="badge badge-gold" style={{ fontSize:9 }}>{it.cat}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', marginLeft:6 }}>
                        {it.amt} {currency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : product ? (
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6, lineHeight:1.5 }}>{product}</p>
              ) : null}

              {v.category && !items.length && (
                <span className="badge badge-gold" style={{ marginTop:6, display:'inline-block' }}>{v.category}</span>
              )}
              {v.note && <p style={S.noteText}>📝 {v.note}</p>}
              {v.consultant && <p style={S.consulText}>Consultante : {v.consultant}</p>}
            </div>
          );
        })
      )}
    </div>
  );
}

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

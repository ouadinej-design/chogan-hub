import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

const CATEGORIES = {
  income: ['Commissions Chogan','Bonus recrutement','Bonus équipe','Remboursement'],
  expense: ['Commandes produits','Transport','Marketing','Formation','Autre'],
};

export default function Wallet() {
  const { getWalletStats, addWalletEntry } = useData();
  const [tab, setTab] = useState('dashboard');
  const [form, setForm] = useState({ type:'income', amount:'', category:'Commissions Chogan', description:'', date:new Date().toISOString().split('T')[0] });
  const [saved, setSaved] = useState('');
  const stats = getWalletStats();

  const monthEntries = stats.entries.filter(e => {
    const now = new Date();
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome = monthEntries.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const monthExpense = monthEntries.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);

  const handleAdd = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    addWalletEntry({ ...form, amount: parseFloat(form.amount) });
    setSaved('✓ Entrée ajoutée.');
    setForm(p => ({ ...p, amount:'', description:'' }));
    setTimeout(() => setSaved(''), 2000);
  };

  return (
    <AppLayout title="Wallet" icon="💰">
      <div style={S.tabs}>
        {['dashboard','add','history'].map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>setTab(t)}>
            {t==='dashboard'?'📊 Tableau':t==='add'?'➕ Ajouter':'📋 Historique'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div style={{ padding:16 }}>
          {/* Balance card */}
          <div style={S.balanceCard}>
            <div style={S.balanceLabel}>Solde Total</div>
            <div style={S.balanceAmount}>{stats.balance.toFixed(2)}€</div>
            <div style={S.balanceRow}>
              <span style={{ color:'var(--green)' }}>↑ {stats.income.toFixed(2)}€</span>
              <span style={{ color:'var(--text-dim)', fontSize:12 }}>|</span>
              <span style={{ color:'var(--red)' }}>↓ {stats.expense.toFixed(2)}€</span>
            </div>
          </div>

          {/* This month */}
          <div style={S.sectionTitle}>Ce mois-ci</div>
          <div className="grid-2" style={{ marginBottom:16 }}>
            <div style={{ ...S.statCard, borderColor:'rgba(76,175,125,0.3)' }}>
              <span style={S.statIcon}>💚</span>
              <span style={{ ...S.statAmount, color:'var(--green)' }}>{monthIncome.toFixed(2)}€</span>
              <span style={S.statLabel}>Revenus</span>
            </div>
            <div style={{ ...S.statCard, borderColor:'rgba(224,85,85,0.3)' }}>
              <span style={S.statIcon}>💸</span>
              <span style={{ ...S.statAmount, color:'var(--red)' }}>{monthExpense.toFixed(2)}€</span>
              <span style={S.statLabel}>Dépenses</span>
            </div>
          </div>

          {/* Recent */}
          <div style={S.sectionTitle}>Récents</div>
          {stats.entries.slice().reverse().slice(0,8).map(e => (
            <div key={e.id} style={S.entryRow} className="fade-in">
              <span style={{ fontSize:20 }}>{e.type==='income'?'💚':'💸'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{e.category}</div>
                {e.description && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{e.description}</div>}
                <div style={{ fontSize:10, color:'var(--text-dim)' }}>{new Date(e.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <span style={{ fontWeight:700, color:e.type==='income'?'var(--green)':'var(--red)', fontSize:14 }}>
                {e.type==='income'?'+':'-'}{e.amount}€
              </span>
            </div>
          ))}
          {stats.entries.length === 0 && <div style={S.empty}>Aucune entrée. Commencez par ajouter vos revenus !</div>}
        </div>
      )}

      {tab === 'add' && (
        <div style={{ padding:16 }}>
          {saved && <div style={S.success}>{saved}</div>}
          <div style={S.typeRow}>
            {[['income','💚 Revenu'],['expense','💸 Dépense']].map(([type,label]) => (
              <button key={type} style={{ ...S.typeBtn, ...(form.type===type?{ background:'var(--gold-pale)', border:'1px solid var(--gold)', color:'var(--gold)'}:{}) }}
                onClick={()=>setForm(p=>({...p,type,category:CATEGORIES[type][0]}))}>
                {label}
              </button>
            ))}
          </div>
          <div className="field">
            <label className="label">Montant (€) *</label>
            <input type="number" step="0.01" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" />
          </div>
          <div className="field">
            <label className="label">Catégorie</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Détail..." />
          </div>
          <div className="field">
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
          </div>
          <button className="btn-gold" onClick={handleAdd}>AJOUTER</button>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ padding:16 }}>
          {stats.entries.slice().reverse().map(e => (
            <div key={e.id} style={S.entryRow} className="fade-in">
              <span style={{ fontSize:20 }}>{e.type==='income'?'💚':'💸'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{e.category}</div>
                {e.description && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{e.description}</div>}
                <div style={{ fontSize:10, color:'var(--text-dim)' }}>{new Date(e.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <span style={{ fontWeight:700, color:e.type==='income'?'var(--green)':'var(--red)', fontSize:14 }}>
                {e.type==='income'?'+':'-'}{e.amount}€
              </span>
            </div>
          ))}
          {stats.entries.length === 0 && <div style={S.empty}>Aucune entrée.</div>}
        </div>
      )}
    </AppLayout>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)' },
  tab: { flex:1, padding:'10px 6px', background:'none', color:'var(--text-muted)', fontSize:12, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  balanceCard: {
    background:'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
    border:'1px solid var(--border-strong)',
    borderRadius:20, padding:'24px', textAlign:'center', marginBottom:20,
  },
  balanceLabel: { fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 },
  balanceAmount: { fontFamily:'var(--font-display)', fontSize:42, color:'var(--gold)', marginBottom:10 },
  balanceRow: { display:'flex', justifyContent:'center', gap:16, fontSize:13 },
  sectionTitle: { fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:10, fontWeight:700 },
  statCard: { background:'var(--bg-card)', border:'1px solid', borderRadius:14, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  statIcon: { fontSize:24 },
  statAmount: { fontFamily:'var(--font-display)', fontSize:22, fontWeight:700 },
  statLabel: { fontSize:11, color:'var(--text-muted)' },
  entryRow: {
    display:'flex', alignItems:'center', gap:12,
    padding:'12px 0', borderBottom:'1px solid var(--border)',
  },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'40px 0', fontSize:13 },
  typeRow: { display:'flex', gap:10, marginBottom:16 },
  typeBtn: { flex:1, padding:'10px', background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:10, fontSize:13, cursor:'pointer' },
  success: { background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, marginBottom:14 },
};

import { useState, useEffect } from 'react';
import { PERFUMES } from '../../utils/choganData';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

const TABS = [
  { id:'bon',     label:'📋 Bon de commande' },
  { id:'clients', label:'👥 Clients' },
];

export default function Orders() {
  const [tab, setTab] = useState('bon');
  return (
    <AppLayout title="Commandes" icon="🛒">
      <div style={S.tabsWrap}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...S.tab, ...(tab===t.id?S.tabActive:{}) }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'bon'     && <BonCommandeTab />}
      {tab === 'clients' && <ClientsTab />}
    </AppLayout>
  );
}

// ── BON DE COMMANDE ──────────────────────────────────────────────
const CATS  = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];

function BonCommandeTab() {
  const [cart, setCart]       = useState([]);
  const [search, setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);

  const [client, setClient]         = useState('');
  const [email, setEmail]           = useState('');
  const [tel, setTel]               = useState('');
  const [prod, setProd]             = useState('');
  const [qty, setQty]               = useState('0');
  const [cat, setCat]               = useState('Parfum');
  const [amt, setAmt]               = useState('');
  const [cur, setCur]               = useState('€');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]             = useState('');
  const [consultant, setConsultant] = useState('');

  const filtered = PERFUMES.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.ref.includes(search);
  });

  useEffect(() => {
    if (cart.length === 0) { setProd(''); setQty('0'); setAmt(''); return; }
    setProd(cart.map(c => `N°${c.ref} ${c.name} ${c.size} ×${c.qty}`).join(', '));
    setQty(String(cart.reduce((s,c) => s+c.qty, 0)));
    setAmt(cart.reduce((s,c) => s+c.price*c.qty, 0).toFixed(2));
  }, [cart]);

  const addToCart = (p, size) => {
    const key = `${p.id}-${size}`;
    setCart(prev => {
      const ex = prev.find(c => c.key===key);
      if (ex) return prev.map(c => c.key===key ? {...c,qty:c.qty+1} : c);
      return [...prev, { key, id:p.id, name:p.name, ref:p.ref, size, price:p.prices?.[size]||35, qty:1 }];
    });
  };

  const updateCart = (newCart) => setCart(newCart);
  const totalEur = cart.reduce((s,c) => s+c.price*c.qty, 0);

  const saveToAgenda = () => {
    if (!client.trim()) { alert('Entrez le nom de la cliente.'); return; }
    try {
      const existing = JSON.parse(localStorage.getItem('le_sales')||'[]');
      const items = cart.map(c => ({ prod:`N°${c.ref} ${c.name} ${c.size}`, qty:c.qty, cat, amt:parseFloat((c.price*c.qty).toFixed(2)) }));
      const sale = {
        id: `BC-${Date.now()}`,
        client, email, tel,
        items,
        product: prod,
        qty: String(cart.reduce((s,c)=>s+c.qty,0)),
        amount: parseFloat(amt)||0,
        currency: cur,
        category: cat,
        date, note, consultant,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('le_sales', JSON.stringify([sale, ...existing]));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { console.warn(e); }
  };

  const exportBC = () => {
    const lines = [
      '📋 BON DE COMMANDE — CHOGAN',
      `👤 Cliente : ${client||'—'}`,
      `📅 ${new Date(date).toLocaleDateString('fr-FR')}`,
      '─────────────────',
      ...cart.map(c => `• N°${c.ref} ${c.name} ${c.size} ×${c.qty} = ${(c.price*c.qty).toFixed(2)}€`),
      '─────────────────',
      `💶 TOTAL : ${amt} ${cur}`,
      ...(note ? [`📝 ${note}`] : []),
    ];
    navigator.clipboard?.writeText(lines.join('\n'))
      .then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2500); });
  };

  if (showForm) return (
    <div style={S.pad}>
      <button style={S.back} onClick={() => setShowForm(false)}>← Retour catalogue</button>
      {saved && <div style={S.ok}>✅ Vente enregistrée dans l'Agenda !</div>}

      <div style={S.fiche}>
        <p style={S.ficheTitle}>✦ Nouvelle transaction</p>

        <div className="field"><label className="label">Cliente *</label>
          <input value={client} onChange={e=>setClient(e.target.value)} placeholder="Nom de la cliente" /></div>
        <div className="grid-2">
          <div className="field"><label className="label">E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@email.com" /></div>
          <div className="field"><label className="label">Téléphone</label>
            <input type="tel" value={tel} onChange={e=>setTel(e.target.value)} placeholder="+33 6..." /></div>
        </div>

        {/* Détail produits du panier */}
        {cart.length > 0 && (
          <div style={S.cartBlock}>
            <p style={S.cartTitle}>🛒 {cart.reduce((s,c)=>s+c.qty,0)} article(s)</p>
            {cart.map(c => (
              <div key={c.key} style={S.cartRow}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>N°{c.ref} {c.name} {c.size}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:6 }}>×{c.qty}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--or-deep)' }}>{(c.price*c.qty).toFixed(2)}€</span>
                <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:13, padding:'0 4px' }}
                  onClick={() => updateCart(cart.map(x=>x.key===c.key?{...x,qty:Math.max(0,x.qty-1)}:x).filter(x=>x.qty>0))}>−</button>
                <button style={{ background:'none', border:'none', color:'var(--green)', cursor:'pointer', fontSize:13, padding:'0 4px' }}
                  onClick={() => updateCart(cart.map(x=>x.key===c.key?{...x,qty:x.qty+1}:x))}>+</button>
                <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:13 }}
                  onClick={() => updateCart(cart.filter(x=>x.key!==c.key))}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="field"><label className="label">Produit(s) Chogan</label>
          <input value={prod} onChange={e=>setProd(e.target.value)} placeholder="Auto-rempli depuis le catalogue" /></div>

        <div className="grid-2">
          <div className="field"><label className="label">Quantité</label>
            <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} /></div>
          <div className="field"><label className="label">Catégorie</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="field"><label className="label">Montant</label>
          <div style={{ display:'flex', gap:8 }}>
            <input type="number" placeholder="0.00" value={amt} onChange={e=>setAmt(e.target.value)} style={{ flex:1 }} />
            <div style={S.curSel}>
              {['DA','€'].map(c => (
                <button key={c} style={{ ...S.curBtn, ...(cur===c?S.curActive:{}) }} onClick={() => setCur(c)}>{c}</button>
              ))}
            </div>
          </div>
          {totalEur > 0 && <p style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>Total calculé : {totalEur.toFixed(2)}€</p>}
        </div>

        <div className="field"><label className="label">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>

        <div className="field"><label className="label">Notes & commentaires</label>
          <textarea rows={2} placeholder="Préférences, allergies..." value={note} onChange={e=>setNote(e.target.value)} style={{ resize:'none' }} /></div>

        <div className="field"><label className="label">Consultante</label>
          <input value={consultant} onChange={e=>setConsultant(e.target.value)} placeholder="Nom de la consultante" /></div>
      </div>

      <button className="btn-gold" onClick={saveToAgenda}>✦ Valider la transaction → Agenda</button>
      <button className="btn-outline" style={{ width:'100%', marginTop:8 }} onClick={exportBC}>
        {copied ? '✓ Copié !' : '📋 Copier le bon de commande'}
      </button>
    </div>
  );

  return (
    <div style={S.pad}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={S.secLabel}>Catalogue ({PERFUMES.length} réf.)</p>
        <button className="btn-gold" style={{ padding:'8px 14px', width:'auto' }} onClick={() => setShowForm(true)}>
          🛒 {cart.reduce((s,c)=>s+c.qty,0)} — Récap
        </button>
      </div>
      <input placeholder="🔍 Ref ou nom..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:10 }}>
            <p style={{ fontSize:10, fontWeight:700, color: p.gender==='h'?'#3d6b9e':p.gender==='f'?'#9e5a7a':'#4a7c59', marginBottom:4 }}>N°{p.ref} · {p.name}</p>
            {p.sizes.map(sz => (
              <button key={sz} style={S.sizeBtn} onClick={() => addToCart(p, sz)}>
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>{sz}</span>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)' }}>{p.prices?.[sz]}€ +</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VENTES (lit le_sales de l'agenda) ───────────────────────────
function VentesTab() {
  const [sales, setSales] = useState(() => {
    try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const refresh = () => {
    try { setSales(JSON.parse(localStorage.getItem('le_sales')||'[]')); } catch {}
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'2-digit' }) : '—';

  const totalRevenu = sales.reduce((s,v) => {
    const a = parseFloat(v.amount || v.amt) || 0;
    return s + (v.currency === '€' || v.cur === '€' ? a : 0);
  }, 0);

  const filtered = sales.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      return (s.client||'').toLowerCase().includes(q) || (s.product||s.prod||'').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={S.pad}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>{sales.length} vente(s)</p>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)' }}>{totalRevenu.toFixed(2)}€</p>
        </div>
        <button className="btn-outline" style={{ padding:'6px 12px' }} onClick={refresh}>↺ Actualiser</button>
      </div>
      <input placeholder="🔍 Cliente ou produit..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
      {filtered.length === 0
        ? <div style={S.empty}>Aucune vente. Créez un bon de commande et validez-le.</div>
        : filtered.map(v => {
          const amount = parseFloat(v.amount || v.amt) || 0;
          const currency = v.currency || v.cur || '€';
          const product = v.product || v.prod || '';
          const items = v.items || [];
          return (
            <div key={v.id} style={S.venteCard}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--taupe)' }}>{v.client}</p>
                  {v.email && <p style={{ fontSize:11, color:'var(--text-muted)' }}>{v.email}</p>}
                  {v.tel   && <p style={{ fontSize:11, color:'var(--text-muted)' }}>{v.tel}</p>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:15, fontWeight:700, color:'var(--or-deep)' }}>{amount} {currency}</p>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>{fmt(v.date || v.createdAt)}</p>
                </div>
              </div>
              {/* Détail produits */}
              {items.length > 0 ? (
                <div style={{ marginTop:6 }}>
                  {items.map((it, i) => (
                    <div key={i} style={S.itemRow}>
                      <span style={{ flex:1, fontSize:11 }}>{it.prod} ×{it.qty}</span>
                      <span className="badge badge-gold" style={{ fontSize:9 }}>{it.cat}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:'var(--or-deep)', marginLeft:6 }}>{it.amt}{currency}</span>
                    </div>
                  ))}
                </div>
              ) : product ? (
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{product}</p>
              ) : null}
              {v.note && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4, fontStyle:'italic' }}>📝 {v.note}</p>}
              {v.consultant && <p style={{ fontSize:10, color:'var(--text-dim)', marginTop:4 }}>Consultante: {v.consultant}</p>}
            </div>
          );
        })
      }
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────
function ClientsTab() {
  const { getClients, addClient, deleteClient, getLoyaltyCards } = useData();
  const [view, setView]     = useState('list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm]     = useState({ firstName:'', lastName:'', email:'', phone:'', address:'', birthday:'' });
  const [saved, setSaved]   = useState('');

  const clients = getClients();
  const cards   = getLoyaltyCards();
  const LEVEL_COLOR = { Bronze:'#cd7f32', Argent:'#a8a9ad', Or:'var(--or-deep)' };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  const handleAdd = () => {
    if (!form.firstName || !form.lastName) { alert('Prénom et nom requis.'); return; }
    addClient(form);
    setSaved(`✓ ${form.firstName} ${form.lastName} ajouté(e).`);
    setForm({ firstName:'', lastName:'', email:'', phone:'', address:'', birthday:'' });
    setTimeout(() => { setSaved(''); setView('list'); }, 2000);
  };

  if (selected) {
    const card  = cards.find(c => c.clientId === selected.id);
    const level = card?.level || 'Bronze';
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={() => setSelected(null)}>← Retour</button>
        <div style={S.fiche}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{ ...S.avatar, width:48, height:48, fontSize:16, margin:'0 auto 10px' }}>
              {selected.firstName.charAt(0)}{selected.lastName.charAt(0)}
            </div>
            <p style={{ fontSize:16, fontWeight:700 }}>{selected.firstName} {selected.lastName}</p>
            <span className="badge" style={{ background:`${LEVEL_COLOR[level]}22`, color:LEVEL_COLOR[level], border:`1px solid ${LEVEL_COLOR[level]}44`, marginTop:6 }}>
              ✦ {level}
            </span>
          </div>
          {[['Email',selected.email],['Téléphone',selected.phone],['Adresse',selected.address],['Anniversaire',selected.birthday],
            ['Commandes',selected.totalOrders||0],['Dépenses',`${selected.totalSpent||0}€`],['Points fidélité',card?.points||0]
          ].filter(([,v])=>v).map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--or-border)', fontSize:13 }}>
              <span style={{ color:'var(--text-muted)' }}>{l}</span>
              <span style={{ fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <button style={{ ...S.back, color:'var(--red)', marginTop:14 }} onClick={() => { deleteClient(selected.id); setSelected(null); }}>
            🗑 Supprimer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.pad}>
      <div style={S.miniTabs}>
        {[['list',`Liste (${clients.length})`],['add','➕ Ajouter']].map(([v,l]) => (
          <button key={v} style={{ ...S.miniTab, ...(view===v?S.miniActive:{}) }} onClick={() => setView(v)}>{l}</button>
        ))}
      </div>

      {view === 'list' && (
        <>
          <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
          {filtered.length === 0
            ? <div style={S.empty}>Aucun client</div>
            : filtered.map(c => {
              const card  = cards.find(x => x.clientId === c.id);
              const level = card?.level || 'Bronze';
              return (
                <div key={c.id} style={S.clientRow} onClick={() => setSelected(c)}>
                  <div style={S.avatar}>{c.firstName.charAt(0)}{c.lastName.charAt(0)}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{c.firstName} {c.lastName}</p>
                    {c.phone && <p style={{ fontSize:11, color:'var(--text-muted)' }}>{c.phone}</p>}
                    <div style={{ display:'flex', gap:6, marginTop:4 }}>
                      <span className="badge badge-gold">{c.totalOrders||0} cdes</span>
                      <span className="badge" style={{ background:`${LEVEL_COLOR[level]}22`, color:LEVEL_COLOR[level], border:`1px solid ${LEVEL_COLOR[level]}44`, fontSize:10 }}>{level}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--or-deep)' }}>{c.totalSpent||0}€</p>
                    <p style={{ fontSize:10, color:'var(--text-dim)', marginTop:2 }}>{card?.points||0} pts</p>
                  </div>
                </div>
              );
            })
          }
        </>
      )}

      {view === 'add' && (
        <>
          {saved && <div style={S.ok}>{saved}</div>}
          {[['firstName','Prénom *','text'],['lastName','Nom *','text'],['email','Email','email'],
            ['phone','Téléphone','tel'],['address','Adresse','text'],['birthday','Anniversaire','date']
          ].map(([k,l,t]) => (
            <div className="field" key={k}>
              <label className="label">{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l.replace(' *','')} />
            </div>
          ))}
          <button className="btn-gold" onClick={handleAdd}>AJOUTER LE CLIENT</button>
        </>
      )}
    </div>
  );
}

const S = {
  tabsWrap: { display:'flex', borderBottom:'1px solid var(--or-border)', overflowX:'auto', scrollbarWidth:'none' },
  tab: { flex:1, padding:'12px 8px', background:'none', color:'var(--text-muted)', fontSize:12, borderBottom:'2px solid transparent', whiteSpace:'nowrap' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  pad: { padding:16 },
  back: { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block' },
  ok: { background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'10px 14px', color:'var(--green)', fontSize:13, fontWeight:600, marginBottom:12 },
  secLabel: { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)' },
  fiche: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:16, marginBottom:12 },
  ficheTitle: { fontFamily:'var(--font-display)', fontSize:13, color:'var(--or-deep)', letterSpacing:'0.08em', marginBottom:14, paddingBottom:10, borderBottom:'1px solid var(--or-border)' },
  cartBlock: { background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:10, padding:'10px 12px', marginBottom:12 },
  cartTitle: { fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:8 },
  cartRow: { display:'flex', alignItems:'center', gap:6, padding:'5px 0', borderBottom:'1px solid var(--or-border)' },
  curSel: { display:'flex', background:'var(--bg-dark)', border:'1px solid var(--or-border)', borderRadius:10, overflow:'hidden', flexShrink:0 },
  curBtn: { padding:'9px 13px', cursor:'pointer', fontSize:12, fontWeight:700, background:'transparent', color:'var(--text-muted)', border:'none', fontFamily:'var(--font-body)' },
  curActive: { background:'linear-gradient(135deg, var(--or), var(--or-deep))', color:'#fff' },
  sizeBtn: { display:'flex', justifyContent:'space-between', width:'100%', padding:'4px 6px', marginBottom:3, background:'rgba(210,183,149,0.06)', border:'1px solid var(--or-border)', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-body)' },
  venteCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 14px', marginBottom:10 },
  itemRow: { display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'1px solid rgba(210,183,149,0.15)' },
  clientRow: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px', marginBottom:8, cursor:'pointer' },
  avatar: { width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg, var(--or), var(--or-deep))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 },
  miniTabs: { display:'flex', gap:8, marginBottom:14 },
  miniTab: { flex:1, padding:'9px', background:'transparent', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:10, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' },
  miniActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 0', fontSize:13 },
};

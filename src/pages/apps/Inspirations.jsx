import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';
import { PERFUMES, PRODUITS_PROMO, GENDER_COLOR } from '../../utils/choganData';

const TABS = [
  { id:'inspirations',label:'🌹 Inspirations' },
  { id:'promo',       label:'🏷 Promo' },
  { id:'convert',     label:'💱 Convertisseur' },
];

export default function Orders() {
  const [tab, setTab] = useState('inspirations');
  return (
    <AppLayout title="Inspirations" icon="🌹">
      <div style={S.tabsWrap}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...S.tab, ...(tab===t.id?S.tabActive:{}) }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'inspirations' && <InspirationsTab />}
      {tab === 'promo'        && <PromoTab />}
      {tab === 'convert'      && <ConvertisseurTab />}
    </AppLayout>
  );
}

// ── COMMANDES ────────────────────────────────────────────────────
function CommandesTab() {
  const { getOrders, addOrder, updateOrderStatus } = useData();
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ clientFirstName:'',clientLastName:'',clientEmail:'',clientPhone:'',notes:'' });
  const [cart, setCart] = useState([]);
  const [success, setSuccess] = useState('');
  const orders = getOrders();

  const addToCart = (p, size) => {
    const key = `${p.id}-${size}`;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key===key?{...i,qty:i.qty+1}:i);
      return [...prev, { key, id:p.id, name:p.name, ref:p.ref, size, price:p.prices?.[size]||35, qty:1 }];
    });
  };
  const cartTotal = cart.reduce((s,i) => s+i.price*i.qty, 0);

  const handleSubmit = () => {
    if (!form.clientFirstName || !form.clientLastName || cart.length === 0) { alert('Remplissez le client et ajoutez des produits.'); return; }
    const order = addOrder({ ...form, items: cart, total: cartTotal });
    setSuccess(`✓ Commande ${order.id} créée ! Client, fidélité et agenda mis à jour automatiquement.`);
    setForm({ clientFirstName:'',clientLastName:'',clientEmail:'',clientPhone:'',notes:'' });
    setCart([]);
    setTimeout(() => { setSuccess(''); setView('list'); }, 3000);
  };

  return (
    <div style={S.pad}>
      <div style={S.miniTabs}>
        <button style={{ ...S.miniTab, ...(view==='list'?S.miniActive:{}) }} onClick={() => setView('list')}>Liste ({orders.length})</button>
        <button style={{ ...S.miniTab, ...(view==='new'?S.miniActive:{}) }} onClick={() => setView('new')}>➕ Nouvelle</button>
      </div>

      {view === 'list' && (
        orders.length === 0 ? <div style={S.empty}>Aucune commande</div> :
        orders.slice().reverse().map(o => (
          <div key={o.id} style={S.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>{o.id}</span>
              <span className="badge badge-gold">{o.status}</span>
            </div>
            <p style={{ fontSize:14, fontWeight:700 }}>{o.clientName}</p>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
              <span>{o.items?.length||0} produit(s)</span>
              <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{o.total}€</span>
            </div>
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              {['En cours','Livré','Annulé'].map(s => (
                <button key={s} style={{ flex:1, padding:'6px 4px', background: o.status===s?'var(--or-pale)':'transparent', border:'1px solid var(--or-border)', borderRadius:8, fontSize:10, color: o.status===s?'var(--or-deep)':'var(--text-muted)', cursor:'pointer' }}
                  onClick={() => updateOrderStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          </div>
        ))
      )}

      {view === 'new' && (
        <div>
          {success && <div style={S.successMsg}>{success}</div>}
          <div style={S.section}>
            <p style={S.secLabel}>👤 Client</p>
            <div className="grid-2">
              <div className="field"><label className="label">Prénom *</label><input value={form.clientFirstName} onChange={e=>setForm(p=>({...p,clientFirstName:e.target.value}))} placeholder="Prénom" /></div>
              <div className="field"><label className="label">Nom *</label><input value={form.clientLastName} onChange={e=>setForm(p=>({...p,clientLastName:e.target.value}))} placeholder="Nom" /></div>
            </div>
            <div className="field"><label className="label">Email</label><input type="email" value={form.clientEmail} onChange={e=>setForm(p=>({...p,clientEmail:e.target.value}))} /></div>
            <div className="field"><label className="label">Téléphone</label><input type="tel" value={form.clientPhone} onChange={e=>setForm(p=>({...p,clientPhone:e.target.value}))} /></div>
          </div>
          <div style={S.section}>
            <p style={S.secLabel}>💎 Produits (cliquez pour ajouter)</p>
            <div style={S.prodGrid}>
              {PERFUMES.slice(0, 24).map(p => (
                <div key={p.id} style={S.prodCard} onClick={() => addToCart(p, p.sizes[0])}>
                  <span style={{ fontSize:10, color: GENDER_COLOR[p.gender], fontWeight:700 }}>N°{p.ref}</span>
                  <span style={{ fontSize:11, fontWeight:600, lineHeight:1.3 }}>{p.name}</span>
                  <span style={{ fontSize:12, color:'var(--or-deep)', fontWeight:700 }}>{p.prices?.[p.sizes[0]]}€</span>
                </div>
              ))}
            </div>
          </div>
          {cart.length > 0 && (
            <div style={S.section}>
              <p style={S.secLabel}>🛒 Panier</p>
              {cart.map(i => (
                <div key={i.key} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{i.name} — {i.size}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{i.qty} × {i.price}€</p>
                  </div>
                  <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{i.qty*i.price}€</span>
                  <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }} onClick={() => setCart(c=>c.filter(x=>x.key!==i.key))}>✕</button>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, borderTop:'1px solid var(--or-border)', paddingTop:10 }}>
                <span>Total</span><span style={{ color:'var(--or-deep)' }}>{cartTotal}€</span>
              </div>
            </div>
          )}
          <button className="btn-gold" onClick={handleSubmit}>CRÉER LA COMMANDE</button>
          <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:8 }}>Crée automatiquement : fiche client · carte fidélité · agenda</p>
        </div>
      )}
    </div>
  );
}

// ── INSPIRATIONS ─────────────────────────────────────────────────
function InspirationsTab() {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('tous');
  const filtered = PERFUMES.filter(p => {
    if (gender !== 'tous' && p.gender !== gender) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.ref.includes(search);
    }
    return true;
  });
  return (
    <div style={S.pad}>
      <input placeholder="🔍 Nom, marque ou référence..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
      <div style={S.filterRow}>
        {[['tous','Tous'],['homme','♂ Homme'],['femme','♀ Femme'],['mixte','⚧ Mixte']].map(([v,l]) => (
          <button key={v} style={{ ...S.filterBtn, ...(gender===v?S.filterActive:{}) }} onClick={() => setGender(v)}>{l}</button>
        ))}
      </div>
      <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>{filtered.length} référence(s)</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...S.card, borderLeft:`3px solid ${GENDER_COLOR[p.gender]}` }}>
            <p style={{ fontSize:11, fontWeight:700, color:GENDER_COLOR[p.gender] }}>N°{p.ref}</p>
            <p style={{ fontSize:12, fontWeight:600, lineHeight:1.3, margin:'3px 0' }}>{p.name}</p>
            <p style={{ fontSize:10, color:'var(--text-muted)' }}>{p.brand}</p>
            <div style={{ marginTop:6 }}>
              {p.sizes.map(s => (
                <div key={s} style={{ display:'flex', justifyContent:'space-between', fontSize:10, padding:'2px 0' }}>
                  <span style={{ color:'var(--text-muted)' }}>{s}</span>
                  <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{p.prices?.[s]}€</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BON DE COMMANDE ──────────────────────────────────────────────
const CATS = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];

function BonCommandeTab() {
  const [cart, setCart]       = useState([]);
  const [search, setSearch]   = useState('');
  const [showCart, setShowCart] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);

  // Champs identiques à la rubrique Vente de l'agenda
  const [client, setClient]         = useState('');
  const [email, setEmail]           = useState('');
  const [tel, setTel]               = useState('');
  const [prod, setProd]             = useState('');
  const [qty, setQty]               = useState('1');
  const [cat, setCat]               = useState('Parfum');
  const [amt, setAmt]               = useState('');
  const [cur, setCur]               = useState('€');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]             = useState('');
  const [consultant, setConsultant] = useState('');

  const filtered = PERFUMES.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.ref.includes(search);
  });

  // Recalcule prod / qty / amt à chaque changement du panier
  useEffect(() => {
    if (cart.length === 0) { setProd(''); setQty('0'); setAmt(''); return; }
    // Format compatible agenda : "N°ref Nom Taille ×qty" séparés par virgule — sans prix ni retour ligne
    const prodStr = cart.map(c => `N°${c.ref} ${c.name} ${c.size} ×${c.qty}`).join(', ');
    const totalQ  = cart.reduce((s,c) => s + c.qty, 0);
    const totalA  = cart.reduce((s,c) => s + c.price * c.qty, 0);
    setProd(prodStr);
    setQty(String(totalQ));
    setAmt(totalA.toFixed(2));   // nombre pur sans symbole : "123.50"
  }, [cart]);

  const addToCart = (p, size) => {
    const key = `${p.id}-${size}`;
    setCart(prev => {
      const ex = prev.find(c => c.key === key);
      if (ex) return prev.map(c => c.key===key ? {...c, qty:c.qty+1} : c);
      return [...prev, { key, name:p.name, ref:p.ref, size, price:p.prices?.[size]||35, qty:1 }];
    });
  };

  const totalEur = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const totalQty = cart.reduce((s,c) => s+c.qty, 0);
  const updateCartFields = (newCart) => setCart(newCart);

  // ✦ Enregistrer dans le_sales (rubrique Vente de l'agenda original)
  const saveToAgenda = () => {
    if (!client.trim()) { alert('Entrez le nom de la cliente.'); return; }
    try {
      const existing = JSON.parse(localStorage.getItem('le_sales') || '[]');
      const sale = {
        id:         `BC-${Date.now()}`,
        client,
        prod,                                        // format: "N°001 Nom Taille ×2, ..."
        qty,
        cat,
        amt:        String(parseFloat(amt) || 0),   // nombre pur sans symbole
        cur,
        date,
        note,
        email,
        tel,
        consultant,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('le_sales', JSON.stringify([sale, ...existing]));
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
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
      `💶 Total : ${amt} ${cur}`,
      ...(note ? [`📝 ${note}`] : []),
    ];
    navigator.clipboard?.writeText(lines.join('\n'))
      .then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2500); });
  };

  if (showCart) return (
    <div style={S.pad}>
      <button style={S.backLink} onClick={() => setShowCart(false)}>← Retour catalogue</button>

      {saved && (
        <div style={{ background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, color:'var(--green)', fontSize:13, fontWeight:600 }}>
          ✅ Vente enregistrée dans la rubrique Agenda !
        </div>
      )}

      <div style={S.venteFiche}>
        <p style={S.venteTitle}>✦ Nouvelle transaction</p>

        {/* Cliente */}
        <div className="field">
          <label className="label">Cliente *</label>
          <input value={client} onChange={e=>setClient(e.target.value)} placeholder="Nom de la cliente" />
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="label">E-mail cliente</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@email.com" />
          </div>
          <div className="field">
            <label className="label">Téléphone</label>
            <input type="tel" value={tel} onChange={e=>setTel(e.target.value)} placeholder="+33 6..." />
          </div>
        </div>

        {/* Produit */}
        <div className="field">
          <label className="label">Produit Chogan</label>
          <input
            value={prod}
            onChange={e=>setProd(e.target.value)}
            placeholder="Les produits s'ajoutent automatiquement"
          />
          {cart.length > 0 && (
            <div style={{ marginTop:6 }}>
              {cart.map(c => (
                <div key={c.key} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', padding:'2px 4px' }}>
                  <span>N°{c.ref} {c.name} {c.size} ×{c.qty}</span>
                  <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{(c.price*c.qty).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="label">Quantité</label>
            <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Catégorie</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Montant + devise */}
        <div className="field">
          <label className="label">Montant</label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="number" placeholder="0.00" value={amt} onChange={e=>setAmt(e.target.value)} style={{ flex:1 }} />
            <div style={{ display:'flex', background:'var(--bg-dark)', border:'1px solid var(--or-border)', borderRadius:10, overflow:'hidden', flexShrink:0 }}>
              {['DA','€'].map(c => (
                <button key={c} style={{ padding:'9px 14px', cursor:'pointer', fontSize:12, fontWeight:700, background:cur===c?'linear-gradient(135deg, var(--or), var(--or-deep))':'transparent', color:cur===c?'#fff':'var(--text-muted)', border:'none', fontFamily:'var(--font-body)' }}
                  onClick={() => setCur(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="field">
          <label className="label">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>

        {/* Notes */}
        <div className="field">
          <label className="label">Notes & commentaires</label>
          <textarea rows={2} placeholder="Préférences, allergies..." value={note} onChange={e=>setNote(e.target.value)} style={{ resize:'none' }} />
        </div>

        {/* Consultante (optionnel) */}
        <div className="field">
          <label className="label">Consultante (optionnel)</label>
          <input value={consultant} onChange={e=>setConsultant(e.target.value)} placeholder="Nom de la consultante" />
        </div>

        {/* Panier récap */}
        {cart.length > 0 && (
          <div style={{ marginTop:4 }}>
            <p style={{ ...S.secLabel, marginBottom:8 }}>🛒 Panier ({totalQty} article(s))</p>
            {cart.map(c => (
              <div key={c.key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, padding:'8px 10px', background:'rgba(210,183,149,0.06)', borderRadius:8, border:'1px solid var(--or-border)' }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>N°{c.ref} {c.name} — {c.size}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>{(c.price*c.qty).toFixed(2)}€</span>
                </div>
                <button style={S.qtyBtn} onClick={() => updateCartFields(cart.map(x=>x.key===c.key?{...x,qty:Math.max(1,x.qty-1)}:x))}>−</button>
                <span style={{ fontSize:12, fontWeight:700, minWidth:16, textAlign:'center' }}>{c.qty}</span>
                <button style={S.qtyBtn} onClick={() => updateCartFields(cart.map(x=>x.key===c.key?{...x,qty:x.qty+1}:x))}>+</button>
                <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:13 }} onClick={() => updateCartFields(cart.filter(x=>x.key!==c.key))}>✕</button>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, color:'var(--or-deep)', padding:'8px 0', borderTop:'1px solid var(--or-border)', marginTop:4 }}>
              <span>Total</span><span>{amt} {cur}</span>
            </div>
          </div>
        )}
      </div>

      {/* Boutons */}
      <button className="btn-gold" style={{ marginTop:12 }} onClick={saveToAgenda}>
        ✦ Valider la transaction → Agenda
      </button>
      <button className="btn-outline" style={{ width:'100%', marginTop:8 }} onClick={exportBC}>
        {copied ? '✓ Copié !' : '📋 Copier le bon de commande'}
      </button>
    </div>
  );

  return (
    <div style={S.pad}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={S.secLabel}>Sélectionnez les produits</p>
        <button className="btn-gold" style={{ padding:'8px 14px', width:'auto' }} onClick={() => setShowCart(true)}>
          🛒 {cart.reduce((s,c)=>s+c.qty,0)} — Récap
        </button>
      </div>
      <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...S.card, borderLeft:`3px solid ${GENDER_COLOR[p.gender]}` }}>
            <p style={{ fontSize:10, fontWeight:700, color:GENDER_COLOR[p.gender], marginBottom:3 }}>N°{p.ref} · {p.name}</p>
            {p.sizes.map(s => (
              <button key={s} style={S.sizeBtn} onClick={() => addToCart(p, s)}>
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>{s}</span>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)' }}>{p.prices?.[s]}€ +</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROMO ─────────────────────────────────────────────────────────
function PromoTab() {
  const [devise, setDevise] = useState('eur');
  const [taux, setTaux]     = useState('290');
  const [promos, setPromos] = useState({});
  const [qtes, setQtes]     = useState({});
  const [sel, setSel]       = useState(null);
  const tx = parseFloat(taux)||290;

  const calc = (p) => {
    const pa   = devise==='eur' ? p.prixEur + p.emballage : p.prixEur + (p.transportDzd||0) + p.emballage;
    const paDA = Math.round((p.prixEur + (p.transportDzd||0) + p.emballage) * tx);
    const min  = devise==='eur' ? parseFloat((pa*1.04).toFixed(2)) : Math.round(paDA*1.04);
    const val  = parseFloat(promos[p.id])||0;
    const qty  = parseInt(qtes[p.id])||0;
    const marge = val>0&&val>=min ? (devise==='eur'?parseFloat(((val-pa)*qty).toFixed(2)):Math.round((val-paDA)*qty)) : 0;
    return { pa:devise==='eur'?pa:paDA, min, val, qty, marge, ok:val>=min };
  };

  const totalMarge = PRODUITS_PROMO.reduce((s,p) => s+calc(p).marge, 0);
  const fmt = v => devise==='eur' ? v.toFixed(2)+' €' : v.toLocaleString('fr-FR')+' DA';

  const selProd = PRODUITS_PROMO.find(p=>p.id===sel);
  const selCalc = selProd ? calc(selProd) : null;

  if (selProd) return (
    <div style={S.pad}>
      <button style={S.backLink} onClick={() => setSel(null)}>← Retour</button>
      <p style={{ fontFamily:'var(--font-display)', fontSize:17, color:'var(--taupe)', marginBottom:14 }}>{selProd.nom}</p>
      <div style={S.card}>
        <p style={S.secLabel}>Prix de revient</p>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--or-border)' }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Total PA</span>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)' }}>{fmt(selCalc.pa)}</span>
        </div>
        <div style={{ textAlign:'center', marginTop:10, padding:'10px', background:'rgba(74,124,89,0.08)', borderRadius:10 }}>
          <p style={{ fontSize:10, color:'var(--green)', marginBottom:4 }}>Prix minimum (ne pas vendre en dessous)</p>
          <p style={{ fontSize:26, fontWeight:700, color:'var(--green)' }}>{fmt(selCalc.min)}</p>
        </div>
      </div>
      <div style={S.card}>
        <p style={S.secLabel}>Simuler une promo</p>
        <div className="field">
          <label className="label">Mon prix promo ({devise==='eur'?'€':'DA'})</label>
          <input type="number" value={promos[selProd.id]||''} onChange={e=>setPromos(p=>({...p,[selProd.id]:e.target.value}))} placeholder={`Min: ${fmt(selCalc.min)}`} />
          {selCalc.val>0 && <p style={{ fontSize:11, marginTop:4, color:selCalc.ok?'var(--green)':'var(--red)' }}>{selCalc.ok?'✅ Prix valide':'⚠️ Prix trop bas !'}</p>}
        </div>
        <div className="field">
          <label className="label">Quantité</label>
          <input type="number" value={qtes[selProd.id]||''} onChange={e=>setQtes(p=>({...p,[selProd.id]:e.target.value}))} placeholder="0" />
        </div>
        {selCalc.marge > 0 && (
          <div style={{ textAlign:'center', background:'var(--or-pale)', borderRadius:10, padding:14 }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Marge générée</p>
            <p style={{ fontSize:26, fontWeight:700, color:'var(--or-deep)' }}>{fmt(selCalc.marge)}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={S.pad}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {[['eur','🇫🇷 €'],['dzd','🇩🇿 DA']].map(([v,l]) => (
          <button key={v} style={{ flex:1, padding:10, borderRadius:10, border:`1px solid ${devise===v?'var(--or-deep)':'var(--or-border)'}`, background:devise===v?'var(--or-pale)':'transparent', color:devise===v?'var(--or-deep)':'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, fontWeight:600 }}
            onClick={() => { setDevise(v); setPromos({}); setQtes({}); }}>{l}</button>
        ))}
      </div>
      {devise==='dzd' && (
        <div className="field"><label className="label">Taux du jour (1€ = ? DA)</label><input type="number" value={taux} onChange={e=>setTaux(e.target.value)} /></div>
      )}
      {totalMarge > 0 && (
        <div style={{ background:'var(--or-pale)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Total marge promo</span>
          <span style={{ fontSize:18, fontWeight:700, color:'var(--or-deep)' }}>{fmt(totalMarge)}</span>
        </div>
      )}
      {PRODUITS_PROMO.map(p => {
        const c = calc(p);
        return (
          <div key={p.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:10, cursor:'pointer', borderLeft:`3px solid ${c.marge>0?'var(--or-deep)':'var(--or-border)'}` }}
            onClick={() => setSel(p.id)}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600 }}>{p.nom}</p>
              <div style={{ display:'flex', gap:10, marginTop:3 }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>PA: {fmt(c.pa)}</span>
                <span style={{ fontSize:11, color:'var(--green)' }}>Min: {fmt(c.min)}</span>
              </div>
              {c.marge>0 && <p style={{ fontSize:11, color:'var(--or-deep)', fontWeight:600, marginTop:2 }}>Marge: {fmt(c.marge)} (×{c.qty})</p>}
            </div>
            <span style={{ color:'var(--or-deep)', fontSize:18 }}>›</span>
          </div>
        );
      })}
    </div>
  );
}

// ── CONVERTISSEUR ─────────────────────────────────────────────────
function ConvertisseurTab() {
  const [eur, setEur]   = useState('');
  const [rate, setRate] = useState('245');
  const dzd = eur && !isNaN(+eur) ? Math.round(+eur * (+rate||245)) : null;
  return (
    <div style={S.pad}>
      <div style={S.card}>
        <p style={S.secLabel}>💱 EUR → DZD</p>
        <div className="field"><label className="label">Taux du jour (1€ = ? DA)</label><input type="number" value={rate} onChange={e=>setRate(e.target.value)} style={{ fontSize:18, textAlign:'center', fontWeight:700 }} /></div>
        <div className="field"><label className="label">Montant en Euros (€)</label><input type="number" value={eur} onChange={e=>setEur(e.target.value)} placeholder="0.00" style={{ fontSize:22, textAlign:'center', fontWeight:700 }} /></div>
        {dzd !== null && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>{eur} € =</p>
            <p style={{ fontSize:46, fontWeight:700, color:'var(--or-deep)', fontFamily:'var(--font-display)', lineHeight:1 }}>{dzd.toLocaleString('fr-FR')}</p>
            <p style={{ fontSize:14, color:'var(--or-deep)', marginTop:4 }}>Dinars algériens</p>
          </div>
        )}
      </div>
      <p style={S.secLabel}>Conversions rapides</p>
      {[11.90,18,25.50,35,45,48,52,57,65].map(p => (
        <div key={p} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:10, marginBottom:6 }}>
          <span style={{ fontSize:13, fontWeight:500 }}>{p.toFixed(2)} €</span>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)' }}>{Math.round(p*(+rate||245)).toLocaleString('fr-FR')} DA</span>
        </div>
      ))}
    </div>
  );
}

const S = {
  tabsWrap: { display:'flex', overflowX:'auto', borderBottom:'1px solid var(--or-border)', scrollbarWidth:'none' },
  tab: { padding:'11px 10px', background:'none', color:'var(--text-muted)', fontSize:11, borderBottom:'2px solid transparent', whiteSpace:'nowrap', flexShrink:0 },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  pad: { padding:16 },
  miniTabs: { display:'flex', gap:8, marginBottom:14 },
  miniTab: { flex:1, padding:'9px', background:'transparent', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:10, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' },
  miniActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  card: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:10 },
  section: { background:'rgba(255,255,255,0.6)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:12 },
  secLabel: { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 0', fontSize:14 },
  successMsg: { background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.25)', borderRadius:10, padding:12, color:'var(--green)', fontSize:13, marginBottom:14 },
  prodGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  prodCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:10, padding:10, cursor:'pointer', display:'flex', flexDirection:'column', gap:3 },
  filterRow: { display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' },
  filterBtn: { background:'var(--bg-card)', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:20, padding:'5px 12px', fontSize:12, cursor:'pointer' },
  filterActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  venteFiche: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:16, marginBottom:12 },
  venteTitle: { fontFamily:'var(--font-display)', fontSize:13, color:'var(--or-deep)', letterSpacing:'0.08em', marginBottom:14, paddingBottom:10, borderBottom:'1px solid var(--or-border)' },
  backLink: { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block' },
  qtyBtn: { width:26, height:26, borderRadius:6, background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' },
};

import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { PERFUMES } from '../../utils/choganData';
import { useData } from '../../context/DataContext';
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

import { cloudSave } from '../../lib/cloudSync';


const TABS = [
  { id:'bon',     label:'📋 Bon de commande' },
  { id:'ventes',  label:'💰 Ventes' },
  { id:'clients', label:'👥 Clients' },
  { id:'maj',     label:'🔄 Mise à jour' },
];

export default function Orders() {
  const { user } = useAuth();
  const hideTabsRoles = ['consultante','marraine'];
  const visibleTabs = TABS.filter(t => {
    if (hideTabsRoles.includes(user?.role) && (t.id === 'ventes' || t.id === 'clients')) return false;
    return true;
  });
  const [tab, setTab] = useState('bon');
  return (
    <AppLayout title="Commandes" icon="🛒">
      <div style={S.tabsWrap}>
        {visibleTabs.map(t => (
          <button key={t.id} style={{ ...S.tab, ...(tab===t.id?S.tabActive:{}) }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'bon'     && <BonCommandeTab />}
      {tab === 'ventes'  && <VentesTab />}
      {tab === 'clients' && <AgendaClientsTab />}
      {tab === 'maj'     && <MajPrixTab />}
    </AppLayout>
  );
}

// ── BON DE COMMANDE ──────────────────────────────────────────────
const CATS  = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];

function BonCommandeTab() {
  const { user: authUser } = useAuth();
  const consultantName = authUser ? `${authUser.firstName||''} ${authUser.lastName||''}`.trim() : '';

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
  const [taux, setTaux]             = useState('245');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]             = useState('');
  const [consultant, setConsultant] = useState('');

  useEffect(() => {
    if (consultantName) setConsultant(consultantName);
  }, [consultantName]);

  // Fusionner PERFUMES statiques avec les prix mis à jour via Claude AI
  const customPrix = (() => {
    try { return JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}'); } catch { return {}; }
  })();

  const allProducts = (() => {
    // Normalise une ref : enlève les préfixes lettres, garde la partie numérique
    // Ex: "T076" → "076", "147M" → "147", "164M" → "164"
    const normalizeRef = r => (r || '').replace(/^[A-Za-z]+/, '').replace(/[A-Za-z]+$/, '').trim();

    // Convertir les produits custom en format PERFUMES
    const customList = Object.values(customPrix).map(p => ({
      id: `c-${p.ref}`,
      ref: normalizeRef(p.ref),       // ref normalisée pour le match
      refOriginal: p.ref || '',       // ref originale affichée
      name: p.nom || '',
      gender: p.genre === 'homme' ? 'h' : p.genre === 'femme' ? 'f' : 'm',
      sizes: Object.entries(p.prix||{}).filter(([,v])=>v!=null).map(([s])=>s),
      prices: Object.fromEntries(Object.entries(p.prix||{}).filter(([,v])=>v!=null)),
      custom: true,
    })).filter(p => p.ref && p.name && p.sizes.length > 0);

    // Les refs custom normalisées écrasent les statiques
    const customRefs = new Set(customList.map(p => p.ref));
    const staticFiltered = PERFUMES.filter(p => !customRefs.has(normalizeRef(p.ref)));
    return [...customList, ...staticFiltered].sort((a,b) => {
      const na = parseInt(a.ref) || 0;
      const nb = parseInt(b.ref) || 0;
      return na - nb;
    });
  })();

  const filtered = allProducts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.ref.includes(search);
  });

  useEffect(() => {
    if (cart.length === 0) { setProd(''); setQty('0'); setAmt(''); return; }
    setProd(cart.map(c => `N°${c.ref} ${c.name} ${c.size} ×${c.qty}`).join(', '));
    setQty(String(cart.reduce((s,c) => s+c.qty, 0)));
    const total = cart.reduce((s,c) => s+c.price*c.qty, 0);
    setAmt(cur==='DA' ? String(Math.round(total*(parseFloat(taux)||245))) : total.toFixed(2));
  }, [cart, cur, taux]);

  const addToCart = (p, size) => {
    const key = `${p.id}-${size}`;
    setCart(prev => {
      const ex = prev.find(c => c.key===key);
      if (ex) return prev.map(c => c.key===key ? {...c,qty:c.qty+1} : c);
      return [...prev, { key, id:p.id, name:p.name, ref:p.ref, size, price:p.prices?.[size]||35, qty:1 }];
    });
  };

  const updateCart = (newCart) => setCart(newCart);
  const tauxN = parseFloat(taux)||245;
  const totalEur = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const totalDisplay = cur==='DA' ? Math.round(totalEur*tauxN) : totalEur;
  const fmtAmt = (eur) => cur==='DA' ? Math.round(eur*tauxN).toLocaleString('fr-FR')+' DA' : eur.toFixed(2)+'€';

  const [saveError, setSaveError] = useState('');

  const saveToAgenda = () => {
    setSaveError('');
    if (!client.trim()) { setSaveError('⚠️ Entrez le nom de la cliente.'); return; }
    if (!amt || parseFloat(amt) <= 0) { setSaveError('⚠️ Entrez un montant valide.'); return; }
    try {
      const rawDate = date || new Date().toISOString().split('T')[0];
      const existing = JSON.parse(localStorage.getItem('le_sales') || '[]');
      const tauxSave = parseFloat(taux) || 245;
      const cartItems = cart.map(c => ({
        prod: `N°${c.ref} ${c.name} ${c.size}`, qty: c.qty, cat,
        amt: cur === 'DA' ? Math.round(c.price * c.qty * tauxSave) : parseFloat((c.price * c.qty).toFixed(2)),
        currency: cur
      }));
      const sale = {
        id: `BC-${Date.now()}`,
        client: client.trim(), email: email.trim(), tel: tel.trim(),
        items: cartItems,
        product: prod || cartItems.map(i => i.prod).join(', '),
        qty: String(cart.reduce((s, c) => s + c.qty, 0)),
        amount: parseFloat(amt) || 0,
        amt: parseFloat(amt) || 0,
        currency: cur, cur: cur,
        category: cat, cat: cat,
        date: rawDate, note: note || '',
        consultant: consultant || consultantName,
        createdAt: new Date().toISOString(),
      };
      const updated = [sale, ...existing];
      // Clé utilisateur pour sync multi-device
      cloudSave('le_sales', updated);

      // ── AUTO : Créer/Mettre à jour la fiche client ────────────────
      try {
        const clientsRaw = JSON.parse(localStorage.getItem('le_clients') || '[]');
        const existIdx = clientsRaw.findIndex(c => (c.name||'').toLowerCase() === client.trim().toLowerCase());
        if (existIdx >= 0) {
          clientsRaw[existIdx].email = email.trim() || clientsRaw[existIdx].email;
          clientsRaw[existIdx].tel   = tel.trim()   || clientsRaw[existIdx].tel;
          clientsRaw[existIdx].lastDate = rawDate;
          clientsRaw[existIdx].consultant = sale.consultant;
        } else {
          clientsRaw.unshift({
            id: `CL-${Date.now()}`,
            name: client.trim(), email: email.trim(), tel: tel.trim(),
            consultant: sale.consultant,
            createdAt: new Date().toISOString(),
            lastDate: rawDate,
          });
        }
        cloudSave('le_clients', clientsRaw);
      } catch {}

      // ── AUTO : Créer/Incrémenter la carte de fidélité ────────────
      try {
        const fidRaw = JSON.parse(localStorage.getItem('le_fidelite') || '{}');
        const cKey = client.trim().toLowerCase();
        const amtEur = cur === 'DA' ? (parseFloat(amt)||0) / (parseFloat(taux)||245) : (parseFloat(amt)||0);
        if (!fidRaw[cKey]) {
          fidRaw[cKey] = { name: client.trim(), email: email.trim(), tel: tel.trim(), total: 0, consultant: sale.consultant, createdAt: new Date().toISOString() };
        }
        fidRaw[cKey].total = (fidRaw[cKey].total || 0) + amtEur;
        fidRaw[cKey].lastDate = rawDate;
        fidRaw[cKey].consultant = sale.consultant;
        cloudSave('le_fidelite', fidRaw);
      } catch {}

      // ── AUTO : Ajouter un événement dans l'agenda ─────────────────
      try {
        const eventsRaw = JSON.parse(localStorage.getItem('le_cevents') || '[]');
        const newEvent = {
          id: `EV-${Date.now()}`,
          type: 'Vente',
          title: `Vente — ${client.trim()}`,
          client: client.trim(),
          date: rawDate,
          amount: parseFloat(amt) || 0,
          currency: cur,
          product: sale.product,
          consultant: sale.consultant,
          createdAt: new Date().toISOString(),
          source: 'commande',
        };
        cloudSave('le_cevents', [newEvent, ...eventsRaw]);
      } catch {}

      console.log('✅ Sale saved + Client + Fidélité + Agenda créés automatiquement');
      setSaved(true);
      setCart([]); setProd(''); setAmt(''); setClient(''); setEmail(''); setTel(''); setNote('');
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setSaveError('❌ Erreur : ' + e.message);
      console.error('saveToAgenda error:', e);
    }
  };

  const exportBC = () => {
    const lines = [
      '📋 BON DE COMMANDE — CHOGAN',
      `👤 Cliente : ${client||'—'}`,
      `📅 ${new Date(date).toLocaleDateString('fr-FR')}`,
      '─────────────────',
      ...cart.map(c => `• N°${c.ref} ${c.name} ${c.size} ×${c.qty} = ${fmtAmt(c.price*c.qty)}`),
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
      {saveError && <div style={{ background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:10, padding:'10px 14px', color:'var(--red)', fontSize:13, fontWeight:600, marginBottom:10 }}>{saveError}</div>}
      {saved && <div style={S.ok}>✅ Vente enregistrée avec succès !</div>}

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
                <span style={{ fontSize:12, fontWeight:700, color:'var(--or-deep)' }}>{fmtAmt(c.price*c.qty)}</span>
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
          {totalEur > 0 && <p style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>Total calculé : {fmtAmt(totalEur)}</p>}
          {cur==='DA' && <div className="field" style={{marginTop:6}}><label className="label" style={{fontSize:10}}>Taux (1€ = ? DA)</label><input type="number" value={taux} onChange={e=>setTaux(e.target.value)} style={{fontSize:13}}/></div>}
        </div>

        <div className="field"><label className="label">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>

        <div className="field"><label className="label">Notes & commentaires</label>
          <textarea rows={2} placeholder="Préférences, allergies..." value={note} onChange={e=>setNote(e.target.value)} style={{ resize:'none' }} /></div>

        <div className="field"><label className="label">Consultante</label>
          <input
              value={consultant}
              readOnly
              style={{ backgroundColor:'#F5EFE8', color:'#8C6D4F', fontWeight:600, cursor:'default', border:'1px solid #D2B795' }}
              placeholder="Nom automatique"
            /></div>
      </div>

      <button className="btn-gold" onClick={saveToAgenda}>✦ Valider la transaction → Agenda</button>
      <button className="btn-outline" style={{ width:'100%', marginTop:8 }} onClick={exportBC}>
        {copied ? '✓ Copié !' : '📋 Copier le bon de commande'}
      </button>
    </div>
  );

  return (
    <div style={S.pad}>
      {/* Sélecteur devise + taux */}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
        <div style={S.curSel}>
          {['€','DA'].map(c => (
            <button key={c} style={{ ...S.curBtn, ...(cur===c?S.curActive:{}) }} onClick={() => setCur(c)}>{c}</button>
          ))}
        </div>
        {cur==='DA' && (
          <input type="number" value={taux} onChange={e=>setTaux(e.target.value)}
            placeholder="Taux 1€=?DA" style={{ width:100, fontSize:11, padding:'5px 8px' }}/>
        )}
        <button className="btn-gold" style={{ padding:'8px 14px', width:'auto', marginLeft:'auto' }} onClick={() => setShowForm(true)}>
          🛒 {cart.reduce((s,c)=>s+c.qty,0)} — Récap
        </button>
      </div>
      <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:8 }}>Catalogue ({allProducts.length} réf.)</p>
      <input placeholder="🔍 Ref ou nom..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:10 }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <p style={{ fontSize:10, fontWeight:700, color: p.gender==='h'?'#3d6b9e':p.gender==='f'?'#9e5a7a':'#4a7c59' }}>N°{p.ref} · {p.name}</p>
              {p.custom && <span style={{fontSize:8,background:'rgba(74,124,89,0.15)',color:'var(--green)',borderRadius:6,padding:'1px 5px',fontWeight:700,border:'1px solid rgba(74,124,89,0.3)'}}>MàJ</span>}
            </div>
            {p.sizes.map(sz => (
              <button key={sz} style={S.sizeBtn} onClick={() => addToCart(p, sz)}>
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>{sz}</span>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)' }}>{cur==='DA'?Math.round((p.prices?.[sz]||0)*(parseFloat(taux)||245)).toLocaleString('fr-FR')+' DA':p.prices?.[sz]+'€'} +</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VENTES (copie de l'onglet Agenda – lit le_sales) ────────────
const CATS_V = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];
function VentesTab() {
  const { getFilteredSales, user } = useAuth();
  const [sales, setSales]   = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({});

  // Charger et rafraîchir toutes les 3s
  useEffect(() => {
    const load = () => { try { setSales(getFilteredSales()); } catch {} };
    load(); // chargement immédiat
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);
  const save = (updated) => { cloudSave('le_sales', updated); setSales(updated); };
  const deleteSale = (id) => { if (!window.confirm('Supprimer cette vente ?')) return; save(sales.filter(s=>s.id!==id)); };

  const openEdit = (v) => {
    setEditing(v.id);
    setForm({
      client:     v.client||'',
      email:      v.email||'',
      tel:        v.tel||'',
      product:    v.product||v.prod||'',
      qty:        String(v.qty||1),
      category:   v.category||v.cat||'Parfum',
      amount:     String(v.amount||v.amt||''),
      currency:   v.currency||v.cur||'€',
      date:       v.date||new Date().toISOString().split('T')[0],
      note:       v.note||'',
      consultant: v.consultant||'',
    });
  };

  const saveEdit = () => {
    const updated = sales.map(s => s.id === editing ? {
      ...s,
      client:     form.client,
      email:      form.email,
      tel:        form.tel,
      product:    form.product,
      prod:       form.product,
      qty:        parseInt(form.qty)||1,
      category:   form.category,
      cat:        form.category,
      amount:     parseFloat(form.amount)||0,
      amt:        form.amount,
      currency:   form.currency,
      cur:        form.currency,
      date:       form.date,
      note:       form.note,
      consultant: form.consultant,
    } : s);
    save(updated);
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

  // Modal edit
  if (editing) return (
    <div style={S.pad}>
      <button style={S.back} onClick={() => setEditing(null)}>← Annuler</button>
      <div style={S.fiche}>
        <p style={S.ficheTitle}>✏️ Modifier la vente</p>
        {[['client','Cliente *','text'],['email','E-mail','email'],['tel','Téléphone','tel'],['product','Produit','text'],['note','Notes','text']].map(([k,l,t])=>(
          <div className="field" key={k}><label className="label">{l}</label>
            <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} /></div>
        ))}
        <div className="grid-2">
          <div className="field"><label className="label">Quantité</label>
            <input type="number" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} /></div>
          <div className="field"><label className="label">Catégorie</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATS_V.map(c=><option key={c}>{c}</option>)}
            </select></div>
        </div>
        <div className="field"><label className="label">Montant</label>
          <div style={{display:'flex',gap:8}}>
            <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} style={{flex:1}} />
            <div style={S.curSel}>{['DA','€'].map(c=>(
              <button key={c} style={{...S.curBtn,...(form.currency===c?S.curActive:{})}} onClick={()=>setForm(p=>({...p,currency:c}))}>{c}</button>
            ))}</div>
          </div></div>
        <div className="field"><label className="label">Date</label>
          <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
        <div className="field"><label className="label">Consultante</label>
          <input value={form.consultant} onChange={e=>setForm(p=>({...p,consultant:e.target.value}))} /></div>
      </div>
      <button className="btn-gold" onClick={saveEdit}>ENREGISTRER LES MODIFICATIONS</button>
    </div>
  );

  return (
    <div style={S.pad}>
      <div style={S.statsRow}>
        <div style={S.statBox}><span style={S.statN}>{sales.length}</span><span style={S.statL}>Ventes</span></div>
        <div style={S.statDiv}/>
        <div style={S.statBox}><span style={{...S.statN,fontSize:16}}>{totalEur.toFixed(2)}€</span><span style={S.statL}>CA €</span></div>
        {totalDa > 0 && <><div style={S.statDiv}/><div style={S.statBox}><span style={{...S.statN,fontSize:13}}>{totalDa.toLocaleString('fr-FR')}</span><span style={S.statL}>CA DA</span></div></>}
        <button style={S.refreshBtn} onClick={refresh}>↺</button>
      </div>
      <input placeholder="🔍 Cliente ou produit..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}} />
      {filtered.length === 0
        ? <div style={S.empty}>Aucune vente enregistrée.</div>
        : filtered.map(v => {
          const amount = parseFloat(v.amount||v.amt)||0;
          const currency = v.currency||v.cur||'€';
          const product  = v.product||v.prod||'';
          const items    = v.items||[];
          return (
            <div key={v.id} style={S.venteCard} className="fade-in">
              <div style={S.venteHeader}>
                <div style={{flex:1}}>
                  <p style={S.clientName}>{v.client||'—'}</p>
                  <div style={{display:'flex',gap:8,marginTop:3,flexWrap:'wrap'}}>
                    {v.email && <span style={S.metaTxt}>✉ {v.email}</span>}
                    {v.tel   && <span style={S.metaTxt}>📞 {v.tel}</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={S.venteAmt}>{amount} {currency}</p>
                  <p style={S.venteDate}>{fmt(v.date||v.createdAt)}</p>
                </div>
              </div>
              {items.length > 0
                ? <div style={S.itemsBlock}>{items.map((it,i)=>(
                    <div key={i} style={S.itemRow}>
                      <span style={{flex:1,fontSize:11,color:'var(--taupe)'}}>{it.prod} <span style={{color:'var(--text-muted)'}}>×{it.qty}</span></span>
                      <span className="badge badge-gold" style={{fontSize:9}}>{it.cat}</span>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginLeft:6}}>{it.amt} {it.currency||currency}</span>
                    </div>))}</div>
                : product ? <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6,lineHeight:1.5}}>{product}</p> : null
              }
              {v.note && <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6,fontStyle:'italic'}}>📝 {v.note}</p>}
              {v.consultant && user?.role !== 'consultante' && (
                <div style={{marginTop:6}}>
                  <ColorBadge consultant={v.consultant} ownerFirst={user?.firstName} />
                </div>
              )}
              {/* Boutons Modifier / Réinitialiser */}
              <div style={S.actionRow}>
                <button style={S.editBtn} onClick={() => openEdit(v)}>✏️ Modifier</button>
                <button style={S.resetBtn} onClick={() => deleteSale(v.id)}>🗑 Réinitialiser</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── CLIENTS AGENDA (construit depuis le_sales comme l'agenda) ────
function AgendaClientsTab() {
  const [rawSales, setRawSales] = useState(() => {
    try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; }
  });
  const [search,     setSearch]   = useState('');
  const [filter,     setFilter]   = useState('all');
  const [selected,   setSelected]  = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [editForm,   setEditForm]   = useState({email:'',tel:''});

  const refresh = () => {
    try { setRawSales(JSON.parse(localStorage.getItem('le_sales')||'[]')); } catch {}
  };

  const now = new Date(); now.setHours(0,0,0,0);

  // Construire la map clients depuis les ventes (même logique que l'agenda)
  const clientMap = {};
  rawSales.forEach(s => {
    const name = s.client;
    if (!name) return;
    if (!clientMap[name]) clientMap[name] = {
      name, purchases:[], total:0, lastDate:'',
      topProd:{}, email:s.email||'', tel:s.tel||'',
      currency: s.currency||s.cur||'DA',
    };
    clientMap[name].purchases.push(s);
    clientMap[name].total += parseFloat(s.amount||s.amt)||0;
    if (!clientMap[name].lastDate || s.date > clientMap[name].lastDate) clientMap[name].lastDate = s.date||s.createdAt||'';
    if (s.email && !clientMap[name].email) clientMap[name].email = s.email;
    if (s.tel && !clientMap[name].tel) clientMap[name].tel = s.tel;
    const prod = s.product||s.prod||'';
    if (prod) clientMap[name].topProd[prod] = (clientMap[name].topProd[prod]||0)+1;
  });

  const daysSince = c => Math.floor((now - new Date(c.lastDate)) / 86400000);

  let clients = Object.values(clientMap);
  if (search) clients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  clients = clients.filter(c => {
    const d = daysSince(c);
    if (filter === 'recent') return d < 30;
    if (filter === 'warn')   return d >= 30 && d < 60;
    if (filter === 'urgent') return d >= 60;
    return true;
  }).sort((a,b) => new Date(b.lastDate) - new Date(a.lastDate));

  const COLORS = ['#B89A6A','#9e5a7a','#3d6b9e','#4a7c59','#6b4d8a','#8a4d4d','#3d7a8a'];

  // Modal édition client (modifie email/tel dans toutes les ventes)
  if (editClient) {
    const updateClient = () => {
      const updated = rawSales.map(s => s.client === editClient.name
        ? { ...s, email: editForm.email||s.email, tel: editForm.tel||s.tel }
        : s
      );
      cloudSave('le_sales', updated);
      setRawSales(updated);
      setEditClient(null);
    };
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={() => setEditClient(null)}>← Annuler</button>
        <div style={S.fiche}>
          <p style={S.ficheTitle}>✏️ Modifier {editClient.name}</p>
          <div className="field"><label className="label">E-mail</label>
            <input type="email" value={editForm.email} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))}
              placeholder={editClient.email||'Ajouter un email'} /></div>
          <div className="field"><label className="label">Téléphone</label>
            <input type="tel" value={editForm.tel} onChange={e=>setEditForm(p=>({...p,tel:e.target.value}))}
              placeholder={editClient.tel||'Ajouter un téléphone'} /></div>
        </div>
        <button className="btn-gold" onClick={updateClient}>ENREGISTRER</button>
      </div>
    );
  }

  if (selected) {
    const c = selected;
    const d = daysSince(c);
    const statusColor = d < 30 ? 'var(--green)' : d < 60 ? '#d97706' : 'var(--red)';
    const statusLabel = d < 30 ? '✅ Récent' : d < 60 ? '⚠️ À relancer' : '🚨 Urgent !';
    const top = Object.entries(c.topProd).sort((a,b)=>b[1]-a[1])[0];
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={() => setSelected(null)}>← Retour clients</button>
        <div style={S.fiche}>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{...S.avatarC,background:COLORS[0],margin:'0 auto 10px'}}>
              {c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <p style={{fontSize:16,fontWeight:700}}>{c.name}</p>
            <span style={{fontSize:11,color:statusColor,fontWeight:700,marginTop:4,display:'block'}}>{statusLabel}</span>
          </div>
          {[
            ['Email', c.email], ['Téléphone', c.tel],
            ['Dernière commande', c.lastDate ? new Date(c.lastDate).toLocaleDateString('fr-FR') : '—'],
            ["Nombre d'achats", c.purchases.length],
            ['CA Total', `${c.total.toFixed(2)} ${c.currency}`],
            ['Produit préféré', top ? top[0] : '—'],
          ].map(([l,v]) => v && (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--or-border)',fontSize:13}}>
              <span style={{color:'var(--text-muted)'}}>{l}</span>
              <span style={{fontWeight:600,maxWidth:'60%',textAlign:'right',wordBreak:'break-word'}}>{v}</span>
            </div>
          ))}
          <p style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',margin:'12px 0 8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>
            Historique achats
          </p>
          {c.purchases.slice(0,6).map((p,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(210,183,149,0.15)',fontSize:12}}>
              <span style={{color:'var(--text-muted)',flex:1,paddingRight:8}}>{p.product||p.prod||'—'}</span>
              <span style={{fontWeight:700,color:'var(--or-deep)',flexShrink:0}}>{parseFloat(p.amount||p.amt)||0} {p.currency||p.cur}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.pad}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <p style={{fontSize:11,color:'var(--text-muted)'}}>{clients.length} client(s)</p>
        <button style={S.refreshBtn} onClick={refresh}>↺ Actualiser</button>
      </div>
      <input placeholder="🔍 Rechercher un client..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:10}} />
      <div style={S.filterRow}>
        {[['all','Tous'],['recent','Récents'],['warn','À relancer'],['urgent','Urgents']].map(([k,l]) => (
          <button key={k} style={{...S.filterBtn,...(filter===k?S.filterActive:{})}} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {clients.length === 0
        ? <div style={S.empty}>Aucun client. Les clients apparaissent automatiquement après une vente.</div>
        : clients.map((c,i) => {
          const d = daysSince(c);
          const sColor = d < 30 ? 'var(--green)' : d < 60 ? '#d97706' : 'var(--red)';
          const sLabel = d < 30 ? 'Récent' : d < 60 ? 'À relancer' : 'Urgent !';
          const init = c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
          const top  = Object.entries(c.topProd).sort((a,b)=>b[1]-a[1])[0];
          return (
            <div key={c.name} style={S.clientCard} className="fade-in">
              <div style={{...S.avatarC,background:COLORS[i%COLORS.length],cursor:'pointer',flexShrink:0}} onClick={() => setSelected(c)}>{init}</div>
              <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={() => setSelected(c)}>
                <p style={{fontSize:13,fontWeight:600}}>{c.name}</p>
                <p style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>
                  {top ? top[0].substring(0,30) : '—'} · {c.purchases.length} achat(s)
                </p>
                <div style={{height:4,background:'rgba(210,183,149,0.2)',borderRadius:2,marginTop:5,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'linear-gradient(90deg,var(--or),var(--or-deep))',borderRadius:2,width:`${Math.min(100,Math.round((c.total/Math.max(...clients.map(x=>x.total),1))*100))}%`}} />
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                <p style={{fontSize:12,fontWeight:700,color:'var(--or-deep)'}}>{c.total.toFixed(0)} {c.currency}</p>
                <p style={{fontSize:9,color:sColor,fontWeight:700}}>{sLabel}</p>
                <div style={{display:'flex',gap:4}}>
                  <button style={S.editBtn} onClick={() => setEditClient(c)}>✏️</button>
                  <button style={S.resetBtn} onClick={() => {
                    if (!window.confirm(`Réinitialiser toutes les ventes de ${c.name} ?`)) return;
                    const updated = rawSales.filter(s => s.client !== c.name);
                    cloudSave('le_sales', updated);
                    setRawSales(updated);
                  }}>🗑</button>
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ── CLIENTS HUB ─────────────────────────────────────────────────
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
  itemRow: { display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'1px solid rgba(210,183,149,0.15)' },
  clientRow: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px', marginBottom:8, cursor:'pointer' },
  avatar: { width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg, var(--or), var(--or-deep))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 },
  miniTabs: { display:'flex', gap:8, marginBottom:14 },
  miniTab: { flex:1, padding:'9px', background:'transparent', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:10, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' },
  miniActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 0', fontSize:13 },
  statsRow: { display:'flex', alignItems:'center', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 16px', marginBottom:14, gap:8 },
  statBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 },
  statN: { fontFamily:'var(--font-display)', fontSize:20, color:'var(--or-deep)', lineHeight:1 },
  statL: { fontSize:9, color:'var(--text-muted)', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' },
  statDiv: { width:1, height:30, background:'var(--or-border)' },
  refreshBtn: { background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:14, fontFamily:'var(--font-body)' },
  venteCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 14px', marginBottom:10 },
  venteHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  clientName: { fontSize:14, fontWeight:700, color:'var(--taupe)' },
  metaTxt: { fontSize:10, color:'var(--text-muted)' },
  venteAmt: { fontSize:15, fontWeight:700, color:'var(--or-deep)' },
  venteDate: { fontSize:10, color:'var(--text-muted)', marginTop:2 },
  itemsBlock: { background:'rgba(210,183,149,0.06)', borderRadius:8, padding:'8px 10px', marginTop:6 },
  clientCard: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px 12px', marginBottom:8, cursor:'pointer' },
  avatarC: { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 },
  filterRow: { display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' },
  filterBtn: { background:'var(--bg-card)', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:20, padding:'5px 12px', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)' },
  filterActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  actionRow: { display:'flex', gap:8, marginTop:10, paddingTop:8, borderTop:'1px solid var(--or-border)' },
  editBtn: { flex:1, padding:'7px', background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  resetBtn: { flex:1, padding:'7px', background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', color:'var(--red)', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  majInfo: { background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:14, padding:'14px', marginBottom:14 },
  majTitle: { fontFamily:'var(--font-display)', fontSize:14, color:'var(--taupe)', letterSpacing:'0.06em', marginBottom:6 },
  majDesc: { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  majStatus: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:'1px solid var(--or-border)' },
  modeRow: { display:'flex', gap:8, marginBottom:14 },
  modeBtn: { flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--or-border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)' },
  modeBtnActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)', fontWeight:700 },
  dropZone: { display:'block', border:'2px dashed var(--or-border)', borderRadius:14, padding:'24px 16px', cursor:'pointer', background:'rgba(210,183,149,0.04)', transition:'border-color 0.2s', marginBottom:4 },
  loadingBox: { textAlign:'center', padding:'24px 0' },
  spinner: { width:32, height:32, border:'3px solid var(--or-pale)', borderTop:'3px solid var(--or-deep)', borderRadius:'50%', margin:'0 auto', animation:'spin 0.8s linear infinite' },
  errorBox: { background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:10, padding:'12px', color:'var(--red)', fontSize:13, marginTop:12 },
  resultHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  resultList: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden', marginBottom:14 },
  resultItem: { padding:'10px 14px', borderBottom:'1px solid var(--or-border)' },
  priceTag: { fontSize:10, padding:'2px 8px', background:'var(--or-pale)', color:'var(--or-deep)', borderRadius:20, border:'1px solid var(--or-border)', fontWeight:600 },
  savedBox: { background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, fontWeight:600, textAlign:'center' },
};

// ── MISE À JOUR PRODUITS & PRIX ──────────────────────────────────
function MajPrixTab() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);   // produits extraits par Claude
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState(false);
  const [manualText, setManual] = useState('');
  const [mode, setMode]         = useState('upload'); // 'upload' | 'paste'

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const analyzeWithClaude = async (content, mediaType, isText = false) => {
    setLoading(true);
    setError('');
    setResult(null);

    const userContent = isText
      ? [{ type: 'text', text: `Voici une liste de parfums Chogan. Extrais TOUS les produits avec leurs informations.\n\n${content}` }]
      : mediaType === 'application/pdf'
        ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: content } },
           { type: 'text', text: "Extrais tous les parfums/produits Chogan de ce document." }]
        : [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: content } },
           { type: 'text', text: "Extrais tous les parfums/produits Chogan visibles dans cette image." }];

    try {
      // Appel via la fonction serverless Vercel (pas de clé API exposée côté client)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mediaType, isText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur ${res.status}`);
      }
      const data = await res.json();

      // Gestion de l'erreur retournée par le serveur
      if (data.error) throw new Error(data.error);

      // Le serveur retourne déjà du JSON parsé dans content[0].text
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      const parsed = JSON.parse(text);

      if (!parsed.produits?.length) throw new Error('Aucun produit extrait. Essayez avec une image ou "Coller du texte".');
      setResult(parsed);
    } catch(e) {
      setError(`Erreur analyse : ${e.message}. Vérifiez votre connexion ou essayez avec un autre fichier.`);
    }
    setLoading(false);
  };

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setSaved(false);

    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'paste') {
      if (!manualText.trim()) return;
      await analyzeWithClaude(manualText, null, true);
      return;
    }
    if (!file) return;
    const b64 = await toBase64(file);
    await analyzeWithClaude(b64, file.type);
  };

  const handleSave = () => {
    if (!result?.produits?.length) return;
    const existing = JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}');
    const updated  = { ...existing };
    result.produits.forEach(p => {
      const key = p.ref || p.nom;
      updated[key] = {
        ref: p.ref, nom: p.nom, genre: p.genre||'mixte',
        categorie: p.categorie||'Parfum', prix: p.prix,
        maj: new Date().toISOString(),
      };
    });
    localStorage.setItem('chogan_prix_custom', JSON.stringify(updated));
    setSaved(true);
  };

  const handleReset = () => {
    if (!window.confirm('Réinitialiser tous les prix personnalisés ?')) return;
    localStorage.removeItem('chogan_prix_custom');
    setSaved(false);
    setResult(null);
    setFile(null);
    setPreview(null);
  };

  const customCount = Object.keys(JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}')).length;

  return (
    <div style={S.pad}>
      {/* Header info */}
      <div style={S.majInfo}>
        <p style={S.majTitle}>🔄 Mise à jour produits & prix</p>
        <p style={S.majDesc}>
          Importez un fichier PDF ou une photo du catalogue Chogan pour mettre à jour automatiquement les prix et les références.
        </p>
        {customCount > 0 && (
          <div style={S.majStatus}>
            <span style={{ color:'var(--green)', fontWeight:700 }}>✅ {customCount} produit(s) mis à jour</span>
            <button style={{ ...S.resetBtn, padding:'4px 10px', fontSize:11 }} onClick={handleReset}>
              Réinitialiser tout
            </button>
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div style={S.modeRow}>
        {[['upload','📎 Fichier / Photo'],['paste','✏️ Coller du texte']].map(([m,l]) => (
          <button key={m} style={{ ...S.modeBtn, ...(mode===m?S.modeBtnActive:{}) }} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === 'upload' && (
        <div>
          <label style={S.dropZone}>
            <input type="file" accept=".pdf,image/*" style={{ display:'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div style={{ textAlign:'center' }}>
                {preview && <img src={preview} alt="aperçu" style={{ maxWidth:'100%', maxHeight:180, borderRadius:10, marginBottom:10 }} />}
                <p style={{ fontSize:13, fontWeight:600, color:'var(--taupe)' }}>{file.name}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                  {(file.size/1024).toFixed(0)} KB · {file.type.includes('pdf')?'PDF':'Image'}
                </p>
                <p style={{ fontSize:11, color:'var(--or-deep)', marginTop:6 }}>Cliquez pour changer</p>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'10px 0' }}>
                <p style={{ fontSize:32, marginBottom:8 }}>📎</p>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--taupe)' }}>Glissez ou cliquez pour importer</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>PDF ou image (JPG, PNG, WEBP)</p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Paste mode */}
      {mode === 'paste' && (
        <div className="field">
          <label className="label">Collez votre liste de prix</label>
          <textarea
            rows={8}
            value={manualText}
            onChange={e => setManual(e.target.value)}
            placeholder={"Exemple :\nN°001 One Million 70ml = 35€\nN°002 Acqua Di Gio 30ml = 18€\n..."}
            style={{ resize:'vertical', fontFamily:'var(--font-body)', fontSize:13 }}
          />
        </div>
      )}

      {/* Analyze button */}
      <button className="btn-gold" style={{ marginTop:12 }}
        onClick={handleAnalyze}
        disabled={loading || (mode==='upload' && !file) || (mode==='paste' && !manualText.trim())}>
        {loading
          ? <span>🔍 Analyse en cours...</span>
          : <span>✨ Analyser avec Claude AI</span>
        }
      </button>

      {loading && (
        <div style={S.loadingBox}>
          <div style={S.spinner} />
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:10 }}>
            Claude analyse votre document et extrait les prix...
          </p>
        </div>
      )}

      {error && <div style={S.errorBox}>{error}</div>}

      {/* Results */}
      {result && !loading && (
        <div style={{ marginTop:16 }} className="fade-in">
          <div style={S.resultHeader}>
            <p style={{ fontSize:14, fontWeight:700, color:'var(--taupe)' }}>
              ✅ {result.produits?.length || 0} produit(s) extraits
            </p>
            {result.date_maj && <span className="badge badge-gold">{result.date_maj}</span>}
          </div>

          <div style={S.resultList}>
            {result.produits?.map((p, i) => (
              <div key={i} style={S.resultItem}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)' }}>N°{p.ref}</span>
                  <span style={{ fontSize:13, fontWeight:600, marginLeft:8 }}>{p.nom}</span>
                  <span className="badge" style={{ marginLeft:6, fontSize:9, background:`${p.genre==='homme'?'rgba(61,107,158,0.15)':p.genre==='femme'?'rgba(158,90,122,0.15)':'rgba(74,124,89,0.15)'}`, color: p.genre==='homme'?'var(--blue)':p.genre==='femme'?'#9e5a7a':'var(--green)', border:'1px solid transparent' }}>
                    {p.genre}
                  </span>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {p.prix && Object.entries(p.prix).filter(([,v])=>v!=null).map(([sz,px]) => (
                    <span key={sz} style={S.priceTag}>{sz}: {px}€</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {saved ? (
            <div style={S.savedBox}>✅ Prix enregistrés avec succès ! Le catalogue est mis à jour.</div>
          ) : (
            <button className="btn-gold" onClick={handleSave}>
              💾 ENREGISTRER LES PRIX
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { getPerfumeImage, preloadImages } from '../../utils/perfumeImages';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';
import { PERFUMES, PRODUITS_PROMO, GENDER_COLOR } from '../../utils/choganData';

const TABS = [
  { id:'inspirations',label:'🌹 Inspirations' },
  { id:'promo',       label:'🏷 Promo' },
  { id:'convert',     label:'💱 Convertisseur' },
  { id:'maj',         label:'🔄 Mise à jour' },
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
      {tab === 'maj'          && <MajPrixTab />}
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
// Flacon SVG élégant selon le genre avec ref
function BottleSVG({ gender, size=48, ref='' }) {
  const colors = { h:'#3d6b9e', f:'#9e5a7a', m:'#4a7c59' };
  const col = colors[gender] || '#B89A6A';
  const s = size;
  return (
    <svg width={s} height={s*1.5} viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bouchon */}
      <rect x="22" y="2" width="16" height="7" rx="3" fill={col} opacity="0.7"/>
      <rect x="26" y="7" width="8" height="5" rx="1" fill={col} opacity="0.5"/>
      {/* Corps du flacon */}
      <rect x="6" y="12" width="48" height="66" rx="10" fill={col} opacity="0.13"/>
      <rect x="6" y="12" width="48" height="66" rx="10" stroke={col} strokeWidth="1.5" fill="none"/>
      {/* Reflet */}
      <rect x="12" y="16" width="12" height="55" rx="5" fill={col} opacity="0.06"/>
      {/* Étiquette */}
      <rect x="11" y="32" width="38" height="28" rx="4" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="15" y="36" width="30" height="1.2" rx="1" fill={col} opacity="0.5"/>
      {/* Numéro de référence */}
      {ref && <text x="30" y="52" textAnchor="middle" fontSize="10" fontFamily="serif" fill={col} opacity="0.8" fontWeight="bold">N°{ref}</text>}
      <rect x="15" y="56" width="30" height="1" rx="1" fill={col} opacity="0.3"/>
      {/* Base */}
      <rect x="14" y="78" width="32" height="3" rx="1.5" fill={col} opacity="0.25"/>
    </svg>
  );
}


function InspirationsTab() {
  const [search, setSearch]     = useState('');
  const [gender, setGender]     = useState('tous');
  const [selected, setSelected] = useState(null);
  const [images, setImages]     = useState(() => {
    try { 
      const cache = JSON.parse(localStorage.getItem('chogan_img_cache')||'{}');
      const imgs = {};
      Object.entries(cache).forEach(([k, v]) => { imgs[k] = v?.url || null; });
      return imgs;
    } catch { return {}; }
  });
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const loadingRef = useRef(false);

  const customPrix = (() => { try { return JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}'); } catch { return {}; } })();
  const normalizeRef = r => (r||'').replace(/^[A-Za-z]+/,'').replace(/[A-Za-z]+$/,'').trim();

  const allProducts = (() => {
    const customList = Object.values(customPrix).map(p => ({
      id:`c-${p.ref}`, ref:normalizeRef(p.ref), name:p.nom||'', brand:p.marque||'Chogan',
      gender:p.genre==='homme'?'h':p.genre==='femme'?'f':'m',
      sizes:Object.entries(p.prix||{}).filter(([,v])=>v!=null).map(([s])=>s),
      prices:Object.fromEntries(Object.entries(p.prix||{}).filter(([,v])=>v!=null)),
      img:p.img||null,
      imgKey:p.imgKey||null,  // clé localStorage de l'image source
      crop:p.crop||null,       // coordonnées de crop
      custom:true,
    })).filter(p=>p.ref&&p.name&&p.sizes.length>0);
    const customRefs = new Set(customList.map(p=>p.ref));
    const staticFiltered = PERFUMES.filter(p=>!customRefs.has(normalizeRef(p.ref)));
    return [...customList,...staticFiltered].sort((a,b)=>(parseInt(a.ref)||0)-(parseInt(b.ref)||0));
  })();

  const clearImgCache = () => {
    localStorage.removeItem('chogan_img_cache');
    localStorage.removeItem('chogan_img_cache_v2');
    setImages({});
  };

  // Mapping des refs vers les fichiers flacons disponibles
  const BOTTLE_MAP = {
    '137':'137','138':'138','139':'139','140':'140',
    '141':'141','142':'142','143':'143','144':'144',
    '145':'145','146':'146','147':'147','147m':'147','147M':'147',
    '148':'148','148w':'148','148W':'148',
    '161':'161','161w':'161','161W':'161',
    '162':'162','162m':'162','162M':'162',
    '163':'163','163w':'163','163W':'163',
    '164':'164','164m':'164','164M':'164',
  };
  const getImg = (p) => {
    if (p.img) return p.img;
    // Essayer ref exact, puis ref normalisé (sans lettre), puis ref brut
    const norm = (p.ref||'').replace(/^[A-Za-z]+/,'').replace(/[A-Za-z]+$/,'').trim();
    const file = BOTTLE_MAP[p.ref] || BOTTLE_MAP[norm] || BOTTLE_MAP[p.ref?.toUpperCase()] || null;
    return file ? `/bottles/${file}.jpg` : null;
  };

  const getCropStyle = (p, containerW=100) => {
    if (!p.crop || !p.imgKey) return null;
    const sourceImg = localStorage.getItem(p.imgKey);
    if (!sourceImg) return null;
    const cr = p.crop;
    // Calcul: afficher seulement la région cr.x,cr.y,cr.w,cr.h (en % de l'image)
    const scale = 100 / cr.w;  // agrandir pour remplir le container
    return {
      backgroundImage: `url(${sourceImg})`,
      backgroundSize: `${scale * 100}%`,
      backgroundPosition: `${-(cr.x / cr.w) * 100}% ${-(cr.y / cr.h) * 100}%`,
      backgroundRepeat: 'no-repeat',
    };
  };

  const filtered = allProducts.filter(p => {
    const gMap = {h:'homme',f:'femme',m:'mixte'};
    if (gender!=='tous' && gMap[p.gender]!==gender) return false;
    if (search) { const q=search.toLowerCase(); return p.name.toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q)||p.ref.includes(search); }
    return true;
  });

  const GC = {h:'#3d6b9e',f:'#9e5a7a',m:'#4a7c59'};
  const GE = {h:'♂',f:'♀',m:'⚧'};
  // BottleSVG used instead of emoji

  if (selected) {
    const img = getImg(selected);
    return (
      <div style={S.pad}>
        <button style={S.backBtn} onClick={()=>setSelected(null)}>← Retour</button>
        <div style={{...S.detailCard, borderTop:`4px solid ${GC[selected.gender]||'var(--or)'}`}}>
          <div style={{...S.photoBox, background:`linear-gradient(135deg, ${GC[selected.gender]}18, ${GC[selected.gender]}05)`}}>
            {img
              ? <img src={img} alt={selected.name}
                    style={{maxHeight:180,maxWidth:'90%',objectFit:'contain',borderRadius:8}}
                    onError={e=>{e.target.style.display='none';}}
                  />
              : getCropStyle(selected)
                ? <div style={{width:160,height:160,borderRadius:10,overflow:'hidden',margin:'0 auto',...getCropStyle(selected)}} />
                : <div style={{textAlign:'center'}}><BottleSVG gender={selected.gender} size={80} ref={selected.ref} /></div>
            }
            {selected.custom && <span style={S.majBadge}>✅ MàJ</span>}
          </div>
          <div style={{padding:'14px'}}>
            <p style={{fontSize:11,fontWeight:700,color:GC[selected.gender]}}>N°{selected.ref} · {GE[selected.gender]}</p>
            <p style={{fontSize:18,fontWeight:700,fontFamily:'var(--font-display)',color:'var(--taupe)',letterSpacing:'0.04em',marginTop:2}}>{selected.name}</p>
            <p style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{selected.brand}</p>
            <div style={{borderTop:'1px solid var(--or-border)',paddingTop:12,marginTop:12}}>
              {selected.sizes.map(s=>(
                <div key={s} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(210,183,149,0.15)'}}>
                  <span style={{fontSize:13,color:'var(--taupe)'}}>{s}</span>
                  <span style={{fontSize:16,fontWeight:700,color:'var(--or-deep)'}}>{selected.prices?.[s]}€</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.pad}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <p style={{fontSize:11,color:'var(--text-muted)'}}>{filtered.length} réf.{Object.keys(customPrix).length>0?` · ${Object.keys(customPrix).length} MàJ`:''}</p>
        <button style={S.loadImgBtn} onClick={clearImgCache} title="Vider le cache photos">🗑 Cache photos</button>
      </div>

      <input placeholder="🔍 Nom, marque ou référence..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:10}} />
      <div style={S.filterRow}>
        {[['tous','Tous'],['homme','♂ Homme'],['femme','♀ Femme'],['mixte','⚧ Mixte']].map(([v,l])=>(
          <button key={v} style={{...S.filterBtn,...(gender===v?S.filterActive:{})}} onClick={()=>setGender(v)}>{l}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {filtered.map(p => {
          const img = getImg(p);
          return (
            <div key={p.id} style={S.perfumeCard} onClick={()=>setSelected(p)}>
              <div style={{...S.cardPhoto, background:`linear-gradient(135deg, ${GC[p.gender]||'var(--or)'}15, ${GC[p.gender]||'var(--or)'}05)`}}>
                {img
                  ? <img src={img} alt={p.name}
                      style={{width:'100%',height:'100%',objectFit:'contain',padding:4}}
                      onError={e=>e.target.replaceWith(Object.assign(document.createElement('div'),{className:'bottle-fallback'}))}
                    />
                  : getCropStyle(p)
                    ? <div style={{width:'100%',height:'100%',...getCropStyle(p)}} />
                    : <BottleSVG gender={p.gender} size={40} ref={p.ref} />
                }
                {p.custom && <span style={S.majBadgeSm}>MàJ</span>}
              </div>
              <div style={{padding:'8px 10px'}}>
                <p style={{fontSize:9,fontWeight:700,color:GC[p.gender],marginBottom:2}}>N°{p.ref} {GE[p.gender]}</p>
                <p style={{fontSize:12,fontWeight:600,lineHeight:1.3,color:'var(--taupe)'}}>{p.name}</p>
                <p style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{p.brand}</p>
                <p style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginTop:6}}>
                  dès {Math.min(...p.sizes.map(s=>p.prices?.[s]||99))}€
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


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

// ── MISE À JOUR ──────────────────────────────────────────────────
function MajPrixTab() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [imgB64, setImgB64]   = useState(null);
  const [imgType, setImgType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);
  const [manualText, setManual] = useState('');
  const [mode, setMode]       = useState('upload');

  const toBase64 = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(f); });
  const toDataURL = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

  const handleFile = async f => {
    if (!f) return;
    setFile(f); setResult(null); setSaved(false); setError('');
    if (f.type.startsWith('image/')) {
      const dataUrl = await toDataURL(f);
      setPreview(dataUrl);
      setImgB64(dataUrl.split(',')[1]);
      setImgType(f.type);
    } else {
      setPreview(null);
      setImgB64(await toBase64(f));
      setImgType(f.type);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(mode==='paste'
          ? { content:manualText, isText:true }
          : { content:imgB64, mediaType:imgType }
        ),
      });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error||`Erreur ${res.status}`); }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.content?.find(b=>b.type==='text')?.text||'';
      const parsed = JSON.parse(text);
      if (!parsed.produits?.length) throw new Error('Aucun produit extrait. Essayez avec une photo.');
      setResult({ ...parsed, sourceImg: preview });
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const handleSave = () => {
    if (!result?.produits?.length) return;
    const norm = r => (r||'').replace(/^[A-Za-z]+/,'').replace(/[A-Za-z]+$/,'').trim();

    // Stocker l'image source UNE SEULE FOIS (pas par produit)
    let imgKey = null;
    if (result.sourceImg) {
      imgKey = `chogan_src_${Date.now()}`;
      try {
        // Nettoyer les anciennes images sources
        Object.keys(localStorage).filter(k=>k.startsWith('chogan_src_')).forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(imgKey, result.sourceImg);
      } catch(e) {
        // Si trop grande, on ignore les images
        imgKey = null;
        console.warn('Image trop grande pour localStorage');
      }
    }

    const existing = JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}');
    const updated = {...existing};
    result.produits.forEach(p => {
      const ref = norm(p.ref);
      updated[ref] = {
        ref, nom:p.nom, genre:p.genre||'mixte', marque:p.marque||'',
        categorie:p.categorie||'Parfum', prix:p.prix,
        // Référence à l'image + coordonnées de crop (pas l'image entière)
        imgKey: imgKey,
        crop: (p.crop && p.crop.x != null) ? p.crop : null,
        img: null,
        maj: new Date().toISOString(),
      };
    });
    try {
      localStorage.setItem('chogan_prix_custom', JSON.stringify(updated));
      setSaved(true);
    } catch(e) {
      // Si toujours trop grand, sauvegarder sans images
      result.produits.forEach(p => { const ref=norm(p.ref); if(updated[ref]) { delete updated[ref].imgKey; delete updated[ref].crop; } });
      localStorage.setItem('chogan_prix_custom', JSON.stringify(updated));
      setSaved(true);
      alert('Produits enregistrés (images non sauvegardées — catalogue trop lourd).');
    }
  };

  const handleReset = () => {
    if (!window.confirm('Réinitialiser tous les produits mis à jour ?')) return;
    localStorage.removeItem('chogan_prix_custom');
    localStorage.removeItem('chogan_img_cache_v2');
    setSaved(false); setResult(null); setFile(null); setPreview(null);
  };

  const customCount = Object.keys(JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}')).length;

  return (
    <div style={S.pad}>
      <div style={S.majInfo}>
        <p style={S.majTitle}>🔄 Mise à jour produits & prix</p>
        <p style={S.majDesc}>Importez une <strong>photo</strong> ou un PDF du catalogue Chogan. Claude extrait automatiquement les prix et les images de chaque flacon.</p>
        {customCount > 0 && (
          <div style={S.majStatus}>
            <span style={{color:'var(--green)',fontWeight:700}}>✅ {customCount} produit(s) mis à jour</span>
            <button style={S.resetBtnSm} onClick={handleReset}>Réinitialiser tout</button>
          </div>
        )}
      </div>

      <div style={S.modeRow}>
        {[['upload','📎 Photo / PDF'],['paste','✏️ Texte']].map(([m,l])=>(
          <button key={m} style={{...S.modeBtn,...(mode===m?S.modeBtnActive:{})}} onClick={()=>setMode(m)}>{l}</button>
        ))}
      </div>

      {mode==='upload' && (
        <label style={S.dropZone}>
          <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
          {file ? (
            <div style={{textAlign:'center'}}>
              {preview && <img src={preview} alt="aperçu" style={{maxWidth:'100%',maxHeight:200,borderRadius:10,marginBottom:10,objectFit:'contain'}} />}
              <p style={{fontSize:13,fontWeight:600,color:'var(--taupe)'}}>{file.name}</p>
              <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{(file.size/1024).toFixed(0)} KB</p>
              <p style={{fontSize:11,color:'var(--or-deep)',marginTop:6}}>Touchez pour changer</p>
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <p style={{fontSize:40,marginBottom:8}}>📸</p>
              <p style={{fontSize:14,fontWeight:600,color:'var(--taupe)'}}>Photo ou PDF du catalogue</p>
              <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>JPG · PNG · WEBP · PDF</p>
            </div>
          )}
        </label>
      )}

      {mode==='paste' && (
        <div className="field">
          <label className="label">Collez votre liste de prix</label>
          <textarea rows={8} value={manualText} onChange={e=>setManual(e.target.value)}
            placeholder={"N°001 One Million 70ml = 35€\nN°002 Acqua Di Gio 30ml = 18€"}
            style={{resize:'vertical',fontFamily:'var(--font-body)',fontSize:13}} />
        </div>
      )}

      <button className="btn-gold" style={{marginTop:12}} onClick={handleAnalyze}
        disabled={loading||(mode==='upload'&&!file)||(mode==='paste'&&!manualText.trim())}>
        {loading ? '🔍 Analyse en cours...' : '✨ Analyser avec Claude AI'}
      </button>

      {loading && (
        <div style={{textAlign:'center',padding:'24px 0'}}>
          <div style={S.spinner}/>
          <p style={{fontSize:13,color:'var(--text-muted)',marginTop:10}}>Claude extrait les produits et les images...</p>
        </div>
      )}
      {error && <div style={S.errorBox}>{error}</div>}

      {result && !loading && (
        <div style={{marginTop:16}} className="fade-in">
          <p style={{fontSize:14,fontWeight:700,color:'var(--taupe)',marginBottom:10}}>
            ✅ {result.produits?.length||0} produit(s) trouvés
            {result.sourceImg && <span style={{fontSize:11,color:'var(--green)',marginLeft:8}}>📸 avec images</span>}
          </p>
          <div style={S.resultList}>
            {result.produits?.map((p,i)=>(
              <div key={i} style={{...S.resultItem,display:'flex',alignItems:'center',gap:10}}>
                {result.sourceImg && p.crop && (
                  <div style={{
                    width:44,height:44,borderRadius:8,overflow:'hidden',
                    flexShrink:0,border:'1px solid var(--or-border)',
                    backgroundImage:`url(${result.sourceImg})`,
                    backgroundSize:`${100/p.crop.w*100}%`,
                    backgroundPosition:`${-(p.crop.x/p.crop.w)*100}% ${-(p.crop.y/p.crop.h)*100}%`,
                    backgroundRepeat:'no-repeat',
                  }}/>
                )}
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:11,fontWeight:700,color:'var(--or-deep)'}}>N°{p.ref}</span>
                    <span style={{fontSize:13,fontWeight:600}}>{p.nom}</span>
                  </div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:3}}>
                    {p.prix && Object.entries(p.prix).filter(([,v])=>v!=null).map(([sz,px])=>(
                      <span key={sz} style={S.priceTag}>{sz}: {px}€</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {saved
            ? <div style={S.savedBox}>✅ Produits et images enregistrés !</div>
            : <button className="btn-gold" onClick={handleSave}>💾 ENREGISTRER</button>
          }
        </div>
      )}
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
  perfumeCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden', cursor:'pointer', boxShadow:'var(--shadow)' },
  cardPhoto: { height:100, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' },
  detailCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:16, overflow:'hidden', marginBottom:12 },
  photoBox: { height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' },
  majBadge: { position:'absolute', top:8, right:8, background:'rgba(74,124,89,0.9)', color:'white', fontSize:10, fontWeight:700, borderRadius:8, padding:'2px 8px' },
  majBadgeSm: { position:'absolute', top:4, right:4, background:'rgba(74,124,89,0.85)', color:'white', fontSize:8, fontWeight:700, borderRadius:6, padding:'1px 5px' },
  backBtn: { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block', fontFamily:'var(--font-body)' },
  majInfo: { background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:14, padding:'14px', marginBottom:14 },
  majTitle: { fontFamily:'var(--font-display)', fontSize:14, color:'var(--taupe)', letterSpacing:'0.06em', marginBottom:6 },
  majDesc: { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  majStatus: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:'1px solid var(--or-border)' },
  modeRow: { display:'flex', gap:8, marginBottom:14 },
  modeBtn: { flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--or-border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)' },
  modeBtnActive: { background:'var(--or-pale)', borderColor:'var(--or-deep)', color:'var(--or-deep)', fontWeight:700 },
  dropZone: { display:'block', border:'2px dashed var(--or-border)', borderRadius:14, padding:'24px 16px', cursor:'pointer', background:'rgba(210,183,149,0.04)', marginBottom:4 },
  spinner: { width:32, height:32, border:'3px solid var(--or-pale)', borderTop:'3px solid var(--or-deep)', borderRadius:'50%', margin:'0 auto', animation:'spin 0.8s linear infinite' },
  errorBox: { background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:10, padding:'12px', color:'var(--red)', fontSize:13, marginTop:12 },
  resultList: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden', marginBottom:14 },
  resultItem: { padding:'10px 14px', borderBottom:'1px solid var(--or-border)' },
  priceTag: { fontSize:10, padding:'2px 8px', background:'var(--or-pale)', color:'var(--or-deep)', borderRadius:20, border:'1px solid var(--or-border)', fontWeight:600 },
  savedBox: { background:'rgba(74,124,89,0.1)', border:'1px solid rgba(74,124,89,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, fontWeight:600, textAlign:'center' },
  resetBtnSm: { background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', color:'var(--red)', borderRadius:8, padding:'5px 12px', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  loadImgBtn: { background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', borderRadius:20, padding:'5px 14px', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  progressBar: { height:4, background:'rgba(210,183,149,0.2)', borderRadius:2, overflow:'hidden', marginBottom:12 },
  progressFill: { height:'100%', background:'linear-gradient(90deg, var(--or), var(--or-deep))', borderRadius:2, transition:'width 0.3s ease' },
  venteFiche: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:16, marginBottom:12 },
  venteTitle: { fontFamily:'var(--font-display)', fontSize:13, color:'var(--or-deep)', letterSpacing:'0.08em', marginBottom:14, paddingBottom:10, borderBottom:'1px solid var(--or-border)' },
  backLink: { background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'0 0 14px', display:'block' },
  qtyBtn: { width:26, height:26, borderRadius:6, background:'var(--or-pale)', border:'1px solid var(--or-border)', color:'var(--or-deep)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' },
};

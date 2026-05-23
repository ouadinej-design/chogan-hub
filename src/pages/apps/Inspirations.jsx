import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { PERFUMES, PRODUITS_PROMO } from '../../utils/choganData';

// ── Flacon SVG élégant ────────────────────────────────────────────
function BottleSVG({ gender, size=48, ref:refNum='' }) {
  const col = { h:'#3d6b9e', f:'#9e5a7a', m:'#4a7c59' }[gender] || '#B89A6A';
  return (
    <svg width={size} height={size*1.5} viewBox="0 0 60 90" fill="none">
      <rect x="22" y="2" width="16" height="7" rx="3" fill={col} opacity="0.7"/>
      <rect x="26" y="7" width="8" height="5" rx="1" fill={col} opacity="0.5"/>
      <rect x="6" y="12" width="48" height="66" rx="10" fill={col} opacity="0.13"/>
      <rect x="6" y="12" width="48" height="66" rx="10" stroke={col} strokeWidth="1.5" fill="none"/>
      <rect x="12" y="16" width="12" height="55" rx="5" fill={col} opacity="0.06"/>
      <rect x="11" y="32" width="38" height="28" rx="4" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeOpacity="0.3"/>
      <rect x="15" y="36" width="30" height="1.2" rx="1" fill={col} opacity="0.5"/>
      {refNum && <text x="30" y="52" textAnchor="middle" fontSize="10" fontFamily="serif" fill={col} opacity="0.8" fontWeight="bold">N°{refNum}</text>}
      <rect x="15" y="56" width="30" height="1" rx="1" fill={col} opacity="0.3"/>
      <rect x="14" y="78" width="32" height="3" rx="1.5" fill={col} opacity="0.25"/>
    </svg>
  );
}

// Refs ayant une photo réelle dans /public/bottles/
const BOTTLE_REFS = new Set([
  '003','012','027','040','044','049','054','056','068','073',
  '099','105','118','119','120','122','131','132','133',
  '137','138','139','140','141','142','143','144',
  '145','146','147','148',
  '161','162','163','164',
]);

const GENDER_COLOR = { h:'#3d6b9e', f:'#9e5a7a', m:'#4a7c59' };

// ── InspirationsTab ───────────────────────────────────────────────
function InspirationsTab() {
  const [search,   setSearch]   = useState('');
  const [gender,   setGender]   = useState('tous');
  const [selected, setSelected] = useState(null);

  const customPrix = (() => { try { return JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}'); } catch { return {}; } })();
  const norm = r => (r||'').replace(/^[A-Za-z]+/,'').replace(/[A-Za-z]+$/,'').trim();

  const allProducts = (() => {
    const customList = Object.values(customPrix).map(p => ({
      id:`c-${norm(p.ref)}`, ref:norm(p.ref), name:p.nom||'', brand:p.marque||'Chogan',
      gender:p.genre==='homme'?'h':p.genre==='femme'?'f':'m',
      sizes:Object.entries(p.prix||{}).filter(([,v])=>v!=null).map(([s])=>s),
      prices:Object.fromEntries(Object.entries(p.prix||{}).filter(([,v])=>v!=null)),
      custom:true,
    })).filter(p=>p.ref&&p.name&&p.sizes.length>0);
    const customRefs = new Set(customList.map(p=>p.ref));
    const staticList = PERFUMES.filter(p=>!customRefs.has(norm(String(p.ref)))).map(p=>({
      ...p, ref:String(p.ref),
      gender:p.gender==='homme'?'h':p.gender==='femme'?'f':'m',
    }));
    return [...customList,...staticList].sort((a,b)=>(parseInt(a.ref)||0)-(parseInt(b.ref)||0));
  })();

  const filtered = allProducts.filter(p => {
    const gMap = {h:'homme',f:'femme',m:'mixte'};
    if (gender!=='tous' && gMap[p.gender]!==gender) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q)||p.ref.includes(search);
  });

  const getBottleImg = (ref) => {
    const r = norm(ref);
    for (const v of [r, ref, ref+'m', ref+'M', ref+'w', ref+'W'])
      if (BOTTLE_REFS.has(v)) return `/bottles/${v}.jpg`;
    return null;
  };

  const GC = {h:'#3d6b9e',f:'#9e5a7a',m:'#4a7c59'};
  const GL = {h:'♂',f:'♀',m:'⚧'};

  if (selected) {
    const img = getBottleImg(selected.ref);
    const col = GC[selected.gender]||'var(--or)';
    const minPrice = selected.sizes.length>0 ? Math.min(...selected.sizes.map(s=>selected.prices?.[s]||99)) : 0;
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={()=>setSelected(null)}>← Retour catalogue</button>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 24px rgba(210,183,149,0.12)'}}>
          {/* Zone photo */}
          <div style={{height:220,background:`linear-gradient(160deg,${col}10 0%,rgba(247,235,225,0.6) 60%,${col}08 100%)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
            {img
              ? <img src={img} alt={selected.name} style={{maxHeight:200,maxWidth:'85%',objectFit:'contain',filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.12))'}} onError={e=>{e.target.style.display='none';}}/>
              : <BottleSVG gender={selected.gender} size={90} refNum={selected.ref}/>
            }
            <div style={{position:'absolute',top:12,left:12,background:'rgba(255,255,255,0.85)',backdropFilter:'blur(8px)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:col,border:`1px solid ${col}30`}}>
              N°{selected.ref} {GL[selected.gender]}
            </div>
            {selected.custom && <span style={{position:'absolute',top:12,right:12,background:'rgba(74,124,89,0.9)',color:'white',fontSize:10,fontWeight:700,borderRadius:12,padding:'3px 10px'}}>✅ MàJ</span>}
          </div>
          {/* Infos */}
          <div style={{padding:'18px 16px'}}>
            <p style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--taupe)',letterSpacing:'0.04em'}}>{selected.name}</p>
            <p style={{fontSize:12,color:'var(--text-muted)',marginTop:4,marginBottom:14}}>Inspiré de {selected.brand}</p>
            <div style={{background:'rgba(210,183,149,0.08)',borderRadius:12,overflow:'hidden',border:'1px solid var(--or-border)'}}>
              {selected.sizes.map((s,i)=>(
                <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderBottom:i<selected.sizes.length-1?'1px solid rgba(210,183,149,0.15)':'none'}}>
                  <span style={{fontSize:13,color:'var(--taupe)',fontWeight:500}}>{s}</span>
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
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <p style={{fontSize:11,color:'var(--text-muted)',letterSpacing:'0.04em'}}>{filtered.length} parfum{filtered.length>1?'s':''}</p>
        {Object.keys(customPrix).length>0&&<span style={{fontSize:10,color:'var(--green)',fontWeight:700,background:'rgba(74,124,89,0.1)',padding:'3px 10px',borderRadius:20,border:'1px solid rgba(74,124,89,0.2)'}}>✅ {Object.keys(customPrix).length} mis à jour</span>}
      </div>

      {/* Recherche */}
      <div style={{position:'relative',marginBottom:12}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'var(--text-muted)'}}>🔍</span>
        <input
          placeholder="Nom, marque ou référence..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{paddingLeft:36,paddingRight:12}}
        />
      </div>

      {/* Filtres genre */}
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2}}>
        {[['tous','Tous'],['homme','♂ Homme'],['femme','♀ Femme'],['mixte','⚧ Mixte']].map(([v,l])=>(
          <button key={v} onClick={()=>setGender(v)}
            style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${gender===v?'var(--or-deep)':'var(--or-border)'}`,background:gender===v?'var(--or-deep)':'transparent',color:gender===v?'#fff':'var(--text-muted)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)',whiteSpace:'nowrap',flexShrink:0,fontWeight:gender===v?600:400,transition:'all 0.15s'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Grille produits */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {filtered.map(p=>{
          const img = getBottleImg(p.ref);
          const col = GC[p.gender]||'#B89A6A';
          const minP = p.sizes.length>0 ? Math.min(...p.sizes.map(s=>p.prices?.[s]||99)) : 0;
          return (
            <div key={p.id||p.ref} onClick={()=>setSelected(p)}
              style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:16,overflow:'hidden',cursor:'pointer',transition:'transform 0.15s',boxShadow:'0 2px 12px rgba(210,183,149,0.08)'}}>
              {/* Photo */}
              <div style={{height:120,background:`linear-gradient(135deg,${col}10,rgba(247,235,225,0.4))`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                {img
                  ? <img src={img} alt={p.name} style={{maxHeight:108,maxWidth:'90%',objectFit:'contain',filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.10))'}} onError={e=>{e.target.style.display='none';}}/>
                  : <BottleSVG gender={p.gender} size={44} refNum={p.ref}/>
                }
                <span style={{position:'absolute',top:6,left:6,fontSize:9,fontWeight:700,color:col,background:'rgba(255,255,255,0.85)',borderRadius:10,padding:'2px 7px'}}>{GL[p.gender]}</span>
                {p.custom&&<span style={{position:'absolute',top:6,right:6,fontSize:8,fontWeight:700,color:'var(--green)',background:'rgba(74,124,89,0.12)',borderRadius:8,padding:'2px 6px',border:'1px solid rgba(74,124,89,0.2)'}}>MàJ</span>}
              </div>
              {/* Texte */}
              <div style={{padding:'10px'}}>
                <p style={{fontSize:9,color:'var(--text-dim)',marginBottom:3,letterSpacing:'0.06em'}}>N°{p.ref}</p>
                <p style={{fontSize:13,fontWeight:600,color:'var(--taupe)',lineHeight:1.25,marginBottom:2}}>{p.name}</p>
                <p style={{fontSize:10,color:'var(--text-muted)',marginBottom:6}}>{p.brand}</p>
                <p style={{fontSize:12,fontWeight:700,color:'var(--or-deep)'}}>dès {minP}€</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PromoTab ──────────────────────────────────────────────────────
function PromoTab() {
  const [devise, setDevise] = useState('eur');
  const [taux,   setTaux]   = useState('290');
  const [promos, setPromos] = useState({});
  const [qtes,   setQtes]   = useState({});
  const [sel,    setSel]    = useState(null);
  const tx = parseFloat(taux)||290;

  const calc = (p) => {
    const paEur = p.prixEur + p.emballage;
    const paDzd = Math.round((p.prixEur + (p.transportDzd||0) + p.emballage) * tx);
    const pa    = devise==='eur' ? paEur : paDzd;
    const min   = devise==='eur' ? parseFloat((paEur*1.04).toFixed(2)) : Math.round(paDzd*1.04);
    const val   = parseFloat(promos[p.id])||0;
    const qty   = parseInt(qtes[p.id])||0;
    const marge = val>0&&val>=min ? (devise==='eur'?parseFloat(((val-pa)*qty).toFixed(2)):Math.round((val-pa)*qty)) : 0;
    return { pa, min, val, qty, marge, ok:val>=min };
  };
  const fmt = v => devise==='eur'?v.toFixed(2)+' €':v.toLocaleString('fr-FR')+' DA';
  const totalMarge = PRODUITS_PROMO.reduce((s,p)=>s+calc(p).marge,0);

  if (sel) {
    const p = PRODUITS_PROMO.find(x=>x.id===sel);
    const c = calc(p);
    return (
      <div style={S.pad}>
        <button style={S.back} onClick={()=>setSel(null)}>← Retour</button>
        <p style={{fontFamily:'var(--font-display)',fontSize:17,color:'var(--taupe)',marginBottom:14}}>{p.nom}</p>
        <div style={S.promoCard}>
          <div style={{textAlign:'center',padding:'10px',background:'rgba(74,124,89,0.08)',borderRadius:10}}>
            <p style={{fontSize:10,color:'var(--green)',marginBottom:4}}>Prix minimum</p>
            <p style={{fontSize:26,fontWeight:700,color:'var(--green)'}}>{fmt(c.min)}</p>
          </div>
        </div>
        <div style={S.promoCard}>
          <div className="field"><label className="label">Mon prix promo ({devise==='eur'?'€':'DA'})</label>
            <input type="number" value={promos[p.id]||''} onChange={e=>setPromos(v=>({...v,[p.id]:e.target.value}))} placeholder={`Min: ${fmt(c.min)}`}/>
            {c.val>0&&<p style={{fontSize:11,marginTop:4,color:c.ok?'var(--green)':'var(--red)'}}>{c.ok?'✅ Valide':'⚠️ Trop bas'}</p>}
          </div>
          <div className="field"><label className="label">Quantité</label>
            <input type="number" value={qtes[p.id]||''} onChange={e=>setQtes(v=>({...v,[p.id]:e.target.value}))} placeholder="0"/>
          </div>
          {c.marge>0&&<div style={{textAlign:'center',background:'var(--or-pale)',borderRadius:10,padding:14}}>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Marge générée</p>
            <p style={{fontSize:26,fontWeight:700,color:'var(--or-deep)'}}>{fmt(c.marge)}</p>
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div style={S.pad}>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[['eur','🇫🇷 €'],['dzd','🇩🇿 DA']].map(([v,l])=>(
          <button key={v} style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${devise===v?'var(--or-deep)':'var(--or-border)'}`,background:devise===v?'var(--or-pale)':'transparent',color:devise===v?'var(--or-deep)':'var(--text-muted)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600}} onClick={()=>{setDevise(v);setPromos({});setQtes({});}}>{l}</button>
        ))}
      </div>
      {devise==='dzd'&&<div className="field"><label className="label">Taux (1€ = ? DA)</label><input type="number" value={taux} onChange={e=>setTaux(e.target.value)}/></div>}
      {totalMarge>0&&<div style={{background:'var(--or-pale)',border:'1px solid var(--or-border)',borderRadius:12,padding:'12px 16px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:12,color:'var(--text-muted)'}}>Total marge</span><span style={{fontSize:18,fontWeight:700,color:'var(--or-deep)'}}>{fmt(totalMarge)}</span></div>}
      {PRODUITS_PROMO.map(p=>{
        const c=calc(p);
        return (
          <div key={p.id} style={{...S.promoCard,display:'flex',alignItems:'center',gap:10,cursor:'pointer',borderLeft:`3px solid ${c.marge>0?'var(--or-deep)':'var(--or-border)'}`}} onClick={()=>setSel(p.id)}>
            <div style={{flex:1}}>
              <p style={{fontSize:13,fontWeight:600}}>{p.nom}</p>
              <div style={{display:'flex',gap:10,marginTop:3}}>
                <span style={{fontSize:11,color:'var(--text-muted)'}}>PA: {fmt(c.pa)}</span>
                <span style={{fontSize:11,color:'var(--green)'}}>Min: {fmt(c.min)}</span>
              </div>
              {c.marge>0&&<p style={{fontSize:11,color:'var(--or-deep)',fontWeight:600,marginTop:2}}>Marge: {fmt(c.marge)} (×{c.qty})</p>}
            </div>
            <span style={{color:'var(--or-deep)',fontSize:18}}>›</span>
          </div>
        );
      })}
    </div>
  );
}

// ── ConvertisseurTab ──────────────────────────────────────────────
function ConvertisseurTab() {
  const [eur, setEur]   = useState('');
  const [rate, setRate] = useState('245');
  const dzd = eur && !isNaN(+eur) ? Math.round(+eur*(+rate||245)) : null;
  return (
    <div style={S.pad}>
      <div style={S.promoCard}>
        <p style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>💱 EUR → DZD</p>
        <div className="field"><label className="label">Taux (1€ = ? DA)</label><input type="number" value={rate} onChange={e=>setRate(e.target.value)} style={{fontSize:18,textAlign:'center',fontWeight:700}}/></div>
        <div className="field"><label className="label">Montant (€)</label><input type="number" value={eur} onChange={e=>setEur(e.target.value)} placeholder="0.00" style={{fontSize:22,textAlign:'center',fontWeight:700}}/></div>
        {dzd!==null&&<div style={{textAlign:'center',padding:'16px 0'}}>
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:4}}>{eur} € =</p>
          <p style={{fontSize:46,fontWeight:700,color:'var(--or-deep)',fontFamily:'var(--font-display)',lineHeight:1}}>{dzd.toLocaleString('fr-FR')}</p>
          <p style={{fontSize:14,color:'var(--or-deep)',marginTop:4}}>Dinars algériens</p>
        </div>}
      </div>
      <p style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'}}>Conversions rapides</p>
      {[11.90,18,25.50,35,45,48,52,57,65].map(p=>(
        <div key={p} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:10,marginBottom:6}}>
          <span style={{fontSize:13,fontWeight:500}}>{p.toFixed(2)} €</span>
          <span style={{fontSize:14,fontWeight:700,color:'var(--or-deep)'}}>{Math.round(p*(+rate||245)).toLocaleString('fr-FR')} DA</span>
        </div>
      ))}
    </div>
  );
}

// ── MajPrixTab ────────────────────────────────────────────────────
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

  const toB64 = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

  const handleFile = async f => {
    if (!f) return; setFile(f); setResult(null); setSaved(false); setError('');
    const dataUrl = await toB64(f);
    if (f.type.startsWith('image/')) setPreview(dataUrl);
    else setPreview(null);
    setImgB64(dataUrl.split(',')[1]);
    setImgType(f.type);
  };

  const handleAnalyze = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(mode==='paste' ? {content:manualText,isText:true} : {content:imgB64,mediaType:imgType}),
      });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error||`Erreur ${res.status}`); }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.content?.find(b=>b.type==='text')?.text||'';
      const parsed = JSON.parse(text);
      if (!parsed.produits?.length) throw new Error('Aucun produit extrait.');
      setResult({...parsed, sourceImg:preview});
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const handleSave = () => {
    if (!result?.produits?.length) return;
    const norm = r => (r||'').replace(/^[A-Za-z]+/,'').replace(/[A-Za-z]+$/,'').trim();
    let imgKey = null;
    if (result.sourceImg) {
      imgKey = `chogan_src_${Date.now()}`;
      try {
        Object.keys(localStorage).filter(k=>k.startsWith('chogan_src_')).forEach(k=>localStorage.removeItem(k));
        localStorage.setItem(imgKey, result.sourceImg);
      } catch { imgKey = null; }
    }
    const existing = JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}');
    const updated = {...existing};
    result.produits.forEach(p => {
      const ref = norm(p.ref);
      updated[ref] = { ref, nom:p.nom, genre:p.genre||'mixte', marque:p.marque||'', categorie:p.categorie||'Parfum', prix:p.prix, imgKey, crop:p.crop||null, img:null, maj:new Date().toISOString() };
    });
    try { localStorage.setItem('chogan_prix_custom', JSON.stringify(updated)); setSaved(true); }
    catch { alert('Produits enregistrés (images non sauvegardées — trop lourd).'); setSaved(true); }
  };

  const handleReset = () => {
    if (!window.confirm('Réinitialiser tous les produits ?')) return;
    localStorage.removeItem('chogan_prix_custom');
    Object.keys(localStorage).filter(k=>k.startsWith('chogan_src_')).forEach(k=>localStorage.removeItem(k));
    setSaved(false); setResult(null); setFile(null); setPreview(null);
  };

  const customCount = Object.keys(JSON.parse(localStorage.getItem('chogan_prix_custom')||'{}')).length;

  return (
    <div style={S.pad}>
      <div style={S.majInfo}>
        <p style={{fontFamily:'var(--font-display)',fontSize:14,color:'var(--taupe)',marginBottom:6}}>🔄 Mise à jour produits & prix</p>
        <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>Importez une photo ou PDF du catalogue Chogan. Claude extrait automatiquement les prix et références.</p>
        {customCount>0&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,paddingTop:10,borderTop:'1px solid var(--or-border)'}}>
          <span style={{color:'var(--green)',fontWeight:700}}>✅ {customCount} produit(s)</span>
          <button style={{background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.2)',color:'var(--red)',borderRadius:8,padding:'5px 12px',fontSize:11,cursor:'pointer',fontFamily:'var(--font-body)',fontWeight:600}} onClick={handleReset}>Réinitialiser</button>
        </div>}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[['upload','📎 Photo / PDF'],['paste','✏️ Texte']].map(([m,l])=>(
          <button key={m} style={{flex:1,padding:10,borderRadius:10,border:`1px solid ${mode===m?'var(--or-deep)':'var(--or-border)'}`,background:mode===m?'var(--or-pale)':'transparent',color:mode===m?'var(--or-deep)':'var(--text-muted)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)'}} onClick={()=>setMode(m)}>{l}</button>
        ))}
      </div>
      {mode==='upload'&&(
        <label style={{display:'block',border:'2px dashed var(--or-border)',borderRadius:14,padding:'24px 16px',cursor:'pointer',background:'rgba(210,183,149,0.04)',marginBottom:4}}>
          <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
          {file ? (
            <div style={{textAlign:'center'}}>
              {preview&&<img src={preview} alt="aperçu" style={{maxWidth:'100%',maxHeight:200,borderRadius:10,marginBottom:10,objectFit:'contain'}}/>}
              <p style={{fontSize:13,fontWeight:600,color:'var(--taupe)'}}>{file.name}</p>
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
      {mode==='paste'&&<div className="field"><label className="label">Liste de prix</label><textarea rows={8} value={manualText} onChange={e=>setManual(e.target.value)} placeholder={"N°001 One Million 70ml = 35€\nN°002 Acqua Di Gio 30ml = 18€"} style={{resize:'vertical',fontFamily:'var(--font-body)',fontSize:13}}/></div>}
      <button className="btn-gold" style={{marginTop:12}} onClick={handleAnalyze} disabled={loading||(mode==='upload'&&!file)||(mode==='paste'&&!manualText.trim())}>
        {loading?'🔍 Analyse en cours...':'✨ Analyser avec Claude AI'}
      </button>
      {loading&&<div style={{textAlign:'center',padding:'24px 0'}}><p style={{fontSize:13,color:'var(--text-muted)'}}>Analyse en cours...</p></div>}
      {error&&<div style={{background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.2)',borderRadius:10,padding:'12px',color:'var(--red)',fontSize:13,marginTop:12}}>{error}</div>}
      {result&&!loading&&(
        <div style={{marginTop:16}}>
          <p style={{fontSize:14,fontWeight:700,color:'var(--taupe)',marginBottom:10}}>✅ {result.produits?.length||0} produit(s) extraits</p>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
            {result.produits?.map((p,i)=>(
              <div key={i} style={{padding:'10px 14px',borderBottom:'1px solid var(--or-border)',display:'flex',alignItems:'center',gap:8}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:6}}><span style={{fontSize:11,fontWeight:700,color:'var(--or-deep)'}}>N°{p.ref}</span><span style={{fontSize:13,fontWeight:600}}>{p.nom}</span></div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:3}}>
                    {p.prix&&Object.entries(p.prix).filter(([,v])=>v!=null).map(([sz,px])=>(
                      <span key={sz} style={{fontSize:10,padding:'2px 8px',background:'var(--or-pale)',color:'var(--or-deep)',borderRadius:20,border:'1px solid var(--or-border)',fontWeight:600}}>{sz}: {px}€</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {saved
            ? <div style={{background:'rgba(74,124,89,0.1)',border:'1px solid rgba(74,124,89,0.3)',borderRadius:10,padding:'12px',color:'var(--green)',fontSize:13,fontWeight:600,textAlign:'center'}}>✅ Enregistré !</div>
            : <button className="btn-gold" onClick={handleSave}>💾 ENREGISTRER</button>
          }
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
const TABS = [
  {id:'inspirations',label:'🌹 Inspirations'},
  {id:'promo',       label:'🏷 Promo'},
  {id:'convert',     label:'💱 Convertisseur'},
  {id:'maj',         label:'🔄 Mise à jour'},
];

export default function Inspirations() {
  const [tab, setTab] = useState('inspirations');
  return (
    <AppLayout title="Inspirations" icon="🌹">
      <div style={{display:'flex',borderBottom:'1px solid var(--or-border)',overflowX:'auto',scrollbarWidth:'none'}}>
        {TABS.map(t=>(
          <button key={t.id} style={{flex:1,padding:'12px 6px',background:'none',color:tab===t.id?'var(--or-deep)':'var(--text-muted)',fontSize:11,borderBottom:tab===t.id?'2px solid var(--or-deep)':'2px solid transparent',whiteSpace:'nowrap',border:'none',cursor:'pointer',fontFamily:'var(--font-body)'}} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab==='inspirations' && <InspirationsTab/>}
      {tab==='promo'        && <PromoTab/>}
      {tab==='convert'      && <ConvertisseurTab/>}
      {tab==='maj'          && <MajPrixTab/>}
    </AppLayout>
  );
}

const S = {
  pad: { padding:16 },
  back: { background:'none',border:'none',color:'var(--text-muted)',fontSize:13,cursor:'pointer',padding:'0 0 14px',display:'block',fontFamily:'var(--font-body)' },
  filterRow: { display:'flex',gap:6,marginBottom:12,flexWrap:'wrap' },
  filterBtn: { background:'var(--bg-card)',border:'1px solid var(--or-border)',color:'var(--text-muted)',borderRadius:20,padding:'5px 12px',fontSize:11,cursor:'pointer',fontFamily:'var(--font-body)' },
  filterActive: { background:'var(--or-pale)',borderColor:'var(--or-deep)',color:'var(--or-deep)' },
  card: { background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,overflow:'hidden',cursor:'pointer' },
  cardPhoto: { height:100,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden' },
  detailCard: { background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:16,overflow:'hidden',marginBottom:12 },
  photoBox: { height:200,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden' },
  majBadge: { position:'absolute',top:8,right:8,background:'rgba(74,124,89,0.9)',color:'white',fontSize:10,fontWeight:700,borderRadius:8,padding:'2px 8px' },
  majBadgeSm: { position:'absolute',top:4,right:4,background:'rgba(74,124,89,0.85)',color:'white',fontSize:8,fontWeight:700,borderRadius:6,padding:'1px 5px' },
  promoCard: { background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:12,padding:14,marginBottom:10 },
  majInfo: { background:'rgba(210,183,149,0.08)',border:'1px solid var(--or-border)',borderRadius:14,padding:'14px',marginBottom:14 },
};

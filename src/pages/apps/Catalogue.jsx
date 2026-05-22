import { useState } from 'react';
import AppLayout from '../../components/AppLayout';

const CATALOGUE = [
  { id:'p1', cat:'Parfums Homme', name:'N°001 - Inspiré Sauvage', price:35, desc:'Fraîcheur épicée, accord bois et agrumes. 50ml EDP' },
  { id:'p2', cat:'Parfums Homme', name:'N°005 - Inspiré Bleu', price:35, desc:'Marine aquatique, cèdre et musc blanc. 50ml EDP' },
  { id:'p3', cat:'Parfums Homme', name:'N°012 - Inspiré 1 Million', price:38, desc:'Mandarine, cannelle et cuir. Très sensuel. 50ml EDP' },
  { id:'p4', cat:'Parfums Femme', name:'N°002 - Inspiré Miss', price:35, desc:'Rose, lychee et musc. Élégant et féminin. 50ml EDP' },
  { id:'p5', cat:'Parfums Femme', name:'N°008 - Inspiré Coco', price:38, desc:'Iris, vanille et bois de santal. Chaud et gourmand.' },
  { id:'p6', cat:'Parfums Femme', name:'N°015 - Inspiré J\'adore', price:38, desc:'Jasmin, rose et ylang. Floral et luxueux. 50ml EDP' },
  { id:'p7', cat:'Parfums Mixte', name:'N°020 - Inspiré CK One', price:30, desc:'Fraîcheur bergamote, thé vert et musc propre.' },
  { id:'p8', cat:'Soins', name:'Crème Visage Gold Line', price:42, desc:'Soin anti-âge avec or 24K et acide hyaluronique.' },
  { id:'p9', cat:'Soins', name:'Sérum Éclat', price:48, desc:'Vitamine C concentrée pour un teint lumineux.' },
  { id:'p10', cat:'Coffrets', name:'Coffret Découverte Femme', price:65, desc:'3 parfums féminins phares en format voyage 15ml.' },
  { id:'p11', cat:'Coffrets', name:'Coffret Couple', price:70, desc:'1 parfum homme + 1 parfum femme, idéal cadeau.' },
  { id:'p12', cat:'Maison', name:'Bougie Parfumée Amber', price:28, desc:'100% cire de soja, 40h de combustion. Ambre et vanille.' },
];

const CATS = ['Tous', ...new Set(CATALOGUE.map(p => p.cat))];

export default function Catalogue() {
  const [cat, setCat] = useState('Tous');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = CATALOGUE.filter(p =>
    (cat === 'Tous' || p.cat === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <AppLayout title="Catalogue" icon="💎">
        <div style={{ padding:16 }}>
          <button style={{ background:'none', color:'var(--text-muted)', fontSize:13, padding:'8px 0', marginBottom:12, display:'block', cursor:'pointer', border:'none' }} onClick={()=>setSelected(null)}>← Retour</button>
          <div style={S.detailCard}>
            <div style={S.productIcon}>💎</div>
            <div className="badge badge-gold" style={{ marginBottom:12 }}>{selected.cat}</div>
            <h2 style={{ fontFamily:'var(--font-display)', color:'var(--gold)', fontSize:18, marginBottom:8, letterSpacing:'0.05em' }}>{selected.name}</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:16 }}>{selected.desc}</p>
            <div style={S.priceTag}>{selected.price}€</div>
            <p style={{ fontSize:11, color:'var(--text-dim)', textAlign:'center', marginTop:12 }}>
              Ajoutez ce produit via l'application Commandes
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Catalogue" icon="💎">
      <div style={{ padding:'12px 16px 0' }}>
        <input placeholder="🔍 Rechercher un produit..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:12 }} />
        <div style={S.catRow}>
          {CATS.map(c => (
            <button key={c} style={{ ...S.catBtn, ...(cat===c?S.catActive:{}) }} onClick={()=>setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:'4px 16px 16px' }}>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>{filtered.length} produit(s)</div>
        {filtered.map(p => (
          <div key={p.id} style={S.productCard} onClick={()=>setSelected(p)} className="fade-in">
            <div style={S.productIconSm}>💎</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:'var(--text-dim)', marginBottom:2 }}>{p.cat}</div>
              <div style={{ fontSize:14, fontWeight:600 }}>{p.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4, lineHeight:1.4 }}>{p.desc.substring(0,60)}...</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontWeight:700, color:'var(--gold)', fontSize:16 }}>{p.price}€</div>
              <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:4 }}>→</div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

const S = {
  catRow: { display:'flex', gap:8, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none', marginBottom:8 },
  catBtn: { background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:20, padding:'6px 14px', fontSize:12, whiteSpace:'nowrap', flexShrink:0, cursor:'pointer' },
  catActive: { background:'var(--gold-pale)', border:'1px solid var(--gold)', color:'var(--gold)' },
  productCard: { display:'flex', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:10, cursor:'pointer' },
  productIconSm: { fontSize:24, flexShrink:0, marginTop:2 },
  detailCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'24px', textAlign:'center' },
  productIcon: { fontSize:48, marginBottom:12 },
  priceTag: { display:'inline-block', background:'var(--gold-pale)', border:'1px solid var(--gold)', borderRadius:20, padding:'8px 24px', fontSize:24, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-display)' },
};

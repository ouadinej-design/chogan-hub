import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const EVENT_TYPES = ['Salon/Expo','Réunion domicile','Réseaux sociaux','Réunion équipe','Brocante','Événement Privé','Autre'];
const CATS_V = ['Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];

const STRATEGIC = [
  { n:'Aïd el-Fitr',    d:'2026-03-20', t:'mus' },{ n:'Aïd el-Adha',      d:'2026-05-27', t:'mus' },
  { n:'Mawlid',         d:'2026-09-10', t:'mus' },{ n:'Noël',              d:'2026-12-25', t:'cath' },
  { n:'Saint-Valentin', d:'2026-02-14', t:'comm'},{ n:'Fête des Mères',    d:'2026-05-31', t:'comm' },
  { n:'Fête des Pères', d:'2026-06-21', t:'comm'},{ n:'Black Friday',      d:'2026-11-27', t:'comm' },
  { n:'Printemps',      d:'2026-03-20', t:'saison'},{ n:'Été',             d:'2026-06-21', t:'saison' },
  { n:'Automne',        d:'2026-09-23', t:'saison'},{ n:'Hiver',           d:'2026-12-21', t:'saison' },
];
const TC = { mus:'#059669', cath:'#7c3aed', comm:'#d97706', saison:'#0891b2' };
const TL = { mus:'Islam', cath:'Chrétien', comm:'Commerce', saison:'Saison' };

export function AgendaTabs({ appTitle = 'Agenda', appIcon = '📅', showIframe = false }) {
  const [tab, setTab] = useState('agenda');
  return (
    <AppLayout title={appTitle} icon={appIcon}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--or-border)', overflowX:'auto', scrollbarWidth:'none' }}>
        {[['agenda','📅 Agenda'],['evenements','📆 Événements'],['ventes','💰 Ventes']].map(([k,l]) => (
          <button key={k} style={{ flex:1, padding:'12px 6px', background:'none', color:tab===k?'var(--or-deep)':'var(--text-muted)', fontSize:12, borderBottom:tab===k?'2px solid var(--or-deep)':'2px solid transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'agenda'     && (showIframe ? <AgendaOriginal /> : <AgendaIframe />)}
      {tab === 'evenements' && <EvenementsTab />}
      {tab === 'ventes'     && <VentesTab />}
    </AppLayout>
  );
}

export default function Agenda() {
  return <AgendaTabs appTitle="Agenda" appIcon="📅" showIframe={true} />;
}

// ── Données calendrier stratégique ──────────────────────────────
const EVENTS_2026 = [
  // Islam
  {n:'Ramadan (début)',       d:'2026-02-18', t:'islam', icon:'🌙'},
  {n:'Aïd el-Fitr',          d:'2026-03-20', t:'islam', icon:'🎉'},
  {n:'Aïd el-Adha',          d:'2026-05-27', t:'islam', icon:'🐑'},
  {n:'Nouvel An Hégire',     d:'2026-07-17', t:'islam', icon:'🌙'},
  {n:'Mawlid',               d:'2026-09-26', t:'islam', icon:'⭐'},
  // Catho
  {n:'Chandeleur',           d:'2026-02-02', t:'catho', icon:'🕯'},
  {n:'Saint-Valentin',       d:'2026-02-14', t:'catho', icon:'❤️'},
  {n:'Mardi Gras',           d:'2026-02-17', t:'catho', icon:'🎭'},
  {n:'Pâques',               d:'2026-04-05', t:'catho', icon:'🐣'},
  {n:'Pentecôte',            d:'2026-05-24', t:'catho', icon:'☁️'},
  {n:'Toussaint',            d:'2026-11-01', t:'catho', icon:'🕯'},
  {n:'Noël',                 d:'2026-12-25', t:'catho', icon:'🎄'},
  // Business
  {n:'Saint-Valentin 🛍',    d:'2026-02-14', t:'business', icon:'🛍'},
  {n:'Fête des Mères',       d:'2026-05-31', t:'business', icon:'🌹'},
  {n:'Fête des Pères',       d:'2026-06-21', t:'business', icon:'👔'},
  {n:'Rentrée scolaire',     d:'2026-09-01', t:'business', icon:'📚'},
  {n:'Halloween',            d:'2026-10-31', t:'business', icon:'🎃'},
  {n:'Black Friday',         d:'2026-11-27', t:'business', icon:'🏷'},
  {n:'Cyber Monday',         d:'2026-11-30', t:'business', icon:'💻'},
  {n:'Noël 🛍',              d:'2026-12-25', t:'business', icon:'🎁'},
  // Saison
  {n:'Printemps',            d:'2026-03-20', t:'saison', icon:'🌸'},
  {n:'Été',                  d:'2026-06-21', t:'saison', icon:'☀️'},
  {n:'Automne',              d:'2026-09-23', t:'saison', icon:'🍂'},
  {n:'Hiver',                d:'2026-12-21', t:'saison', icon:'❄️'},
  // Push
  {n:"Soldes d'Hiver (début)",  d:'2026-01-07', t:'push', icon:'🛒'},
  {n:"Soldes d'Hiver (fin)",    d:'2026-02-04', t:'push', icon:'🛒'},
  {n:'Fête des Mères 📣',       d:'2026-05-24', t:'push', icon:'📣'},
  {n:'Fête des Pères 📣',       d:'2026-06-01', t:'push', icon:'📣'},
  {n:"Soldes d'Été (début)",    d:'2026-06-24', t:'push', icon:'🛒'},
  {n:"Soldes d'Été (fin)",      d:'2026-07-22', t:'push', icon:'🛒'},
  {n:'Rentrée 📣',              d:'2026-08-25', t:'push', icon:'📣'},
  {n:'Black Friday 📣',         d:'2026-11-20', t:'push', icon:'📣'},
  {n:'Noël 📣',                 d:'2026-12-10', t:'push', icon:'📣'},
];

const CAT = {
  islam:    { label:'ISLAM',    color:'#059669', bg:'#d1fae5', border:'#059669' },
  catho:    { label:'CATHO',    color:'#7c3aed', bg:'#ede9fe', border:'#7c3aed' },
  business: { label:'BUSINESS', color:'#b45309', bg:'#fef3c7', border:'#d97706' },
  saison:   { label:'SAISON',   color:'#0891b2', bg:'#e0f2fe', border:'#0891b2' },
  push:     { label:'🛒 PUSH',  color:'#92400e', bg:'#fef3c7', border:'#d97706' },
  perso:    { label:'PERSO',    color:'#9e5a7a', bg:'#fdf2f8', border:'#9e5a7a' },
};

// ── AGENDA ORIGINAL (Limitless Elite) ────────────────────────────
function AgendaOriginal() {
  return (
    <div style={{ height:'calc(100vh - 110px)' }}>
      <iframe
        src="https://agenda-chogan.vercel.app/"
        style={{ width:'100%', height:'100%', border:'none' }}
        title="Agenda Chogan"
      />
    </div>
  );
}

// ── CALENDRIER STRATÉGIQUE ────────────────────────────────────────
function AgendaIframe() {
  const [filter, setFilter] = useState('tout');

  const now = new Date(); now.setHours(0,0,0,0);
  const fmt = d => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
  const diffJ = d => Math.ceil((new Date(d)-now)/86400000);
  const day = now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});

  // Charger les événements perso depuis localStorage
  const persoEvts = (() => {
    try {
      return JSON.parse(localStorage.getItem('le_cevents')||'[]').map(e => ({
        n: e.n, d: e.d, t: 'perso', icon: '📌', id: e.id, lbl: e.lbl
      }));
    } catch { return []; }
  })();

  const allEvts = [...EVENTS_2026, ...persoEvts];

  const filtered = allEvts
    .filter(e => filter === 'tout' || e.t === filter)
    .sort((a,b) => new Date(a.d)-new Date(b.d));
  const futurs = filtered.filter(e => diffJ(e.d) >= 0);
  const passes = filtered.filter(e => diffJ(e.d) < 0);

  return (
    <div style={{ height:'calc(100vh - 110px)', overflowY:'auto', background:'#f9f7f5' }}>
      {/* Header doré */}
      <div style={{ background:'linear-gradient(135deg,#C9A84C,#E8C96A,#C9A84C)', padding:'16px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:20, fontWeight:800, color:'white', fontFamily:'var(--font-display)', letterSpacing:'0.04em', textShadow:'0 1px 4px rgba(0,0,0,0.2)' }}>Calendrier</p>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.85)', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', marginTop:2 }}>Stratégique 2026</p>
        </div>
      </div>

      <div style={{ padding:'14px 16px' }}>
        {/* Date */}
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'right', marginBottom:12, fontStyle:'italic' }}>{day}</p>

        {/* Filtres */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', marginBottom:16, paddingBottom:2 }}>
          {[['tout','Tout'],['islam','Islam'],['catho','Catho'],['business','Business'],['saison','Saison'],['push','🛒 Push'],['perso','📌 Perso']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${filter===k?'#C9A84C':'#e5e7eb'}`, background:filter===k?'#C9A84C':'white', color:filter===k?'white':'#374151', fontSize:11, fontWeight:filter===k?700:500, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:'var(--font-body)' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Prochains */}
        {futurs.length > 0 && (
          <>
            <p style={{ fontSize:10, fontWeight:800, color:'#C9A84C', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:10 }}>✦ Prochains — {futurs.length}</p>
            {futurs.map((e,i) => {
              const cat = CAT[e.t]; const j = diffJ(e.d);
              const jColor = j===0?'#ef4444':j<=7?'#f59e0b':j<=30?'#C9A84C':'#9ca3af';
              return (
                <div key={i} style={{ background:'white', borderRadius:14, padding:'12px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 6px rgba(0,0,0,0.06)', borderLeft:`4px solid ${cat.border}` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{e.icon} {e.n}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5 }}>
                      <span style={{ fontSize:11, color:'#9ca3af' }}>{fmt(e.d)}</span>
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:20, background:cat.bg, color:cat.color, letterSpacing:'0.06em' }}>{cat.label}</span>
                    </div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:800, color:jColor, flexShrink:0 }}>{j===0?'Auj.':j===1?'Dem.':`J-${j}`}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Passés */}
        {passes.length > 0 && (
          <>
            <p style={{ fontSize:10, fontWeight:800, color:'#9ca3af', letterSpacing:'0.15em', textTransform:'uppercase', margin:'16px 0 10px' }}>📁 Passés — {passes.length}</p>
            {passes.map((e,i) => {
              const cat = CAT[e.t];
              return (
                <div key={i} style={{ background:'white', borderRadius:14, padding:'10px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10, opacity:0.5, borderLeft:`3px solid ${cat.border}` }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#374151', textDecoration:'line-through' }}>{e.n}</p>
                    <p style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{fmt(e.d)}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ── ÉVÉNEMENTS ────────────────────────────────────────────────────
function EvenementsTab() {
  const { getFilteredEvents, user:evtUser } = useAuth();
  const [evts, setEvts]     = useState(() => getFilteredEvents());
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ name:'', type:'Salon/Expo', date:new Date().toISOString().split('T')[0], email:'', tel:'' });
  const [filter, setFilter] = useState('perso');
  const [ok, setOk]         = useState('');
  const now = useMemo(() => { const d=new Date(); d.setHours(0,0,0,0); return d; }, []);
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const save_ = e => { setEvts(e); localStorage.setItem('le_cevents', JSON.stringify(e)); };
  const openEdit = ev => { setEditId(ev.id); setForm({ name:ev.n, type:ev.lbl, date:ev.d, email:ev.email||'', tel:ev.tel||'' }); };
  const save = () => {
    if (!form.name.trim()||!form.date) return;
    let e=[...evts];
    if (editId) { e=e.map(x=>x.id===editId?{...x,n:form.name.trim(),lbl:form.type,d:form.date,email:form.email,tel:form.tel}:x); setOk('✦ Modifié !'); }
    else { e=[...e,{id:Date.now().toString(),n:form.name.trim(),lbl:form.type,d:form.date,email:form.email.trim(),tel:form.tel.trim()}]; setOk('✦ Ajouté !'); }
    save_(e); setEditId(null); setForm({name:'',type:'Salon/Expo',date:new Date().toISOString().split('T')[0],email:'',tel:''});
    setTimeout(()=>setOk(''),2500);
  };
  const del = id => { if(!window.confirm('Supprimer ?')) return; save_(evts.filter(x=>x.id!==id)); };
  const sorted=([...evts]).sort((a,b)=>new Date(a.d)-new Date(b.d));
  const futurs=sorted.filter(e=>new Date(e.d)>=now);
  const passes=sorted.filter(e=>new Date(e.d)<now);
  const fmt=d=>d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'—';
  const diffJ=d=>Math.ceil((new Date(d)-now)/86400000);
  const Badge=({d})=>{const j=diffJ(d),c=j<0?'var(--text-dim)':j<=7?'var(--red)':j<=30?'#d97706':'var(--green)',l=j<0?`J+${Math.abs(j)}`:j===0?'Auj.':`J-${j}`;return<span style={{fontSize:10,fontWeight:700,color:c,background:`${c}12`,padding:'2px 8px',borderRadius:20,border:`1px solid ${c}30`,flexShrink:0}}>{l}</span>;};
  return (
    <div style={{padding:16}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:14,marginBottom:14}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--or-deep)',marginBottom:10}}>{editId?'✏️ Modifier':'➕ Ajouter'}</p>
        {ok&&<div style={{background:'rgba(74,124,89,0.1)',border:'1px solid rgba(74,124,89,0.3)',borderRadius:10,padding:'8px 12px',color:'var(--green)',fontSize:12,fontWeight:600,marginBottom:10}}>{ok}</div>}
        <div className="field"><label className="label">Titre *</label><input placeholder="Salon de Beauté..." value={form.name} onChange={upd('name')}/></div>
        <div className="field"><label className="label">Type</label><select value={form.type} onChange={upd('type')}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="field"><label className="label">Date *</label><input type="date" value={form.date} onChange={upd('date')}/></div>
        <div className="grid-2">
          <div className="field"><label className="label">E-mail</label><input type="email" value={form.email} onChange={upd('email')}/></div>
          <div className="field"><label className="label">Tél.</label><input type="tel" value={form.tel} onChange={upd('tel')}/></div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-gold" onClick={save} style={{flex:1}}>{editId?'Enregistrer':'✦ Ajouter'}</button>
          {editId&&<button className="btn-outline" style={{padding:'10px 14px',width:'auto'}} onClick={()=>{setEditId(null);setForm({name:'',type:'Salon/Expo',date:new Date().toISOString().split('T')[0],email:'',tel:''});}}>Annuler</button>}
        </div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[['perso','📅 Mes événements'],['strategique','🗓 2026']].map(([k,l])=>(
          <button key={k} style={{flex:1,padding:'9px',borderRadius:10,border:`1px solid ${filter===k?'var(--or-deep)':'var(--or-border)'}`,background:filter===k?'var(--or-pale)':'transparent',color:filter===k?'var(--or-deep)':'var(--text-muted)',cursor:'pointer',fontSize:11,fontFamily:'var(--font-body)',fontWeight:filter===k?700:400}} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      {filter==='perso'&&<>
        {futurs.length>0&&<><p style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--or-deep)',marginBottom:8}}>✦ Prochains — {futurs.length}</p>
        {futurs.map(ev=><div key={ev.id} style={{display:'flex',alignItems:'center',gap:10,background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:12,padding:'10px 12px',marginBottom:8,borderLeft:'3px solid var(--blue)'}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:12,fontWeight:600,color:'var(--taupe)'}}>{ev.n}</p>
            <p style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{fmt(ev.d)} · <span style={{color:'var(--blue)'}}>{ev.lbl}</span></p>
            {ev.email&&<p style={{fontSize:9,color:'var(--text-dim)'}}>✉ {ev.email}</p>}
          </div>
          <Badge d={ev.d}/>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:'2px 4px'}} onClick={()=>openEdit(ev)}>✏️</button>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:'2px 4px',color:'var(--red)'}} onClick={()=>del(ev.id)}>🗑</button>
        </div>)}</>}
        {passes.length>0&&<><p style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-muted)',margin:'12px 0 8px'}}>📁 Historique</p>
        {passes.map(ev=><div key={ev.id} style={{display:'flex',alignItems:'center',gap:10,background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:12,padding:'10px 12px',marginBottom:8,opacity:0.6}}>
          <div style={{flex:1}}><p style={{fontSize:12,color:'var(--taupe)',textDecoration:'line-through'}}>{ev.n}</p><p style={{fontSize:10,color:'var(--text-muted)'}}>{fmt(ev.d)}</p></div>
          <Badge d={ev.d}/>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--red)'}} onClick={()=>del(ev.id)}>🗑</button>
        </div>)}</>}
        {!evts.length&&<div style={{textAlign:'center',color:'var(--text-muted)',padding:'40px 20px',fontSize:13}}>Aucun événement.</div>}
      </>}
      {filter==='strategique'&&Object.entries(TC).map(([type,color])=>{
        const items=STRATEGIC.filter(e=>e.t===type).sort((a,b)=>new Date(a.d)-new Date(b.d));
        return<div key={type} style={{marginBottom:14}}>
          <p style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color,marginBottom:6}}>{TL[type]}</p>
          {items.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:12,padding:'10px 12px',marginBottom:6,borderLeft:`3px solid ${color}`,opacity:diffJ(e.d)<0?0.5:1}}>
            <p style={{flex:1,fontSize:12,fontWeight:500,color:'var(--taupe)'}}>{e.n}</p>
            <span style={{fontSize:10,color:'var(--text-muted)',marginRight:8}}>{fmt(e.d)}</span>
            <Badge d={e.d}/>
          </div>)}
        </div>;
      })}
    </div>
  );
}

// ── VENTES ────────────────────────────────────────────────────────
function VentesTab() {
  const [sales,setSales]=useState(()=>{try{return JSON.parse(localStorage.getItem('le_sales')||'[]');}catch{return[];}});
  const [search,setSearch]=useState('');
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const save_=u=>{localStorage.setItem('le_sales',JSON.stringify(u));setSales(u);};
  const del=id=>{if(!window.confirm('Supprimer ?'))return;save_(sales.filter(s=>s.id!==id));};
  const openEdit=v=>{setEditing(v.id);setForm({client:v.client||'',email:v.email||'',tel:v.tel||'',product:v.product||v.prod||'',qty:String(v.qty||1),category:v.category||v.cat||'Parfum',amount:String(v.amount||v.amt||''),currency:v.currency||v.cur||'€',date:v.date||new Date().toISOString().split('T')[0],note:v.note||'',consultant:v.consultant||''});};
  const saveEdit=()=>{save_(sales.map(s=>s.id!==editing?s:{...s,client:form.client,email:form.email,tel:form.tel,product:form.product,prod:form.product,qty:parseInt(form.qty)||1,category:form.category,cat:form.category,amount:parseFloat(form.amount)||0,amt:form.amount,currency:form.currency,cur:form.currency,date:form.date,note:form.note,consultant:form.consultant}));setEditing(null);};
  const fmt=d=>d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'2-digit'}):'—';
  const totalEur=sales.filter(v=>(v.currency||v.cur)==='€').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);
  const totalDa=sales.filter(v=>(v.currency||v.cur)==='DA').reduce((s,v)=>s+(parseFloat(v.amount||v.amt)||0),0);
  const filtered=sales.filter(s=>{if(!search)return true;const q=search.toLowerCase();return(s.client||'').toLowerCase().includes(q)||(s.product||s.prod||'').toLowerCase().includes(q);});
  if (editing) return(
    <div style={{padding:16}}>
      <button style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:13,cursor:'pointer',padding:'0 0 14px',display:'block',fontFamily:'var(--font-body)'}} onClick={()=>setEditing(null)}>← Annuler</button>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:14,marginBottom:12}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--or-deep)',marginBottom:10}}>✏️ Modifier</p>
        {[['client','Cliente *','text'],['email','E-mail','email'],['tel','Téléphone','tel'],['product','Produit','text'],['note','Notes','text']].map(([k,l,t])=>(
          <div className="field" key={k}><label className="label">{l}</label><input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>
        ))}
        <div className="grid-2">
          <div className="field"><label className="label">Qté</label><input type="number" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))}/></div>
          <div className="field"><label className="label">Catégorie</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{CATS_V.map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div className="field"><label className="label">Montant</label>
          <div style={{display:'flex',gap:8}}>
            <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} style={{flex:1}}/>
            <div style={{display:'flex',background:'var(--bg-dark)',border:'1px solid var(--or-border)',borderRadius:10,overflow:'hidden',flexShrink:0}}>
              {['DA','€'].map(c=><button key={c} style={{padding:'9px 12px',cursor:'pointer',fontSize:12,fontWeight:700,background:form.currency===c?'linear-gradient(135deg,var(--or),var(--or-deep))':'transparent',color:form.currency===c?'#fff':'var(--text-muted)',border:'none',fontFamily:'var(--font-body)'}} onClick={()=>setForm(p=>({...p,currency:c}))}>{c}</button>)}
            </div>
          </div>
        </div>
        <div className="field"><label className="label">Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
      </div>
      <button className="btn-gold" onClick={saveEdit}>ENREGISTRER</button>
    </div>
  );
  return(
    <div style={{padding:16}}>
      <div style={{display:'flex',alignItems:'center',background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:'12px 16px',marginBottom:14,gap:8}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}><span style={{fontFamily:'var(--font-display)',fontSize:20,color:'var(--or-deep)',lineHeight:1}}>{sales.length}</span><span style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Ventes</span></div>
        <div style={{width:1,height:30,background:'var(--or-border)'}}/>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}><span style={{fontFamily:'var(--font-display)',fontSize:17,color:'var(--or-deep)',lineHeight:1}}>{totalEur.toFixed(2)}€</span><span style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em'}}>CA €</span></div>
        {totalDa>0&&<><div style={{width:1,height:30,background:'var(--or-border)'}}/><div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}><span style={{fontFamily:'var(--font-display)',fontSize:14,color:'var(--or-deep)',lineHeight:1}}>{totalDa.toLocaleString('fr-FR')}</span><span style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em'}}>CA DA</span></div></>}
        <button style={{background:'var(--or-pale)',border:'1px solid var(--or-border)',color:'var(--or-deep)',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:14,fontFamily:'var(--font-body)'}} onClick={()=>{try{setSales(JSON.parse(localStorage.getItem('le_sales')||'[]'));}catch{}}}>↺</button>
      </div>
      <input placeholder="🔍 Cliente ou produit..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}}/>
      {!filtered.length
        ?<div style={{textAlign:'center',color:'var(--text-muted)',padding:'40px 20px',fontSize:13}}>Aucune vente.</div>
        :filtered.map(v=>{
          const amount=parseFloat(v.amount||v.amt)||0,currency=v.currency||v.cur||'€',product=v.product||v.prod||'',items=v.items||[];
          return<div key={v.id} style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:'12px 14px',marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:'var(--taupe)'}}>{v.client||'—'}</p>
                <div style={{display:'flex',gap:8,marginTop:3,flexWrap:'wrap'}}>
                  {v.email&&<span style={{fontSize:10,color:'var(--text-muted)'}}>✉ {v.email}</span>}
                  {v.tel&&<span style={{fontSize:10,color:'var(--text-muted)'}}>📞 {v.tel}</span>}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}><p style={{fontSize:15,fontWeight:700,color:'var(--or-deep)'}}>{amount} {currency}</p><p style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{fmt(v.date||v.createdAt)}</p></div>
            </div>
            {items.length>0?<div style={{background:'rgba(210,183,149,0.06)',borderRadius:8,padding:'8px 10px',marginBottom:8}}>{items.map((it,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0',borderBottom:'1px solid rgba(210,183,149,0.12)'}}><span style={{flex:1,fontSize:11}}>{it.prod} <span style={{color:'var(--text-muted)'}}>×{it.qty}</span></span><span style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',marginLeft:4}}>{it.amt} {currency}</span></div>)}</div>
            :product?<p style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{product}</p>:null}
            {v.note&&<p style={{fontSize:11,color:'var(--text-muted)',marginBottom:8,fontStyle:'italic'}}>📝 {v.note}</p>}
            <div style={{display:'flex',gap:8,paddingTop:8,borderTop:'1px solid var(--or-border)'}}>
              <button style={{flex:1,padding:'7px',background:'var(--or-pale)',border:'1px solid var(--or-border)',color:'var(--or-deep)',borderRadius:8,fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',fontWeight:600}} onClick={()=>openEdit(v)}>✏️ Modifier</button>
              <button style={{flex:1,padding:'7px',background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.2)',color:'var(--red)',borderRadius:8,fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',fontWeight:600}} onClick={()=>del(v.id)}>🗑 Supprimer</button>
            </div>
          </div>;
        })
      }
    </div>
  );
}

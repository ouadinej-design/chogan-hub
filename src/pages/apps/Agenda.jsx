import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function AgendaTabs({ appTitle = 'Agenda', appIcon = '📅', agendaAsLink = false }) {
  const [tab, setTab] = useState('agenda');
  return (
    <AppLayout title={appTitle} icon={appIcon}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--or-border)', overflowX:'auto', scrollbarWidth:'none' }}>
        {[['agenda','📅 Agenda'],['evenements','📆 Événements'],['ventes','💰 Ventes']].map(([k,l]) => (
          <button key={k} style={{ flex:1, padding:'12px 6px', background:'none', color:tab===k?'var(--or-deep)':'var(--text-muted)', fontSize:12, borderBottom:tab===k?'2px solid var(--or-deep)':'2px solid transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'agenda'     && <AgendaIframe asLink={agendaAsLink} />}
      {tab === 'evenements' && <EvenementsTab />}
      {tab === 'ventes'     && <VentesTab />}
    </AppLayout>
  );
}

export default function Agenda() {
  return <AgendaTabs appTitle="Agenda" appIcon="📅" />;
}

// ── AGENDA TAB (iframe ou lien selon contexte) ───────────────────
function AgendaIframe({ asLink = false }) {
  const navigate = useNavigate();
  if (asLink) {
    // Navigation directe vers l'app Agenda
    navigate('/app/agenda');
    return null;
  }
  return (
    <div style={{ height:'calc(100vh - 110px)' }}>
      <iframe
        src="https://limitless-app-seven.vercel.app/"
        style={{ width:'100%', height:'100%', border:'none' }}
        title="Agenda Limitless Elite"
        allow="same-origin"
      />
    </div>
  );
}

// ── ÉVÉNEMENTS ────────────────────────────────────────────────────
function EvenementsTab() {
  const [evts, setEvts]     = useState(() => { try { return JSON.parse(localStorage.getItem('le_cevents')||'[]'); } catch { return []; } });
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

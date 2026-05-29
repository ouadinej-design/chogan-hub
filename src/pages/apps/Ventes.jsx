import AppLayout from '../../components/AppLayout';
import { cloudSave } from '../../lib/cloudSync';
import { useAuth } from '../../context/AuthContext';
import { syncFromServer } from '../../lib/syncAll';
import { useState, useEffect } from 'react';

// ── Filtre équipe pour la Marraine ───────────────────────────
function useTeamFilter(user) {
  const myName  = user ? `${user.firstName||''} ${user.lastName||''}`.trim() : '';
  const firstName = (user?.firstName||'').toLowerCase();
  const [selected, setSelected] = useState('tous');

  const treeNodes = (() => {
    try {
      const t1 = JSON.parse(localStorage.getItem('le_tree')||'{"nodes":[]}').nodes||[];
      const t2 = JSON.parse(localStorage.getItem('limitless_team_tree_v5')||'{"nodes":[]}').nodes||[];
      return [...t1,...t2];
    } catch { return []; }
  })();

  const myNode = treeNodes.find(n => {
    const nn=(n.name||'').toLowerCase();
    return nn===myName.toLowerCase()||nn.includes(firstName)||(firstName.length>2&&firstName.includes(nn.split(' ')[0]));
  });
  const consultants = myNode ? treeNodes.filter(n=>n.parentId===myNode.id).map(n=>n.name) : [];

  const filterSales = (items) => {
    if (!user||user.role!=='marraine'||selected==='tous') return items;
    return items.filter(s => {
      const c=(s.consultant||'').toLowerCase();
      if (selected==='moi') return c.includes(firstName)||(firstName.length>2&&firstName.includes(c.split(' ')[0]));
      const sel=selected.toLowerCase();
      return c.includes(sel.split(' ')[0])||(sel.split(' ')[0].length>2&&sel.includes(c.split(' ')[0]));
    });
  };

  const C_COLORS=[
    {bg:'rgba(80,130,200,0.12)',border:'#5082C8',text:'#2d5a9e'},
    {bg:'rgba(100,180,100,0.12)',border:'#64B464',text:'#2d7a2d'},
    {bg:'rgba(180,100,200,0.12)',border:'#B464C8',text:'#7a2d9e'},
    {bg:'rgba(210,160,50,0.12)',border:'#D2A032',text:'#8C6D00'},
    {bg:'rgba(50,190,180,0.12)',border:'#32BEB4',text:'#1a7a74'},
  ];
  const OWNER_C={bg:'rgba(220,80,120,0.10)',border:'#DC5078',text:'#a03060'};

  const FilterDropdown = () => {
    if (!user||user.role!=='marraine') return null;
    const opts=[
      {v:'tous',l:"👥 Toute l'équipe",col:'#4A3E3D',bg:'#F5EFE8',bd:'#D2B795'},
      {v:'moi', l:`🌸 Moi — ${myName}`,col:OWNER_C.text,bg:OWNER_C.bg,bd:OWNER_C.border},
      ...consultants.map((n,i)=>({v:n.toLowerCase(),l:`👤 ${n}`,col:C_COLORS[i%C_COLORS.length].text,bg:C_COLORS[i%C_COLORS.length].bg,bd:C_COLORS[i%C_COLORS.length].border}))
    ];
    const cur=opts.find(o=>o.v===selected)||opts[0];
    return (
      <div style={{marginBottom:12,position:'relative'}}>
        <select value={selected} onChange={e=>setSelected(e.target.value)}
          style={{width:'100%',padding:'10px 14px',borderRadius:10,border:`1.5px solid ${cur.bd}`,
            background:cur.bg,color:cur.col,fontWeight:700,fontSize:13,cursor:'pointer',
            appearance:'none',WebkitAppearance:'none',boxSizing:'border-box'}}>
          {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:cur.col,fontSize:12}}>▾</span>
      </div>
    );
  };

  return { filterSales, FilterDropdown };
}

// ── Couleurs par consultant ────────────────────────────────────
const CONSULT_COLORS=[
  {bg:'rgba(80,130,200,0.12)',border:'#5082C8',text:'#2d5a9e'},
  {bg:'rgba(100,180,100,0.12)',border:'#64B464',text:'#2d7a2d'},
  {bg:'rgba(180,100,200,0.12)',border:'#B464C8',text:'#7a2d9e'},
  {bg:'rgba(210,160,50,0.12)',border:'#D2A032',text:'#8C6D00'},
  {bg:'rgba(50,190,180,0.12)',border:'#32BEB4',text:'#1a7a74'},
  {bg:'rgba(220,120,60,0.12)',border:'#DC783C',text:'#9e4a1a'},
];
const OWNER_C={bg:'rgba(220,80,120,0.10)',border:'#DC5078',text:'#a03060'};
const _cc={};let _ci=0;
function cColor(name,ownerFirst){
  if(!name)return CONSULT_COLORS[0];
  const n=name.toLowerCase().trim();
  const o=(ownerFirst||'').toLowerCase().trim();
  if(o&&(n.includes(o)||o.includes(n.split(' ')[0])))return OWNER_C;
  if(!_cc[n]){_cc[n]=CONSULT_COLORS[_ci%CONSULT_COLORS.length];_ci++;}
  return _cc[n];
}

const CATS_V=['Toutes','Parfum','Soin visage','Soin corps','Maquillage','Coffret','Autre'];

export default function Ventes() {
  // Sync depuis serveur puis recharger
  useEffect(() => {
    syncFromServer().then(() => {
      try { setSales(getFilteredSales()); } catch {}
    });
  }, []);

  const { getFilteredSales, user } = useAuth();
  const [sales, setSales]   = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('Toutes');
  const { filterSales, FilterDropdown } = useTeamFilter(user);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({});

  useEffect(() => {
    const load = () => { try { setSales(getFilteredSales()); } catch {} };
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, []);

  const userId = user ? `${user.firstName}_${user.lastName||''}`.trim().replace(/\s+/g,'_').toLowerCase() : null;
  const save = (updated) => { cloudSave('le_sales', updated, userId); setSales(updated); };
  const del = (id) => { if (!window.confirm('Supprimer ?')) return; save(sales.filter(s=>s.id!==id)); };
  const openEdit = (v) => { setEditing(v.id); setForm({ client:v.client||'', email:v.email||'', tel:v.tel||'', product:v.product||v.prod||'', qty:String(v.qty||1), amount:String(v.amount||v.amt||''), currency:v.currency||v.cur||'€', date:v.date||'', note:v.note||'', consultant:v.consultant||'' }); };
  const saveEdit = () => { save(sales.map(s=>s.id!==editing?s:{...s,...form,amount:parseFloat(form.amount)||0,amt:form.amount})); setEditing(null); };

  const filtered = filterSales(sales).filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || (s.client||'').toLowerCase().includes(q)||(s.product||s.prod||'').toLowerCase().includes(q)||(s.consultant||'').toLowerCase().includes(q);
    const matchCat = catFilter==='Toutes'||(s.category||s.cat||'')===catFilter;
    return matchSearch && matchCat;
  });

  const totalEu = filtered.filter(s=>(s.currency||s.cur||'€')==='€').reduce((t,s)=>t+(parseFloat(s.amount||s.amt)||0),0);
  const totalDa = filtered.filter(s=>(s.currency||s.cur)==='DA').reduce((t,s)=>t+(parseFloat(s.amount||s.amt)||0),0);

  if (editing) return (
    <AppLayout title="Ventes" icon="💰">
      <div style={{padding:16,maxWidth:500,margin:'0 auto'}}>
        <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',color:'var(--taupe)',cursor:'pointer',marginBottom:16,fontSize:13}}>← Annuler</button>
        <h3 style={{color:'var(--taupe)',marginBottom:16}}>✏️ Modifier la vente</h3>
        {[['client','Cliente *','text'],['email','E-mail','email'],['tel','Téléphone','tel'],['product','Produit','text'],['note','Notes','text']].map(([k,l,t])=>(
          <div key={k} style={{marginBottom:10}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--or-deep)',display:'block',marginBottom:4}}>{l}</label>
            <input type={t} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border)',boxSizing:'border-box'}}/>
          </div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <div><label style={{fontSize:12,fontWeight:700,color:'var(--or-deep)',display:'block',marginBottom:4}}>Montant</label>
            <input type="number" value={form.amount||''} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border)',boxSizing:'border-box'}}/></div>
          <div><label style={{fontSize:12,fontWeight:700,color:'var(--or-deep)',display:'block',marginBottom:4}}>Date</label>
            <input type="date" value={form.date||''} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border)',boxSizing:'border-box'}}/></div>
        </div>
        <button onClick={saveEdit} style={{width:'100%',padding:12,background:'var(--or-deep)',color:'white',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',marginTop:8}}>💾 Enregistrer</button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Ventes" icon="💰">
      <div style={{padding:16,maxWidth:700,margin:'0 auto'}}>

        {/* Totaux */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          {totalEu>0&&<div style={{background:'rgba(45,122,74,0.1)',border:'1px solid rgba(45,122,74,0.3)',borderRadius:10,padding:'8px 16px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#2d7a4a'}}>{totalEu.toFixed(2)} €</div>
            <div style={{fontSize:10,color:'#2d7a4a',textTransform:'uppercase'}}>Total EUR</div>
          </div>}
          {totalDa>0&&<div style={{background:'rgba(61,107,158,0.1)',border:'1px solid rgba(61,107,158,0.3)',borderRadius:10,padding:'8px 16px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#3d6b9e'}}>{Math.round(totalDa).toLocaleString('fr-FR')} DA</div>
            <div style={{fontSize:10,color:'#3d6b9e',textTransform:'uppercase'}}>Total DA</div>
          </div>}
          <div style={{background:'#F5EFE8',border:'1px solid #D2B795',borderRadius:10,padding:'8px 16px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'var(--taupe)'}}>{filtered.length}</div>
            <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Ventes</div>
          </div>
        </div>

        {/* Filtre équipe */}
        <FilterDropdown />

        {/* Filtres recherche */}
        <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher..."
            style={{flex:1,minWidth:150,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13}}/>
          <select value={catFilter} onChange={e=>setCat(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'white',fontSize:13}}>
            {CATS_V.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Liste */}
        {filtered.length===0&&<div style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>Aucune vente</div>}
        {filtered.map(v=>{
          const col = user?.role!=='consultante' ? cColor(v.consultant,user?.firstName) : null;
          const amount = parseFloat(v.amount||v.amt)||0;
          const cur = v.currency||v.cur||'€';
          return (
            <div key={v.id} style={{background:'white',borderRadius:12,padding:14,marginBottom:10,
              border:`1px solid ${col?.border||'var(--border)'}`,
              borderLeft:`4px solid ${col?.border||'var(--border)'}`,
              boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <div>
                  <span style={{fontWeight:700,color:'var(--taupe)',fontSize:15}}>{v.client||'—'}</span>
                  {v.date&&<span style={{fontSize:11,color:'var(--text-muted)',marginLeft:8}}>{v.date}</span>}
                </div>
                <span style={{fontWeight:700,fontSize:16,color:cur==='€'?'#2d7a4a':'#3d6b9e'}}>
                  {amount.toFixed(cur==='€'?2:0)} {cur}
                </span>
              </div>
              {(v.product||v.prod)&&<p style={{fontSize:12,color:'var(--text-muted)',margin:'4px 0'}}>{v.product||v.prod}</p>}
              {v.note&&<p style={{fontSize:11,color:'var(--text-muted)',fontStyle:'italic',margin:'2px 0'}}>📝 {v.note}</p>}
              {col&&v.consultant&&<span style={{display:'inline-block',background:col.bg,border:`1px solid ${col.border}`,color:col.text,borderRadius:10,padding:'2px 8px',fontSize:10,fontWeight:700,marginTop:4}}>
                {col===OWNER_C?'🌸 Moi':'👤 '+v.consultant}
              </span>}
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={()=>openEdit(v)} style={{flex:1,padding:'6px',background:'#F5EFE8',border:'1px solid #D2B795',borderRadius:6,cursor:'pointer',fontSize:12,color:'var(--taupe)',fontWeight:600}}>✏️ Modifier</button>
                <button onClick={()=>del(v.id)} style={{flex:1,padding:'6px',background:'#FFF0F0',border:'1px solid #FFA3A3',borderRadius:6,cursor:'pointer',fontSize:12,color:'#D32F2F',fontWeight:600}}>🗑 Supprimer</button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

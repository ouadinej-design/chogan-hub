import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

export default function Reseau() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const defaultTree = { nodes: [] };

  const [tree, setTree] = useState(() => {
    try {
      const d = localStorage.getItem('le_tree');
      if (d) return JSON.parse(d);
    } catch {}
    return defaultTree;
  });

  useEffect(() => {
    localStorage.setItem('le_tree', JSON.stringify(tree));
  }, [tree]);

  const sales = (() => { try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; } })();

  const getCAByCur = (name) => {
    const ns = sales.filter(s => s.consultant === name);
    const da = ns.filter(x=>(x.currency||x.cur)==='DA').reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);
    const eu = ns.filter(x=>(x.currency||x.cur)==='€'||(!x.currency&&!x.cur)).reduce((t,x)=>t+(parseFloat(x.amount||x.amt)||0),0);
    return { da, eu };
  };

  const [newMember, setNewMember] = useState({
    name:'', role:'Consultante', genre:'femme', parentId:'', mdp:'',
    topClient:'', bestSeller:'', meilleuresVentes:'', objectif:'',
    caNum:'0', objNum:'1000'
  });

  const saveTree = t => { setTree(t); localStorage.setItem('le_tree', JSON.stringify(t)); };

  const totalNodes = tree.nodes.length;
  const totalCA = tree.nodes.reduce((s,n)=>s+(parseFloat(n.caNum)||0),0);
  const totalObj = tree.nodes.reduce((s,n)=>s+(parseFloat(n.objNum)||1000),0);
  const globalPerf = totalObj>0 ? Math.min(100,Math.round((totalCA/totalObj)*100)) : 0;

  const displayRole = (role, genre) => {
    if (genre==='homme') { if(role==='Consultante') return 'Consultant'; if(role==='Marraine') return 'Parrain'; }
    return role;
  };

  const startEditing = (m) => { setEditingId(m.id); setEditForm({...m}); };

  const saveRowEdits = () => {
    const cNum = parseFloat(editForm.caNum)||0;
    saveTree({ nodes: tree.nodes.map(n => n.id!==editingId ? n : {...editForm, caNum:cNum, ca:`${cNum.toLocaleString('fr-FR')} €`}) });
    setEditingId(null);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    const m = tree.nodes.find(n=>n.id===id);
    saveTree({ nodes: tree.nodes.filter(n=>n.id!==id).map(n=>n.parentId===id?{...n,parentId:m?.parentId||null}:n) });
    if (treeRootId===id) setTreeRootId(null);
    if (selectedMember?.id===id) setSelectedMember(null);
  };

  const handleAdd = () => {
    if (!newMember.name.trim()) return;
    const cNum=parseFloat(newMember.caNum)||0, oNum=parseFloat(newMember.objNum)||1000;
    saveTree({ nodes:[...tree.nodes,{
      id:Date.now().toString(), name:newMember.name.trim(), role:newMember.role,
      genre:newMember.genre, parentId:newMember.parentId||null,
      ca:`${cNum.toLocaleString('fr-FR')} €`, caNum:cNum, objNum:oNum,
      objectif:newMember.objectif||'Fixer un objectif', mdp:newMember.mdp||'Chogan#123',
      fidelity:'Initial (0 pts)',
      topClientsList:[{name:newMember.topClient||'Aucun',date:'Aujourd\'hui',details:'Direct'}],
      bestSellersList:[{name:newMember.bestSeller||'Non défini',date:'Aujourd\'hui',qty:'1 un.'}],
      meilleuresVentesList:[{name:newMember.meilleuresVentes||'Non défini',date:'Aujourd\'hui',total:`${cNum} €`}],
      eventsList:[{name:'Intégration Chogan',date:'À définir',loc:'En ligne'}]
    }]});
    setNewMember({name:'',role:'Consultante',genre:'femme',parentId:'',mdp:'',topClient:'',bestSeller:'',meilleuresVentes:'',objectif:'',caNum:'0',objNum:'1000'});
  };

  // Render tree with connection lines
  const renderTree = (node) => {
    if (!node) return null;
    const children = tree.nodes.filter(n => n.parentId === node.id);
    const { eu, da } = getCAByCur(node.name);
    const roleColor = { 'VIP':'#8b5a2b','Manager':'#8a6800','Marraine':'#9e5a7a','Parrain':'#9e5a7a','Consultante':'#3d6b9e' };
    const color = roleColor[node.role]||'#3d6b9e';
    const caDisplay = (node.caNum>0||eu>0||da>0)
      ? (eu>0?`${eu.toFixed(0)}€`:'') + (eu>0&&da>0?' · ':'') + (da>0?`${Math.round(da).toLocaleString('fr-FR')}DA`:'') || `${node.caNum} €`
      : '—';

    return (
      <div key={node.id} style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
        <div onClick={()=>setSelectedMember(node)} style={{background:'white',border:`1.5px solid ${color}40`,borderRadius:12,padding:'12px 14px',minWidth:130,textAlign:'center',cursor:'pointer',boxShadow:'0 3px 12px rgba(0,0,0,0.07)',margin:5,position:'relative',zIndex:2,transition:'box-shadow 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='0 3px 12px rgba(0,0,0,0.07)'}>
          <div style={{width:36,height:36,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff',fontWeight:700,margin:'0 auto 6px'}}>{node.name[0]?.toUpperCase()}</div>
          <div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{displayRole(node.role,node.genre)}</div>
          <div style={{fontWeight:600,color:'#4A3E3D',fontSize:13,marginBottom:3}}>{node.name}</div>
          <div style={{fontSize:10,color:'#2d7a4a',fontWeight:700}}>{caDisplay}</div>
        </div>
        {children.length>0&&<div style={{width:2,height:20,background:'#D2B795',zIndex:1}}/>}
        {children.length>0&&(
          <div style={{display:'flex',gap:20,position:'relative'}}>
            {children.map((child,i)=>(
              <div key={child.id} style={{position:'relative',paddingTop:20,display:'flex',flexDirection:'column',alignItems:'center'}}>
                {children.length>1&&<div style={{position:'absolute',top:0,left:i===0?'50%':0,right:i===children.length-1?'50%':0,borderTop:'2px solid #D2B795',zIndex:1}}/>}
                <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:2,height:25,background:'#D2B795',zIndex:1}}/>
                {renderTree(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const visibleRoots = treeRootId ? tree.nodes.filter(n=>n.id===treeRootId) : tree.nodes.filter(n=>!n.parentId);
  const focusedNode = treeRootId ? tree.nodes.find(n=>n.id===treeRootId) : null;
  const parentOfFocused = focusedNode ? tree.nodes.find(n=>n.id===focusedNode.parentId) : null;
  const pct = selectedMember ? Math.min(100,Math.round((parseFloat(selectedMember.caNum)||0)/(parseFloat(selectedMember.objNum)||1)*100)) : 0;

  // Filter for marraine role
  const canManage = user?.role==='admin' || user?.role==='marraine';

  return (
    <AppLayout title="Mon Réseau" icon="🌐">

      {/* Dashboard global */}
      <div style={{margin:'12px 16px 0',background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:'14px 16px',display:'flex',justifyContent:'space-around',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div style={{textAlign:'center'}}>
          <p style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>👥 Membres</p>
          <p style={{fontSize:22,fontWeight:700,color:'var(--taupe)',fontFamily:'var(--font-display)'}}>{totalNodes}</p>
        </div>
        <div style={{width:1,height:36,background:'var(--or-border)'}}/>
        <div style={{textAlign:'center'}}>
          <p style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>📈 CA Équipe</p>
          <p style={{fontSize:18,fontWeight:700,color:'#2d7a4a',fontFamily:'var(--font-display)'}}>{totalCA.toLocaleString('fr-FR')} €</p>
        </div>
        <div style={{width:1,height:36,background:'var(--or-border)'}}/>
        <div style={{textAlign:'center',minWidth:100}}>
          <p style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>🎯 Performance</p>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <p style={{fontSize:18,fontWeight:700,color:'var(--taupe)',fontFamily:'var(--font-display)'}}>{globalPerf}%</p>
            <div style={{width:60,height:6,background:'rgba(210,183,149,0.2)',borderRadius:3,overflow:'hidden'}}>
              <div style={{width:`${globalPerf}%`,height:'100%',background:'linear-gradient(90deg,var(--or),var(--or-deep))',borderRadius:3}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{display:'flex',gap:8,padding:'12px 16px 0',justifyContent:'center'}}>
        {[['arbre','🌳 Arbre'],[...(canManage?[['gestion','⚙️ Gestion']]:[])]].flat().filter(Boolean).map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{padding:'9px 18px',borderRadius:20,border:'1px solid var(--or-border)',background:activeTab===k?'linear-gradient(135deg,var(--or),var(--or-deep))':'var(--bg-card)',color:activeTab===k?'#fff':'var(--text-muted)',cursor:'pointer',fontWeight:activeTab===k?700:500,fontSize:12,fontFamily:'var(--font-body)'}}>
            {l}
          </button>
        ))}
      </div>

      {/* VUE ARBRE */}
      {activeTab==='arbre'&&(
        <div style={{padding:16}}>
          {treeRootId&&(
            <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
              <button onClick={()=>setTreeRootId(null)} style={{background:'var(--taupe)',color:'#fff',border:'none',padding:'7px 14px',borderRadius:20,fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)'}}>🏠 Tout voir</button>
              {parentOfFocused&&<button onClick={()=>setTreeRootId(focusedNode.parentId)} style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',color:'var(--text-muted)',padding:'7px 14px',borderRadius:20,fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)'}}>← {parentOfFocused.name}</button>}
            </div>
          )}
          {visibleRoots.length===0?(
            <div style={{textAlign:'center',color:'var(--text-muted)',padding:'48px 20px'}}>
              <p style={{fontSize:40,marginBottom:8}}>🌐</p>
              <p style={{fontSize:14}}>Réseau vide.</p>
              {canManage&&<p style={{fontSize:12,marginTop:4}}>Ajoutez des membres via l'onglet ⚙️ Gestion.</p>}
            </div>
          ):(
            <div style={{overflowX:'auto',paddingBottom:20,textAlign:'center'}}>
              <div style={{display:'inline-flex',flexDirection:'column',alignItems:'center',minWidth:'100%',gap:20}}>
                {visibleRoots.map(root=>renderTree(root))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VUE GESTION */}
      {activeTab==='gestion'&&canManage&&(
        <div style={{padding:16,display:'flex',flexDirection:'column',gap:16}}>

          {/* Formulaire ajout */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,padding:16}}>
            <p style={{fontSize:11,fontWeight:700,color:'var(--or-deep)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>✨ Ajouter un membre</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              {[['name','Nom & Prénom *','text','Ex: Marie Ouadi'],['mdp','Mot de passe','text','Chogan#2026'],['caNum','CA initial (€)','number','0'],['objNum','Objectif CA (€)','number','1000'],['objectif','Objectif (texte)','text','Atteindre 3 000€'],['topClient','Top client','text','Alice D.'],['bestSeller','Best-seller','text','Parfum N°001'],['meilleuresVentes','Meilleure vente','text','Pack Été']].map(([k,l,t,ph])=>(
                <div key={k} className="field"><label className="label">{l}</label>
                  <input type={t} placeholder={ph} value={newMember[k]} onChange={e=>setNewMember(p=>({...p,[k]:e.target.value}))}/></div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
              <div className="field"><label className="label">Rôle</label>
                <select value={newMember.role} onChange={e=>setNewMember(p=>({...p,role:e.target.value}))}>
                  {['Consultante','Marraine','Manager','VIP'].map(r=><option key={r}>{r}</option>)}
                </select></div>
              <div className="field"><label className="label">Genre</label>
                <select value={newMember.genre} onChange={e=>setNewMember(p=>({...p,genre:e.target.value}))}>
                  <option value="femme">Femme</option><option value="homme">Homme</option>
                </select></div>
              <div className="field"><label className="label">Rattaché à</label>
                <select value={newMember.parentId} onChange={e=>setNewMember(p=>({...p,parentId:e.target.value}))}>
                  <option value="">— Racine —</option>
                  {tree.nodes.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}
                </select></div>
            </div>
            <button className="btn-gold" onClick={handleAdd} disabled={!newMember.name.trim()}>➕ Ajouter au réseau</button>
          </div>

          {/* Tableau */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:14,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 90px',background:'rgba(210,183,149,0.12)',padding:'10px 14px',borderBottom:'1px solid var(--or-border)'}}>
              {['Nom','Rôle','Mot de passe','CA','Actions'].map(h=>(
                <span key={h} style={{fontSize:10,fontWeight:700,color:'var(--or-deep)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</span>
              ))}
            </div>
            {tree.nodes.length===0&&<p style={{textAlign:'center',color:'var(--text-muted)',padding:24,fontSize:13}}>Aucun membre.</p>}
            {tree.nodes.map((n,idx)=>{
              const isEd=editingId===n.id;
              return(
                <div key={n.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 90px',padding:'11px 14px',background:idx%2===0?'transparent':'rgba(210,183,149,0.025)',borderBottom:'1px solid rgba(210,183,149,0.1)',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--taupe)'}}>{isEd?<input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} style={{fontSize:12}}/>:n.name}</span>
                  <span style={{fontSize:11,color:'var(--text-muted)'}}>{displayRole(n.role,n.genre)}</span>
                  <span style={{fontSize:11,fontFamily:'monospace',color:'var(--or-deep)'}}>{isEd?<input value={editForm.mdp} onChange={e=>setEditForm(p=>({...p,mdp:e.target.value}))} style={{fontSize:11}}/>:n.mdp||'—'}</span>
                  <span style={{fontSize:11,color:'#2d7a4a',fontWeight:600}}>{isEd?<input type="number" value={editForm.caNum} onChange={e=>setEditForm(p=>({...p,caNum:e.target.value}))} style={{fontSize:11,width:70}}/>:n.ca||`${n.caNum||0} €`}</span>
                  <div style={{display:'flex',gap:4}}>
                    {isEd?(
                      <><button onClick={saveRowEdits} style={{background:'var(--or-pale)',border:'1px solid var(--or-border)',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer',color:'var(--or-deep)'}}>💾</button>
                      <button onClick={()=>setEditingId(null)} style={{background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.2)',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer',color:'var(--red)'}}>✕</button></>
                    ):(
                      <><button onClick={()=>startEditing(n)} style={{background:'var(--or-pale)',border:'1px solid var(--or-border)',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer',color:'var(--or-deep)'}}>✏️</button>
                      <button onClick={()=>handleDelete(n.id,n.name)} style={{background:'rgba(192,57,43,0.08)',border:'1px solid rgba(192,57,43,0.2)',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer',color:'var(--red)'}}>🗑</button></>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DÉTAIL MEMBRE */}
      {selectedMember&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:9999,padding:'0'}}>
          <div style={{background:'var(--bg)',border:'1px solid var(--or-border)',borderRadius:'20px 20px 0 0',padding:'24px 18px',width:'100%',maxWidth:500,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 -6px 30px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:46,height:46,borderRadius:'50%',background:selectedMember.genre==='homme'?'#3d6b9e':'#9e5a7a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',fontWeight:700}}>{selectedMember.name[0]?.toUpperCase()}</div>
                <div>
                  <p style={{fontSize:17,fontWeight:700,color:'var(--taupe)',fontFamily:'var(--font-display)',marginBottom:3}}>{selectedMember.name}</p>
                  <span style={{background:'var(--or-pale)',color:'var(--or-deep)',padding:'3px 10px',borderRadius:12,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{displayRole(selectedMember.role,selectedMember.genre)}</span>
                </div>
              </div>
              <button onClick={()=>setSelectedMember(null)} style={{background:'rgba(210,183,149,0.15)',border:'1px solid var(--or-border)',borderRadius:20,padding:'5px 14px',fontSize:13,color:'var(--text-muted)',cursor:'pointer',fontFamily:'var(--font-body)'}}>✕</button>
            </div>

            {/* Barre objectif */}
            <div style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                <span style={{color:'var(--text-muted)'}}>🎯 {selectedMember.objectif||'Objectif non défini'}</span>
                <span style={{fontWeight:700,color:'var(--or-deep)'}}>{pct}%</span>
              </div>
              <div style={{height:6,background:'rgba(210,183,149,0.2)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,var(--or),var(--or-deep))',borderRadius:3}}/>
              </div>
            </div>

            {/* Infos */}
            {[['💰 CA',selectedMember.ca||`${selectedMember.caNum||0} €`,'#2d7a4a'],['💎 Fidélité',selectedMember.fidelity||'Initial','var(--or-deep)'],['🔑 Mot de passe',selectedMember.mdp||'—','var(--taupe)']].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(210,183,149,0.12)',fontSize:13}}>
                <span style={{color:'var(--text-muted)'}}>{l}</span>
                <strong style={{color:c}}>{v}</strong>
              </div>
            ))}

            {/* Sections détail */}
            {[
              ['🛍️ TOP VENTES',selectedMember.meilleuresVentesList,'name','total'],
              ['💄 BEST-SELLERS',selectedMember.bestSellersList,'name','qty'],
              ['👥 TOP CLIENTS',selectedMember.topClientsList,'name','details'],
              ['📅 ÉVÉNEMENTS',selectedMember.eventsList,'name','loc'],
            ].map(([title,list,k1,k2])=>list?.length>0&&(
              <div key={title} style={{marginTop:14}}>
                <p style={{fontSize:10,fontWeight:700,color:'var(--or-deep)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{title}</p>
                {list.map((it,i)=>(
                  <div key={i} style={{background:'var(--bg-card)',border:'1px solid var(--or-border)',padding:'8px 12px',borderRadius:10,fontSize:12,display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontWeight:500}}>{it[k1]}</span>
                    <span style={{color:'var(--or-deep)',fontWeight:700}}>{it[k2]}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:18}}>
              <button onClick={()=>{setTreeRootId(selectedMember.id);setSelectedMember(null);setActiveTab('arbre');}} style={{width:'100%',padding:12,background:'linear-gradient(135deg,var(--or),var(--or-deep))',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font-body)'}}>🔍 Zoomer sur son réseau</button>
              <button onClick={()=>setSelectedMember(null)} style={{width:'100%',padding:12,background:'var(--taupe)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontFamily:'var(--font-body)'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

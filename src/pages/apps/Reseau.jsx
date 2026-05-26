import React, { useState, useEffect } from 'react';
import { loadTree, saveTreeToCloud, isSupabaseEnabled } from '../../lib/supabase';

// ── Écran de connexion Réseau ─────────────────────────────────────
function LoginReseau({ tree, onLogin }) {
  const [name, setName]     = useState('');
  const [mdp, setMdp]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true); setError('');
    const match = tree.nodes.find(n =>
      n.mdp === mdp.trim() &&
      n.name.toLowerCase().includes(name.toLowerCase().trim())
    );
    setTimeout(() => {
      setLoading(false);
      if (match) { onLogin(match); }
      else { setError('Nom ou mot de passe incorrect.'); }
    }, 600);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#FAF7F2', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'sans-serif' }}>
      <div style={{ background:'white', border:'1px solid #D2B795', borderRadius:16, padding:32, width:'100%', maxWidth:380, boxShadow:'0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>👥</div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:400, textTransform:'uppercase', letterSpacing:'3px', color:'#4A3E3D', fontFamily:'serif' }}>Réseau</h2>
          <p style={{ fontSize:12, color:'#8C6D4F', marginTop:8 }}>Connectez-vous avec vos identifiants</p>
          {isSupabaseEnabled && <span style={{ fontSize:10, background:'#d1fae5', color:'#065f46', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>☁️ Cloud actif</span>}
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:'bold', color:'#8C6D4F', display:'block', marginBottom:4 }}>Nom & Prénom</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Marie OUADI"
            style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid #E6DCD0', fontSize:14, boxSizing:'border-box', outline:'none' }}
            onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:'bold', color:'#8C6D4F', display:'block', marginBottom:4 }}>🔑 Mot de passe</label>
          <input type="password" value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="Votre mot de passe"
            style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid #E6DCD0', fontSize:14, boxSizing:'border-box', outline:'none' }}
            onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
        </div>

        {error && <div style={{ background:'#FFF0F0', border:'1px solid #FFA3A3', borderRadius:8, padding:'10px 14px', color:'#D32F2F', fontSize:13, marginBottom:14, textAlign:'center' }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading||!name.trim()||!mdp.trim()}
          style={{ width:'100%', background:loading?'#8C6D4F':'#D2B795', color:'white', border:'none', padding:'13px', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:14, letterSpacing:'0.5px', transition:'background 0.2s' }}>
          {loading ? '⏳ Vérification...' : 'SE CONNECTER'}
        </button>

        <p style={{ textAlign:'center', fontSize:11, color:'#999', marginTop:16 }}>
          Votre accès est géré par votre Marraine / Manager
        </p>
      </div>
    </div>
  );
}

// ── App principale Réseau ─────────────────────────────────────────
export default function Reseau() {
  const [activeTab, setActiveTab]       = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId]     = useState(null);
  const [editingId, setEditingId]       = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [currentUser, setCurrentUser]   = useState(null);
  const [cloudStatus, setCloudStatus]   = useState('');

  const defaultTree = {
    nodes: [
      {
        id:"kheira_b", name:"Kheira BELARIBI", role:"Manager", genre:"femme", parentId:null,
        ca:"12 500 €", caNum:12500, objNum:15000, objectif:"Atteindre 15 000 € de CA d'équipe",
        fidelity:"Platine (1500 pts)", mdp:"Limitless*2026A",
        topClientsList:[{name:"Sarah Benali",date:"24 Mai 2026",details:"+450 pts"},{name:"Amel K.",date:"18 Mai 2026",details:"+300 pts"}],
        eventsList:[{name:"Séminaire Annuel Limitless",date:"15 Juin 2026",loc:"Paris"}],
        bestSellersList:[{name:"Parfum Prestige Luxury",date:"25 Mai 2026",qty:"18 un."}],
        meilleuresVentesList:[{name:"Pack Élite & Soins Éclat",date:"24 Mai 2026",total:"2 450 €"}]
      },
      {
        id:"marie", name:"Marie OUADI", role:"Marraine", genre:"femme", parentId:"kheira_b",
        ca:"8 400 €", caNum:8400, objNum:10000, objectif:"Atteindre 10 000 € de CA perso",
        fidelity:"Or (900 pts)", mdp:"Limitless*2026B",
        topClientsList:[{name:"Amine Mansouri",date:"25 Mai 2026",details:"+250 pts"}],
        eventsList:[{name:"Masterclass Or & Excellence",date:"18 Juin 2026",loc:"Marseille"}],
        bestSellersList:[{name:"Sérum Anti-Âge Ultime",date:"23 Mai 2026",qty:"15 un."}],
        meilleuresVentesList:[{name:"Gamme Corps & Fragrances",date:"22 Mai 2026",total:"1 650 €"}]
      },
      {
        id:"soumia", name:"Soumia", role:"Consultante", genre:"femme", parentId:"marie",
        ca:"2 100 €", caNum:2100, objNum:3000, objectif:"Atteindre 3 000 € de CA",
        fidelity:"Argent (320 pts)", mdp:"Soumia#Lmtl",
        topClientsList:[{name:"Léa Roussel",date:"26 Mai 2026",details:"+95 pts"}],
        eventsList:[{name:"Atelier Initial & Catalogue",date:"12 Juin 2026",loc:"En ligne"}],
        bestSellersList:[{name:"Huile Sèche Scintillante",date:"24 Mai 2026",qty:"9 un."}],
        meilleuresVentesList:[{name:"Duos Maquillage Été",date:"24 Mai 2026",total:"450 €"}]
      }
    ]
  };

  const [tree, setTree] = useState(() => {
    try {
      const d = localStorage.getItem('limitless_team_tree_v5');
      if (d) return JSON.parse(d);
    } catch {}
    return defaultTree;
  });

  // Sync avec Supabase au chargement
  useEffect(() => {
    if (isSupabaseEnabled) {
      setCloudStatus('sync');
      loadTree().then(cloudData => {
        if (cloudData) {
          setTree(cloudData);
          localStorage.setItem('limitless_team_tree_v5', JSON.stringify(cloudData));
        }
        setCloudStatus('ok');
      });
    }
  }, []);

  // Sauvegarder en localStorage + Supabase
  const persistTree = (newTree) => {
    setTree(newTree);
    localStorage.setItem('limitless_team_tree_v5', JSON.stringify(newTree));
    if (isSupabaseEnabled) {
      setCloudStatus('saving');
      saveTreeToCloud(newTree).then(() => setCloudStatus('ok'));
    }
  };

  const [newMember, setNewMember] = useState({
    name:'', role:'Consultante', genre:'femme', parentId:'', mdp:'',
    topClient:'', bestSeller:'', meilleuresVentes:'', objectif:'',
    caNum:'0', objNum:'1000'
  });

  const totalCA          = tree.nodes.reduce((s,n)=>s+(parseFloat(n.caNum)||0),0);
  const totalObjectifs   = tree.nodes.reduce((s,n)=>s+(parseFloat(n.objNum)||0),0);
  const globalPerformance = totalObjectifs>0 ? Math.min(100,Math.round((totalCA/totalObjectifs)*100)) : 0;

  const displayRole = (role, genre) => {
    if (genre==='homme') { if(role==='Consultante') return 'Consultant'; if(role==='Marraine') return 'Parrain'; }
    return role;
  };

  const startEditing = (m) => { setEditingId(m.id); setEditForm({...m}); };

  const saveRowEdits = () => {
    const cNum = parseFloat(editForm.caNum)||0;
    persistTree({ nodes: tree.nodes.map(n => n.id!==editingId ? n : {...editForm, caNum:cNum, ca:`${cNum.toLocaleString()} €`}) });
    setEditingId(null);
  };

  const handleDeleteMember = (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'équipe ?`)) return;
    const m = tree.nodes.find(n=>n.id===id);
    persistTree({ nodes: tree.nodes.filter(n=>n.id!==id).map(n=>n.parentId===id?{...n,parentId:m?.parentId||null}:n) });
    if (treeRootId===id) setTreeRootId(null);
    if (selectedMember?.id===id) setSelectedMember(null);
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const cNum=parseFloat(newMember.caNum)||0, oNum=parseFloat(newMember.objNum)||1000;
    persistTree({ nodes:[...tree.nodes,{
      id:Date.now().toString(), name:newMember.name.trim(), role:newMember.role,
      genre:newMember.genre, parentId:newMember.parentId||null,
      ca:`${cNum.toLocaleString()} €`, caNum:cNum, objNum:oNum,
      objectif:newMember.objectif.trim()||"Fixer un objectif",
      fidelity:"Initial (0 pts)", mdp:newMember.mdp.trim()||"Limitless#123",
      topClientsList:[{name:newMember.topClient.trim()||"Aucun",date:"26 Mai 2026",details:"Direct"}],
      eventsList:[{name:"Intégration digitale",date:"06 Juin 2026",loc:"En ligne"}],
      bestSellersList:[{name:newMember.bestSeller.trim()||"Non défini",date:"26 Mai 2026",qty:"1 un."}],
      meilleuresVentesList:[{name:newMember.meilleuresVentes.trim()||"Non défini",date:"26 Mai 2026",total:`${cNum} €`}]
    }]});
    setNewMember({name:'',role:'Consultante',genre:'femme',parentId:'',mdp:'',topClient:'',bestSeller:'',meilleuresVentes:'',objectif:'',caNum:'0',objNum:'1000'});
  };

  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = tree.nodes.filter(n=>n.parentId===node.id);
    return (
      <div key={node.id} style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
        <div onClick={()=>setSelectedMember(node)}
          style={{background:'white',border:'1px solid #D2B795',borderRadius:'12px',padding:'12px',minWidth:'140px',textAlign:'center',cursor:'pointer',boxShadow:'0 4px 10px rgba(210,183,149,0.15)',margin:'5px',position:'relative',zIndex:2}}>
          <div style={{fontSize:'10px',fontWeight:'700',color:node.genre==='homme'?'#3d6b9e':'#8C6D4F',textTransform:'uppercase'}}>
            {displayRole(node.role,node.genre)}
          </div>
          <div style={{fontWeight:'600',color:'#4A3E3D',fontSize:'14px',margin:'4px 0'}}>{node.name}</div>
          <div style={{fontSize:'11px',color:'#2d7a4a'}}>🟢 Actif</div>
        </div>
        {enfants.length>0&&<div style={{width:'2px',height:'20px',backgroundColor:'#D2B795',zIndex:1}}></div>}
        {enfants.length>0&&(
          <div style={{display:'flex',gap:'20px',position:'relative'}}>
            {enfants.map((enfant,index)=>(
              <div key={enfant.id} style={{position:'relative',paddingTop:'20px',display:'flex',flexDirection:'column',alignItems:'center'}}>
                {enfants.length>1&&(
                  <div style={{position:'absolute',top:0,left:index===0?'50%':0,right:index===enfants.length-1?'50%':0,borderTop:'2px solid #D2B795',zIndex:1}}/>
                )}
                <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'2px',height:'25px',backgroundColor:'#D2B795',zIndex:1}}/>
                {renderTreeNodes(enfant)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const visibleRoots       = treeRootId ? tree.nodes.filter(n=>n.id===treeRootId) : tree.nodes.filter(n=>!n.parentId);
  const currentFocusedNode = treeRootId ? tree.nodes.find(n=>n.id===treeRootId) : null;
  const parentNodeOfFocused = currentFocusedNode ? tree.nodes.find(n=>n.id===currentFocusedNode.parentId) : null;
  const pctProgress        = selectedMember ? Math.min(100,Math.round((selectedMember.caNum/(selectedMember.objNum||1))*100)) : 0;

  const isAdmin = currentUser?.role==='Manager' || currentUser?.role==='Marraine';

  // Écran login si pas connecté
  if (!currentUser) {
    return <LoginReseau tree={tree} onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div style={{padding:'15px',minHeight:'100vh',background:'#FAF7F2',fontFamily:'sans-serif',color:'#4A3E3D'}}>

      {/* EN-TÊTE */}
      <div style={{display:'flex',alignItems:'center',gap:'18px',maxWidth:'1000px',margin:'10px auto 25px auto',padding:'0 5px'}}>
        <button onClick={()=>setCurrentUser(null)} style={{width:'42px',height:'42px',borderRadius:'50%',backgroundColor:'#ffffff',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 3px 10px rgba(0,0,0,0.06)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:'10px',flex:1}}>
          <span style={{fontSize:'20px'}}>👥</span>
          <h1 style={{fontSize:'20px',fontWeight:'400',textTransform:'uppercase',letterSpacing:'3px',color:'#4A3E3D',margin:0,fontFamily:'serif'}}>Réseau</h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isSupabaseEnabled && (
            <span style={{fontSize:10,background:cloudStatus==='ok'?'#d1fae5':cloudStatus==='saving'?'#fef3c7':'#e0f2fe',color:cloudStatus==='ok'?'#065f46':cloudStatus==='saving'?'#92400e':'#0369a1',padding:'3px 8px',borderRadius:20,fontWeight:600}}>
              {cloudStatus==='sync'?'⏳ Sync...':cloudStatus==='saving'?'💾 Sauvegarde...':'☁️ Cloud'}
            </span>
          )}
          <div style={{background:'#F5EFE8',border:'1px solid #D2B795',borderRadius:20,padding:'4px 10px',fontSize:11,color:'#8C6D4F',fontWeight:600}}>
            👤 {currentUser.name.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* DASHBOARD GLOBAL */}
      <div style={{maxWidth:'1000px',margin:'0 auto 20px auto',background:'white',border:'1px solid #D2B795',borderRadius:'14px',padding:'15px 25px',display:'flex',justifyContent:'space-around',alignItems:'center',flexWrap:'wrap',gap:'20px',boxShadow:'0 4px 15px rgba(210,183,149,0.1)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'11px',color:'#8C6D4F',fontWeight:'700',textTransform:'uppercase'}}>📈 Chiffre d'Affaires Global</div>
          <div style={{fontSize:'24px',fontWeight:'700',color:'#2d7a4a',marginTop:'4px'}}>{totalCA.toLocaleString()} €</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'11px',color:'#8C6D4F',fontWeight:'700',textTransform:'uppercase'}}>🎯 Performance Équipe</div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'4px'}}>
            <div style={{fontSize:'24px',fontWeight:'700',color:'#4A3E3D'}}>{globalPerformance}%</div>
            <div style={{width:'120px',height:'8px',background:'#E6DCD0',borderRadius:'4px',overflow:'hidden'}}>
              <div style={{width:`${globalPerformance}%`,height:'100%',background:'linear-gradient(90deg,#D2B795,#8C6D4F)'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{display:'flex',gap:'10px',marginBottom:'20px',justifyContent:'center'}}>
        <button onClick={()=>setActiveTab('arbre')} style={{padding:'10px 20px',borderRadius:'20px',border:'1px solid #D2B795',background:activeTab==='arbre'?'#D2B795':'white',color:activeTab==='arbre'?'white':'#4A3E3D',cursor:'pointer',fontWeight:'600'}}>🌳 Arbre</button>
        {isAdmin && <button onClick={()=>setActiveTab('gestion')} style={{padding:'10px 20px',borderRadius:'20px',border:'1px solid #D2B795',background:activeTab==='gestion'?'#D2B795':'white',color:activeTab==='gestion'?'white':'#4A3E3D',cursor:'pointer',fontWeight:'600'}}>⚙️ Gestion</button>}
      </div>

      {/* VUE ARBRE */}
      {activeTab==='arbre'&&(
        <div style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'15px'}}>
          {treeRootId&&(
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap',justifyContent:'center',marginBottom:'5px'}}>
              <button onClick={()=>setTreeRootId(null)} style={{background:'#4A3E3D',color:'white',border:'none',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',cursor:'pointer'}}>🏠 Racine</button>
              <button onClick={()=>setTreeRootId(currentFocusedNode.parentId)} style={{background:'white',border:'1px solid #8C6D4F',color:'#8C6D4F',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',cursor:'pointer'}}>⬅️ Remonter ({parentNodeOfFocused?parentNodeOfFocused.name:"Racine"})</button>
            </div>
          )}
          <div style={{width:'100%',overflowX:'auto',paddingBottom:'20px',textAlign:'center'}}>
            <div style={{display:'inline-flex',flexDirection:'column',alignItems:'center',minWidth:'100%',gap:'20px'}}>
              {visibleRoots.map(root=>renderTreeNodes(root))}
            </div>
          </div>
        </div>
      )}

      {/* VUE GESTION */}
      {activeTab==='gestion'&&isAdmin&&(
        <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'25px'}}>
          <div style={{background:'white',padding:'25px',borderRadius:'14px',border:'1px solid #D2B795',boxShadow:'0 4px 12px rgba(0,0,0,0.03)'}}>
            <h3 style={{marginTop:0,color:'#4A3E3D',marginBottom:'20px',fontSize:'16px',letterSpacing:'1px',textTransform:'uppercase'}}>✨ FORMULAIRE D'INSCRIPTION COMPLET</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'15px'}}>
              {[['name','Nom & Prénom *','text','Ex: Jean Dupont'],['mdp','🔑 Mot de passe','text','Ex: Limitless#2026'],['caNum','Chiffre d\'Affaires Initial (€)','number','0'],['objNum','Objectif de CA (€)','number','1000'],['objectif','Phrase d\'Objectif','text','Ex: Atteindre 3000€'],['topClient','👥 Premier Client Top','text','Ex: Alice Durand'],['bestSeller','💄 Premier Produit Best-Seller','text','Ex: Parfum Luxury']].map(([k,l,t,ph])=>(
                <div key={k}>
                  <label style={{fontSize:'12px',fontWeight:'bold',color:'#8C6D4F'}}>{l}</label>
                  <input type={t} placeholder={ph} value={newMember[k]} onChange={e=>setNewMember({...newMember,[k]:e.target.value})}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #E6DCD0',marginTop:'4px',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:'12px',fontWeight:'bold',color:'#8C6D4F'}}>Rôle</label>
                <select value={newMember.role} onChange={e=>setNewMember({...newMember,role:e.target.value})}
                  style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #E6DCD0',marginTop:'4px',background:'white'}}>
                  <option value="Consultante">Consultante / Consultant</option>
                  <option value="Marraine">Marraine / Parrain</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:'12px',fontWeight:'bold',color:'#8C6D4F'}}>Genre</label>
                <select value={newMember.genre} onChange={e=>setNewMember({...newMember,genre:e.target.value})}
                  style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #E6DCD0',marginTop:'4px',background:'white'}}>
                  <option value="femme">Femme</option><option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:'12px',fontWeight:'bold',color:'#8C6D4F'}}>Rattaché à (Marraine/Supérieur)</label>
                <select value={newMember.parentId} onChange={e=>setNewMember({...newMember,parentId:e.target.value})}
                  style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #E6DCD0',marginTop:'4px',background:'white'}}>
                  <option value="">Aucun (Racine)</option>
                  {tree.nodes.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{fontSize:'12px',fontWeight:'bold',color:'#8C6D4F'}}>🛍️ Description Meilleure Vente initiale</label>
                <input placeholder="Ex: Pack Crèmes & Fragrances d'été" value={newMember.meilleuresVentes} onChange={e=>setNewMember({...newMember,meilleuresVentes:e.target.value})}
                  style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #E6DCD0',marginTop:'4px',boxSizing:'border-box'}}/>
              </div>
            </div>
            <button onClick={handleAddMember} style={{width:'100%',background:'#2d7a4a',color:'white',border:'none',padding:'14px',borderRadius:'8px',fontWeight:'600',cursor:'pointer',marginTop:'20px',letterSpacing:'1px'}}>
              AJOUTER AU RÉSEAU LIMITLESS
            </button>
          </div>

          {/* Tableau */}
          <div style={{overflowX:'auto',background:'white',borderRadius:'14px',border:'1px solid #D2B795'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'850px'}}>
              <thead>
                <tr style={{background:'#F5EFE8',color:'#4A3E3D'}}>
                  <th style={{padding:'12px',textAlign:'left'}}>Conseiller(e)</th>
                  <th style={{padding:'12px',textAlign:'left'}}>Rôle</th>
                  <th style={{padding:'12px',textAlign:'left'}}>🔑 Mot de passe</th>
                  <th style={{padding:'12px',textAlign:'left'}}>Chiffre d'Affaires</th>
                  <th style={{padding:'12px',textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map(n=>{
                  const isEditing=editingId===n.id;
                  return(
                    <tr key={n.id} style={{borderBottom:'1px solid rgba(210,183,149,0.15)'}}>
                      <td style={{padding:'12px',fontWeight:'600'}}>{isEditing?<input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>:n.name}</td>
                      <td style={{padding:'12px'}}>{displayRole(n.role,n.genre)}</td>
                      <td style={{padding:'12px',fontFamily:'monospace',fontWeight:'bold',color:'#B39266'}}>{isEditing?<input value={editForm.mdp} onChange={e=>setEditForm({...editForm,mdp:e.target.value})}/>:n.mdp}</td>
                      <td style={{padding:'12px',color:'#2d7a4a',fontWeight:'600'}}>{isEditing?<input type="number" value={editForm.caNum} onChange={e=>setEditForm({...editForm,caNum:e.target.value})}/>:n.ca}</td>
                      <td style={{padding:'12px',textAlign:'center'}}>
                        {isEditing?(
                          <div style={{display:'flex',justifyContent:'center',gap:'8px'}}>
                            <button onClick={saveRowEdits} style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>💾</button>
                            <button onClick={()=>setEditingId(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>❌</button>
                          </div>
                        ):(
                          <div style={{display:'flex',justifyContent:'center',gap:'10px'}}>
                            <button onClick={()=>startEditing(n)} style={{background:'white',border:'1px solid #D2B795',padding:'5px 10px',borderRadius:'6px',cursor:'pointer',fontWeight:'600',color:'#4A3E3D'}}>✏️ Modifier</button>
                            <button onClick={()=>handleDeleteMember(n.id,n.name)} style={{background:'#FFF0F0',border:'1px solid #FFA3A3',padding:'5px 10px',borderRadius:'6px',cursor:'pointer',fontWeight:'600',color:'#D32F2F'}}>🗑️ Supprimer</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARTE MODALE DU MEMBRE */}
      {selectedMember&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'10px'}}>
          <div style={{background:'white',border:'1px solid #D2B795',borderRadius:'16px',padding:'25px',width:'100%',maxWidth:'440px',position:'relative',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 10px 25px rgba(0,0,0,0.15)'}}>
            <button onClick={()=>setSelectedMember(null)} style={{position:'absolute',top:'15px',right:'15px',background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'#4A3E3D'}}>✕</button>
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <h2 style={{margin:'0 0 5px 0',fontSize:'18px',color:'#4A3E3D',fontFamily:'serif',letterSpacing:'1px'}}>{selectedMember.name}</h2>
              <span style={{background:'#F5EFE8',color:'#8C6D4F',padding:'4px 12px',borderRadius:'12px',fontSize:'11px',fontWeight:'bold',textTransform:'uppercase'}}>{displayRole(selectedMember.role,selectedMember.genre)}</span>
            </div>
            <div style={{background:'#FAF5EE',padding:'12px 15px',borderRadius:'10px',marginBottom:'15px',border:'1px solid rgba(210,183,149,0.2)'}}>
              <div style={{fontSize:'12px',fontWeight:'bold',color:'#4A3E3D',display:'flex',justifyContent:'space-between'}}>
                <span>🎯 Objectif : {selectedMember.objectif}</span>
                <span style={{color:'#8C6D4F'}}>{pctProgress}%</span>
              </div>
              <div style={{width:'100%',height:'8px',background:'#E6DCD0',borderRadius:'4px',marginTop:'8px',overflow:'hidden'}}>
                <div style={{width:`${pctProgress}%`,height:'100%',background:'linear-gradient(90deg,#D2B795,#8C6D4F)'}}></div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',fontSize:'13px',marginBottom:'20px'}}>
              {[['💰 Chiffre d\'Affaires :',selectedMember.ca,'#2d7a4a'],['💎 Statut Fidélité :',selectedMember.fidelity||"Initial",'#4A3E3D'],['🔑 Mot de passe :',selectedMember.mdp,'#B39266']].map(([l,v,c])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #F0EAE1'}}>
                  <span style={{color:'#8C6D4F'}}>{l}</span>
                  <strong style={{color:c,fontFamily:l.includes('passe')?'monospace':'inherit'}}>{v}</strong>
                </div>
              ))}
            </div>
            {[['🛍️ TOP VENTES & COMMANDES',selectedMember.meilleuresVentesList,'name','total'],
              ['💄 PRODUITS PHARES (BEST-SELLERS)',selectedMember.bestSellersList,'name','qty'],
              ['👥 FIDÉLITÉ CLIENTS & POINTS',selectedMember.topClientsList,'name','details'],
              ['📅 FORMATIONS & SÉMINAIRES',selectedMember.eventsList,'name','loc']
            ].map(([title,list,k1,k2])=>(
              <div key={title} style={{marginTop:'15px',textAlign:'left'}}>
                <span style={{fontSize:'11px',fontWeight:'700',color:'#8C6D4F',textTransform:'uppercase',letterSpacing:'1px',display:'block',marginBottom:'6px'}}>{title}</span>
                {list?.length>0 ? list.map((it,i)=>(
                  <div key={i} style={{background:title.includes('SÉMIN')?'#FAF8F5':'#FDFBF7',border:title.includes('SÉMIN')?'none':'1px solid #F0EAE1',borderLeft:title.includes('SÉMIN')?'3px solid #D2B795':'none',padding:'8px 12px',borderRadius:'8px',fontSize:'12px',display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontWeight:title.includes('SÉMIN')?'600':'500'}}>{it[k1]}{title.includes('SÉMIN')&&it.date?<div style={{color:'#777',fontSize:'11px',marginTop:'2px'}}>{it.date} — {it.loc}</div>:null}</span>
                    {!title.includes('SÉMIN')&&<span style={{color:title.includes('VENTES')?'#2d7a4a':'#8C6D4F',fontWeight:'700'}}>{it[k2]}</span>}
                  </div>
                )) : <div style={{fontSize:'12px',color:'#999'}}>Non défini</div>}
              </div>
            ))}
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'20px'}}>
              <button onClick={()=>{setTreeRootId(selectedMember.id);setSelectedMember(null);}} style={{width:'100%',padding:'11px',background:'#D2B795',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',letterSpacing:'0.5px'}}>Zoomer sur son réseau</button>
              <button onClick={()=>setSelectedMember(null)} style={{width:'100%',padding:'11px',background:'#4A3E3D',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

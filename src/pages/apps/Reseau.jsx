import React, { useState, useEffect, useCallback } from 'react';
import { useCloudData } from '../../lib/useCloudData';
import { useAuth } from '../../context/AuthContext';

export default function Reseau() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]           = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId]         = useState(null);
  const [editingId, setEditingId]           = useState(null);
  const [editForm, setEditForm]             = useState({});
  const [lastRefresh, setLastRefresh]       = useState(Date.now());

  const [tree, setTree_]    = useCloudData('limitless_team_tree_v5', {nodes:[]});
  const [sales]             = useCloudData('le_sales', []);
  const [events]            = useCloudData('le_cevents', []);

  // Synchroniser les comptes existants du réseau au chargement
  useEffect(() => {
    if (user?.role !== 'admin') return;
    try {
      const list = JSON.parse(localStorage.getItem('consultants') || '[]');
      const existingNames = list.map(u => u.firstName.toLowerCase());
      let updated = false;
      tree.nodes.forEach(n => {
        const parts = n.name.trim().split(' ');
        const fn = (parts[0]||'').toLowerCase();
        if (fn && !existingNames.includes(fn) && n.mdp) {
          const firstName = parts[0];
          const lastName  = parts.slice(1).join(' ') || '';
          const hubRole   = n.role==='Consultante'?'consultante':'marraine';
          list.push({ id:`user_${Date.now()}_${fn}`, firstName, lastName, displayName:`${firstName} ${lastName}`.trim(), role:hubRole, password:n.mdp, locked:false });
          existingNames.push(fn);
          updated = true;
        }
      });
      if (updated) localStorage.setItem('consultants', JSON.stringify(list));
    } catch {}
  }, [tree.nodes.length]);

  // Auto-refresh via useCloudData + storage events
  useEffect(() => {
    const onStorage = () => setLastRefresh(Date.now());
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => setLastRefresh(Date.now()), 3000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  const persistTree = (newTree) => { setTree_(newTree); };

  // ── Filtrage selon le rôle ────────────────────────────────────
  const getVisibleNodes = () => {
    if (!user || user.role === 'admin') return tree.nodes;
    const userName = (user.firstName || '').toLowerCase();
    // Trouver le nœud correspondant à l'utilisateur connecté
    const myNode = tree.nodes.find(n => n.name.toLowerCase().includes(userName));
    if (!myNode) return tree.nodes; // fallback: tout voir
    if (user.role === 'marraine') {
      // Marraine voit elle-même + ses consultants directs
      const myConsultants = tree.nodes.filter(n => n.parentId === myNode.id);
      return [myNode, ...myConsultants];
    }
    return [myNode];
  };

  const visibleNodes = getVisibleNodes();

  // ── CA depuis les ventes réelles ──────────────────────────────
  const getCA = (nodeName) => {
    const ns = sales.filter(s => s.consultant === nodeName);
    const eu = ns.filter(x => (x.currency || x.cur) === '€' || (!x.currency && !x.cur))
                  .reduce((t, x) => t + (parseFloat(x.amount || x.amt) || 0), 0);
    const da = ns.filter(x => (x.currency || x.cur) === 'DA')
                  .reduce((t, x) => t + (parseFloat(x.amount || x.amt) || 0), 0);
    return { eu, da };
  };

  // ── Événements d'un membre ────────────────────────────────────
  const getMemberEvents = (nodeName) => {
    return events.filter(e => (e.consultant || '').toLowerCase() === nodeName.toLowerCase());
  };

  // ── Calculs dashboard ─────────────────────────────────────────
  const totalCA         = visibleNodes.reduce((s, n) => s + (parseFloat(n.caNum) || 0), 0);
  const totalObjectifs  = visibleNodes.reduce((s, n) => s + (parseFloat(n.objNum) || 0), 0);
  const globalPerf      = totalObjectifs > 0 ? Math.min(100, Math.round((totalCA / totalObjectifs) * 100)) : 0;

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine')    return 'Parrain';
    }
    return role;
  };

  // ── Gestion CRUD ──────────────────────────────────────────────
  const startEditing = (m) => { setEditingId(m.id); setEditForm({ ...m }); };

  const saveRowEdits = () => {
    const cNum = parseFloat(editForm.caNum) || 0;
    persistTree({ nodes: tree.nodes.map(n => n.id !== editingId ? n : { ...editForm, caNum: cNum, ca: `${cNum.toLocaleString('fr-FR')} €` }) });
    setEditingId(null);
  };

  const handleDeleteMember = (id, name) => {
    if (!window.confirm(`Supprimer ${name} de l'équipe ?`)) return;
    const m = tree.nodes.find(n => n.id === id);
    persistTree({ nodes: tree.nodes.filter(n => n.id !== id).map(n => n.parentId === id ? { ...n, parentId: m?.parentId || null } : n) });
    if (treeRootId === id) setTreeRootId(null);
    if (selectedMember?.id === id) setSelectedMember(null);
  };

  const [newMember, setNewMember] = useState({
    name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '',
    topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000'
  });

  // Créer un compte Chogan Hub pour le nouveau membre
  const createAccount = (name, role, mdp) => {
    const parts     = name.trim().split(' ');
    const firstName = parts[0] || name;
    const lastName  = parts.slice(1).join(' ') || '';
    const hubRole   = role === 'Consultante' ? 'consultante' : role === 'Marraine' || role === 'Parrain' ? 'marraine' : 'marraine';
    const id        = `user_${Date.now()}`;
    try {
      const list = JSON.parse(localStorage.getItem('consultants') || '[]');
      // Vérifier si le compte existe déjà
      const exists = list.some(u => u.firstName.toLowerCase() === firstName.toLowerCase() && u.lastName.toLowerCase() === lastName.toLowerCase());
      if (!exists) {
        list.push({ id, firstName, lastName, displayName:`${firstName} ${lastName}`.trim(), role:hubRole, password:mdp||'Chogan#123', locked:false });
        localStorage.setItem('consultants', JSON.stringify(list));
      }
    } catch {}
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const cNum = parseFloat(newMember.caNum) || 0, oNum = parseFloat(newMember.objNum) || 1000;
    // Créer le compte de connexion automatiquement
    createAccount(newMember.name, newMember.role, newMember.mdp);
    persistTree({ nodes: [...tree.nodes, {
      id: Date.now().toString(), name: newMember.name.trim(), role: newMember.role,
      genre: newMember.genre, parentId: newMember.parentId || null,
      ca: `${cNum.toLocaleString('fr-FR')} €`, caNum: cNum, objNum: oNum,
      objectif: newMember.objectif || 'Fixer un objectif', fidelity: 'Initial (0 pts)',
      mdp: newMember.mdp || 'Chogan#123',
      topClientsList:       [{ name: newMember.topClient     || 'Aucun',    date: 'Aujourd\'hui', details: 'Direct' }],
      bestSellersList:      [{ name: newMember.bestSeller     || 'Non défini', date: 'Aujourd\'hui', qty: '1 un.' }],
      meilleuresVentesList: [{ name: newMember.meilleuresVentes || 'Non défini', date: 'Aujourd\'hui', total: `${cNum} €` }],
      eventsList:           [{ name: 'Intégration Chogan', date: 'À définir', loc: 'En ligne' }]
    }]});
    setNewMember({ name:'', role:'Consultante', genre:'femme', parentId:'', mdp:'', topClient:'', bestSeller:'', meilleuresVentes:'', objectif:'', caNum:'0', objNum:'1000' });
  };

  // ── Rendu arbre avec lignes de connexion ──────────────────────
  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants   = tree.nodes.filter(n => n.parentId === node.id && visibleNodes.find(v => v.id === n.id));
    const { eu, da } = getCA(node.name);
    const caReal    = eu > 0 || da > 0;
    const caDisplay = caReal
      ? [(eu > 0 ? `${eu.toFixed(0)} €` : ''), (da > 0 ? `${Math.round(da).toLocaleString('fr-FR')} DA` : '')].filter(Boolean).join(' · ')
      : (node.ca || '—');

    return (
      <div key={node.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
        <div onClick={() => setSelectedMember({ ...node, _caEu: eu, _caDa: da, _events: getMemberEvents(node.name) })}
          style={{ background:'white', border:'1px solid #D2B795', borderRadius:'12px', padding:'12px', minWidth:'140px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 10px rgba(210,183,149,0.15)', margin:'5px', position:'relative', zIndex:2 }}>
          <div style={{ fontSize:'10px', fontWeight:'700', color: node.genre==='homme'?'#3d6b9e':'#8C6D4F', textTransform:'uppercase' }}>
            {displayRole(node.role, node.genre)}
          </div>
          <div style={{ fontWeight:'600', color:'#4A3E3D', fontSize:'14px', margin:'4px 0' }}>{node.name}</div>
          <div style={{ fontSize:'11px', color:'#2d7a4a' }}>🟢 {caDisplay}</div>
        </div>
        {enfants.length > 0 && <div style={{ width:'2px', height:'20px', backgroundColor:'#D2B795', zIndex:1 }}></div>}
        {enfants.length > 0 && (
          <div style={{ display:'flex', gap:'20px', position:'relative' }}>
            {enfants.map((enfant, index) => (
              <div key={enfant.id} style={{ position:'relative', paddingTop:'20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
                {enfants.length > 1 && (
                  <div style={{ position:'absolute', top:0, left:index===0?'50%':0, right:index===enfants.length-1?'50%':0, borderTop:'2px solid #D2B795', zIndex:1 }} />
                )}
                <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'2px', height:'25px', backgroundColor:'#D2B795', zIndex:1 }} />
                {renderTreeNodes(enfant)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const visibleRoots        = treeRootId ? visibleNodes.filter(n => n.id === treeRootId) : visibleNodes.filter(n => !n.parentId || !visibleNodes.find(v => v.id === n.parentId));
  const currentFocusedNode  = treeRootId ? tree.nodes.find(n => n.id === treeRootId) : null;
  const parentNodeOfFocused = currentFocusedNode ? tree.nodes.find(n => n.id === currentFocusedNode.parentId) : null;
  const pctProgress         = selectedMember ? Math.min(100, Math.round(((selectedMember._caEu || selectedMember.caNum || 0) / (selectedMember.objNum || 1)) * 100)) : 0;
  const isManager           = user?.role === 'admin' || (selectedMember && (selectedMember.role === 'Manager' || selectedMember.role === 'Marraine'));

  return (
    <div style={{ padding:'15px', minHeight:'100vh', background:'#FAF7F2', fontFamily:'sans-serif', color:'#4A3E3D' }}>

      {/* EN-TÊTE */}
      <div style={{ display:'flex', alignItems:'center', gap:'18px', maxWidth:'1000px', margin:'10px auto 25px auto', padding:'0 5px' }}>
        <button onClick={() => window.history.back()} style={{ width:'42px', height:'42px', borderRadius:'50%', backgroundColor:'#ffffff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 3px 10px rgba(0,0,0,0.06)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
          <span style={{ fontSize:'20px' }}>👥</span>
          <h1 style={{ fontSize:'20px', fontWeight:'400', textTransform:'uppercase', letterSpacing:'3px', color:'#4A3E3D', margin:0, fontFamily:'serif' }}>Réseau</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:10, background:'#d1fae5', color:'#065f46', padding:'3px 8px', borderRadius:20, fontWeight:600 }}>🔄 Auto</span>
          <span style={{ fontSize:10, color:'#999' }}>{new Date(lastRefresh).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
        </div>
      </div>

      {/* DASHBOARD */}
      <div style={{ maxWidth:'1000px', margin:'0 auto 20px auto', background:'white', border:'1px solid #D2B795', borderRadius:'14px', padding:'15px 25px', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:'20px', boxShadow:'0 4px 15px rgba(210,183,149,0.1)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:'#8C6D4F', fontWeight:'700', textTransform:'uppercase' }}>📈 Chiffre d'Affaires Global</div>
          <div style={{ fontSize:'24px', fontWeight:'700', color:'#2d7a4a', marginTop:'4px' }}>{totalCA.toLocaleString('fr-FR')} €</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:'#8C6D4F', fontWeight:'700', textTransform:'uppercase' }}>🎯 Performance Équipe</div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'4px' }}>
            <div style={{ fontSize:'24px', fontWeight:'700', color:'#4A3E3D' }}>{globalPerf}%</div>
            <div style={{ width:'120px', height:'8px', background:'#E6DCD0', borderRadius:'4px', overflow:'hidden' }}>
              <div style={{ width:`${globalPerf}%`, height:'100%', background:'linear-gradient(90deg,#D2B795,#8C6D4F)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', justifyContent:'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding:'10px 20px', borderRadius:'20px', border:'1px solid #D2B795', background:activeTab==='arbre'?'#D2B795':'white', color:activeTab==='arbre'?'white':'#4A3E3D', cursor:'pointer', fontWeight:'600' }}>🌳 Arbre</button>
        {user?.role === 'admin' && <button onClick={() => setActiveTab('gestion')} style={{ padding:'10px 20px', borderRadius:'20px', border:'1px solid #D2B795', background:activeTab==='gestion'?'#D2B795':'white', color:activeTab==='gestion'?'white':'#4A3E3D', cursor:'pointer', fontWeight:'600' }}>⚙️ Gestion</button>}
      </div>

      {/* VUE ARBRE */}
      {activeTab === 'arbre' && (
        <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'15px' }}>
          {treeRootId && (
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginBottom:'5px' }}>
              <button onClick={() => setTreeRootId(null)} style={{ background:'#4A3E3D', color:'white', border:'none', padding:'8px 16px', borderRadius:'20px', fontSize:'13px', cursor:'pointer' }}>🏠 Racine</button>
              <button onClick={() => setTreeRootId(currentFocusedNode?.parentId)} style={{ background:'white', border:'1px solid #8C6D4F', color:'#8C6D4F', padding:'8px 16px', borderRadius:'20px', fontSize:'13px', cursor:'pointer' }}>⬅️ Remonter ({parentNodeOfFocused ? parentNodeOfFocused.name : 'Racine'})</button>
            </div>
          )}
          <div style={{ width:'100%', overflowX:'auto', paddingBottom:'20px', textAlign:'center' }}>
            <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', minWidth:'100%', gap:'20px' }}>
              {visibleRoots.length === 0
                ? <div style={{ textAlign:'center', color:'#8C6D4F', padding:'40px 20px' }}><div style={{ fontSize:40, marginBottom:8 }}>🌐</div><p>Réseau vide. Ajoutez des membres via ⚙️ Gestion.</p></div>
                : visibleRoots.map(root => renderTreeNodes(root))
              }
            </div>
          </div>
        </div>
      )}

      {/* VUE GESTION — Admin uniquement */}
      {activeTab === 'gestion' && user?.role === 'admin' && (
        <div style={{ maxWidth:'1000px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'25px' }}>
          <div style={{ background:'white', padding:'25px', borderRadius:'14px', border:'1px solid #D2B795', boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ marginTop:0, color:'#4A3E3D', marginBottom:'20px', fontSize:'16px', letterSpacing:'1px', textTransform:'uppercase' }}>✨ FORMULAIRE D'INSCRIPTION COMPLET</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'15px' }}>
              {[['name','Nom & Prénom *','text','Ex: Jean Dupont'],['mdp','🔑 Mot de passe','text','Chogan#2026'],['caNum','Chiffre d\'Affaires Initial (€)','number','0'],['objNum','Objectif de CA (€)','number','1000'],['objectif','Phrase d\'Objectif','text','Ex: Atteindre 3000€'],['topClient','👥 Premier Client Top','text','Ex: Alice Durand'],['bestSeller','💄 Premier Produit Best-Seller','text','Ex: Parfum N°001']].map(([k,l,t,ph]) => (
                <div key={k}>
                  <label style={{ fontSize:'12px', fontWeight:'bold', color:'#8C6D4F' }}>{l}</label>
                  <input type={t} placeholder={ph} value={newMember[k]} onChange={e => setNewMember({ ...newMember, [k]: e.target.value })}
                    style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #E6DCD0', marginTop:'4px', boxSizing:'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'12px', fontWeight:'bold', color:'#8C6D4F' }}>Rôle</label>
                <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #E6DCD0', marginTop:'4px', background:'white' }}>
                  <option value="Consultante">Consultante / Consultant</option>
                  <option value="Marraine">Marraine / Parrain</option>
                  <option value="Manager">Manager</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:'12px', fontWeight:'bold', color:'#8C6D4F' }}>Genre</label>
                <select value={newMember.genre} onChange={e => setNewMember({ ...newMember, genre: e.target.value })} style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #E6DCD0', marginTop:'4px', background:'white' }}>
                  <option value="femme">Femme</option><option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:'12px', fontWeight:'bold', color:'#8C6D4F' }}>Rattaché à (Marraine/Supérieur)</label>
                <select value={newMember.parentId} onChange={e => setNewMember({ ...newMember, parentId: e.target.value })} style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #E6DCD0', marginTop:'4px', background:'white' }}>
                  <option value="">Aucun (Racine)</option>
                  {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={{ fontSize:'12px', fontWeight:'bold', color:'#8C6D4F' }}>🛍️ Description Meilleure Vente initiale</label>
                <input placeholder="Ex: Pack Crèmes & Fragrances d'été" value={newMember.meilleuresVentes} onChange={e => setNewMember({ ...newMember, meilleuresVentes: e.target.value })}
                  style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #E6DCD0', marginTop:'4px', boxSizing:'border-box' }} />
              </div>
            </div>
            <button onClick={handleAddMember} style={{ width:'100%', background:'#2d7a4a', color:'white', border:'none', padding:'14px', borderRadius:'8px', fontWeight:'600', cursor:'pointer', marginTop:'20px', letterSpacing:'1px' }}>
              AJOUTER AU RÉSEAU
            </button>
          </div>

          <div style={{ overflowX:'auto', background:'white', borderRadius:'14px', border:'1px solid #D2B795' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px', minWidth:'850px' }}>
              <thead>
                <tr style={{ background:'#F5EFE8', color:'#4A3E3D' }}>
                  <th style={{ padding:'12px', textAlign:'left' }}>Conseiller(e)</th>
                  <th style={{ padding:'12px', textAlign:'left' }}>Rôle</th>
                  <th style={{ padding:'12px', textAlign:'left' }}>🔑 Mot de passe</th>
                  <th style={{ padding:'12px', textAlign:'left' }}>Chiffre d'Affaires</th>
                  <th style={{ padding:'12px', textAlign:'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map(n => {
                  const isEditing = editingId === n.id;
                  return (
                    <tr key={n.id} style={{ borderBottom:'1px solid rgba(210,183,149,0.15)' }}>
                      <td style={{ padding:'12px', fontWeight:'600' }}>{isEditing ? <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /> : n.name}</td>
                      <td style={{ padding:'12px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding:'12px', fontFamily:'monospace', fontWeight:'bold', color:'#B39266' }}>{isEditing ? <input value={editForm.mdp} onChange={e => setEditForm({ ...editForm, mdp: e.target.value })} /> : n.mdp}</td>
                      <td style={{ padding:'12px', color:'#2d7a4a', fontWeight:'600' }}>{isEditing ? <input type="number" value={editForm.caNum} onChange={e => setEditForm({ ...editForm, caNum: e.target.value })} /> : n.ca}</td>
                      <td style={{ padding:'12px', textAlign:'center' }}>
                        {isEditing ? (
                          <div style={{ display:'flex', justifyContent:'center', gap:'8px' }}>
                            <button onClick={saveRowEdits} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px' }}>💾</button>
                            <button onClick={() => setEditingId(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px' }}>❌</button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', justifyContent:'center', gap:'10px' }}>
                            <button onClick={() => startEditing(n)} style={{ background:'white', border:'1px solid #D2B795', padding:'5px 10px', borderRadius:'6px', cursor:'pointer', fontWeight:'600', color:'#4A3E3D' }}>✏️ Modifier</button>
                            <button onClick={() => handleDeleteMember(n.id, n.name)} style={{ background:'#FFF0F0', border:'1px solid #FFA3A3', padding:'5px 10px', borderRadius:'6px', cursor:'pointer', fontWeight:'600', color:'#D32F2F' }}>🗑️ Supprimer</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Zone de réinitialisation */}
          <div style={{ background:'white', padding:'20px', borderRadius:'14px', border:'2px solid #FFA3A3' }}>
            <h3 style={{ marginTop:0, color:'#D32F2F', fontSize:'14px', letterSpacing:'1px', textTransform:'uppercase', marginBottom:16 }}>⚠️ RÉINITIALISATION DES DONNÉES</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'🗑️ Effacer toutes les ventes (CA)', key:'le_sales', color:'#D32F2F', confirm:'Supprimer TOUTES les ventes ? Cette action est irréversible.' },
                { label:'🗑️ Effacer tous les événements', key:'le_cevents', color:'#D32F2F', confirm:'Supprimer TOUS les événements ?' },
                { label:'🗑️ Effacer tous les clients', key:'le_clients', color:'#D32F2F', confirm:'Supprimer TOUS les clients ?' },
                { label:'🗑️ Réinitialiser le réseau (arbre)', key:'limitless_team_tree_v5', color:'#D32F2F', confirm:"Réinitialiser l'arbre réseau ? Tous les membres seront supprimés." },
                { label:'🔴 TOUT RÉINITIALISER', key:'ALL', color:'#7f0000', confirm:'Supprimer TOUTES les données (ventes, événements, clients, réseau) ? Action IRRÉVERSIBLE.' },
              ].map(({ label, key, color, confirm }) => (
                <button key={key} onClick={() => {
                  if (!window.confirm(confirm)) return;
                  if (key === 'ALL') {
                    ['le_sales','le_cevents','le_clients','limitless_team_tree_v5','le_tree'].forEach(k => localStorage.removeItem(k));
                    setTree({ nodes: [] });
                    setSales([]);
                    setEvents([]);
                  } else {
                    localStorage.removeItem(key);
                    if (key === 'le_sales') setSales([]);
                    if (key === 'le_cevents') setEvents([]);
                    if (key === 'limitless_team_tree_v5' || key === 'le_tree') setTree({ nodes: [] });
                  }
                  alert('✅ Réinitialisation effectuée.');
                }} style={{ width:'100%', padding:'12px', background: key==='ALL'?'#7f0000':'#FFF0F0', color:color, border:`1px solid ${color}40`, borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:13, letterSpacing:'0.5px', fontFamily:'sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CARTE MODALE DU MEMBRE */}
      {selectedMember && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'10px' }}>
          <div style={{ background:'white', border:'1px solid #D2B795', borderRadius:'16px', padding:'25px', width:'100%', maxWidth:'440px', position:'relative', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#4A3E3D' }}>✕</button>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <h2 style={{ margin:'0 0 5px 0', fontSize:'18px', color:'#4A3E3D', fontFamily:'serif', letterSpacing:'1px' }}>{selectedMember.name}</h2>
              <span style={{ background:'#F5EFE8', color:'#8C6D4F', padding:'4px 12px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold', textTransform:'uppercase' }}>{displayRole(selectedMember.role, selectedMember.genre)}</span>
            </div>
            <div style={{ background:'#FAF5EE', padding:'12px 15px', borderRadius:'10px', marginBottom:'15px', border:'1px solid rgba(210,183,149,0.2)' }}>
              <div style={{ fontSize:'12px', fontWeight:'bold', color:'#4A3E3D', display:'flex', justifyContent:'space-between' }}>
                <span>🎯 {selectedMember.objectif || 'Objectif non défini'}</span>
                <span style={{ color:'#8C6D4F' }}>{pctProgress}%</span>
              </div>
              <div style={{ width:'100%', height:'8px', background:'#E6DCD0', borderRadius:'4px', marginTop:'8px', overflow:'hidden' }}>
                <div style={{ width:`${pctProgress}%`, height:'100%', background:'linear-gradient(90deg,#D2B795,#8C6D4F)' }}></div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', fontSize:'13px', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0EAE1' }}>
                <span style={{ color:'#8C6D4F' }}>💰 CA Euros :</span>
                <strong style={{ color:'#2d7a4a' }}>{(selectedMember._caEu||0).toFixed(0)} €</strong>
              </div>
              {(selectedMember._caDa||0) > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0EAE1' }}>
                  <span style={{ color:'#8C6D4F' }}>💰 CA Dinars :</span>
                  <strong style={{ color:'#3d6b9e' }}>{Math.round(selectedMember._caDa||0).toLocaleString('fr-FR')} DA</strong>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0EAE1' }}>
                <span style={{ color:'#8C6D4F' }}>💎 Statut Fidélité :</span>
                <strong>{selectedMember.fidelity || 'Initial'}</strong>
              </div>
            </div>

            {/* Événements réels depuis le Planner */}
            {(selectedMember._events||[]).length > 0 && (
              <div style={{ marginTop:'15px' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#8C6D4F', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>📅 ÉVÉNEMENTS</span>
                {selectedMember._events.map((ev, i) => (
                  <div key={i} style={{ background:'#FAF8F5', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', borderLeft:'3px solid #D2B795', marginBottom:'4px' }}>
                    <div style={{ fontWeight:'600' }}>{ev.n}</div>
                    <div style={{ color:'#777', fontSize:'11px', marginTop:'2px' }}>{ev.d} — {ev.lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Top ventes & best-sellers du profil */}
            {[['🛍️ TOP VENTES',selectedMember.meilleuresVentesList,'name','total'],
              ['💄 BEST-SELLERS',selectedMember.bestSellersList,'name','qty'],
              ['👥 FIDÉLITÉ CLIENTS',selectedMember.topClientsList,'name','details']
            ].map(([title,list,k1,k2]) => list?.length > 0 && (
              <div key={title} style={{ marginTop:'15px' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#8C6D4F', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>{title}</span>
                {list.map((it, i) => (
                  <div key={i} style={{ background:'#FDFBF7', border:'1px solid #F0EAE1', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontWeight:'500' }}>{it[k1]}</span>
                    <span style={{ color: title.includes('VENTES')?'#2d7a4a':'#8C6D4F', fontWeight:'700' }}>{it[k2]}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'20px' }}>
              <button onClick={() => { setTreeRootId(selectedMember.id); setSelectedMember(null); }} style={{ width:'100%', padding:'11px', background:'#D2B795', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600' }}>Zoomer sur son réseau</button>
              <button onClick={() => setSelectedMember(null)} style={{ width:'100%', padding:'11px', background:'#4A3E3D', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

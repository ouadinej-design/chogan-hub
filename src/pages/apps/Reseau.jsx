import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Base de données initiale et complète de la Limitless Team
  const defaultTree = {
    nodes: [
      { 
        id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12 500 €", caNum: 12500, objNum: 15000, objectif: "Atteindre 15 000 € de CA d'équipe", fidelity: "Platine (1500 pts)", mdp: "Limitless*2026A",
        topClientsList: [
          { name: "Sarah Benali", date: "24 Mai 2026", details: "+450 pts" },
          { name: "Amel K.", date: "18 Mai 2026", details: "+300 pts" }
        ],
        eventsList: [{ name: "Séminaire Annuel Limitless", date: "15 Juin 2026", loc: "Paris" }],
        bestSellersList: [{ name: "Parfum Prestige Luxury", date: "25 Mai 2026", qty: "18 un." }],
        meilleuresVentesList: [{ name: "Pack Élite & Soins Éclat", date: "24 Mai 2026", total: "2 450 €" }]
      },
      { 
        id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8 400 €", caNum: 8400, objNum: 10000, objectif: "Atteindre 10 000 € de CA perso", fidelity: "Or (900 pts)", mdp: "Limitless*2026B",
        topClientsList: [{ name: "Amine Mansouri", date: "25 Mai 2026", details: "+250 pts" }],
        eventsList: [{ name: "Masterclass Or & Excellence", date: "18 Juin 2026", loc: "Marseille" }],
        bestSellersList: [{ name: "Sérum Anti-Âge Ultime", date: "23 Mai 2026", qty: "15 un." }],
        meilleuresVentesList: [{ name: "Gamme Corps & Fragrances", date: "22 Mai 2026", total: "1 650 €" }]
      },
      { 
        id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 100 €", caNum: 2100, objNum: 3000, objectif: "Atteindre 3 000 € de CA", fidelity: "Argent (320 pts)", mdp: "Soumia#Lmtl",
        topClientsList: [{ name: "Léa Roussel", date: "26 Mai 2026", details: "+95 pts" }],
        eventsList: [{ name: "Atelier Initial & Catalogue", date: "12 Juin 2026", loc: "En ligne" }],
        bestSellersList: [{ name: "Huile Sèche Scintillante", date: "24 Mai 2026", qty: "9 un." }],
        meilleuresVentesList: [{ name: "Duos Maquillage Été", date: "24 Mai 2026", total: "450 €" }]
      }
    ]
  };

  // Persistance locale
  const [tree, setTree] = useState(() => {
    try {
      const localData = localStorage.getItem('limitless_team_tree_v5');
      if (localData) return JSON.parse(localData);
    } catch (e) {}
    return defaultTree;
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree_v5', JSON.stringify(tree));
  }, [tree]);

  // État initial complet du formulaire d'inscription
  const [newMember, setNewMember] = useState({ 
    name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', 
    topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', 
    caNum: '0', objNum: '1000' 
  });

  // Calculs globaux du tableau de bord
  const totalCA = tree.nodes.reduce((sum, node) => sum + (parseFloat(node.caNum) || 0), 0);
  const totalObjectifs = tree.nodes.reduce((sum, node) => sum + (parseFloat(node.objNum) || 0), 0);
  const globalPerformance = totalObjectifs > 0 ? Math.min(100, Math.round((totalCA / totalObjectifs) * 100)) : 0;

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

  const saveRowEdits = () => {
    const updatedNodes = tree.nodes.map(node => {
      if (node.id === editingId) {
        const cNum = parseFloat(editForm.caNum) || 0;
        return { ...editForm, caNum: cNum, ca: `${cNum.toLocaleString()} €` };
      }
      return node;
    });
    setTree({ nodes: updatedNodes });
    setEditingId(null);
  };

  const handleDeleteMember = (id, name) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'équipe ?`);
    if (confirmDelete) {
      const memberToDelete = tree.nodes.find(n => n.id === id);
      const parentIdOfDeleted = memberToDelete ? memberToDelete.parentId : null;

      const updatedNodes = tree.nodes
        .filter(node => node.id !== id)
        .map(node => {
          if (node.parentId === id) {
            return { ...node, parentId: parentIdOfDeleted };
          }
          return node;
        });

      setTree({ nodes: updatedNodes });
      
      if (treeRootId === id) setTreeRootId(null);
      if (selectedMember && selectedMember.id === id) setSelectedMember(null);
    }
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const cNum = parseFloat(newMember.caNum) || 0;
    const oNum = parseFloat(newMember.objNum) || 1000;

    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null,
      ca: `${cNum.toLocaleString()} €`, 
      caNum: cNum,
      objNum: oNum,
      objectif: newMember.objectif.trim() || "Fixer un objectif",
      fidelity: "Initial (0 pts)",
      mdp: newMember.mdp.trim() || "Limitless#123",
      topClientsList: [{ name: newMember.topClient.trim() || "Aucun", date: "26 Mai 2026", details: "Direct" }],
      eventsList: [{ name: "Intégration digitale", date: "06 Juin 2026", loc: "En ligne" }],
      bestSellersList: [{ name: newMember.bestSeller.trim() || "Non défini", date: "26 Mai 2026", qty: "1 un." }],
      meilleuresVentesList: [{ name: newMember.meilleuresVentes.trim() || "Non défini", date: "26 Mai 2026", total: `${cNum} €` }]
    };

    setTree({ nodes: [...tree.nodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000' });
  };

  // 🌳 FONCTION DE RENDU DE L'ARBRE (AVEC LIGNES DE CONNEXION INTÉGRÉES)
  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = tree.nodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        
        {/* Boîte du Membre */}
        <div 
          onClick={() => setSelectedMember(node)}
          style={{
            background: 'white', border: '1px solid #D2B795', borderRadius: '12px',
            padding: '12px', minWidth: '140px', textAlign: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(210,183,149,0.15)', margin: '5px',
            position: 'relative', zIndex: 2
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', color: node.genre === 'homme' ? '#3d6b9e' : '#8C6D4F', textTransform: 'uppercase' }}>
            {displayRole(node.role, node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#4A3E3D', fontSize: '14px', margin: '4px 0' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#2d7a4a' }}>🟢 Actif</div>
        </div>

        {/* Ligne verticale descendante sous le parent */}
        {enfants.length > 0 && (
          <div style={{ width: '2px', height: '20px', backgroundColor: '#D2B795', zIndex: 1 }}></div>
        )}

        {/* Conteneur des enfants avec gestion des branches de liaison */}
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
            {enfants.map((enfant, index) => (
              <div 
                key={enfant.id} 
                style={{ 
                  position: 'relative', 
                  paddingTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Ligne horizontale pour relier les frères/sœurs */}
                {enfants.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: index === 0 ? '50%' : 0,
                    right: index === enfants.length - 1 ? '50%' : 0,
                    borderTop: '2px solid #D2B795',
                    zIndex: 1
                  }} />
                )}
                
                {/* Ligne verticale montante rejoignant la branche supérieure */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '25px',
                  backgroundColor: '#D2B795',
                  zIndex: 1
                }} />

                {renderTreeNodes(enfant)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const visibleRoots = treeRootId ? tree.nodes.filter(n => n.id === treeRootId) : tree.nodes.filter(n => !n.parentId);
  const currentFocusedNode = treeRootId ? tree.nodes.find(n => n.id === treeRootId) : null;
  const parentNodeOfFocused = currentFocusedNode ? tree.nodes.find(n => n.id === currentFocusedNode.parentId) : null;
  const pctProgress = selectedMember ? Math.min(100, Math.round((selectedMember.caNum / (selectedMember.objNum || 1)) * 100)) : 0;

  return (
    <div style={{ padding: '15px', minHeight: '100vh', background: '#FAF7F2', fontFamily: 'sans-serif', color: '#4A3E3D' }}>
      
      {/* 👑 EN-TÊTE ÉLÉGANT SANS RECTANGLE BLEU */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '18px', maxWidth: '1000px',
        margin: '10px auto 25px auto', padding: '0 5px'
      }}>
        <button style={{
          width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ffffff',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,0.06)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>👥</span>
          <h1 style={{
            fontSize: '20px', fontWeight: '400', textTransform: 'uppercase',
            letterSpacing: '3px', color: '#4A3E3D', margin: 0, fontFamily: 'serif'
          }}>
            Réseau
          </h1>
        </div>
      </div>

      {/* DASHBOARD GLOBAL */}
      <div style={{ 
        maxWidth: '1000px', margin: '0 auto 20px auto', background: 'white', 
        border: '1px solid #D2B795', borderRadius: '14px', padding: '15px 25px', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        boxShadow: '0 4px 15px rgba(210,183,149,0.1)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>📈 Chiffre d'Affaires Global</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d7a4a', marginTop: '4px' }}>{totalCA.toLocaleString()} €</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>🎯 Performance Équipe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4A3E3D' }}>{globalPerformance}%</div>
            <div style={{ width: '120px', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${globalPerformance}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('gestion')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'gestion' ? '#D2B795' : 'white', color: activeTab === 'gestion' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>⚙️ Gestion</button>
      </div>

      {/* VUE ARBRE */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {treeRootId && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5px' }}>
              <button onClick={() => setTreeRootId(null)} style={{ background: '#4A3E3D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}>🏠 Racine</button>
              <button onClick={() => setTreeRootId(currentFocusedNode.parentId)} style={{ background: 'white', border: '1px solid #8C6D4F', color: '#8C6D4F', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}>⬅️ Remonter ({parentNodeOfFocused ? parentNodeOfFocused.name : "Racine"})</button>
            </div>
          )}
          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
              {visibleRoots.map(root => renderTreeNodes(root))}
            </div>
          </div>
        </div>
      )}

      {/* VUE GESTION & INSCRIPTION INITIALE RESTAURÉE */}
      {activeTab === 'gestion' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Formulaire complet d'inscription */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '14px', border: '1px solid #D2B795', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '20px', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>✨ FORMULAIRE D'INSCRIPTION COMPLET</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Nom & Prénom *</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Jean Dupont" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Rôle</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', background: 'white' }} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                  <option value="Consultante">Consultante / Consultant</option>
                  <option value="Marraine">Marraine / Parrain</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Genre</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', background: 'white' }} value={newMember.genre} onChange={e => setNewMember({...newMember, genre: e.target.value})}>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Rattaché à (Marraine/Supérieur)</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
                  <option value="">Aucun (Racine)</option>
                  {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>🔑 Mot de passe</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Limitless#2026" value={newMember.mdp} onChange={e => setNewMember({...newMember, mdp: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Chiffre d'Affaires Initial (€)</label>
                <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} value={newMember.caNum} onChange={e => setNewMember({...newMember, caNum: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Objectif de CA (€)</label>
                <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} value={newMember.objNum} onChange={e => setNewMember({...newMember, objNum: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Phrase d'Objectif</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Atteindre 3000€" value={newMember.objectif} onChange={e => setNewMember({...newMember, objectif: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>👥 Premier Client Top</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Alice Durand" value={newMember.topClient} onChange={e => setNewMember({...newMember, topClient: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>💄 Premier Produit Best-Seller</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Parfum Luxury" value={newMember.bestSeller} onChange={e => setNewMember({...newMember, bestSeller: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>🛍️ Description Meilleure Vente initiale</label>
                <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Pack Crèmes & Fragrances d'été" value={newMember.meilleuresVentes} onChange={e => setNewMember({...newMember, meilleuresVentes: e.target.value})} />
              </div>
            </div>
            <button onClick={handleAddMember} style={{ width: '100%', background: '#2d7a4a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '20px', letterSpacing: '1px' }}>AJOUTER AU RÉSEAU LIMITLESS</button>
          </div>

          {/* Tableau de gestion */}
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '850px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Conseiller(e)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Rôle</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>🔑 Mot de passe</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Chiffre d'Affaires</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map(n => {
                  const isEditing = editingId === n.id;
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{isEditing ? <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : n.name}</td>
                      <td style={{ padding: '12px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#B39266' }}>{isEditing ? <input value={editForm.mdp} onChange={e => setEditForm({...editForm, mdp: e.target.value})} /> : n.mdp}</td>
                      <td style={{ padding: '12px', color: '#2d7a4a', fontWeight: '600' }}>{isEditing ? <input type="number" value={editForm.caNum} onChange={e => setEditForm({...editForm, caNum: e.target.value})} /> : n.ca}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button onClick={saveRowEdits} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>💾</button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button onClick={() => startEditing(n)} style={{ background: 'white', border: '1px solid #D2B795', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#4A3E3D' }}>✏️ Modifier</button>
                            <button onClick={() => handleDeleteMember(n.id, n.name)} style={{ background: '#FFF0F0', border: '1px solid #FFA3A3', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#D32F2F' }}>🗑️ Supprimer</button>
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
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '10px' }}>
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '440px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#4A3E3D' }}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#4A3E3D', fontFamily: 'serif', letterSpacing: '1px' }}>{selectedMember.name}</h2>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {displayRole(selectedMember.role, selectedMember.genre)}
              </span>
            </div>

            <div style={{ background: '#FAF5EE', padding: '12px 15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid rgba(210,183,149,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4A3E3D', display: 'flex', justifyContent: 'space-between' }}>
                <span>🎯 Objectif : {selectedMember.objectif}</span>
                <span style={{ color: '#8C6D4F' }}>{pctProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E6DCD0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pctProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                <span style={{ color: '#8C6D4F' }}>💰 Chiffre d'Affaires :</span><strong style={{ color: '#2d7a4a' }}>{selectedMember.ca}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                <span style={{ color: '#8C6D4F' }}>💎 Statut Fidélité :</span><strong>{selectedMember.fidelity || "Initial"}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                <span style={{ color: '#8C6D4F' }}>🔑 Mot de passe :</span><span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedMember.mdp}</span>
              </div>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>🛍️ TOP VENTES & COMMANDES</span>
              {selectedMember.meilleuresVentesList && selectedMember.meilleuresVentesList.length > 0 ? (
                selectedMember.meilleuresVentesList.map((mv, idx) => (
                  <div key={idx} style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>{mv.name}</span>
                    <span style={{ color: '#2d7a4a', fontWeight: '700' }}>{mv.total}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#999' }}>Aucune vente enregistrée</div>
              )}
            </div>

            <div style={{ marginTop: '15px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>💄 PRODUITS PHARES (BEST-SELLERS)</span>
              {selectedMember.bestSellersList && selectedMember.bestSellersList.length > 0 ? (
                selectedMember.bestSellersList.map((bs, idx) => (
                  <div key={idx} style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{bs.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#8C6D4F' }}>{bs.qty || "1 un."}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#999' }}>Non défini</div>
              )}
            </div>

            <div style={{ marginTop: '15px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>👥 FIDÉLITÉ CLIENTS & POINTS</span>
              {selectedMember.topClientsList && selectedMember.topClientsList.length > 0 ? (
                selectedMember.topClientsList.map((c, idx) => (
                  <div key={idx} style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500' }}>{c.name}</span>
                    <span style={{ color: '#8C6D4F', fontWeight: 'bold' }}>{c.details}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#999' }}>Aucun client favori configuré</div>
              )}
            </div>

            <div style={{ marginTop: '15px', textAlign: 'left', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>📅 FORMATIONS & SÉMINAIRES</span>
              {selectedMember.eventsList && selectedMember.eventsList.length > 0 ? (
                selectedMember.eventsList.map((ev, idx) => (
                  <div key={idx} style={{ background: '#FAF8F5', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', borderLeft: '3px solid #D2B795', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600' }}>{ev.name}</div>
                    <div style={{ color: '#777', fontSize: '11px', marginTop: '2px' }}>{ev.date} — {ev.loc}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#999' }}>Aucun événement au programme</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setTreeRootId(selectedMember.id); setSelectedMember(null); }} style={{ width: '100%', padding: '11px', background: '#D2B795', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', letterSpacing: '0.5px' }}>Zoomer sur son réseau</button>
              <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '11px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Base de données par défaut de la Limitless Team
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

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000' });

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

  // 🔥 NOUVELLE FONCTION : SUPPRIMER UN MEMBRE DE L'ÉQUIPE SÉCURISÉ
  const handleDeleteMember = (id, name) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'équipe ?`);
    if (confirmDelete) {
      // Trouver le parent du membre qu'on supprime pour y rattacher ses enfants
      const memberToDelete = tree.nodes.find(n => n.id === id);
      const parentIdOfDeleted = memberToDelete ? memberToDelete.parentId : null;

      const updatedNodes = tree.nodes
        .filter(node => node.id !== id) // On enlève le membre
        .map(node => {
          // Si le membre supprimé était son parent, on le rattache au parent du dessus
          if (node.parentId === id) {
            return { ...node, parentId: parentIdOfDeleted };
          }
          return node;
        });

      setTree({ nodes: updatedNodes });
      
      // Si le membre supprimé était sélectionné dans la vue zoomée ou le modal, on nettoie
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
      eventsList: [{ name: "Intégration digitale", date: "05 Juin 2026", loc: "En ligne" }],
      bestSellersList: [{ name: newMember.bestSeller.trim() || "Non défini", date: "25 Mai 2026", qty: "0 un." }],
      meilleuresVentesList: [{ name: newMember.meilleuresVentes.trim() || "Non défini", date: "24 Mai 2026", total: "0 €" }]
    };
    setTree({ nodes: [...tree.nodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000' });
  };

  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = tree.nodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          onClick={() => setSelectedMember(node)}
          style={{
            background: 'white', border: '1px solid #D2B795', borderRadius: '12px',
            padding: '12px', minWidth: '140px', textAlign: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(210,183,149,0.15)', margin: '5px'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', color: node.genre === 'homme' ? '#3d6b9e' : '#8C6D4F', textTransform: 'uppercase' }}>
            {displayRole(node.role, node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#4A3E3D', fontSize: '14px', margin: '4px 0' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#2d7a4a' }}>🟢 Actif</div>
        </div>
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
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
      
      {/* 👑 EN-TÊTE SANS POPUP NI ENCADRÉ BLEU */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        maxWidth: '1000px',
        margin: '10px auto 25px auto',
        padding: '0 5px'
      }}>
        <button
          onClick={() => { /* Optionnel : redirection ou état parent */ }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
            padding: 0,
            webkitTapHighlightColor: 'transparent'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>👥</span>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '400',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: '#4A3E3D',
            margin: 0,
            fontFamily: 'serif'
          }}>
            Réseau
          </h1>
        </div>
      </div>

      {/* DASHBOARD */}
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

      {/* CONTENU ARBRE */}
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

      {/* GESTION TABLEAU (MIS À JOUR AVEC SUPPRESSION) */}
      {activeTab === 'gestion' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', textAlign: 'center', fontSize: '15px' }}>✨ Inscrire un nouveau conseiller</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Nom & Prénom" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              <button onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Ajouter à l'organisation</button>
            </div>
          </div>

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

      {/* DETAILS DU MEMBRE MODAL */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '10px' }}>
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '12px', right: '15px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <h3>{selectedMember.name}</h3>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '3px 10px', borderRadius: '10px', fontSize: '11px' }}>{displayRole(selectedMember.role, selectedMember.genre)}</span>
            </div>
            <div style={{ background: '#FAF5EE', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>🎯 Objectif : {pctProgress}% Réalisé</div>
              <div style={{ width: '100%', height: '6px', background: '#E6DCD0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${pctProgress}%`, height: '100%', background: '#8C6D4F' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>💰 Chiffre d'Affaires:</span><strong>{selectedMember.ca}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>💄 Best-Seller:</span><strong>{selectedMember.bestSellersList?.[0]?.name || "Aucun"}</strong>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setTreeRootId(selectedMember.id); setSelectedMember(null); }} style={{ width: '100%', padding: '10px', background: '#D2B795', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Zoomer sur son réseau</button>
              <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

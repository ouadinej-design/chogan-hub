import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 🏢 Structure complète de la Limitless Team
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira B", role: "Manager", genre: "femme", parentId: null },
      { id: "marie", name: "Marie", role: "Marraine", genre: "femme", parentId: "kheira_b" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine" }
    ]
  };

  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      return savedData ? JSON.parse(savedData) : defaultTree;
    } catch (error) {
      console.error("Erreur de lecture du localStorage", error);
      return defaultTree;
    }
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];
  const currentNodes = tree && tree.nodes ? tree.nodes : [];

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  const handleAddMember = (e) => {
    if (e) e.preventDefault();
    if (!newMember.name || !newMember.name.trim()) {
      alert("Veuillez saisir un nom ou un prénom.");
      return;
    }
    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null
    };
    setTree({ nodes: [...currentNodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  const startEdit = (n) => {
    setEditId(n.id);
    setEditForm({ name: n.name, role: n.role || 'Consultante', genre: n.genre || 'femme', parentId: n.parentId || '' });
  };

  const handleSaveRow = () => {
    if (!editForm.name.trim()) return;
    setTree({
      nodes: currentNodes.map(n => n.id === editId ? {
        ...n,
        name: editForm.name.trim(),
        role: editForm.role,
        genre: editForm.genre,
        parentId: editForm.parentId || null
      } : n)
    });
    setEditId(null);
  };

  const handleDeleteRow = (id) => {
    if (!window.confirm('Supprimer définitivement ce membre ?')) return;
    setTree({
      nodes: currentNodes
        .filter(n => n.id !== id)
        .map(n => n.parentId === id ? { ...n, parentId: null } : n)
    });
  };

  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      const matchesRole = filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // 🌳 RENDU DE L'ARBRE EN MODE VERTICAL
  const renderTreeNodesVertical = (node) => {
    if (!node) return null;
    const enfants = currentNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        {/* Badge de la personne */}
        <div style={{
          background: 'white',
          border: '1px solid #D2B795',
          borderRadius: '12px',
          padding: '12px 18px',
          minWidth: '170px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          textAlign: 'center',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '5px', color: node.genre === 'homme' ? '#2b5c8f' : '#7c5a34', textTransform: 'uppercase' }}>
            {node.genre === 'homme' ? '👨' : '👩'} {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          <div style={{ fontWeight: '700', color: '#2C2520', fontSize: '14px', marginBottom: '4px' }}>
            {node.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#2d7a4a' }}>
            🟢 Actif
          </div>
        </div>

        {/* Ligne verticale de connexion s'il y a des enfants */}
        {enfants.length > 0 && (
          <div style={{ width: '2px', height: '25px', background: '#D2B795' }}></div>
        )}

        {/* Conteneur des enfants disposés VERTICALEMENT (ou côte à côte s'ils sont peu nombreux) */}
        {enfants.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: enfants.length > 2 ? 'column' : 'row', // S'il y a beaucoup de monde (comme chez Marie), on empile verticalement pour que ce soit lisible
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            width: '100%',
            alignItems: 'center',
            padding: '5px 15px'
          }}>
            {enfants.map(enfant => renderTreeNodesVertical(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#FAF6F0', minHeight: '100vh' }}>
      
      {/* 👑 ONGLETS CONTROLE */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('arbre')}
          style={{
            padding: '12px 24px', borderRadius: '25px', border: '1px solid #D2B795',
            background: activeTab === 'arbre' ? '#D2B795' : 'white',
            color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        >
          🌳 Arbre Visuel (Vertical)
        </button>
        <button 
          onClick={() => setActiveTab('tableau')}
          style={{
            padding: '12px 24px', borderRadius: '25px', border: '1px solid #D2B795',
            background: activeTab === 'tableau' ? '#D2B795' : 'white',
            color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        >
          📊 Vue Tableau (Admin)
        </button>
      </div>

      {/* 🌳 CONTENU DE L'ARBRE (Structure verticale sécurisée) */}
      {activeTab === 'arbre' && (
        <div style={{ 
          width: '100%', 
          overflowX: 'hidden', // Plus besoin de défilement horizontal infini
          padding: '10px 20px', 
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            maxWidth: '800px', // On centre le flux verticalement à une taille humaine
            margin: '0 auto',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '25px'
          }}>
            {rootNodes.length > 0 ? (
              rootNodes.map(root => renderTreeNodesVertical(root))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun membre détecté.</p>
            )}
          </div>
        </div>
      )}

      {/* 📊 ONGLET TABLEAU RESTAURÉ ET SÉCURISÉ */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* FORMULAIRE */}
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '15px', fontSize: '16px' }}>✨ Ajouter un membre</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 180px' }}>
                <input 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="Nom / Prénom"
                  value={newMember.name}
                  onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div style={{ flex: '1 1 90px' }}>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.genre} onChange={e => setNewMember(p => ({ ...p, genre: e.target.value }))}>
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">— Aucun (Racine) —</option>
                  {currentNodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button type="button" onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                ➕ Ajouter
              </button>
            </div>
          </div>

          {/* RECHERCHE */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input 
              style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #D2B795', background: 'white' }}
              placeholder="🔍 Rechercher dans le tableau..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            <select
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D2B795', background: 'white' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="tous">👑 Tous les rôles</option>
              <option value="Consultante">Consultantes / Consultants</option>
              <option value="Marraine">Marraines / Parrains</option>
              <option value="Manager">Managers</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* TABLEAU */}
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px 10px' }}>Membre</th>
                  <th style={{ padding: '12px 10px' }}>Genre</th>
                  <th style={{ padding: '12px 10px' }}>Rôle</th>
                  <th style={{ padding: '12px 10px' }}>Parrain</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map(n => {
                  const isEditing = editId === n.id;
                  const currentParent = currentNodes.find(p => p.id === n.parentId);
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.2)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '600' }}>{isEditing ? <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /> : n.name}</td>
                      <td style={{ padding: '12px 10px' }}>{n.genre === 'homme' ? '👨 Homme' : '👩 Femme'}</td>
                      <td style={{ padding: '12px 10px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px 10px' }}>{currentParent ? currentParent.name : 'Aucun'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={handleSaveRow}>💾</button>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => startEdit(n)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                            <button onClick={() => handleDeleteRow(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
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

    </div>
  );
}

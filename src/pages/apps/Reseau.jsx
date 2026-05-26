import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 📁 Chargement initial sécurisé depuis le localStorage
  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error("Erreur de lecture du localStorage", error);
      return null;
    }
  });

  // 🏢 Structure par défaut de la Limitless Team
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

  const finalTree = tree && tree.nodes && tree.nodes.length > 0 ? tree : defaultTree;
  const currentNodes = finalTree.nodes;

  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(finalTree));
  }, [finalTree]);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];

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
    if (editId === id) setEditId(null);
  };

  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      const matchesRole = filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = currentNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          background: 'white',
          border: '1px solid #D2B795',
          borderRadius: '12px',
          padding: '12px 18px',
          minWidth: '140px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
          textAlign: 'center',
          display: 'inline-block'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '6px', color: node.genre === 'homme' ? '#3d6b9e' : '#4A3E3D' }}>
            {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '6px', whiteSpace: 'normal' }}>
            {node.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#2d7a4a' }}>
            🟢 Actif
          </div>
        </div>

        {enfants.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', position: 'relative', flexDirection: 'row', alignItems: 'flex-start' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 👑 ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('arbre')}
          style={{
            padding: '10px 15px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'arbre' ? '#D2B795' : 'white',
            color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}
        >
          🌳 Arbre Visuel
        </button>
        <button 
          onClick={() => setActiveTab('tableau')}
          style={{
            padding: '10px 15px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'tableau' ? '#D2B795' : 'white',
            color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}
        >
          📊 Vue Tableau (Admin)
        </button>
      </div>

      {/* 🌳 ZONE ARBRE (Défilement fluide) */}
      {activeTab === 'arbre' && (
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch', 
          padding: '20px 10px', 
          display: 'block'
        }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '30px' }}>
            {rootNodes.length > 0 ? (
              rootNodes.map(root => renderTreeNodes(root))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun membre détecté.</p>
            )}
          </div>
        </div>
      )}

      {/* 📊 ZONE TABLEAU */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Formulaire d'ajout */}
          <div style={{ background: '#FDFBF7', border: '1px solid #D2B795', borderRadius: '14px', padding: '15px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '12px', fontSize: '15px' }}>✨ Ajouter à la Limitless Team</h3>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <input 
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                placeholder="Nom / Prénom"
                value={newMember.name}
                onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.genre} onChange={e => setNewMember(p => ({ ...p, genre: e.target.value }))}>
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember(p => ({ ...p, parentId: e.target.value }))}>
                <option value="">— Aucun (Membre Racine) —</option>
                {currentNodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                ➕ Ajouter le membre
              </button>
            </div>
          </div>

          {/* Tableau responsif */}
          <div style={{ 
            overflowX: 'auto', 
            WebkitOverflowScrolling: 'touch', 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #D2B795' 
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '600px' }}>
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
                      <td style={{ padding: '12px 10px', fontWeight: '600' }}>
                        {isEditing ? <input style={{ padding: '6px', width: '90px' }} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /> : n.name}
                      </td>
                      <td style={{ padding: '12px 10px' }}>{n.genre === 'homme' ? '👨 H' : '👩 F'}</td>
                      <td style={{ padding: '12px 10px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px 10px' }}>{currentParent ? currentParent.name : 'Aucun'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={handleSaveRow}>💾</button>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => startEdit(n)} style={{ background: 'none', border: 'none' }}>✏️</button>
                            <button onClick={() => handleDeleteRow(n.id)} style={{ background: 'none', border: 'none' }}>🗑️</button>
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

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
    setEditForm({
      name: n.name,
      role: n.role || 'Consultante',
      genre: n.genre || 'femme',
      parentId: n.parentId || ''
    });
  };

  const handleSaveRow = () => {
    if (!editForm.name.trim()) return;
    if (editForm.parentId === editId) {
      alert("Un membre ne peut pas être son propre parrain/marraine !");
      return;
    }
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
    if (!window.confirm('Supprimer définitivement ce membre ? Ses filleuls seront rattachés à la racine.')) return;
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

  // 🌳 RENDU DE L'ARBRE VERTICAL FILAIRE
  const renderTreeNodes = (node, level = 0) => {
    if (!node) return null;
    const enfants = currentNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: `${level * 25}px`,
          marginBottom: '8px',
          position: 'relative',
          width: 'calc(100% - ' + (level * 25) + 'px)',
          maxWidth: '400px',
        }}>
          {level > 0 && (
            <div style={{ position: 'absolute', left: '-14px', top: '24px', width: '10px', height: '2px', background: '#D2B795' }} />
          )}

          <div style={{
            background: 'white',
            border: '1px solid #D2B795',
            borderRadius: '12px',
            padding: '12px 18px',
            width: '100%',
            boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>{node.name}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: node.genre === 'homme' ? '#3d6b9e' : '#4A3E3D', marginTop: '3px' }}>
                {displayRole(node.role || 'Consultante', node.genre)}
              </div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#2d7a4a' }}>🟢 Actif</div>
          </div>
        </div>

        {enfants.length > 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', left: `${(level * 25) + 8}px`, top: '0', bottom: '14px', width: '2px', background: '#EAE1D4' }} />
            {enfants.map(enfant => renderTreeNodes(enfant, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', background: '#FAF8F5', minHeight: '100vh' }}>
      
      {/* 👑 ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('arbre')}
          style={{
            padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'arbre' ? '#D2B795' : 'white',
            color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600'
          }}
        >
          🌳 Arbre Visuel
        </button>
        <button 
          onClick={() => setActiveTab('tableau')}
          style={{
            padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'tableau' ? '#D2B795' : 'white',
            color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600'
          }}
        >
          📊 Vue Tableau (Admin)
        </button>
      </div>

      {/* 🌳 CONTENU : ARBRE */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', padding: '10px 5px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {rootNodes.length > 0 ? (
              rootNodes.map(root => renderTreeNodes(root, 0))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>Aucun membre détecté.</p>
            )}
          </div>
        </div>
      )}

      {/* 📊 CONTENU : TABLEAU */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* FORMULAIRE */}
          <div style={{ background: '#FDFBF7', border: '1px solid #D2B795', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '15px' }}>✨ Ajouter un nouveau membre à la Limitless Team</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Nom / Prénom</label>
                <input 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  placeholder="Ex: KHEIRA A..."
                  value={newMember.name}
                  onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div style={{ flex: 1, minWidth: '110px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Genre</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                  value={newMember.genre}
                  onChange={e => setNewMember(p => ({ ...p, genre: e.target.value }))}
                >
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Statut</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                  value={newMember.role}
                  onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}
                >
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ flex: 1.5, minWidth: '160px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Rattacher à (Parrain)</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                  value={newMember.parentId}
                  onChange={e => setNewMember(p => ({ ...p, parentId: e.target.value }))}
                >
                  <option value="">— Aucun (Membre Racine) —</option>
                  {currentNodes.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                ➕ Ajouter
              </button>
            </div>
          </div>

          {/* FILTRES DE RECHERCHE DANS LE TABLEAU */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input 
              style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              placeholder="🔍 Rechercher un membre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="tous">👑 Tous les rôles</option>
              {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
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
                  <th style={{ padding: '12px 10px' }}>Parrain / Marraine</th>
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
                        {isEditing ? (
                          <input style={{ padding: '6px' }} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                        ) : n.name}
                      </td>
                      <td style={{ padding: '12px 10px' }}>{n.genre === 'homme' ? '👨 Homme' : '👩 Femme'}</td>
                      <td style={{ padding: '12px 10px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px 10px' }}>{currentParent ? currentParent.name : 'Aucun'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={handleSaveRow} style={{ padding: '4px 8px', cursor: 'pointer' }}>💾 Enregistrer</button>
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

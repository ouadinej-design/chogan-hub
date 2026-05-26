import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 📁 Chargement initial des données depuis le localStorage (ou tableau vide si premier démarrage)
  const [tree, setTree] = useState(() => {
    const savedData = localStorage.getItem('limitless_team_tree');
    return savedData ? JSON.parse(savedData) : { nodes: [] };
  });

  // 💾 Sauvegarde automatique dans le localStorage à chaque fois que la liste des membres change
  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  // États locaux pour les filtres et l'édition
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  // État pour le formulaire d'un NOUVEAU membre
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];
  const currentNodes = tree && tree.nodes ? tree.nodes : [];

  // Fonction pour adapter le rôle selon le genre
  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // ➕ FONCTION D'AJOUT
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

    setTree({
      nodes: [...currentNodes, newNode]
    });

    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  // ✏️ ÉDITION EN LIGNE
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

  // 🗑️ SUPPRESSION
  const handleDeleteRow = (id) => {
    if (!window.confirm('Supprimer définitivement ce membre ? Ses filleuls seront rattachés à la racine.')) return;
    setTree({
      nodes: currentNodes
        .filter(n => n.id !== id)
        .map(n => n.parentId === id ? { ...n, parentId: null } : n)
    });
    if (editId === id) setEditId(null);
  };

  // Filtrage et recherche pour le tableau
  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      const matchesRole = filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // 🌳 RENDU DE L'ARBRE VISUEL
  const renderTreeNodes = (node) => {
    if (!node) return null;

    const enfants = currentNodes.filter(n => n.parentId === node.id);
    const isMarieOuadi = node.name.trim().toLowerCase() === "marie ouadi";

    const childrenContainerStyle = {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '20px',
      position: 'relative',
      flexDirection: isMarieMarieOuadi ? 'column' : 'row',
      alignItems: isMarieOuadi ? 'center' : 'flex-start'
    };

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          background: 'white',
          border: '1px solid #D2B795',
          borderRadius: '12px',
          padding: '12px 18px',
          minWidth: '160px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '6px', color: node.genre === 'homme' ? '#3d6b9e' : '#4A3E3D' }}>
            {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '6px' }}>
            {n => n.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#D6AF37' }}>
            Actif
          </div>
        </div>

        {enfants.length > 0 && (
          <div style={childrenContainerStyle}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNode = currentNodes.find(n => !n.parentId);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
      
      {/* BOUTONS DES SOUS-ONGLETS */}
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

      {/* CONTENU : ONGLET ARBRE */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
          {rootNode ? renderTreeNodes(rootNode) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Aucun membre détecté. Allez dans l'onglet "Vue Tableau (Admin)" pour ajouter le premier membre racine.
            </p>
          )}
        </div>
      )}

      {/* CONTENU : ONGLET TABLEAU (ADMIN) */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* FORMULAIRE D'AJOUT DE MEMBRE */}
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
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r === 'Consultante' ? 'Consultante / Consultant' : r === 'Marraine' ? 'Marraine / Parrain' : r}</option>)}
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

          {/* BARRE DE FILTRES */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input 
              style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #D2B795' }}
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
                  <th style={{ padding: '12px 10px' }}>Parrain / Marraine</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Aucun membre enregistré pour le moment.</td>
                  </tr>
                ) : (
                  filteredNodes.map(n => {
                    const isEditing = editId === n.id;
                    const currentParent = currentNodes.find(p => p.id === n.parentId);

                    return (
                      <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.2)', background: isEditing ? 'rgba(214,175,55,0.04)' : 'transparent' }}>
                        
                        <td style={{ padding: '12px 10px', fontWeight: '600' }}>
                          {isEditing ? (
                            <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D6AF37', width: '100%' }} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                          ) : n.name}
                        </td>

                        <td style={{ padding: '12px 10px' }}>
                          {isEditing ? (
                            <select style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D6AF37' }} value={editForm.genre} onChange={e => setEditForm(p => ({ ...p, genre: e.target.value }))}>
                              <option value="femme">👩 Femme</option>
                              <option value="homme">👨 Homme</option>
                            </select>
                          ) : (n.genre === 'homme' ? '👨 Homme' : '👩 Femme')}
                        </td>

                        <td style={{ padding: '12px 10px' }}>
                          {isEditing ? (
                            <select style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D6AF37' }} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                              {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : displayRole(n.role, n.genre)}
                        </td>

                        <td style={{ padding: '12px 10px', color: '#666' }}>
                          {isEditing ? (
                            <select style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D6AF37' }} value={editForm.parentId} onChange={e => setEditForm(p => ({ ...p, parentId: e.target.value }))}>
                              <option value="">— Aucun —</option>
                              {currentNodes.filter(cand => cand.id !== n.id).map(cand => <option key={cand.id} value={cand.id}>{cand.name}</option>)}
                            </select>
                          ) : (currentParent ? currentParent.name : 'Aucun')}
                        </td>

                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button onClick={handleSaveRow} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>💾</button>
                              <button onClick={() => setEditId(null)} style={{ background: '#ccc', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => startEdit(n)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                              <button onClick={() => handleDeleteRow(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}

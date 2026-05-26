import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 🏢 Structure complète de la Limitless Team
  const defaultTree = {
    nodes: [
      // Échelon 1 : La Racine
      { id: "kheira_b", name: "Kheira B", role: "Manager", genre: "femme", parentId: null },

      // Échelon 2 : Marie (rattachée à Kheira B)
      { id: "marie", name: "Marie", role: "Marraine", genre: "femme", parentId: "kheira_b" },

      // Échelon 3 : Les Consultantes rattachées directement à Marie
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

      // Échelon 3 : Les sous-marraines rattachées à Marie
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie" },

      // Échelon 4 : Filleuls de Nadia N
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n" },

      // Échelon 4 : Filleuls d'Isabelle
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle" },

      // Échelon 4 : Filleuls de Blandine
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine" }
    ]
  };

  // 📁 Chargement initial
  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      return savedData ? JSON.parse(savedData) : defaultTree;
    } catch (error) {
      console.error("Erreur de lecture du localStorage", error);
      return defaultTree;
    }
  });

  // 💾 Sauvegarde automatique dans le localStorage
  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  // États locaux
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

    setTree({ nodes: [...currentNodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  // ✏️ ÉDITION
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

  // 🗑️ SUPPRESSION
  const handleDeleteRow = (id) => {
    if (!window.confirm('Supprimer définitivement ce membre ?')) return;
    setTree({
      nodes: currentNodes
        .filter(n => n.id !== id)
        .map(n => n.parentId === id ? { ...n, parentId: null } : n)
    });
  };

  // Filtrage et recherche
  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      const matchesRole = filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // 🌳 RENDU DE L'ARBRE EN MODE VERTICAL PUR (Cascading List)
  const renderVerticalTree = (node, level = 0) => {
    if (!node) return null;

    const enfants = currentNodes.filter(n => n.parentId === node.id);

    // Définition de la couleur de bordure selon le rôle
    let badgeBorderColor = '#D2B795'; // Or clair par défaut
    if (node.role === 'Manager') badgeBorderColor = '#B89047'; // Or plus soutenu
    if (node.role === 'Marraine') badgeBorderColor = '#C5A880';

    return (
      <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        
        {/* Ligne / Badge individuel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: `${level * 28}px`, // Crée l'effet de cascade propre à chaque génération
          marginBottom: '10px',
          position: 'relative',
          width: 'calc(100% - ' + (level * 28) + 'px)',
          maxWidth: '400px'
        }}>
          {/* Petite branche visuelle indicatrice */}
          {level > 0 && (
            <div style={{
              position: 'absolute',
              left: '-16px',
              top: '50%',
              width: '12px',
              height: '2px',
              background: '#D2B795'
            }} />
          )}

          {/* Badge du membre */}
          <div style={{
            background: 'white',
            border: `1px solid ${badgeBorderColor}`,
            borderRadius: '10px',
            padding: '10px 14px',
            width: '100%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', color: '#333', fontSize: '14px' }}>
                {node.name}
              </div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: node.genre === 'homme' ? '#3d6b9e' : '#7c5a34', marginTop: '2px' }}>
                {node.genre === 'homme' ? '👨' : '👩'} {displayRole(node.role || 'Consultante', node.genre)}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#2d7a4a', fontWeight: '500' }}>
              🟢 Actif
            </div>
          </div>
        </div>

        {/* Rendu immédiat des enfants directement en dessous */}
        {enfants.length > 0 && (
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Ligne verticale de liaison pour la descendance */}
            <div style={{
              position: 'absolute',
              left: `${(level * 28) + 12}px`,
              top: '0',
              bottom: '20px',
              width: '2px',
              background: '#EAE1D4'
            }} />
            
            {enfants.map(enfant => renderVerticalTree(enfant, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#FAF8F5', minHeight: '100vh' }}>
      
      {/* 👑 INTERRUPTEURS D'ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('arbre')}
          style={{
            padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'arbre' ? '#D2B795' : 'white',
            color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}
        >
          🌳 Organigramme Vertical
        </button>
        <button 
          onClick={() => setActiveTab('tableau')}
          style={{
            padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'tableau' ? '#D2B795' : 'white',
            color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}
        >
          📊 Vue Tableau (Admin)
        </button>
      </div>

      {/* 🌳 CONTENU : MODE VERTICAL SÉCURISÉ POUR TOUS LES ÉCRANS */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', padding: '5px 10px', boxSizing: 'border-box' }}>
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            {rootNodes.length > 0 ? (
              rootNodes.map(root => renderVerticalTree(root, 0))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun membre enregistré.</p>
            )}
          </div>
        </div>
      )}

      {/* 📊 CONTENU : TABLEAU D'ADMINISTRATION COMPLET */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* FORMULAIRE DE CRÉATION */}
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '12px', fontSize: '15px' }}>✨ Ajouter un membre</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '2 1 160px' }}>
                <input 
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="Nom / Prénom"
                  value={newMember.name}
                  onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div style={{ flex: '1 1 90px' }}>
                <select style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.genre} onChange={e => setNewMember(p => ({ ...p, genre: e.target.value }))}>
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <select style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: '1.5 1 140px' }}>
                <select style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">— Aucun (Racine) —</option>
                  {currentNodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button type="button" onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                ➕ Ajouter
              </button>
            </div>
          </div>

          {/* CHERCHER / FILTRER */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              style={{ flex: 2, padding: '9px', borderRadius: '6px', border: '1px solid #D2B795' }}
              placeholder="🔍 Rechercher un nom..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            <select
              style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #D2B795', background: 'white' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="tous">👑 Rôles</option>
              <option value="Consultante">Consultants</option>
              <option value="Marraine">Marraines</option>
              <option value="Manager">Managers</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* STRUCTURE TABLEAU DES ACTIONS */}
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Membre</th>
                  <th style={{ padding: '10px' }}>Genre</th>
                  <th style={{ padding: '10px' }}>Rôle</th>
                  <th style={{ padding: '10px' }}>Supérieur</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map(n => {
                  const isEditing = editId === n.id;
                  const currentParent = currentNodes.find(p => p.id === n.parentId);
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>
                        {isEditing ? <input style={{ width: '90%', padding: '4px' }} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /> : n.name}
                      </td>
                      <td style={{ padding: '10px' }}>{n.genre === 'homme' ? '👨' : '👩'}</td>
                      <td style={{ padding: '10px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '10px', color: '#666' }}>{currentParent ? currentParent.name : 'Aucun'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={handleSaveRow} style={{ padding: '2px 6px', background: '#2d7a4a', color: 'white', border: 'none', borderRadius: '4px' }}>💾</button>
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

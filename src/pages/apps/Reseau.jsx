import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 🏢 Structure complète de la Limitless Team intégrée directement par défaut
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

  // 📁 Chargement initial sécurisé depuis le localStorage
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

  // États locaux pour les filtres, la recherche et l'édition
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

    const childrenContainerStyle = {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '20px',
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-start'
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
            {node.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#2d7a4a' }}>
            🟢 Actif
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

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* 👑 BOUTONS DES ONGLETS */}
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
          

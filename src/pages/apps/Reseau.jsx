import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMemberId, setSelectedMemberId] = useState(null); // Pour suivre la carte cliquée
  const [visiblePasswords, setVisiblePasswords] = useState({}); // Pour masquer/afficher les mots de passe

  // 🏢 Structure complète enrichie avec CA, Événements, Fidélité et Identifiants
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira B", role: "Manager", genre: "femme", parentId: null, ca: "15,400 €", events: "Réunion Régionale - 05/06", points: 450, email: "kheira.b@limitless.com", mdp: "KhLimit2026!" },
      { id: "marie", name: "Marie", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8,900 €", events: "Coaching d'Équipe - Chaque Lundi", points: 320, email: "marie.l@limitless.com", mdp: "MarieLimit94*" },
      
      // Filleuls directs de Marie
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,400 €", events: "Atelier Beauté - 30/05", points: 120, email: "soumia@limitless.com", mdp: "SoumTeam26" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,850 €", events: "Aucun événement", points: 90, email: "nawel@limitless.com", mdp: "NawelPass99" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", ca: "3,100 €", events: "Live Instagram - 02/06", points: 180, email: "selma@limitless.com", mdp: "SelmaSecur!" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", ca: "950 €", events: "Aucun événement", points: 45, email: "sophia@limitless.com", mdp: "SophLimit1" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,200 €", events: "Atelier Parfum - 04/06", points: 60, email: "baya@limitless.com", mdp: "BayaVip2026" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,150 €", events: "Aucun événement", points: 110, email: "milene@limitless.com", mdp: "MileneLimit!" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", ca: "4,200 €", events: "Masterclass Ventes - 12/06", points: 250, email: "sarah@limitless.com", mdp: "SarahBest💎" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,300 €", events: "Aucun événement", points: 70, email: "nadia.b@limitless.com", mdp: "NadiaB2026" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", ca: "800 €", events: "Aucun événement", points: 35, email: "shaima@limitless.com", mdp: "ShaimaPass" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,600 €", events: "Atelier Teint - 08/06", points: 80, email: "melissa@limitless.com", mdp: "MelLimit26" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,900 €", events: "Aucun événement", points: 140, email: "cassandra@limitless.com", mdp: "CassiePass!" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", ca: "3,400 €", events: "Lancement Gamme - 15/06", points: 195, email: "meryem@limitless.com", mdp: "MeryemLimit" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", ca: "2,700 €", events: "Aucun événement", points: 130, email: "karim@limitless.com", mdp: "KarimPass94" },

      // Sous-marraines rattachées à Marie
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", ca: "5,600 €", events: "Suivi Filleuls - Jeudi", points: 210, email: "nadia.n@limitless.com", mdp: "NadiaNLimit" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", ca: "6,200 €", events: "Atelier Recrutement - 10/06", points: 240, email: "isabelle@limitless.com", mdp: "IsaMarraine!" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", ca: "4,800 €", events: "Formation Réseau - 06/06", points: 190, email: "blandine@limitless.com", mdp: "Blandine26" },

      // Filleuls de Nadia N
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1,100 €", events: "Aucun événement", points: 50, email: "tracy@limitless.com", mdp: "TracyPass!" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1,450 €", events: "Atelier Soins - 03/06", points: 75, email: "yasmin@limitless.com", mdp: "Yasmin2026" },

      // Filleuls d'Isabelle
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "980 €", events: "Aucun événement", points: 40, email: "anita@limitless.com", mdp: "AnitaLimit" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "2,200 €", events: "Atelier Beauté - 11/06", points: 115, email: "khayra@limitless.com", mdp: "KhayraPass" },

      // Filleuls de Blandine
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", ca: "1,350 €", events: "Aucun événement", points: 65, email: "yasmina@limitless.com", mdp: "Yasmina26" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", ca: "1,900 €", events: "Présentation Homme - 09/06", points: 95, email: "adam@limitless.com", mdp: "AdamLimit!" }
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

  // États de filtrage, recherche et édition
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', ca: '', events: '', points: 0, email: '', mdp: '' });
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', ca: '0 €', events: 'Aucun', points: 0, email: '', mdp: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];
  const currentNodes = tree && tree.nodes ? tree.nodes : [];

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (id) => {
    setSelectedMemberId(selectedMemberId === id ? null : id); // Ouvre ou ferme au clic
  };

  // ➕ AJOUT MEMBRE (Avec champs supplémentaires)
  const handleAddMember = (e) => {
    if (e) e.preventDefault();
    if (!newMember.name || !newMember.name.trim()) {
      alert("Veuillez saisir un nom.");
      return;
    }
    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null,
      ca: newMember.ca || "0 €",
      events: newMember.events || "Aucun",
      points: Number(newMember.points) || 0,
      email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@limitless.com`,
      mdp: newMember.mdp || "Limitless2026!"
    };
    setTree({ nodes: [...currentNodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', ca: '0 €', events: 'Aucun', points: 0, email: '', mdp: '' });
  };

  const startEdit = (n) => {
    setEditId(n.id);
    setEditForm({ 
      name: n.name, role: n.role || 'Consultante', genre: n.genre || 'femme', parentId: n.parentId || '',
      ca: n.ca || '0 €', events: n.events || 'Aucun', points: n.points || 0, email: n.email || '', mdp: n.mdp || ''
    });
  };

  const handleSaveRow = () => {
    if (!editForm.name.trim()) return;
    setTree({
      nodes: currentNodes.map(n => n.id === editId ? {
        ...n,
        name: editForm.name.trim(), role: editForm.role, genre: editForm.genre, parentId: editForm.parentId || null,
        ca: editForm.ca, events: editForm.events, points: Number(editForm.points), email: editForm.email, mdp: editForm.mdp
      } : n)
    });
    setEditId(null);
  };

  const handleDeleteRow = (id) => {
    if (!window.confirm('Supprimer définitivement ce membre ?')) return;
    setTree({
      nodes: currentNodes.filter(n => n.id !== id).map(n => n.parentId === id ? { ...n, parentId: null } : n)
    });
  };

  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      return matchesSearch && (filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // 🌳 RENDU DE L'ARBRE VERTICAL AVEC INFOS ÉTENDUES AU CLIC
  const renderVerticalTree = (node, level = 0) => {
    if (!node) return null;

    const enfants = currentNodes.filter(n => n.parentId === node.id);
    const isSelected = selectedMemberId === node.id;

    let badgeBorderColor = '#D2B795';
    if (node.role === 'Manager') badgeBorderColor = '#B89047';
    if (node.role === 'Marraine') badgeBorderColor = '#C5A880';

    return (
      <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        
        {/* Ligne / Carte Individuelle Cliquable */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: `${level * 25}px`,
          marginBottom: '6px',
          position: 'relative',
          width: 'calc(100% - ' + (level * 25) + 'px)',
          maxWidth: '420px',
        }}>
          {level > 0 && (
            <div style={{ position: 'absolute', left: '-14px', top: '24px', width: '10px', height: '2px', background: '#D2B795' }} />
          )}

          {/* Badge principal */}
          <div 
            onClick={() => handleCardClick(node.id)}
            style={{
              background: isSelected ? '#FDF8F2' : 'white',
              border: `1px solid ${isSelected ? '#B89047' : badgeBorderColor}`,
              borderRadius: '12px',
              padding: '12px 16px',
              width: '100%',
              boxShadow: isSelected ? '0 4px 12px rgba(184,144,71,0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', color: '#2C2520', fontSize: '14px' }}>
                {node.name}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: node.genre === 'homme' ? '#3d6b9e' : '#7c5a34', marginTop: '3px' }}>
                {node.genre === 'homme' ? '👨' : '👩'} {displayRole(node.role || 'Consultante', node.genre)}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#B89047', background: '#F9F1E6', padding: '2px 8px', borderRadius: '8px' }}>
                {node.ca || '0 €'}
              </span>
              <span style={{ fontSize: '10px' }}>{isSelected ? '🔼' : '🔽'}</span>
            </div>
          </div>
        </div>

        {/* 📑 TIROIR DE DÉTAILS (CA, Fidélité, Événements, Mots de Passe) */}
        {isSelected && (
          <div style={{
            marginLeft: `${(level * 25) + 10}px`,
            width: 'calc(100% - ' + ((level * 25) + 10) + 'px)',
            maxWidth: '410px',
            background: 'white',
            border: '1px solid #EAE1D4',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '15px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 10px rgba(0,0,0,0.04)',
            boxSizing: 'border-box',
            fontSize: '12px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
              <div>
                <span style={{ color: '#888', display: 'block', fontWeight: '500' }}>📊 Chiffre d'Affaires</span>
                <strong style={{ fontSize: '14px', color: '#2d7a4a' }}>{node.ca || '0 €'}</strong>
              </div>
              <div>
                <span style={{ color: '#888', display: 'block', fontWeight: '500' }}>🎁 Fidélité Wallet</span>
                <strong style={{ fontSize: '13px', color: '#B89047' }}>{node.points || 0} Points</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #EAE1D4', paddingOver: '8px', paddingTop: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#888', display: 'block', fontWeight: '500' }}>📅 Événement Planifié</span>
              <span style={{ fontWeight: '600', color: '#4A3E3D' }}>{node.events || 'Aucun événement'}</span>
            </div>

            {/* 🔑 ZONE ACCÈS & MOTS DE PASSE */}
            <div style={{ borderTop: '1px solid #F0EAE1', paddingTop: '8px', background: '#FAF8F5', padding: '8px', borderRadius: '6px' }}>
              <span style={{ color: '#555', fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '11px' }}>🔑 IDENTIFIANTS COMPTE</span>
              <div style={{ color: '#4A3E3D', marginBottom: '2px' }}><strong>Email :</strong> {node.email || 'Non renseigné'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <strong>MDP :</strong> 
                <span style={{ fontFamily: 'monospace', background: '#eee', padding: '1px 4px', borderRadius: '4px' }}>
                  {visiblePasswords[node.id] ? (node.mdp || 'Aucun') : '••••••••'}
                </span>
                <button 
                  onClick={() => togglePasswordVisibility(node.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto' }}
                >
                  {visiblePasswords[node.id] ? '🙈 Masquer' : '👁️ Voir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste descendante des enfants */}
        {enfants.length > 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', left: `${(level * 25) + 8}px`, top: '0', bottom: '12px', width: '2px', background: '#EAE1D4' }} />
            {enfants.map(enfant => renderVerticalTree(enfant, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#FAF8F5', minHeight: '100vh' }}>
      
      {/* ONGLETS NAV */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>
          🌳 Organigramme interactif
        </button>
        <button onClick={() => setActiveTab('tableau')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'tableau' ? '#D2B795' : 'white', color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>
          📊 Mode Édition & Comptes
        </button>
      </div>

      {/* 🌳 VUE ARBRE DÉTAILLÉ */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', padding: '0 5px', boxSizing: 'border-box' }}>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#7c5a34', fontStyle: 'italic', marginTop: '-10px', marginBottom: '20px' }}>
            💡 Cliquez sur une carte d'équipe pour voir son CA, ses événements, ses points fidélité et son mot de passe.
          </p>
          <div style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {rootNodes.map(root => renderVerticalTree(root, 0))}
          </div>
        </div>
      )}

      {/* 📊 VUE TABLEAU (ADMIN COMPLÈTE) */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Formulaire ajout complexe */}
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '12px', fontSize: '15px' }}>✨ Ajouter un membre complet</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Nom / Prénom</label>
                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Genre</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.genre} onChange={e => setNewMember(p => ({ ...p, genre: e.target.value }))}>
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Rôle</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                  {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Parrain</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">— Aucun —</option>
                  {currentNodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>CA initial</label>
                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={newMember.ca} onChange={e => setNewMember(p => ({ ...p, ca: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600' }}>Mot de passe</label>
                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={newMember.mdp} onChange={e => setNewMember(p => ({ ...p, mdp: e.target.value }))} />
              </div>
              <button type="button" onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '9px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', gridColumn: '1 / -1' }}>
                ➕ Enregistrer le nouveau profil dans l'équipe
              </button>
            </div>
          </div>

          {/* Recherche rapide */}
          <input style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D2B795', marginBottom: '15px', boxSizing: 'border-box' }} placeholder="🔍 Rechercher une personne..." value={search} onChange={e => setSearch(e.target.value)} />

          {/* Tableau complet */}
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Membre</th>
                  <th style={{ padding: '10px' }}>CA</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Mot de passe</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map(n => {
                  const isEditing = editId === n.id;
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>
                        {isEditing ? <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /> : n.name}
                      </td>
                      <td style={{ padding: '10px', color: '#2d7a4a', fontWeight: '700' }}>
                        {isEditing ? <input size="6" value={editForm.ca} onChange={e => setEditForm(p => ({ ...p, ca: e.target.value }))} /> : n.ca}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {isEditing ? <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /> : n.email}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>
                        {isEditing ? <input size="10" value={editForm.mdp} onChange={e => setEditForm(p => ({ ...p, mdp: e.target.value }))} /> : (visiblePasswords[n.id] ? n.mdp : '••••••••')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isEditing ? (
                          <button onClick={handleSaveRow}>💾</button>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => togglePasswordVisibility(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>👁️</button>
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

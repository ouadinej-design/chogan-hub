import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);

  // 🏢 Structure complète de la Limitless Team (24 membres)
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12 500 €", events: "Séminaire Annuel, Masterclass Or", fidelity: "Platine (1500 pts)" },
      { id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8 400 €", events: "Masterclass Or, Conférence Elite", fidelity: "Or (900 pts)" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 100 €", events: "Atelier Initial", fidelity: "Argent (320 pts)" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 850 €", events: "Atelier Initial", fidelity: "Bronze (150 pts)" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 400 €", events: "Atelier Initial, Boost Camp", fidelity: "Argent (450 pts)" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", ca: "950 €", events: "Introduction Digitale", fidelity: "Initial (50 pts)" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 200 €", events: "Atelier Initial", fidelity: "Bronze (120 pts)" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", ca: "4 200 €", events: "Boost Camp, Masterclass Or", fidelity: "Or (600 pts)" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 800 €", events: "Atelier Initial", fidelity: "Argent (300 pts)" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 600 €", events: "Atelier Initial", fidelity: "Bronze (180 pts)" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", ca: "750 €", events: "Introduction Digitale", fidelity: "Initial (80 pts)" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 100 €", events: "Boost Camp", fidelity: "Argent (410 pts)" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 150 €", events: "Atelier Initial", fidelity: "Bronze (100 pts)" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 400 €", events: "Atelier Initial", fidelity: "Argent (290 pts)" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", ca: "5 300 €", events: "Boost Camp, Conférence Elite", fidelity: "Or (650 pts)" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 200 €", events: "Masterclass Or", fidelity: "Or (710 pts)" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", ca: "5 900 €", events: "Masterclass Or", fidelity: "Or (680 pts)" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 000 €", events: "Masterclass Or", fidelity: "Or (700 pts)" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1 300 €", events: "Atelier Initial", fidelity: "Bronze (140 pts)" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "900 €", events: "Introduction Digitale", fidelity: "Initial (40 pts)" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "3 800 €", events: "Boost Camp", fidelity: "Argent (480 pts)" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "2 250 €", events: "Atelier Initial", fidelity: "Argent (250 pts)" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", ca: "4 100 €", events: "Boost Camp", fidelity: "Or (510 pts)" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", ca: "1 980 €", events: "Atelier Initial", fidelity: "Bronze (160 pts)" }
    ]
  };

  // 🔥 Forçage de sécurité pour écraser la mémoire locale obsolète de votre téléphone
  const [tree, setTree] = useState(() => {
    try {
      const localData = localStorage.getItem('limitless_team_tree');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed?.nodes?.length >= 20) return parsed;
      }
    } catch (e) {}
    return defaultTree;
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null,
      ca: "0 €", events: "Aucun", fidelity: "Initial (0 pts)"
    };
    setTree({ nodes: [...tree.nodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = tree.nodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* CARTE DE MEMBRE CLIQUABLE */}
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

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', background: '#FAF7F2', minHeight: '100vh' }}>
      
      {/* 👑 BOUTONS ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'tableau' ? '#D2B795' : 'white', color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>📊 Gestion</button>
      </div>

      {/* 🌳 VUE ARBRE (Avec défilement horizontal) */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
            {tree.nodes.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
          </div>
        </div>
      )}

      {/* 📊 VUE AJOUT & LISTE */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795' }}>
          <h3 style={{ marginTop: 0, color: '#4A3E3D', textAlign: 'center' }}>Inscrire un membre</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Nom & Prénom" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} value={newMember.genre} onChange={e => setNewMember({...newMember, genre: e.target.value})}>
                <option value="femme">👩 Femme</option>
                <option value="homme">👨 Homme</option>
              </select>
              <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                <option value="Consultante">Consultante</option>
                <option value="Manager">Manager</option>
                <option value="Marraine">Marraine</option>
              </select>
            </div>
            <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} value={newMember.parentId} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
              <option value="">— Aucun parrain —</option>
              {tree.nodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Ajouter l'organisation</button>
          </div>
        </div>
      )}

      {/* 👑 POP-UP DE DÉTAILS (S'OUVRE AU CLIC SANS MOT DE PASSE) */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', border: '2px solid #D2B795', borderRadius: '16px', padding: '20px', width: '90%', maxWidth: '340px', position: 'relative' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #F0E6DA', paddingBottom: '10px' }}>
              <div style={{ fontSize: '28px' }}>{selectedMember.genre === 'homme' ? '👨' : '👩'}</div>
              <h3 style={{ margin: '5px 0', color: '#4A3E3D' }}>{selectedMember.name}</h3>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>{displayRole(selectedMember.role, selectedMember.genre)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: '#777' }}>📊 Chiffre d'Affaires :</span>
                <span style={{ color: '#2d7a4a', fontWeight: '700' }}>{selectedMember.ca || "0 €"}</span>
              </div>
              <div style={{ background: '#FDFBF9', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: '#777' }}>📅 Formations & Événements :</span>
                <div style={{ color: '#4A3E3D', fontWeight: '600', marginTop: '3px' }}>{selectedMember.events || "Aucun"}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: '#777' }}>🏆 Fidélité :</span>
                <span style={{ color: '#8C6D4F', fontWeight: '600' }}>{selectedMember.fidelity || "Niveau Initial"}</span>
              </div>
            </div>
            <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', marginTop: '15px', cursor: 'pointer' }}>Fermer</button>
          </div>
        </div>
      )}

    </div>
  );
}

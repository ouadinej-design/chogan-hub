import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null); // Pour la fenêtre modale au clic

  // 🏢 Structure complète de la Limitless Team avec données fictives de démo (CA, Événements, Fidélité)
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12,500 €", events: "Séminaire Annuel, Masterclass Or", fidelity: "Niveau Platine (1500 pts)" },
      { id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8,400 €", events: "Masterclass Or, Conférence Elite", fidelity: "Niveau Or (900 pts)" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,100 €", events: "Atelier Initial", fidelity: "Niveau Argent (320 pts)" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,850 €", events: "Atelier Initial", fidelity: "Niveau Bronze (150 pts)" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", ca: "3,400 €", events: "Atelier Initial, Boost Camp", fidelity: "Niveau Argent (450 pts)" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", ca: "950 €", events: "Introduction Digitale", fidelity: "Niveau Initial (50 pts)" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,200 €", events: "Atelier Initial", fidelity: "Niveau Bronze (120 pts)" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", ca: "4,200 €", events: "Boost Camp, Masterclass Or", fidelity: "Niveau Or (600 pts)" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,800 €", events: "Atelier Initial", fidelity: "Niveau Argent (300 pts)" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,600 €", events: "Atelier Initial", fidelity: "Niveau Bronze (180 pts)" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", ca: "750 €", events: "Introduction Digitale", fidelity: "Niveau Initial (80 pts)" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", ca: "3,100 €", events: "Boost Camp", fidelity: "Niveau Argent (410 pts)" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", ca: "1,150 €", events: "Atelier Initial", fidelity: "Niveau Bronze (100 pts)" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", ca: "2,400 €", events: "Atelier Initial", fidelity: "Niveau Argent (290 pts)" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", ca: "5,300 €", events: "Boost Camp, Conférence Elite", fidelity: "Niveau Or (650 pts)" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", ca: "6,200 €", events: "Masterclass Or", fidelity: "Niveau Or (710 pts)" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", ca: "5,900 €", events: "Masterclass Or", fidelity: "Niveau Or (680 pts)" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", ca: "6,000 €", events: "Masterclass Or", fidelity: "Niveau Or (700 pts)" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1,300 €", events: "Atelier Initial", fidelity: "Niveau Bronze (140 pts)" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "900 €", events: "Introduction Digitale", fidelity: "Niveau Initial (40 pts)" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "3,800 €", events: "Boost Camp", fidelity: "Niveau Argent (480 pts)" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "2,250 €", events: "Atelier Initial", fidelity: "Niveau Argent (250 pts)" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", ca: "4,100 €", events: "Boost Camp", fidelity: "Niveau Or (510 pts)" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", ca: "1,980 €", events: "Atelier Initial", fidelity: "Niveau Bronze (160 pts)" }
    ]
  };

  // 📁 Chargement avec Forçage : si l'équipe stockée est incomplète, on charge l'équipe entière
  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && parsed.nodes && parsed.nodes.length >= 20) {
          return parsed;
        }
      }
      return defaultTree;
    } catch (error) {
      return defaultTree;
    }
  });

  const currentNodes = tree.nodes;

  // Sauvegarde
  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // Ajouter un membre avec des valeurs de démo par défaut
  const handleAddMember = (e) => {
    if (e) e.preventDefault();
    if (!newMember.name || !newMember.name.trim()) return;
    
    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null,
      ca: "0 €",
      events: "Aucun événement",
      fidelity: "Niveau Initial (0 pts)"
    };
    setTree({ nodes: [...currentNodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  // Rendu de l'arbre
  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = currentNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* CARTE CLIQUABLE */}
        <div 
          onClick={() => setSelectedMember(node)}
          style={{
            background: 'white',
            border: '1px solid #D2B795',
            borderRadius: '12px',
            padding: '14px 18px',
            minWidth: '150px',
            boxShadow: '0 4px 12px rgba(210,183,149,0.15)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '6px', color: node.genre === 'homme' ? '#3d6b9e' : '#8C6D4F', textTransform: 'uppercase' }}>
            {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#4A3E3D', fontSize: '14px', marginBottom: '6px', whiteSpace: 'normal' }}>
            {node.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#2d7a4a' }}>
            🟢 Actif
          </div>
        </div>

        {enfants.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', position: 'relative', flexDirection: 'row', alignItems: 'flex-start' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);
  const filteredNodes = currentNodes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  return (

import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null); // Stocke l'ID du membre focus pour l'arbre

  // États pour l'édition dans le tableau
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 🏢 Structure complète de base
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12 500 €", caNum: 12500, objNum: 15000, objectif: "Atteindre 15 000 € de CA d'équipe", events: "Séminaire Annuel, Masterclass Or", fidelity: "Platine (1500 pts)", mdp: "Limitless*2026A", topClient: "Sarah Benali", bestSeller: "Parfum Prestige Luxury", meilleuresVentes: "Pack Élite & Soins Éclat" },
      { id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8 400 €", caNum: 8400, objNum: 10000, objectif: "Atteindre 10 000 € de CA personnel", events: "Masterclass Or, Conférence Elite", fidelity: "Or (900 pts)", mdp: "Limitless*2026B", topClient: "Amine Mansouri", bestSeller: "Sérum Anti-Âge Ultime", meilleuresVentes: "Gamme Corps & Fragrances" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 100 €", caNum: 2100, objNum: 3000, objectif: "Atteindre 3 000 € de CA", events: "Atelier Initial", fidelity: "Argent (320 pts)", mdp: "Soumia#Lmtl", topClient: "Léa Roussel", bestSeller: "Huile Sèche Scintillante", meilleuresVentes: "Duos Maquillage Été" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 850 €", caNum: 1850, objNum: 2000, objectif: "Valider le palier à 2 000 €", events: "Atelier Initial", fidelity: "Bronze (150 pts)", mdp: "Nawel#Lmtl", topClient: "Yasmine K.", bestSeller: "Rouge à Lèvres Mat Intense", meilleuresVentes: "Coffrets Découverte" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 400 €", caNum: 3400, objNum: 4000, objectif: "Passer au statut Marraine", events: "Atelier Initial, Boost Camp", fidelity: "Argent (450 pts)", mdp: "Selma#Lmtl", topClient: "Chloé Dubois", bestSeller: "Crème de Nuit Régénérante", meilleuresVentes: "Rituels Hydratation" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", ca: "950 €", caNum: 950, objNum: 1500, objectif: "Atteindre les 1 500 €", events: "Introduction Digitale", fidelity: "Initial (50 pts)", mdp: "Sophia#Lmtl", topClient: "Inès Hadj", bestSeller: "Eau de Parfum Floral", meilleuresVentes: "Brumes Parfumées" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 200 €", caNum: 1200, objNum: 2000, objectif: "Atteindre le niveau Argent", events: "Atelier Initial", fidelity: "Bronze (120 pts)", mdp: "Baya#Lmtl", topClient: "Nadia Meziane", bestSeller: "Gel Nettoyant Purifiant", meilleuresVentes: "Soins Visage Essentiels" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", ca: "4 200 €", caNum: 4200, objNum: 5000, objectif: "Atteindre 5 000 € de CA", events: "Boost Camp, Masterclass Or", fidelity: "Or (600 pts)", mdp: "Milene#Lmtl", topClient: "Élodie Martin", bestSeller: "Élixir Capillaire Nourrissant", meilleuresVentes: "Cures Capillaires Pro" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 800 €", caNum: 2800, objNum: 3000, objectif: "Finaliser l'objectif Argent", events: "Atelier Initial", fidelity: "Argent (300 pts)", mdp: "Sarah#Lmtl", topClient: "Myriam B.", bestSeller: "Mascara Volume Extrême", meilleuresVentes: "Palettes Yeux & Teint" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 600 €", caNum: 1600, objNum: 2000, objectif: "Atteindre les 2 000 €", events: "Atelier Initial", fidelity: "Bronze (180 pts)", mdp: "NadiaB#Lmtl", topClient: "Sabrina T.", bestSeller: "Gommage Corps Gourmand", meilleuresVentes: "Duo Douceur Douche" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", ca: "750 €", caNum: 750, objNum: 1000, objectif: "Passer au niveau Bronze", events: "Introduction Digitale", fidelity: "Initial (80 pts)", mdp: "Shaima#Lmtl", topClient: "Lina Amrani", bestSeller: "Baume Lèvres Nourrissant", meilleuresVentes: "Soin Quotidien" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 100 €", caNum: 3100, objNum: 4000, objectif: "Atteindre les 4 000 €", events: "Boost Camp", fidelity: "Argent (410 pts)", mdp: "Melissa#Lmtl", topClient: "Emma Bernard", bestSeller: "Fond de Teint Haute Couvrance", meilleuresVentes: "Gamme Teint Parfait" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 150 €", caNum: 1150, objNum: 1500, objectif: "Atteindre les 1 500 €", events: "Atelier Initial", fidelity: "Bronze (100 pts)", mdp: "Cassandra#Lmtl", topClient: "Julie Petit", bestSeller: "Lotion Tonique Éclat", meilleuresVentes: "Routine Pureté" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 400 €", caNum: 2400, objNum: 3000, objectif: "Atteindre les 3 000 €", events: "Atelier Initial", fidelity: "Argent (290 pts)", mdp: "Meryem#Lmtl", topClient: "Fatiha K.", bestSeller: "Parfum Intense Oud", meilleuresVentes: "Collection Orientale" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", ca: "5 300 €", caNum: 5300, objNum: 6000, objectif: "Atteindre les 6 000 €", events: "Boost Camp, Conférence Elite", fidelity: "Or (650 pts)", mdp: "Karim#Lmtl", topClient: "Thomas Durand", bestSeller: "Soin Visage Global Homme", meilleuresVentes: "Gamme Barbier & Parfums" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 200 €", caNum: 6200, objNum: 7500, objectif: "Développer sa lignée directe", events: "Masterclass Or", fidelity: "Or (710 pts)", mdp: "NadiaN#Lmtl", topClient: "Farida Bouaziz", bestSeller: "Sérum Booster Vitamine C", meilleuresVentes: "Cures Éclat Anti-Fatigue" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", ca: "5 900 €", caNum: 5900, objNum: 7000, objectif: "Atteindre 7 000 € de CA d'équipe", events: "Masterclass Or", fidelity: "Or (680 pts)", mdp: "Isabelle#Lmtl", topClient: "Sophie Morel", bestSeller: "Crème Mains Haute Protection", meilleuresVentes: "Packs Confort Hiver" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 000 €", caNum: 6000, objNum: 8000, objectif: "Se qualifier pour le Séminaire Élite", events: "Masterclass Or", fidelity: "Or (700 pts)", mdp: "Blandine#Lmtl", topClient: "Valérie Simon", bestSeller: "Masque Détox Régénérant", meilleuresVentes: "Soins Spa à la Maison" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1 300 €", caNum: 1300, objNum: 2000, objectif: "Atteindre les 2 000 €", events: "Atelier Initial", fidelity: "Bronze (140 pts)", mdp: "Tracy#Lmtl", topClient: "Camille Laurent", bestSeller: "Crayon Yeux Waterproof", meilleuresVentes: "Basiques Regard" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "900 €", caNum: 900, objNum: 1500, objectif: "Passer le palier Bronze", events: "Introduction Digitale", fidelity: "Initial (40 pts)", mdp: "Yasmin#Lmtl", topClient: "Sonia Aloui", bestSeller: "Gloss Repulpant Éclat", meilleuresVentes: "Mini Kits Lèvres" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "3 800 €", caNum: 3800, objNum: 5000, objectif: "Atteindre les 5 000 €", events: "Boost Camp", fidelity: "Argent (480 pts)", mdp: "Anita#Lmtl", topClient: "Manon Roussel", bestSeller: "Eau Micellaire Apaisante", meilleuresVentes: "Démaquillants Douceur" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "2 250 €", caNum: 2250, objNum: 3000, objectif: "Valider l'objectif Argent", events: "Atelier Initial", fidelity: "Argent (250 pts)", mdp: "Khayra#Lmtl", topClient: "Houria B.", bestSeller: "Brume Fixatrice Teint", meilleuresVentes: "Incontournables Teint" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", ca: "4 100 €", caNum: 4100, objNum: 5000, objectif: "Atteindre les 5 000 €", events: "Boost Camp", fidelity: "Or (510 pts)", mdp: "Yasmina#Lmtl", topClient: "Nathalie Robert", bestSeller: "Concentré Anti-Tâches", meilleuresVentes: "Sérums Haute Performance" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", ca: "1 980 €", caNum: 1980, objNum: 2500, objectif: "Atteindre les 2 500 €", events: "Atelier Initial", fidelity: "Bronze (160 pts)", mdp: "Adam#Lmtl", topClient: "Lucas Michel", bestSeller: "Gel Douche Énergisant", meilleuresVentes: "Soins Corps Dynamisants" }
    ]
  };

  const [tree, setTree] = useState(() => {
    try {
      const localData = localStorage.getItem('limitless_team_tree_v4');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed?.nodes?.length >= 20) return parsed;
      }
    } catch (e) {}
    return defaultTree;
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree_v4', JSON.stringify(tree));
  }, [tree]);

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000' });

  // 📈 Totaux globaux du tableau de bord
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

  // 🔄 Action de Réinitialisation complète du réseau
  const handleResetTree = () => {
    if (window.confirm("⚠️ Êtes-vous sûr de vouloir réinitialiser tout le réseau aux valeurs d'origine ? Toutes vos saisies locales seront effacées.")) {
      setTree(defaultTree);
      setTreeRootId(null);
      setEditingId(null);
    }
  };

  // ✏️ Lancement du mode édition sur une ligne
  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

  // 💾 Enregistrement de la ligne modifiée
  const saveRowEdits = () => {
    const cNum = parseFloat(editForm.caNum) || 0;
    const oNum = parseFloat(editForm.objNum) || 0;
    
    const updatedNodes = tree.nodes.map(node => {
      if (node.id === editingId) {
        return {
          ...editForm,
          caNum: cNum,
          objNum: oNum,
          ca: `${cNum.toLocaleString()} €`
        };
      }
      return node;
    });

    setTree({ nodes: updatedNodes });
    setEditingId(null);
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
      objectif: newMember.objectif.trim() || "Fixer un objectif de vente",
      events: "Aucun", 
      fidelity: "Initial (0 pts)",
      mdp: newMember.mdp.trim() || "Limitless#123",
      topClient: newMember.topClient.trim() || "Non défini",
      bestSeller: newMember.bestSeller.trim() || "Non défini",
      meilleuresVentes: newMember.meilleuresVentes.trim() || "Non défini"
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

  // Trouver les nœuds de départ pour l'arbre d'accueil selon le focus actif
  const visibleRoots = treeRootId 
    ? tree.nodes.filter(n => n.id === treeRootId)
    : tree.nodes.filter(n => !n.parentId);

  // Déterminer le parent du niveau supérieur actuel pour l'affichage du bouton retour
  const currentFocusedNode = treeRootId ? tree.nodes.find(n => n.id === treeRootId) : null;
  const parentNodeOfFocused = currentFocusedNode ? tree.nodes.find(n => n.id === currentFocusedNode.parentId) : null;

  const pctProgress = selectedMember 
    ? Math.min(100, Math.round((selectedMember.caNum / (selectedMember.objNum || 1)) * 100)) 
    : 0;

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', background: '#FAF7F2', minHeight: '100vh' }}>
      
      {/* 👑 DASHBOARD DE PILOTAGE HAUT DE PAGE */}
      <div style={{ 
        maxWidth: '1000px', margin: '0 auto 20px auto', background: 'white', 
        border: '1px solid #D2B795', borderRadius: '14px', padding: '15px 25px', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        boxShadow: '0 4px 15px rgba(210,183,149,0.1)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Chiffre d'Affaires Global</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d7a4a', marginTop: '4px' }}>{totalCA.toLocaleString()} €</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎯 Performance Équipe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4A3E3D' }}>{globalPerformance}%</div>
            <div style={{ width: '120px', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${globalPerformance}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 👑 NAVIGATION PAR ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('gestion')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'gestion' ? '#D2B795' : 'white', color: activeTab === 'gestion' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>⚙️ Gestion</button>
      </div>

      {/* 🌳 ONGLET "ARBRE" (ACCUEIL) */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          
          {/* Bouton de retour au niveau supérieur si filtre actif */}
          {treeRootId && (
            <button 
              onClick={() => setTreeRootId(currentFocusedNode.parentId)}
              style={{
                background: 'white', border: '1px solid #8C6D4F', color: '#8C6D4F',
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              ⬅️ Revenir au niveau supérieur ({parentNodeOfFocused ? parentNodeOfFocused.name : "Racine Totale"})
            </button>
          )}

          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
              {visibleRoots.map(root => renderTreeNodes(root))}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ ONGLET "GESTION" */}
      {activeTab === 'gestion' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Form d'inscription */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', textAlign: 'center', fontSize: '15px' }}>✨ Inscrire un nouveau membre</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Nom & Prénom" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                <input style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Mot de passe" value={newMember.mdp} onChange={e => setNewMember({...newMember, mdp: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Objectif personnel (Ex: Atteindre 3000€)" value={newMember.objectif} onChange={e => setNewMember({...newMember, objectif: e.target.value})} />
                <input type="number" style={{ flex: 1, minWidth: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Objectif (€)" value={newMember.objNum} onChange={e => setNewMember({...newMember, objNum: e.target.value})} />
                <input type="number" style={{ flex: 1, minWidth: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="CA Initial (€)" value={newMember.caNum} onChange={e => setNewMember({...newMember, caNum: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Top Client" value={newMember.topClient} onChange={e => setNewMember({...newMember, topClient: e.target.value})} />
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Best-seller produit" value={newMember.bestSeller} onChange={e => setNewMember({...newMember, bestSeller: e.target.value})} />
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Meilleures ventes" value={newMember.meilleuresVentes} onChange={e => setNewMember({...newMember, meilleuresVentes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.genre} onChange={e => setNewMember({...newMember, genre: e.target.value})}>
                  <option value="femme">👩 Femme</option>
                  <option value="homme">👨 Homme</option>
                </select>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                  <option value="Consultante">Consultante</option>
                  <option value="Manager">Manager</option>
                  <option value="Marraine">Marraine</option>
                </select>
              </div>
              <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
                <option value="">— Aucun parrain —</option>
                {tree.nodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Ajouter à l'organisation</button>
            </div>
          </div>

          {/* Grand Tableau Récapitulatif Administration */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', background: 'white', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px' }}>Conseiller(e)</th>
                  <th style={{ padding: '12px' }}>Rôle</th>
                  <th style={{ padding: '12px', color: '#8C6D4F' }}>🔑 Mot de Passe</th>
                  <th style={{ padding: '12px' }}>Chiffre d'Affaires</th>
                  <th style={{ padding: '12px' }}>Objectif Personnel</th>
                  <th style={{ padding: '12px' }}>Taux Réal.</th>
                  <th style={{ padding: '12px', textCenter: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map(n => {
                  const isEditing = editingId === n.id;
                  const currentForm = isEditing ? editForm : n;
                  const pct = Math.min(100, Math.round((currentForm.caNum / (currentForm.objNum || 1)) * 100));

                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)', background: isEditing ? '#FFFDF9' : 'none' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#4A3E3D' }}>
                        {isEditing ? (
                          <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '140px' }} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        ) : (
                          <>{n.genre === 'homme' ? '👨 ' : '👩 '}{n.name}</>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <select style={{ padding: '5px', borderRadius: '6px', border: '1px solid #D2B795' }} value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                            <option value="Consultante">Consultante</option>
                            <option value="Manager">Manager</option>
                            <option value="Marraine">Marraine</option>
                          </select>
                        ) : (
                          displayRole(n.role, n.genre)
                        )}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#B39266' }}>
                        {isEditing ? (
                          <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '120px' }} value={editForm.mdp} onChange={e => setEditForm({...editForm, mdp: e.target.value})} />
                        ) : (
                          n.mdp || "Non défini"
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="number" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '80px' }} value={editForm.caNum} onChange={e => setEditForm({...editForm, caNum: e.target.value})} /> €
                          </div>
                        ) : (
                          <span style={{ color: '#2d7a4a', fontWeight: '600' }}>{n.ca || "0 €"}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '150px' }} value={editForm.objectif} placeholder="Description" onChange={e => setEditForm({...editForm, objectif: e.target.value})} />
                            <input type="number" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '80px' }} value={editForm.objNum} placeholder="Montant €" onChange={e => setEditForm({...editForm, objNum: e.target.value})} />
                          </div>
                        ) : (
                          <span style={{ color: '#666', fontSize: '12px' }}>{n.objectif || "—"}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: pct >= 80 ? '#2d7a4a' : '#8C6D4F' }}>{pct}%</td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={saveRowEdits} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>💾</button>
                            <button onClick={() => setEditingId(null)} style={{ background: '#777', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>❌</button>
                          </div>
                        ) : (
                          <button onClick={() => startEditing(n)} style={{ background: '#FAF5EE', border: '1px solid #D2B795', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#8C6D4F' }}>✏️ Modifier</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bouton Réinitialisation Globale */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button 
              onClick={handleResetTree}
              style={{
                background: 'white', color: '#b93c3c', border: '1px solid #b93c3c',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              ⚠️ Réinitialiser l'organisation d'origine
            </button>
          </div>

        </div>
      )}

      {/* 👑 MODAL DES PERFORMANCES (Avec Zoom Réseau) */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', border: '2px solid #D2B795', borderRadius: '16px', padding: '20px', width: '90%', maxWidth: '360px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '12px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#777' }}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '1px solid #F0E6DA', paddingBottom: '10px' }}>
              <div style={{ fontSize: '32px', marginBottom: '5px' }}>{selectedMember.genre === 'homme' ? '👨' : '👩'}</div>
              <h3 style={{ margin: '5px 0', color: '#4A3E3D', fontSize: '18px' }}>{selectedMember.name}</h3>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                {displayRole(selectedMember.role, selectedMember.genre)}
              </span>
            </div>

            {/* Jauge d'Objectif Personnel */}
            <div style={{ background: '#FAF5EE', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.4)', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4A3E3D', fontWeight: '700', marginBottom: '4px' }}>
                <span>🎯 Objectif Personnel :</span>
                <span style={{ color: '#8C6D4F' }}>{pctProgress}% Réalisé</span>
              </div>
              <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>
                "{selectedMember.objectif || "Non défini"}"
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pctProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>

            {/* Indicateurs clefs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #2d7a4a' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>📊 Chiffre d'Affaires :</span>
                <span style={{ color: '#2d7a4a', fontWeight: '700', fontSize: '14px' }}>{selectedMember.ca || "0 €"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>🏆 Fidélité :</span>
                <span style={{ color: '#B39266', fontWeight: '700' }}>{selectedMember.fidelity || "Niveau Initial"}</span>
              </div>
              <div style={{ background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>💄 Best-seller produit :</span>
                <div style={{ color: '#8C6D4F', fontWeight: '600', marginTop: '2px' }}>{selectedMember.bestSeller || "Non défini"}</div>
              </div>
              <div style={{ background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>📈 Meilleures ventes :</span>
                <div style={{ color: '#2d7a4a', fontWeight: '600', marginTop: '2px' }}>{selectedMember.meilleuresVentes || "Non défini"}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>👤 Top Client :</span>
                <span style={{ color: '#4A3E3D', fontWeight: '600' }}>{selectedMember.topClient || "Non défini"}</span>
              </div>
            </div>

            {/* Bouton Zoom Filtre (Nouvelle fonctionnalité d'accueil demandée) */}
            <button 
              onClick={() => {
                setTreeRootId(selectedMember.id);
                setSelectedMember(null);
              }}
              style={{ width: '100%', padding: '11px', background: '#D2B795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginBottom: '6px' }}
            >
              🔍 Zoomer sur son réseau
            </button>

            <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '11px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Fermer</button>
          </div>
        </div>
      )}

    </div>
  );
}

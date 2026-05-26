import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null); // Stocke l'ID du membre focus pour l'arbre

  // États pour l'édition dans le tableau
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 🏢 Structure complète de base avec listes chronologiques (Plus récent au plus ancien)
  const defaultTree = {
    nodes: [
      { 
        id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12 500 €", caNum: 12500, objNum: 15000, objectif: "Atteindre 15 000 € de CA d'équipe", fidelity: "Platine (1500 pts)", mdp: "Limitless*2026A",
        topClientsList: [
          { name: "Sarah Benali", date: "24 Mai 2026", details: "+450 pts (Commande Élite)" },
          { name: "Amel K.", date: "18 Mai 2026", details: "+300 pts (Abonnement Cure)" },
          { name: "Nadia Meziane", date: "10 Mai 2026", details: "+250 pts (Coffrets Cadeaux)" },
          { name: "Sonia Triki", date: "02 Mai 2026", details: "+200 pts (Gamme Prestige)" },
          { name: "Yasmine L.", date: "26 Avr 2026", details: "+150 pts (Soins Éclat)" }
        ],
        eventsList: [
          { name: "Séminaire Annuel Limitless", date: "15 Juin 2026", loc: "Paris" },
          { name: "Masterclass Or & Leadership", date: "28 Juin 2026", loc: "En ligne" },
          { name: "Conférence National Cosmetics", date: "10 Juil 2026", loc: "Lyon" }
        ],
        bestSellersList: [
          { name: "Parfum Prestige Luxury", date: "25 Mai 2026", qty: "18 unités" },
          { name: "Élixir Anti-Âge Diamond", date: "19 Mai 2026", qty: "14 unités" },
          { name: "Brume d'Or Scintillante", date: "12 Mai 2026", qty: "12 unités" },
          { name: "Sérum Rénovateur Nuit", date: "05 Mai 2026", qty: "10 unités" },
          { name: "Coffret Rituel Absolu", date: "28 Avr 2026", qty: "9 unités" }
        ],
        meilleuresVentesList: [
          { name: "Pack Élite & Soins Éclat", date: "24 Mai 2026", total: "2 450 €" },
          { name: "Collection Fragrances Suprême", date: "15 Mai 2026", total: "1 980 €" },
          { name: "Gamme Hydra-Régénérante Pro", date: "08 Mai 2026", total: "1 520 €" },
          { name: "Duo Teint Parfait & Pinceaux", date: "02 Mai 2026", total: "1 100 €" },
          { name: "Kits Découverte Printemps", date: "20 Avr 2026", total: "950 €" }
        ]
      },
      { 
        id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8 400 €", caNum: 8400, objNum: 10000, objectif: "Atteindre 10 000 € de CA personnel", fidelity: "Or (900 pts)", mdp: "Limitless*2026B",
        topClientsList: [
          { name: "Amine Mansouri", date: "25 Mai 2026", details: "+250 pts (Gamme Homme Pro)" },
          { name: "Chloé Dubois", date: "20 Mai 2026", details: "+210 pts (Packs Maquillage)" },
          { name: "Fatima Z.", date: "14 Mai 2026", details: "+180 pts (Parfums d'Orient)" },
          { name: "Julie Morel", date: "05 Mai 2026", details: "+140 pts (Routine Solaire)" },
          { name: "Léa Roussel", date: "28 Avr 2026", details: "+120 pts (Soins Hydratants)" }
        ],
        eventsList: [
          { name: "Masterclass Or & Excellence", date: "18 Juin 2026", loc: "Marseille" },
          { name: "Conférence Élite Ventes", date: "05 Juil 2026", loc: "En ligne" },
          { name: "Atelier Stratégie Automne", date: "12 Sept 2026", loc: "Alger" }
        ],
        bestSellersList: [
          { name: "Sérum Anti-Âge Ultime", date: "23 Mai 2026", qty: "15 unités" },
          { name: "Parfum Impérial Chogan", date: "17 Mai 2026", qty: "11 unités" },
          { name: "Crème Soyeuse Jour", date: "11 Mai 2026", qty: "9 unités" },
          { name: "Fond de Teint Perfection", date: "04 Mai 2026", qty: "8 unités" },
          { name: "Huile de Douche Sensorielle", date: "29 Avr 2026", qty: "7 unités" }
        ],
        meilleuresVentesList: [
          { name: "Gamme Corps & Fragrances", date: "22 Mai 2026", total: "1 650 €" },
          { name: "Rituel Anti-Âge Premium", date: "14 Mai 2026", total: "1 200 €" },
          { name: "Assortiment Maquillage d'Été", date: "09 Mai 2026", total: "980 €" },
          { name: "Duo Parfums d'Exception", date: "02 Mai 2026", total: "750 €" },
          { name: "Pack Routine Pureté Visage", date: "24 Avr 2026", total: "520 €" }
        ]
      },
      { 
        id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 100 €", caNum: 2100, objNum: 3000, objectif: "Atteindre 3 000 € de CA", fidelity: "Argent (320 pts)", mdp: "Soumia#Lmtl",
        topClientsList: [
          { name: "Léa Roussel", date: "26 Mai 2026", details: "+95 pts (Achat Huiles Sèches)" },
          { name: "Inès Hadj", date: "20 Mai 2026", details: "+70 pts (Palette Yeux)" },
          { name: "Mélanie D.", date: "15 Mai 2026", details: "+65 pts (Parfum Floral)" },
          { name: "Clara Simon", date: "08 Mai 2026", details: "+50 pts (Rouge à lèvres)" },
          { name: "Sophie Vaux", date: "30 Avr 2026", details: "+40 pts (Soin Éclat)" }
        ],
        eventsList: [
          { name: "Atelier Initial & Catalogue", date: "12 Juin 2026", loc: "En ligne" },
          { name: "Webinaire Techniques Ventes", date: "25 Juin 2026", loc: "En ligne" },
          { name: "Session Pratique Maquillage", date: "08 Juil 2026", loc: "En ligne" }
        ],
        bestSellersList: [
          { name: "Huile Sèche Scintillante", date: "24 Mai 2026", qty: "9 unités" },
          { name: "Mascara Regard Intense", date: "19 Mai 2026", qty: "6 unités" },
          { name: "Eau de Parfum Boisée", date: "13 Mai 2026", qty: "5 unités" },
          { name: "Gloss Volume Naturel", date: "05 Mai 2026", qty: "4 unités" },
          { name: "Gommage Douceur Corps", date: "27 Avr 2026", qty: "3 unités" }
        ],
        meilleuresVentesList: [
          { name: "Duos Maquillage Été", date: "24 Mai 2026", total: "450 €" },
          { name: "Pack Éclat Soleil & Huiles", date: "17 Mai 2026", total: "380 €" },
          { name: "Collection Mini-Parfums", date: "10 Mai 2026", total: "290 €" },
          { name: "Soin Visage Hydratation", date: "02 Mai 2026", total: "210 €" },
          { name: "Duo Nettoyage Peau Fraîche", date: "23 Avr 2026", total: "150 €" }
        ]
      }
    ]
  };

  // Remplissage automatique pour les autres membres d'origine afin de garantir un affichage fluide
  const completeBaseData = () => {
    const backupNodes = [
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", caNum: 1850, objNum: 2000, mdp: "Nawel#Lmtl", fidelity: "Bronze (150 pts)", objectif: "Valider le palier à 2 000 €", topProduct: "Rouge à Lèvres Mat Intense", topCategory: "Coffrets Découverte", client: "Yasmine K." },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", caNum: 3400, objNum: 4000, mdp: "Selma#Lmtl", fidelity: "Argent (450 pts)", objectif: "Passer au statut Marraine", topProduct: "Crème de Nuit Régénérante", topCategory: "Rituels Hydratation", client: "Chloé Dubois" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", caNum: 950, objNum: 1500, mdp: "Sophia#Lmtl", fidelity: "Initial (50 pts)", objectif: "Atteindre les 1 500 €", topProduct: "Eau de Parfum Floral", topCategory: "Brumes Parfumées", client: "Inès Hadj" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", caNum: 1200, objNum: 2000, mdp: "Baya#Lmtl", fidelity: "Bronze (120 pts)", objectif: "Atteindre le niveau Argent", topProduct: "Gel Nettoyant Purifiant", topCategory: "Soins Visage Essentiels", client: "Nadia Meziane" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", caNum: 4200, objNum: 5000, mdp: "Milene#Lmtl", fidelity: "Or (600 pts)", objectif: "Atteindre 5 000 € de CA", topProduct: "Élixir Capillaire Nourrissant", topCategory: "Cures Capillaires Pro", client: "Élodie Martin" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", caNum: 2800, objNum: 3000, mdp: "Sarah#Lmtl", fidelity: "Argent (300 pts)", objectif: "Finaliser l'objectif Argent", topProduct: "Mascara Volume Extrême", topCategory: "Palettes Yeux & Teint", client: "Myriam B." },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", caNum: 1600, objNum: 2000, mdp: "NadiaB#Lmtl", fidelity: "Bronze (180 pts)", objectif: "Atteindre les 2 000 €", topProduct: "Gommage Corps Gourmand", topCategory: "Duo Douceur Douche", client: "Sabrina T." },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", caNum: 750, objNum: 1000, mdp: "Shaima#Lmtl", fidelity: "Initial (80 pts)", objectif: "Passer au niveau Bronze", topProduct: "Baume Lèvres Nourrissant", topCategory: "Soin Quotidien", client: "Lina Amrani" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", caNum: 3100, objNum: 4000, mdp: "Melissa#Lmtl", fidelity: "Argent (410 pts)", objectif: "Atteindre les 4 000 €", topProduct: "Fond de Teint Haute Couvrance", topCategory: "Gamme Teint Parfait", client: "Emma Bernard" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", caNum: 1150, objNum: 1500, mdp: "Cassandra#Lmtl", fidelity: "Bronze (100 pts)", objectif: "Atteindre les 1 500 €", topProduct: "Lotion Tonique Éclat", topCategory: "Routine Pureté", client: "Julie Petit" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", caNum: 2400, objNum: 3000, mdp: "Meryem#Lmtl", fidelity: "Argent (290 pts)", objectif: "Atteindre les 3 000 €", topProduct: "Parfum Intense Oud", topCategory: "Collection Orientale", client: "Fatiha K." },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", caNum: 5300, objNum: 6000, mdp: "Karim#Lmtl", fidelity: "Or (650 pts)", objectif: "Atteindre les 6 000 €", topProduct: "Soin Visage Global Homme", topCategory: "Gamme Barbier & Parfums", client: "Thomas Durand" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", caNum: 6200, objNum: 7500, mdp: "NadiaN#Lmtl", fidelity: "Or (710 pts)", objectif: "Développer sa lignée directe", topProduct: "Sérum Booster Vitamine C", topCategory: "Cures Éclat Anti-Fatigue", client: "Farida Bouaziz" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", caNum: 5900, objNum: 7000, mdp: "Isabelle#Lmtl", fidelity: "Or (680 pts)", objectif: "Atteindre 7 000 € de CA d'équipe", topProduct: "Crème Mains Haute Protection", topCategory: "Packs Confort Hiver", client: "Sophie Morel" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", caNum: 6000, objNum: 8000, mdp: "Blandine#Lmtl", fidelity: "Or (700 pts)", objectif: "Se qualifier pour le Séminaire Élite", topProduct: "Masque Détox Régénérant", topCategory: "Soins Spa à la Maison", client: "Valérie Simon" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", caNum: 1300, objNum: 2000, mdp: "Tracy#Lmtl", fidelity: "Bronze (140 pts)", objectif: "Atteindre les 2 000 €", topProduct: "Crayon Yeux Waterproof", topCategory: "Basiques Regard", client: "Camille Laurent" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", caNum: 900, objNum: 1500, mdp: "Yasmin#Lmtl", fidelity: "Initial (40 pts)", objectif: "Passer le palier Bronze", topProduct: "Gloss Repulpant Éclat", topCategory: "Mini Kits Lèvres", client: "Sonia Aloui" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", caNum: 3800, objNum: 5000, mdp: "Anita#Lmtl", fidelity: "Argent (480 pts)", objectif: "Atteindre les 5 000 €", topProduct: "Eau Micellaire Apaisante", topCategory: "Démaquillants Douceur", client: "Manon Roussel" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", caNum: 2250, objNum: 3000, mdp: "Khayra#Lmtl", fidelity: "Argent (250 pts)", objectif: "Valider l'objectif Argent", topProduct: "Brume Fixatrice Teint", topCategory: "Incontournables Teint", client: "Houria B." },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", caNum: 4100, objNum: 5000, mdp: "Yasmina#Lmtl", fidelity: "Or (510 pts)", joke: true, objectif: "Atteindre les 5 000 €", topProduct: "Concentré Anti-Tâches", topCategory: "Sérums Haute Performance", client: "Nathalie Robert" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", caNum: 1980, objNum: 2500, mdp: "Adam#Lmtl", fidelity: "Bronze (160 pts)", objectif: "Atteindre les 2 500 €", topProduct: "Gel Douche Énergisant", topCategory: "Soins Corps Dynamisants", client: "Lucas Michel" }
    ];

    backupNodes.forEach(node => {
      defaultTree.nodes.push({
        id: node.id, name: node.name, role: node.role, genre: node.genre, parentId: node.parentId,
        caNum: node.caNum, ca: `${node.caNum.toLocaleString()} €`, objNum: node.objNum, objectif: node.objectif, fidelity: node.fidelity, mdp: node.mdp,
        topClientsList: [
          { name: node.client, date: "24 Mai 2026", details: "+80 pts (Dernière commande)" },
          { name: "Client Privé B", date: "15 Mai 2026", details: "+60 pts" },
          { name: "Client Privé C", date: "02 Mai 2026", details: "+45 pts" },
          { name: "Client Privé D", date: "18 Avr 2026", details: "+30 pts" },
          { name: "Client Privé E", date: "05 Avr 2026", details: "+20 pts" }
        ],
        eventsList: [
          { name: "Atelier Equipe Hebdo", date: "14 Juin 2026", loc: "En ligne" },
          { name: "Focus Ventes Directes", date: "29 Juin 2026", loc: "En ligne" },
          { name: "Lancement Catalogue Saisonnier", date: "15 Juil 2026", loc: "En ligne" }
        ],
        bestSellersList: [
          { name: node.topProduct, date: "25 Mai 2026", qty: "8 unités" },
          { name: "Émulsion Confort", date: "18 Mai 2026", qty: "5 unités" },
          { name: "Soin des Lèvres Hydra", date: "10 Mai 2026", qty: "4 unités" },
          { name: "Crayon Contour Noir", date: "02 Mai 2026", qty: "3 unités" },
          { name: "Gel Lavant Pur", date: "20 Avr 2026", qty: "2 unités" }
        ],
        meilleuresVentesList: [
          { name: node.topCategory, date: "24 Mai 2026", total: "350 €" },
          { name: "Kit Routine Essentielle", date: "16 Mai 2026", total: "220 €" },
          { name: "Assortiment Parfums Sac", date: "04 Mai 2026", total: "180 €" },
          { name: "Duo Hydratation Totale", date: "22 Avr 2026", total: "130 €" },
          { name: "Pack Accessoires Beauté", date: "08 Avr 2026", total: "90 €" }
        ]
      });
    });
  };

  // Exécution de l'injection des listes par défaut
  if(defaultTree.nodes.length === 3) { completeBaseData(); }

  const [tree, setTree] = useState(() => {
    try {
      const localData = localStorage.getItem('limitless_team_tree_v5');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed?.nodes?.length >= 20) return parsed;
      }
    } catch (e) {}
    return defaultTree;
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree_v5', JSON.stringify(tree));
  }, [tree]);

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', topClient: '', bestSeller: '', meilleuresVentes: '', objectif: '', caNum: '0', objNum: '1000' });

  // 📈 Totaux globaux
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

  const handleResetTree = () => {
    if (window.confirm("⚠️ Réinitialiser tout le réseau aux valeurs d'origine ? Toutes vos saisies seront effacées.")) {
      setTree(defaultTree);
      setTreeRootId(null);
      setEditingId(null);
    }
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

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

    // Création automatique des top listes chronologiques pour les nouveaux inscrits
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
      fidelity: "Initial (0 pts)",
      mdp: newMember.mdp.trim() || "Limitless#123",
      topClientsList: [
        { name: newMember.topClient.trim() || "Aucun client", date: "26 Mai 2026", details: "Client Principal direct" },
        { name: "Client B", date: "20 Mai 2026", details: "Suivi mensuel" },
        { name: "Client C", date: "12 Mai 2026", details: "Premier contact" }
      ],
      eventsList: [
        { name: "Atelier d'intégration digital", date: "05 Juin 2026", loc: "En ligne" },
        { name: "Découverte Gammes Chogan", date: "19 Juin 2026", loc: "En ligne" }
      ],
      bestSellersList: [
        { name: newMember.bestSeller.trim() || "Non défini", date: "25 Mai 2026", qty: "1 unité" }
      ],
      meilleuresVentesList: [
        { name: newMember.meilleuresVentes.trim() || "Non défini", date: "24 Mai 2026", total: `${cNum} €` }
      ]
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

  const visibleRoots = treeRootId ? tree.nodes.filter(n => n.id === treeRootId) : tree.nodes.filter(n => !n.parentId);
  const currentFocusedNode = treeRootId ? tree.nodes.find(n => n.id === treeRootId) : null;
  const parentNodeOfFocused = currentFocusedNode ? tree.nodes.find(n => n.id === currentFocusedNode.parentId) : null;

  const pctProgress = selectedMember ? Math.min(100, Math.round((selectedMember.caNum / (selectedMember.objNum || 1)) * 100)) : 0;

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', background: '#FAF7F2', minHeight: '100vh' }}>
      
      {/* 👑 DASHBOARD GENERAL */}
      <div style={{ 
        maxWidth: '1000px', margin: '0 auto 20px auto', background: 'white', 
        border: '1px solid #D2B795', borderRadius: '14px', padding: '15px 25px', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        boxShadow: '0 4px 15px rgba(210,183,149,0.1)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>📈 Chiffre d'Affaires Global</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d7a4a', marginTop: '4px' }}>{totalCA.toLocaleString()} €</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>🎯 Performance Équipe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4A3E3D' }}>{globalPerformance}%</div>
            <div style={{ width: '120px', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${globalPerformance}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 👑 ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('gestion')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'gestion' ? '#D2B795' : 'white', color: activeTab === 'gestion' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>⚙️ Gestion</button>
      </div>

      {/* 🌳 ARBRE (ACCUEIL) */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {treeRootId && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5px' }}>
              <button onClick={() => setTreeRootId(null)} style={{ background: '#4A3E3D', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>🏠 Accueil Général</button>
              <button onClick={() => setTreeRootId(currentFocusedNode.parentId)} style={{ background: 'white', border: '1px solid #8C6D4F', color: '#8C6D4F', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>⬅️ Niveau Supérieur ({parentNodeOfFocused ? parentNodeOfFocused.name : "Racine"})</button>
            </div>
          )}
          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
              {visibleRoots.map(root => renderTreeNodes(root))}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ GESTION */}
      {activeTab === 'gestion' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Formulaire */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <h3 style={{ marginTop: 0, color: '#4A3E3D', textAlign: 'center', fontSize: '15px' }}>✨ Inscrire un nouveau membre</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Nom & Prénom" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                <input style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Mot de passe" value={newMember.mdp} onChange={e => setNewMember({...newMember, mdp: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Objectif personnel" value={newMember.objectif} onChange={e => setNewMember({...newMember, objectif: e.target.value})} />
                <input type="number" style={{ flex: 1, minWidth: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Objectif (€)" value={newMember.objNum} onChange={e => setNewMember({...newMember, objNum: e.target.value})} />
                <input type="number" style={{ flex: 1, minWidth: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="CA Initial (€)" value={newMember.caNum} onChange={e => setNewMember({...newMember, caNum: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Top Client" value={newMember.topClient} onChange={e => setNewMember({...newMember, topClient: e.target.value})} />
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Best-seller produit" value={newMember.bestSeller} onChange={e => setNewMember({...newMember, bestSeller: e.target.value})} />
                <input style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0' }} placeholder="Meilleures ventes" value={newMember.meilleuresVentes} onChange={e => setNewMember({...newMember, meilleuresVentes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.genre} onChange={e => setNewMember({...newMember, genre: e.target.value})}><option value="femme">👩 Femme</option><option value="homme">👨 Homme</option></select>
                <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}><option value="Consultante">Consultante</option><option value="Manager">Manager</option><option value="Marraine">Marraine</option></select>
              </div>
              <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember({...newMember, parentId: e.target.value})}><option value="">— Aucun parrain —</option>{tree.nodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <button onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Ajouter à l'organisation</button>
            </div>
          </div>

          {/* Tableau Administrateur */}
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px' }}>Conseiller(e)</th>
                  <th style={{ padding: '12px' }}>Rôle</th>
                  <th style={{ padding: '12px', color: '#8C6D4F' }}>🔑 Mot de Passe</th>
                  <th style={{ padding: '12px' }}>Chiffre d'Affaires</th>
                  <th style={{ padding: '12px' }}>Objectif Personnel</th>
                  <th style={{ padding: '12px' }}>Taux Réal.</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map(n => {
                  const isEditing = editingId === n.id;
                  const currentForm = isEditing ? editForm : n;
                  const pct = Math.min(100, Math.round((currentForm.caNum / (currentForm.objNum || 1)) * 100));
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)', background: isEditing ? '#FFFDF9' : 'none' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#4A3E3D' }}>{isEditing ? <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '140px' }} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : <>{n.genre === 'homme' ? '👨 ' : '👩 '}{n.name}</>}</td>
                      <td style={{ padding: '12px' }}>{isEditing ? <select style={{ padding: '5px', borderRadius: '6px', border: '1px solid #D2B795' }} value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}><option value="Consultante">Consultante</option><option value="Manager">Manager</option><option value="Marraine">Marraine</option></select> : displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#B39266' }}>{isEditing ? <input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '120px' }} value={editForm.mdp} onChange={e => setEditForm({...editForm, mdp: e.target.value})} /> : (n.mdp || "Non défini")}</td>
                      <td style={{ padding: '12px' }}>{isEditing ? <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="number" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '80px' }} value={editForm.caNum} onChange={e => setEditForm({...editForm, caNum: e.target.value})} /> €</div> : <span style={{ color: '#2d7a4a', fontWeight: '600' }}>{n.ca || "0 €"}</span>}</td>
                      <td style={{ padding: '12px' }}>{isEditing ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><input style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '150px' }} value={editForm.objectif} onChange={e => setEditForm({...editForm, objectif: e.target.value})} /><input type="number" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D2B795', width: '80px' }} value={editForm.objNum} onChange={e => setEditForm({...editForm, objNum: e.target.value})} /></div> : <span style={{ color: '#666', fontSize: '12px' }}>{n.objectif || "—"}</span>}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: pct >= 80 ? '#2d7a4a' : '#8C6D4F' }}>{pct}%</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{isEditing ? <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}><button onClick={saveRowEdits} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>💾</button><button onClick={() => setEditingId(null)} style={{ background: '#777', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>❌</button></div> : <button onClick={() => startEditing(n)} style={{ background: '#FAF5EE', border: '1px solid #D2B795', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#8C6D4F' }}>✏️ Modifier</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}><button onClick={handleResetTree} style={{ background: 'white', color: '#b93c3c', border: '1px solid #b93c3c', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>⚠️ Réinitialiser le réseau par défaut</button></div>
        </div>
      )}

      {/* 👑 MODAL ENRICHI AVEC ZOOM CHRONOLOGIQUE ET TOP 5 (Du plus récent au plus ancien) */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '10px' }}>
          <div style={{ background: 'white', border: '2px solid #D2B795', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '12px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#777' }}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #F0E6DA', paddingBottom: '12px' }}>
              <div style={{ fontSize: '36px', marginBottom: '4px' }}>{selectedMember.genre === 'homme' ? '👨' : '👩'}</div>
              <h3 style={{ margin: '4px 0', color: '#4A3E3D', fontSize: '20px' }}>{selectedMember.name}</h3>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '4px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{displayRole(selectedMember.role, selectedMember.genre)}</span>
            </div>

            {/* Barre d'objectif */}
            <div style={{ background: '#FAF5EE', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.4)', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4A3E3D', fontWeight: '700', marginBottom: '4px' }}>
                <span>🎯 Objectif Personnel :</span>
                <span style={{ color: '#8C6D4F' }}>{pctProgress}% Réalisé</span>
              </div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>"{selectedMember.objectif || "Non défini"}"</div>
              <div style={{ width: '100%', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pctProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
              </div>
            </div>

            {/* Chiffre d'Affaires Global en avant */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0F9F4', padding: '10px 14px', borderRadius: '10px', borderLeft: '4px solid #2d7a4a', marginBottom: '15px' }}>
              <span style={{ color: '#2d7a4a', fontWeight: '600', fontSize: '13px' }}>📊 Chiffre d'Affaires Actuel :</span>
              <span style={{ color: '#2d7a4a', fontWeight: '800', fontSize: '16px' }}>{selectedMember.ca || "0 €"}</span>
            </div>

            {/* Chronologie Activité Détaillée */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 🏆 FIDÉLITÉ & TOP 5 CLIENTS */}
              <div style={{ border: '1px solid #E6DCD0', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#8C6D4F', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🏆 Fidélité : {selectedMember.fidelity || "Niveau Initial"}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#A18A68', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>👑 Top 5 Clients (Du + récent au - récent)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedMember.topClientsList || []).map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '5px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '500', color: '#4A3E3D' }}>{idx+1}. {c.name}</span>
                      <span style={{ color: '#888', fontSize: '11px' }}>{c.date} — {c.details}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📅 ÉVÉNEMENTS (3 PROCHAINS) */}
              <div style={{ border: '1px solid #E6DCD0', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#4A3E3D', marginBottom: '6px' }}>📅 3 Prochains Événements Planning</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedMember.eventsList || []).slice(0,3).map((e, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '5px 8px', borderRadius: '4px', fontSize: '12px', borderLeft: '2px solid #8C6D4F' }}>
                      <span style={{ fontWeight: '600', color: '#4A3E3D' }}>{e.name}</span>
                      <span style={{ color: '#8C6D4F', fontWeight: '500', fontSize: '11px' }}>{e.date} ({e.loc})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💄 TOP 5 BEST-SELLERS PRODUITS */}
              <div style={{ border: '1px solid #E6DCD0', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#8C6D4F', marginBottom: '4px' }}>💄 Top 5 Best-Sellers Produits</div>
                <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px' }}>Classement par ordre de vente récent</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedMember.bestSellersList || []).map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '5px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      <span style={{ color: '#4A3E3D' }}>{idx+1}. {b.name}</span>
                      <span style={{ color: '#2d7a4a', fontWeight: '600', fontSize: '11px' }}>{b.qty} <span style={{ color: '#888', fontWeight: 'normal' }}>({b.date})</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📈 TOP 5 MEILLEURES VENTES */}
              <div style={{ border: '1px solid #E6DCD0', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#4A3E3D', marginBottom: '4px' }}>📈 Top 5 Catégories & Volumes Enregistrés</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedMember.meilleuresVentesList || []).map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#FDFBF9', padding: '5px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      <span style={{ color: '#666' }}>{idx+1}. {m.name}</span>
                      <span style={{ color: '#8C6D4F', fontWeight: '700' }}>{m.total} <span style={{ color: '#aaa', fontSize: '10px', fontWeight: 'normal' }}>({m.date})</span></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions de la modal */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => { setTreeRootId(selectedMember.id); setSelectedMember(null); }}
                style={{ width: '100%', padding: '12px', background: '#D2B795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                🔍 Filtrer et zoomer sur ce réseau
              </button>
              <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '12px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Fermer les détails</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

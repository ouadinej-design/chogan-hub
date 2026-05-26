import React, { useState, useEffect } from 'react';
import { userStore } from '../../utils/storage'; 

// --- Composant Jauge Circulaire ---
const Gauge = ({ percentage }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#E6DCD0" strokeWidth="8" />
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#2d7a4a" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4A3E3D">{percentage}%</text>
    </svg>
  );
};

// --- Composant Badge de performance ---
const PerformanceBadge = ({ ca, obj }) => {
  const pct = Math.round((ca / (obj || 1)) * 100);
  if (pct >= 100) return <span style={{ background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>🔥 TOP</span>;
  if (pct >= 70) return <span style={{ background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>⚡ OK</span>;
  return <span style={{ background: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>⚠️ RELANCER</span>;
};

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);

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
      return localData ? JSON.parse(localData) : defaultTree;
    } catch (e) { return defaultTree; }
  });

  useEffect(() => { localStorage.setItem('limitless_team_tree_v4', JSON.stringify(tree)); }, [tree]);

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', caNum: '0', objNum: '1000', objectif: '', topClient: '', bestSeller: '', meilleuresVentes: '' });

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const newNode = {
      ...newMember,
      id: Date.now().toString(),
      ca: `${newMember.caNum} €`,
      caNum: parseFloat(newMember.caNum) || 0,
      objNum: parseFloat(newMember.objNum) || 1000
    };
    setTree({ nodes: [...tree.nodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', caNum: '0', objNum: '1000', objectif: '', topClient: '', bestSeller: '', meilleuresVentes: '' });
  };

  const renderTreeNodes = (node) => {
    const enfants = tree.nodes.filter(n => n.parentId === node.id);
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div onClick={() => setSelectedMember(node)} style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '12px', padding: '10px', minWidth: '140px', textAlign: 'center', cursor: 'pointer', margin: '5px' }}>
          <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#8C6D4F' }}>{node.role.toUpperCase()}</div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>{node.name}</div>
          <PerformanceBadge ca={node.caNum} obj={node.objNum} />
        </div>
        {enfants.length > 0 && <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>{enfants.map(e => renderTreeNodes(e))}</div>}
      </div>
    );
  };

  const totalCA = tree.nodes.reduce((sum, n) => sum + (n.caNum || 0), 0);
  const totalObj = tree.nodes.reduce((sum, n) => sum + (n.objNum || 0), 0);
  const avgPerf = totalObj > 0 ? Math.round((totalCA / totalObj) * 100) : 0;

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#8C6D4F', fontWeight: 'bold' }}>CA TOTAL</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#2d7a4a' }}>{totalCA.toLocaleString()} €</div>
        </div>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#8C6D4F', fontWeight: 'bold' }}>PERF.</div>
          <Gauge percentage={avgPerf} />
        </div>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '14px', border: '1px solid #D2B795', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#8C6D4F', fontWeight: 'bold' }}>MEMBRES</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#4A3E3D', marginTop: '10px' }}>{tree.nodes.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '8px 16px', borderRadius: '20px', background: activeTab === 'arbre' ? '#D2B795' : 'white' }}>Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ padding: '8px 16px', borderRadius: '20px', background: activeTab === 'tableau' ? '#D2B795' : 'white' }}>Gestion</button>
      </div>

      {activeTab === 'arbre' ? (
        <div style={{ overflowX: 'auto' }}>{tree.nodes.filter(n => !n.parentId).map(root => renderTreeNodes(root))}</div>
      ) : (
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #D2B795' }}>
          <h3>Ajouter un membre</h3>
          <input placeholder="Nom" onChange={e => setNewMember({...newMember, name: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }} />
          <button onClick={handleAddMember} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '10px', width: '100%' }}>Ajouter</button>
        </div>
      )}

      {selectedMember && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background: 'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', width: '320px' }}>
            <h3>{selectedMember.name}</h3>
            <p><strong>CA :</strong> {selectedMember.ca}</p>
            <p><strong>Objectif :</strong> {selectedMember.objectif}</p>
            <p><strong>Fidélité :</strong> {selectedMember.fidelity}</p>
            <p><strong>Top Client :</strong> {selectedMember.topClient}</p>
            <button onClick={() => setSelectedMember(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

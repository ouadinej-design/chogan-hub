Import React, { useState, useEffect } from 'react';
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

// --- Composant Badge ---
const PerformanceBadge = ({ ca, obj }) => {
  const pct = Math.round((ca / (obj || 1)) * 100);
  if (pct >= 100) return <span style={{ background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>🔥 TOP</span>;
  if (pct >= 70) return <span style={{ background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>⚡ OK</span>;
  return <span style={{ background: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold' }}>⚠️ RELANCER</span>;
};

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);

  const [tree, setTree] = useState({
    nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, ca: "12 500 €", caNum: 12500, objNum: 15000, objectif: "Atteindre 15 000 €", events: "Séminaire, Masterclass", fidelity: "Platine", mdp: "Limitless*2026A", topClient: "Sarah B.", bestSeller: "Parfum Luxe", ventes: "Pack Élite" },
      { id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", ca: "8 400 €", caNum: 8400, objNum: 10000, objectif: "Atteindre 10 000 €", events: "Masterclass", fidelity: "Or", mdp: "Limitless*2026B", topClient: "Amine M.", bestSeller: "Sérum", ventes: "Gamme Corps" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 100 €", caNum: 2100, objNum: 3000, objectif: "Atteindre 3 000 €", events: "Atelier", fidelity: "Argent", mdp: "Soumia#Lmtl", topClient: "Léa R.", bestSeller: "Huile", ventes: "Maquillage" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 850 €", caNum: 1850, objNum: 2000, objectif: "Valider 2 000 €", events: "Atelier", fidelity: "Bronze", mdp: "Nawel#Lmtl", topClient: "Yasmine K.", bestSeller: "Rouge", ventes: "Coffrets" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 400 €", caNum: 3400, objNum: 4000, objectif: "Statut Marraine", events: "Boost", fidelity: "Argent", mdp: "Selma#Lmtl", topClient: "Chloé D.", bestSeller: "Crème", ventes: "Rituels" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie", ca: "950 €", caNum: 950, objNum: 1500, objectif: "Atteindre 1 500 €", events: "Webinar", fidelity: "Initial", mdp: "Sophia#Lmtl", topClient: "Inès H.", bestSeller: "Parfum", ventes: "Brumes" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 200 €", caNum: 1200, objNum: 2000, objectif: "Niveau Argent", events: "Atelier", fidelity: "Bronze", mdp: "Baya#Lmtl", topClient: "Nadia M.", bestSeller: "Gel", ventes: "Visage" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie", ca: "4 200 €", caNum: 4200, objNum: 5000, objectif: "Atteindre 5 000 €", events: "Boost", fidelity: "Or", mdp: "Milene#Lmtl", topClient: "Élodie M.", bestSeller: "Élixir", ventes: "Cures" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 800 €", caNum: 2800, objNum: 3000, objectif: "Objectif Argent", events: "Atelier", fidelity: "Argent", mdp: "Sarah#Lmtl", topClient: "Myriam B.", bestSeller: "Mascara", ventes: "Palettes" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 600 €", caNum: 1600, objNum: 2000, objectif: "Atteindre 2 000 €", events: "Atelier", fidelity: "Bronze", mdp: "NadiaB#Lmtl", topClient: "Sabrina T.", bestSeller: "Gommage", ventes: "Douche" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie", ca: "750 €", caNum: 750, objNum: 1000, objectif: "Niveau Bronze", events: "Webinar", fidelity: "Initial", mdp: "Shaima#Lmtl", topClient: "Lina A.", bestSeller: "Baume", ventes: "Soin" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie", ca: "3 100 €", caNum: 3100, objNum: 4000, objectif: "Atteindre 4 000 €", events: "Boost", fidelity: "Argent", mdp: "Melissa#Lmtl", topClient: "Emma B.", bestSeller: "Fond de Teint", ventes: "Teint" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie", ca: "1 150 €", caNum: 1150, objNum: 1500, objectif: "Atteindre 1 500 €", events: "Atelier", fidelity: "Bronze", mdp: "Cassandra#Lmtl", topClient: "Julie P.", bestSeller: "Lotion", ventes: "Pureté" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie", ca: "2 400 €", caNum: 2400, objNum: 3000, objectif: "Atteindre 3 000 €", events: "Atelier", fidelity: "Argent", mdp: "Meryem#Lmtl", topClient: "Fatiha K.", bestSeller: "Parfum", ventes: "Orientale" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie", ca: "5 300 €", caNum: 5300, objNum: 6000, objectif: "Atteindre 6 000 €", events: "Boost", fidelity: "Or", mdp: "Karim#Lmtl", topClient: "Thomas D.", bestSeller: "Soin Homme", ventes: "Barbier" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 200 €", caNum: 6200, objNum: 7500, objectif: "Lignée directe", events: "Masterclass", fidelity: "Or", mdp: "NadiaN#Lmtl", topClient: "Farida B.", bestSeller: "Sérum", ventes: "Éclat" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie", ca: "5 900 €", caNum: 5900, objNum: 7000, objectif: "Atteindre 7 000 €", events: "Masterclass", fidelity: "Or", mdp: "Isabelle#Lmtl", topClient: "Sophie M.", bestSeller: "Crème", ventes: "Hiver" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie", ca: "6 000 €", caNum: 6000, objNum: 8000, objectif: "Séminaire Élite", events: "Masterclass", fidelity: "Or", mdp: "Blandine#Lmtl", topClient: "Valérie S.", bestSeller: "Masque", ventes: "Spa" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "1 300 €", caNum: 1300, objNum: 2000, objectif: "Atteindre 2 000 €", events: "Atelier", fidelity: "Bronze", mdp: "Tracy#Lmtl", topClient: "Camille L.", bestSeller: "Crayon", ventes: "Regard" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n", ca: "900 €", caNum: 900, objNum: 1500, objectif: "Palier Bronze", events: "Webinar", fidelity: "Initial", mdp: "Yasmin#Lmtl", topClient: "Sonia A.", bestSeller: "Gloss", ventes: "Lèvres" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "3 800 €", caNum: 3800, objNum: 5000, objectif: "Atteindre 5 000 €", events: "Boost", fidelity: "Argent", mdp: "Anita#Lmtl", topClient: "Manon R.", bestSeller: "Eau", ventes: "Démaquillant" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle", ca: "2 250 €", caNum: 2250, objNum: 3000, objectif: "Objectif Argent", events: "Atelier", fidelity: "Argent", mdp: "Khayra#Lmtl", topClient: "Houria B.", bestSeller: "Brume", ventes: "Teint" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine", ca: "4 100 €", caNum: 4100, objNum: 5000, objectif: "Atteindre 5 000 €", events: "Boost", fidelity: "Or", mdp: "Yasmina#Lmtl", topClient: "Nathalie R.", bestSeller: "Concentré", ventes: "Sérums" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine", ca: "1 980 €", caNum: 1980, objNum: 2500, objectif: "Atteindre 2 500 €", events: "Atelier", fidelity: "Bronze", mdp: "Adam#Lmtl", topClient: "Lucas M.", bestSeller: "Douche", ventes: "Corps" }
    ]
  });
  useEffect(() => {
    localStorage.setItem('limitless_team_tree_v4', JSON.stringify(tree));
  }, [tree]);

  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', caNum: '0', objNum: '1000', objectif: '', topClient: '', bestSeller: '', ventes: '' });

  const totalCA = tree.nodes.reduce((sum, n) => sum + (n.caNum || 0), 0);
  const totalObj = tree.nodes.reduce((sum, n) => sum + (n.objNum || 0), 0);
  const avgPerf = totalObj > 0 ? Math.round((totalCA / totalObj) * 100) : 0;

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
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', caNum: '0', objNum: '1000', objectif: '', topClient: '', bestSeller: '', ventes: '' });
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
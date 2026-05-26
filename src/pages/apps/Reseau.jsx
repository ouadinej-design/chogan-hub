import React, { useState, useEffect } from 'react';

// --- Composant Jauge ---
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

  const [tree, setTree] = useState(() => {
    const saved = localStorage.getItem('limitless_team_tree_v4');
    return saved ? JSON.parse(saved) : { nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", caNum: 12500, objNum: 15000, parentId: null },
      { id: "marie", name: "Marie OUADI", role: "Marraine", caNum: 8400, objNum: 10000, parentId: "kheira_b" }
    ]};
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree_v4', JSON.stringify(tree));
  }, [tree]);

  const renderNodes = (node) => {
    const kids = tree.nodes.filter(n => n.parentId === node.id);
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div onClick={() => setSelectedMember(node)} style={{ background: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #D2B795', margin: '5px', cursor: 'pointer' }}>
          <div style={{ fontSize: '10px', color: '#8C6D4F' }}>{node.role}</div>
          <div style={{ fontWeight: '600' }}>{node.name}</div>
          <PerformanceBadge ca={node.caNum} obj={node.objNum} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>{kids.map(child => renderNodes(child))}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{fontSize: '12px', color: '#8C6D4F'}}>CA TOTAL</div>
            <div style={{fontSize: '20px', fontWeight: 'bold'}}>{tree.nodes.reduce((a, b) => a + b.caNum, 0)} €</div>
        </div>
        <Gauge percentage={Math.round((tree.nodes.reduce((a,b) => a + b.caNum, 0) / tree.nodes.reduce((a,b) => a + b.objNum, 0)) * 100)} />
      </div>

      {activeTab === 'arbre' ? (
        <div style={{ overflowX: 'auto' }}>{tree.nodes.filter(n => !n.parentId).map(root => renderNodes(root))}</div>
      ) : (
        <div>/* Section gestion à compléter */</div>
      )}

      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px' }}>
            <h3>{selectedMember.name}</h3>
            <p>CA : {selectedMember.caNum} €</p>
            <button onClick={() => setSelectedMember(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

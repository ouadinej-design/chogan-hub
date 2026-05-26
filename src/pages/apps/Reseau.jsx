import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const { getAllConsultants } = useAuth();
  const [activeTab, setActiveTab] = useState('arbre');
  const [treeNodes, setTreeNodes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const injecterEquipeComplete = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null, mdp: "Kheira#2026", objNum: 10000 },
      { id: "marie-m", name: "Marie", role: "Marraine", parentId: "admin-kheira", mdp: "Marie#2026", objNum: 5000 },
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem"].map(n => ({ id: `cons-${n}`, name: n, role: "Consultante", parentId: "admin-kheira", mdp: `${n}#2026`, objNum: 1500 })),
      { id: "karim-c", name: "Karim", role: "Consultante", parentId: "admin-kheira", mdp: "Karim#2026", objNum: 2000 },
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie-m", mdp: "Nadia#2026", objNum: 3000 },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie-m", mdp: "Isabelle#2026", objNum: 3000 },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie-m", mdp: "Blandine#2026", objNum: 3000 },
      { id: "tracy", name: "Tracy", role: "Consultante", parentId: "nadia-n", mdp: "Tracy#2026", objNum: 1000 },
      { id: "yasmin", name: "Yasmin", role: "Consultante", parentId: "nadia-n", mdp: "Yasmin#2026", objNum: 1000 },
      { id: "anita", name: "Anita", role: "Consultante", parentId: "isabelle", mdp: "Anita#2026", objNum: 1000 },
      { id: "khayra", name: "Khayra", role: "Consultante", parentId: "isabelle", mdp: "Khayra#2026", objNum: 1000 },
      { id: "yasmina", name: "Yasmina", role: "Consultante", parentId: "blandine", mdp: "Yasmina#2026", objNum: 1000 },
      { id: "adam", name: "Adam", role: "Consultante", parentId: "blandine", mdp: "Adam#2026", objNum: 1000 }
    ];
    store.set('consultants', equipe);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const rawNodes = store.get('consultants', []);
    setTreeNodes(rawNodes);
  }, [refreshKey]);

  // Design compact des cartes
  const Card = ({ node }) => (
    <div style={{ 
      background: 'white', border: '1px solid #D2B795', borderRadius: '8px', 
      padding: '8px', margin: '4px', minWidth: '100px', textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{node.name}</div>
      <div style={{ fontSize: '10px', color: '#8C6D4F' }}>{node.role}</div>
    </div>
  );

  const renderTree = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ marginLeft: '15px', borderLeft: '1px solid #D2B795' }}>
        {children.map(child => (
          <div key={child.id}>
            <Card node={child} />
            {renderTree(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh' }}>
      <button onClick={injecterEquipeComplete} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: '#D2B795', marginBottom: '20px', borderRadius: '8px', border: 'none' }}>
        ⚡ Recharger l'équipe
      </button>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px' }}>Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px' }}>Tableau</button>
      </div>

      {activeTab === 'arbre' ? (
        <div>
          {treeNodes.filter(n => !n.parentId).map(root => (
            <div key={root.id}>
              <Card node={root} />
              {renderTree(root.id)}
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: '100%', background: 'white' }}>
          <tbody>
            {treeNodes.map(n => <tr key={n.id}><td>{n.name}</td><td>{n.role}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}

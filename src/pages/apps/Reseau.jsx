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
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null, mdp: "Kheira#2026" },
      { id: "marie-m", name: "Marie", role: "Marraine", parentId: "admin-kheira", mdp: "Marie#2026" },
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie-m", mdp: "Nadia#2026" },
      { id: "tracy", name: "Tracy", role: "Consultante", parentId: "nadia-n", mdp: "Tracy#2026" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", parentId: "nadia-n", mdp: "Yasmin#2026" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie-m", mdp: "Isabelle#2026" },
      { id: "anita", name: "Anita", role: "Consultante", parentId: "isabelle", mdp: "Anita#2026" },
      { id: "khayra", name: "Khayra", role: "Consultante", parentId: "isabelle", mdp: "Khayra#2026" },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie-m", mdp: "Blandine#2026" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", parentId: "blandine", mdp: "Yasmina#2026" },
      { id: "adam", name: "Adam", role: "Consultante", parentId: "blandine", mdp: "Adam#2026" },
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem", "Karim"].map(n => ({ id: `cons-${n}`, name: n, role: "Consultante", parentId: "admin-kheira", mdp: `${n}#2026` }))
    ];
    store.set('consultants', equipe);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    setTreeNodes(store.get('consultants', []));
  }, [refreshKey]);

  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ marginLeft: '20px', borderLeft: '2px solid #D2B795', paddingLeft: '10px' }}>
        {children.map(child => (
          <div key={child.id} style={{ marginTop: '10px' }}>
            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #E0D0C0', display: 'inline-block' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{child.name}</div>
              <div style={{ fontSize: '10px', color: '#8C6D4F' }}>{child.role}</div>
            </div>
            {renderNodes(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <button onClick={injecterEquipeComplete} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: '#D2B795', marginBottom: '20px', borderRadius: '8px', border: 'none' }}>
        ⚡ Recharger l'équipe
      </button>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', background: activeTab === 'arbre' ? '#4A3E3D' : '#D2B795', color: 'white', border: 'none', borderRadius: '8px' }}>Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', background: activeTab === 'tableau' ? '#4A3E3D' : '#D2B795', color: 'white', border: 'none', borderRadius: '8px' }}>Tableau</button>
      </div>

      {activeTab === 'arbre' ? (
        <div>
          {treeNodes.filter(n => !n.parentId).map(root => (
            <div key={root.id}>
              <div style={{ padding: '10px', background: '#F5EFE8', borderRadius: '8px', display: 'inline-block', fontWeight: 'bold' }}>{root.name} ({root.role})</div>
              {renderNodes(root.id)}
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: '100%', background: 'white', borderRadius: '8px', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#F5EFE8' }}><th style={{ padding: '8px' }}>Nom</th><th>Rôle</th></tr></thead>
          <tbody>{treeNodes.map(n => <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>{n.name}</td><td>{n.role}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

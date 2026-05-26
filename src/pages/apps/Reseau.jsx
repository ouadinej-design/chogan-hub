import React, { useState, useEffect } from 'react';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [treeNodes, setTreeNodes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Initialisation de la structure (ta structure initiale)
  const synchroniserReseau = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null, objNum: 10000 },
      { id: "marie", name: "Marie", role: "Marraine", parentId: "admin-kheira", objNum: 5000 },
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem", "Karim"].map(n => ({ id: `cons-${n.toLowerCase()}`, name: n, role: "Consultante", parentId: "admin-kheira", objNum: 1500 })),
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie", objNum: 3000 },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie", objNum: 3000 },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie", objNum: 3000 },
      { id: "tracy", name: "Tracy", role: "Consultante", parentId: "nadia-n", objNum: 1000 },
      { id: "yasmin", name: "Yasmin", role: "Consultante", parentId: "nadia-n", objNum: 1000 },
      { id: "anita", name: "Anita", role: "Consultante", parentId: "isabelle", objNum: 1000 },
      { id: "khayra", name: "Khayra", role: "Consultante", parentId: "isabelle", objNum: 1000 },
      { id: "yasmina", name: "Yasmina", role: "Consultante", parentId: "blandine", objNum: 1000 },
      { id: "adam", name: "Adam", role: "Consultante", parentId: "blandine", objNum: 1000 }
    ];
    store.set('consultants', equipe);
    setRefreshKey(prev => prev + 1);
  };

  // 2. Calcul des données réelles pour chaque membre
  useEffect(() => {
    const rawNodes = store.get('consultants', []);
    const data = rawNodes.map(c => {
      const db = userStore(c.id);
      const orders = db?.get('orders', []) || [];
      const caNum = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      return { 
        ...c, 
        ca: `${caNum.toLocaleString()} €` 
      };
    });
    setTreeNodes(data);
  }, [refreshKey]);

  // 3. Affichage récursif (ta structure initiale)
  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ marginLeft: '20px', borderLeft: '2px solid #D2B795', paddingLeft: '10px' }}>
        {children.map(child => (
          <div key={child.id} style={{ marginTop: '10px' }}>
            <div style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #E0D0C0', display: 'inline-block' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{child.name}</div>
              <div style={{ fontSize: '10px', color: '#8C6D4F' }}>{child.role} • {child.ca}</div>
            </div>
            {renderNodes(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <button onClick={synchroniserReseau} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: '#D2B795', border: 'none', borderRadius: '8px', marginBottom: '20px' }}>
        ⚡ Synchroniser l'organisation
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', background: activeTab === 'arbre' ? '#4A3E3D' : '#D2B795', color: 'white', border: 'none', borderRadius: '8px' }}>Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', background: activeTab === 'tableau' ? '#4A3E3D' : '#D2B795', color: 'white', border: 'none', borderRadius: '8px' }}>Tableau</button>
      </div>

      {activeTab === 'arbre' ? (
        <div>{treeNodes.filter(n => !n.parentId).map(root => (
          <div key={root.id}>
            <div style={{ padding: '10px', background: '#F5EFE8', borderRadius: '8px', display: 'inline-block', fontWeight: 'bold' }}>{root.name} ({root.role})</div>
            {renderNodes(root.id)}
          </div>
        ))}</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#F5EFE8' }}><th style={{ padding: '8px' }}>Nom</th><th>Rôle</th><th>CA</th></tr></thead>
            <tbody>{treeNodes.map(n => <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>{n.name}</td><td>{n.role}</td><td>{n.ca}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

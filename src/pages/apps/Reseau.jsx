
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const { getAllConsultants } = useAuth();
  const { log } = useData();
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
    const data = rawNodes.map(c => {
      const userDb = userStore(c.id);
      const orders = userDb?.get('orders', []) || [];
      const caNum = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const clients = userDb?.get('clients', []) || [];
      const top = clients.length > 0 ? [...clients].sort((a,b) => b.totalSpent - a.totalSpent)[0] : {firstName: "Aucun"};
      const pct = Math.min(100, Math.round((caNum / (c.objNum || 1000)) * 100));
      return { ...c, caNum, ca: `${caNum.toLocaleString()} €`, pct, top: top.firstName };
    });
    setTreeNodes(data);
  }, [refreshKey]);

  const MemberCard = ({ m }) => (
    <div style={{ background: 'white', border: '1px solid #E0D0C0', borderRadius: '12px', padding: '12px', width: '160px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
      <div style={{ fontWeight: 'bold', color: '#4A3E3D' }}>{m.name}</div>
      <div style={{ fontSize: '10px', color: '#8C6D4F', textTransform: 'uppercase', marginBottom: '8px' }}>{m.role}</div>
      <div style={{ fontSize: '12px', color: '#2d7a4a', fontWeight: 'bold' }}>{m.ca}</div>
      <div style={{ width: '100%', height: '4px', background: '#eee', margin: '6px 0', borderRadius: '2px' }}>
        <div style={{ width: `${m.pct}%`, height: '100%', background: '#D2B795' }} />
      </div>
      <div style={{ fontSize: '9px', color: '#666' }}>Top Client: {m.top}</div>
    </div>
  );

  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    return (
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {children.map(child => (
          <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MemberCard m={child} />
            {renderNodes(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: activeTab === 'arbre' ? '#4A3E3D' : '#D2B795', color: 'white' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: activeTab === 'tableau' ? '#4A3E3D' : '#D2B795', color: 'white' }}>📊 Tableau</button>
      </div>

      <button onClick={injecterEquipeComplete} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: '#D2B795', border: 'none', borderRadius: '8px', marginBottom: '20px' }}>⚡ Synchroniser les données</button>

      {activeTab === 'arbre' ? (
        <div>{treeNodes.filter(n => !n.parentId).map(root => (<div key={root.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><MemberCard m={root} />{renderNodes(root.id)}</div>))}</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#F5EFE8' }}><th style={{ padding: '10px' }}>Nom</th><th>CA</th><th>Progression</th><th>Mdp</th></tr></thead>
            <tbody>{treeNodes.map(n => <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{n.name}</td><td>{n.ca}</td><td>{n.pct}%</td><td>{n.mdp}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

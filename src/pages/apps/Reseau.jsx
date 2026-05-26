import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const { getAllConsultants } = useAuth();
  const { log } = useData();
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeNodes, setTreeNodes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Initialisation : Structure complète de l'équipe
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
    alert("✅ Équipe et hiérarchie mises à jour !");
  };

  // 2. Calcul dynamique des données (CA, progression, etc.)
  useEffect(() => {
    const rawNodes = store.get('consultants', []);
    const data = rawNodes.map(c => {
      const userDb = userStore(c.id);
      const orders = userDb?.get('orders', []) || [];
      const caNum = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const pct = Math.min(100, Math.round((caNum / (c.objNum || 1000)) * 100));
      return { ...c, caNum, ca: `${caNum.toLocaleString()} €`, pct };
    });
    setTreeNodes(data);
  }, [refreshKey]);

  // 3. Rendu visuel Arbre
  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {children.map(child => (
          <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div onClick={() => setSelectedMember(child)} style={{ padding: '8px', border: '1px solid #D2B795', borderRadius: '8px', background: 'white', minWidth: '85px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{child.name}</div>
              <div style={{ fontSize: '9px', color: '#8C6D4F' }}>{child.role}</div>
            </div>
            {renderNodes(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'tableau' ? '#D2B795' : 'white' }}>📊 Tableau</button>
      </div>

      <button onClick={injecterEquipeComplete} style={{ width: '100%', marginBottom: '20px', padding: '10px', background: '#4A3E3D', color: '#D2B795', border: 'none', borderRadius: '8px' }}>⚡ Synchroniser les données</button>

      {activeTab === 'arbre' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {treeNodes.filter(n => !n.parentId).map(root => (
            <div key={root.id} style={{ textAlign: 'center' }}>
              <div onClick={() => setSelectedMember(root)} style={{ padding: '10px', border: '2px solid #4A3E3D', borderRadius: '8px', background: '#F5EFE8' }}><strong>{root.name}</strong></div>
              {renderNodes(root.id)}
            </div>
          ))}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F5EFE8' }}><th>Nom</th><th>Rôle</th><th>CA</th><th>Progression</th></tr>
          </thead>
          <tbody>
            {treeNodes.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{n.name}</td><td>{n.role}</td><td>{n.ca}</td><td>{n.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedMember && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'white', padding: '20px', borderTop: '2px solid #D2B795', borderRadius: '20px 20px 0 0' }}>
          <h3>{selectedMember.name}</h3>
          <p>🔑 Code : {selectedMember.mdp}</p>
          <p>📊 CA : {selectedMember.ca}</p>
          <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '10px' }}>Fermer</button>
        </div>
      )}
    </div>
  );
}

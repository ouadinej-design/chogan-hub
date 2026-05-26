import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeData, setTreeData] = useState([]);

  const synchroniserReseau = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null, objNum: 10000 },
      { id: "marie", name: "Marie", role: "Marraine", parentId: "admin-kheira", objNum: 5000 },
      // Consultantes directes de Kheira
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem", "Karim"].map(n => ({ id: `cons-${n.toLowerCase()}`, name: n, role: "Consultante", parentId: "admin-kheira", objNum: 1500 })),
      // Marraines sous Marie
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie", objNum: 3000 },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie", objNum: 3000 },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie", objNum: 3000 },
      // Consultantes sous Nadia N
      { id: "tracy", name: "Tracy", role: "Consultante", parentId: "nadia-n", objNum: 1000 },
      { id: "yasmin", name: "Yasmin", role: "Consultante", parentId: "nadia-n", objNum: 1000 },
      // Consultantes sous Isabelle
      { id: "anita", name: "Anita", role: "Consultante", parentId: "isabelle", objNum: 1000 },
      { id: "khayra", name: "Khayra", role: "Consultante", parentId: "isabelle", objNum: 1000 },
      // Consultantes sous Blandine
      { id: "yasmina", name: "Yasmina", role: "Consultante", parentId: "blandine", objNum: 1000 },
      { id: "adam", name: "Adam", role: "Consultante", parentId: "blandine", objNum: 1000 }
    ];
    
    store.set('consultants', equipe);
    rechargerDonnees();
    alert("✅ Équipe complète synchronisée avec succès !");
  };

  const rechargerDonnees = () => {
    const base = store.get('consultants', []);
    const dataCalculee = base.map(membre => {
      const db = userStore(membre.id);
      const orders = db?.get('orders', []) || [];
      const caTotal = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      return {
        ...membre,
        caNum: caTotal,
        ca: `${caTotal.toLocaleString()} €`,
        pct: Math.min(100, Math.round((caTotal / (membre.objNum || 1000)) * 100))
      };
    });
    setTreeData(dataCalculee);
  };

  useEffect(() => {
    rechargerDonnees();
  }, []);

  const renderTreeNodes = (node) => {
    const enfants = treeData.filter(n => n.parentId === node.id);
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '5px' }}>
        <div onClick={() => setSelectedMember(node)} style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '8px', padding: '8px', width: '100px', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{node.name}</div>
          <div style={{ fontSize: '9px', color: '#2d7a4a' }}>{node.ca}</div>
        </div>
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh' }}>
      <button onClick={synchroniserReseau} style={{ width: '100%', padding: '10px', background: '#4A3E3D', color: '#D2B795', borderRadius: '8px', border: 'none', marginBottom: '20px' }}>
        ⚡ Mettre à jour l'équipe complète
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', background: activeTab === 'arbre' ? '#D2B795' : 'white', borderRadius: '8px', border: '1px solid #D2B795' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', background: activeTab === 'tableau' ? '#D2B795' : 'white', borderRadius: '8px', border: '1px solid #D2B795' }}>📊 Tableau</button>
      </div>

      {activeTab === 'arbre' ? (
        <div style={{ overflowX: 'auto' }}>
          {treeData.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
        </div>
      ) : (
        <table style={{ width: '100%', background: 'white', borderRadius: '8px', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#F5EFE8' }}><th style={{ padding: '8px' }}>Nom</th><th>Rôle</th><th>CA</th></tr></thead>
          <tbody>
            {treeData.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>{n.name}</td><td>{n.role}</td><td>{n.ca}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

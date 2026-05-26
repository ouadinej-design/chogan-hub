import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeData, setTreeData] = useState([]);

  // Fonction de synchronisation : Injecte la structure et recalcule les CA depuis les vrais comptes
  const synchroniserReseau = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira BELARIBI", role: "Manager", parentId: null, mdp: "Limitless*2026A", objNum: 15000 },
      { id: "marie", name: "Marie OUADI", role: "Marraine", parentId: "admin-kheira", mdp: "Limitless*2026B", objNum: 10000 },
      { id: "soumia", name: "Soumia", role: "Consultante", parentId: "marie", mdp: "Soumia#Lmtl", objNum: 3000 },
      // ... ajoute ici tous les autres membres avec leur parentId correct
    ];
    
    store.set('consultants', equipe);
    rechargerDonnees();
    alert("✅ Synchronisation réussie : Les données de ventes sont à jour.");
  };

  const rechargerDonnees = () => {
    const base = store.get('consultants', []);
    const dataCalculee = base.map(membre => {
      // Va chercher les commandes réelles dans le compte du membre
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
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div onClick={() => setSelectedMember(node)} style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '12px', padding: '10px', minWidth: '120px', textAlign: 'center', cursor: 'pointer', margin: '5px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#2d7a4a' }}>{node.ca} ({node.pct}%)</div>
        </div>
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh' }}>
      <button onClick={synchroniserReseau} style={{ width: '100%', padding: '12px', background: '#4A3E3D', color: '#D2B795', borderRadius: '8px', border: 'none', marginBottom: '20px' }}>
        ⚡ Synchroniser avec les ventes réelles
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ flex: 1, padding: '10px', background: activeTab === 'arbre' ? '#D2B795' : 'white' }}>🌳 Arbre</button>
        <button onClick={() => setActiveTab('tableau')} style={{ flex: 1, padding: '10px', background: activeTab === 'tableau' ? '#D2B795' : 'white' }}>📊 Tableau</button>
      </div>

      {activeTab === 'arbre' ? (
        <div>
          {treeData.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
        </div>
      ) : (
        <table style={{ width: '100%', background: 'white' }}>
          <thead><tr><th>Nom</th><th>CA</th><th>Progression</th></tr></thead>
          <tbody>
            {treeData.map(n => (
              <tr key={n.id}><td>{n.name}</td><td>{n.ca}</td><td>{n.pct}%</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

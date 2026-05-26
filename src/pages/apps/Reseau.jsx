import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const { getAllConsultants } = useAuth();
  const { log } = useData(); 
  const [treeNodes, setTreeNodes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const injecterEquipeComplete = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null },
      // Niveau 1 : Marie + Consultantes directes
      { id: "marie-m", name: "Marie", role: "Marraine", parentId: "admin-kheira" },
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem"].map(n => ({ id: `cons-${n}`, name: n, role: "Consultante", parentId: "admin-kheira" })),
      { id: "karim-c", name: "Karim", role: "Consultante", parentId: "admin-kheira" },
      // Niveau 2 : Sous Marie
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie-m" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie-m" },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie-m" },
      // Niveau 3
      { id: "tracy", name: "Tracy", role: "Consultante", parentId: "nadia-n" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", parentId: "nadia-n" },
      { id: "anita", name: "Anita", role: "Consultante", parentId: "isabelle" },
      { id: "khayra", name: "Khayra", role: "Consultante", parentId: "isabelle" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", parentId: "blandine" },
      { id: "adam", name: "Adam", role: "Consultante", parentId: "blandine" }
    ];
    store.set('consultants', equipe);
    setRefreshKey(prev => prev + 1);
    alert("Équipe injectée !");
  };

  useEffect(() => {
    setTreeNodes(store.get('consultants', []));
  }, [refreshKey]);

  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {children.map(child => (
          <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '8px', border: '1px solid #D2B795', borderRadius: '8px', background: 'white', minWidth: '90px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{child.name}</div>
              <div style={{ fontSize: '9px', color: '#8C6D4F' }}>{child.role}</div>
            </div>
            {renderNodes(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh' }}>
      <button onClick={injecterEquipeComplete} style={{ width: '100%', padding: '12px', background: '#4A3E3D', color: '#D2B795', border: 'none', borderRadius: '8px', marginBottom: '20px' }}>
        ⚡ Re-charger toute l'organisation
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {treeNodes.filter(n => !n.parentId).map(root => (
          <div key={root.id} style={{ textAlign: 'center' }}>
            <div style={{ padding: '10px', border: '2px solid #4A3E3D', borderRadius: '8px', background: '#F5EFE8' }}>
              <strong>{root.name}</strong><br/>{root.role}
            </div>
            {renderNodes(root.id)}
          </div>
        ))}
      </div>
    </div>
  );
}

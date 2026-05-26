import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { userStore, store } from '../../utils/storage';

export default function Reseau() {
  const { getAllConsultants } = useAuth();
  const { log } = useData(); 
  const [treeNodes, setTreeNodes] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Initialisation complète de l'équipe (Hiérarchie + Données)
  const injecterEquipeComplete = () => {
    const equipe = [
      { id: "admin-kheira", name: "Kheira B", role: "Manager", parentId: null, objNum: 10000 },
      { id: "marie-m", name: "Marie", role: "Marraine", parentId: "admin-kheira", objNum: 5000 },
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem"].map(n => ({ id: `cons-${n}`, name: n, role: "Consultante", parentId: "admin-kheira", objNum: 1500 })),
      { id: "karim-c", name: "Karim", role: "Consultante", parentId: "admin-kheira", objNum: 2000 },
      { id: "nadia-n", name: "Nadia N", role: "Marraine", parentId: "marie-m", objNum: 3000 },
      { id: "isabelle", name: "Isabelle", role: "Marraine", parentId: "marie-m", objNum: 3000 },
      { id: "blandine", name: "Blandine", role: "Marraine", parentId: "marie-m", objNum: 3000 },
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
    const rawConsultants = store.get('consultants', []);
    const data = rawConsultants.map(c => {
      const userDb = userStore(c.id);
      const orders = userDb?.get('orders', []) || [];
      const caNum = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const clients = userDb?.get('clients', []) || [];
      const topClient = clients.length > 0 ? [...clients].sort((a, b) => b.totalSpent - a.totalSpent)[0] : null;
      
      return {
        ...c,
        caNum,
        ca: `${caNum.toLocaleString()} €`,
        topClient: topClient ? `${topClient.firstName} ${topClient.lastName}` : "Aucun",
        eventsCount: userDb?.get('agenda', [])?.length || 0
      };
    });
    setTreeNodes(data);
  }, [refreshKey]);

  // 3. Rendu récursif avec affichage des stats au clic
  const renderNodes = (parentId) => {
    const children = treeNodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {children.map(child => (
          <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              onClick={() => setSelectedMember(child)}
              style={{ padding: '8px', border: '1px solid #D2B795', borderRadius: '8px', background: 'white', minWidth: '90px', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{child.name}</div>
              <div style={{ fontSize: '9px', color: '#8C6D4F' }}>{child.role}</div>
              <div style={{ fontSize: '9px', color: '#2d7a4a', fontWeight: 'bold' }}>{child.ca}</div>
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
        ⚡ Mettre à jour les données équipe
      </button>

      {/* Arbre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {treeNodes.filter(n => !n.parentId).map(root => (
          <div key={root.id} style={{ textAlign: 'center' }}>
            <div onClick={() => setSelectedMember(root)} style={{ padding: '10px', border: '2px solid #4A3E3D', borderRadius: '8px', background: '#F5EFE8', cursor: 'pointer' }}>
              <strong>{root.name}</strong><br/>{root.role}
            </div>
            {renderNodes(root.id)}
          </div>
        ))}
      </div>

      {/* Modale Stats */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: '10%', left: '5%', right: '5%', background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #D2B795', zIndex: 100 }}>
          <h3>{selectedMember.name}</h3>
          <p>Chiffre d'affaires : {selectedMember.ca}</p>
          <p>Top Client : {selectedMember.topClient}</p>
          <p>Ateliers prévus : {selectedMember.eventsCount}</p>
          <button onClick={() => setSelectedMember(null)} style={{ padding: '10px', width: '100%' }}>Fermer</button>
        </div>
      )}
    </div>
  );
}

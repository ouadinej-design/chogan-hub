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

  const injecterEquipeComplete = () => {
    const equipeInitiale = [
      { id: "admin-kheira", firstName: "Kheira", lastName: "B", displayName: "Kheira B", role: "admin", parentId: null, genre: "femme", password: "Kheira#2026" },
      // Marraine Marie
      { id: "marie-m", firstName: "Marie", lastName: "L", displayName: "Marie", role: "marraine", parentId: "admin-kheira", genre: "femme", password: "Marie#2026" },
      // Sous Kheira (Consultantes directes)
      ...["Soumia", "Nawel", "Selma", "Sophia", "Baya", "Milène", "Sarah", "Nadia B", "Shaïma", "Mélissa", "Cassandra", "Meryem"].map(n => ({ id: `cons-${n}`, firstName: n, lastName: "", displayName: n, role: "consultante", parentId: "admin-kheira", genre: "femme", password: `${n}#2026` })),
      { id: "karim-c", firstName: "Karim", lastName: "", displayName: "Karim", role: "consultante", parentId: "admin-kheira", genre: "homme", password: "Karim#2026" },
      // Sous Marie (Marraines)
      { id: "nadia-n", firstName: "Nadia", lastName: "N", displayName: "Nadia N", role: "marraine", parentId: "marie-m", genre: "femme", password: "Nadia#2026" },
      { id: "isabelle", firstName: "Isabelle", lastName: "", displayName: "Isabelle", role: "marraine", parentId: "marie-m", genre: "femme", password: "Isabelle#2026" },
      { id: "blandine", firstName: "Blandine", lastName: "", displayName: "Blandine", role: "marraine", parentId: "marie-m", genre: "femme", password: "Blandine#2026" },
      // Sous Nadia N
      { id: "tracy", firstName: "Tracy", lastName: "", displayName: "Tracy", role: "consultante", parentId: "nadia-n", genre: "femme", password: "Tracy#2026" },
      { id: "yasmin", firstName: "Yasmin", lastName: "", displayName: "Yasmin", role: "consultante", parentId: "nadia-n", genre: "femme", password: "Yasmin#2026" },
      // Sous Isabelle
      { id: "anita", firstName: "Anita", lastName: "", displayName: "Anita", role: "consultante", parentId: "isabelle", genre: "femme", password: "Anita#2026" },
      { id: "khayra", firstName: "Khayra", lastName: "", displayName: "Khayra", role: "consultante", parentId: "isabelle", genre: "femme", password: "Khayra#2026" },
      // Sous Blandine
      { id: "yasmina", firstName: "Yasmina", lastName: "", displayName: "Yasmina", role: "consultante", parentId: "blandine", genre: "femme", password: "Yasmina#2026" },
      { id: "adam", firstName: "Adam", lastName: "", displayName: "Adam", role: "consultante", parentId: "blandine", genre: "homme", password: "Adam#2026" }
    ];

    store.set('consultants', equipeInitiale);
    log('Réseau', 'Equipe complète injectée');
    setRefreshKey(old => old + 1);
    alert("✨ Équipe Limitless déployée avec succès !");
  };

  useEffect(() => {
    const consultants = getAllConsultants();
    const dynamicNodes = consultants.map(c => {
      const userDb = userStore(c.id);
      const orders = userDb?.get('orders', []) || [];
      const totalCA = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      return {
        ...c,
        name: c.displayName,
        ca: `${totalCA.toLocaleString()} €`,
        caNum: totalCA,
        role: c.role.charAt(0).toUpperCase() + c.role.slice(1)
      };
    });
    setTreeNodes(dynamicNodes);
  }, [getAllConsultants, refreshKey]);

  const renderTreeNodes = (node) => {
    const enfants = treeNodes.filter(n => n.parentId === node.id);
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div onClick={() => setSelectedMember(node)} style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '12px', padding: '10px', minWidth: '120px', textAlign: 'center', cursor: 'pointer', margin: '5px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>{node.name}</div>
          <div style={{ fontSize: '9px' }}>{node.role}</div>
        </div>
        {enfants.length > 0 && <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>{enfants.map(e => renderTreeNodes(e))}</div>}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', background: '#FAF7F2', minHeight: '100vh' }}>
      <button onClick={injecterEquipeComplete} style={{ marginBottom: '20px', padding: '10px', background: '#4A3E3D', color: '#D2B795', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⚡ Injecter mon organisation</button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {treeNodes.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
      </div>
    </div>
  );
}

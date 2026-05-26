import React, { useState } from 'react';

// Si vous avez besoin d'importer TableauTab et ArbreTab depuis le même dossier (apps), utilisez "./"
// Exemple (ajustez selon vos vrais fichiers s'ils sont dans le même dossier) :
// import TableauTab from './TableauTab.jsx';
// import ArbreTab from './ArbreTab.jsx';

export default function Reseau({ tree, saveTree, getCAByCur }) {
  const [activeTab, setActiveTab] = useState('arbre');

  // Rôles pour l'affichage selon le genre
  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // Fonction récursive pour afficher l'arbre généalogique
  const renderTreeNodes = (node) => {
    if (!node) return null;

    const enfants = tree.nodes.filter(n => n.parentId === node.id);
    const isMarieOuadi = node.name.trim().toLowerCase() === "marie ouadi";

    const childrenContainerStyle = {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '20px',
      position: 'relative',
      flexDirection: isMarieOuadi ? 'column' : 'row',
      alignItems: isMarieOuadi ? 'center' : 'flex-start'
    };

    const { eu, da } = getCAByCur ? getCAByCur(node.name) : { eu: 0, da: 0 };

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* CARTE MEMBRE */}
        <div style={{
          background: 'white',
          border: '1px solid #D2B795',
          borderRadius: '12px',
          padding: '12px 18px',
          minWidth: '160px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '6px', color: node.genre === 'homme' ? '#3d6b9e' : '#4A3E3D' }}>
            {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '6px' }}>
            {node.name}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '500' }}>
            <span style={{ color: '#D6AF37', fontWeight: '700' }}>{eu.toFixed(0)}€</span>
            <span style={{ margin: '0 4px', color: '#ccc' }}>|</span>
            <span style={{ color: '#3d6b9e', fontWeight: '700' }}>{Math.round(da).toLocaleString('fr-FR')} DA</span>
          </div>
        </div>

        {/* ENFANTS */}
        {enfants.length > 0 && (
          <div style={childrenContainerStyle}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNode = tree?.nodes?.find(n => !n.parentId);

  return (
    <div style={{ padding: '10px' }}>
      {/* SOUS-ONGLETS INTERNES A L'APP RESEAU */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('arbre')}
          style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'arbre' ? '#D2B795' : 'white',
            color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600'
          }}
        >
          🌳 Arbre Visuel
        </button>
        <button 
          onClick={() => setActiveTab('tableau')}
          style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid #D2B795',
            background: activeTab === 'tableau' ? '#D2B795' : 'white',
            color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600'
          }}
        >
          📊 Vue Tableau (Admin)
        </button>
      </div>

      {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
      {activeTab === 'arbre' ? (
        <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
          {rootNode ? renderTreeNodes(rootNode) : <p>Aucun membre détecté.</p>}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          {/* Le composant TableauTab peut être appelé directement ici s'il est importé */}
          <p>Tableau de gestion prêt pour l'administration.</p>
        </div>
      )}
    </div>
  );
}

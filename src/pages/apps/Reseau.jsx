import React from 'react';

function ArbreTab({ tree, getCAByCur }) {
  // Trouver le membre racine (qui n'a pas de parentId)
  const rootNode = tree.nodes.find(n => !n.parentId);

  // Fonction récursive pour construire l'arbre
  const renderNode = (node) => {
    if (!node) return null;

    // Trouver tous les filleuls directs de ce membre
    const enfants = tree.nodes.filter(n => n.parentId === node.id);
    
    // Vérifier si ce membre est Marie Ouadi
    const isMarieOuadi = node.name.trim().toLowerCase() === "marie ouadi";

    // Si ce n'est pas Marie Ouadi, on aligne les enfants horizontalement (flexDirection: 'row')
    // Si c'est Marie Ouadi, on garde une structure verticale classique (flexDirection: 'column')
    const childrenContainerStyle = {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '20px',
      position: 'relative',
      flexDirection: isMarieOuadi ? 'column' : 'row', 
      alignItems: isMarieOuadi ? 'center' : 'flex-start'
    };

    // Calcul du rôle affiché selon le genre
    const displayRole = (role, genre) => {
      if (genre === 'homme') {
        if (role === 'Consultante') return 'Consultant';
        if (role === 'Marraine') return 'Parrain';
      }
      return role;
    };

    const { eu, da } = getCAByCur(node.name);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* CARD DU MEMBRE */}
        <div style={{
          background: 'white',
          border: '1px solid var(--or-border)',
          borderRadius: '12px',
          padding: '12px 18px',
          minWidth: '160px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Badge Rôle */}
          <div style={{ 
            fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px',
            color: node.genre === 'homme' ? '#3d6b9e' : 'var(--taupe)',
            letterSpacing: '0.5px'
          }}>
            {displayRole(node.role || 'Consultante', node.genre)}
          </div>
          
          {/* Nom */}
          <div style={{ fontWeight: '600', color: '#333', fontSize: '14px', marginBottom: '6px' }}>
            {node.name}
          </div>

          {/* Chiffre d'affaires */}
          <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--or-deep)', fontWeight: '700' }}>{eu.toFixed(0)}€</span>
            <span style={{ margin: '0 4px' }}>|</span>
            <span style={{ color: '#3d6b9e', fontWeight: '700' }}>{Math.round(da).toLocaleString('fr-FR')} DA</span>
          </div>
        </div>

        {/* AFFICHAGE DES FILLEULS (Enfants) */}
        {enfants.length > 0 && (
          <div style={childrenContainerStyle}>
            {enfants.map(enfant => renderNode(enfant))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '30px 10px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {rootNode ? renderNode(rootNode) : <p style={{ color: 'var(--text-muted)' }}>Aucun membre dans l'arbre.</p>}
      </div>
    </div>
  );
}

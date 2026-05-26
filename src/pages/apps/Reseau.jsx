import React, { useState } from 'react';
// ... gardez vos autres imports du haut ici (s'il y en a) ...

// 🛠️ CORRECTION DES IMPORTS (Lignes 16 à 18 corrigées pour Vercel)
import Reseau from './src/pages/apps/Reseau.jsx';
import Catalogue from './src/pages/apps/Catalogue.jsx';
import CoachVocal from './src/pages/apps/CoachVocal.jsx';

export default function App() {
  // Vos états existants (ex: l'état de l'onglet actif, les données de l'arbre, etc.)
  const [currentTab, setCurrentTab] = useState('reseau');

  // Exemple de structure de données si vous en avez besoin pour tester
  const [tree, setTree] = useState({
    nodes: [
      { id: "1", name: "Marie Ouadi", role: "Manager", genre: "femme", parentId: null },
      { id: "2", name: "Sarah", role: "Consultante", genre: "femme", parentId: "1" },
      { id: "3", name: "Karim", role: "Consultante", genre: "homme", parentId: "1" }
    ]
  });

  // Fonction de sauvegarde globale de l'arbre
  const saveTree = (newTree) => {
    setTree(newTree);
    // Si vous utilisez localStorage : localStorage.setItem('limitless_tree', JSON.stringify(newTree));
  };

  // Fonction de calcul de CA factice pour éviter les bugs au rendu
  const getCAByCur = (name) => {
    return { eu: 0, da: 0 };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAF6F0', 
      fontFamily: 'sans-serif',
      color: '#4A3E3D' 
    }}>
      {/* 👑 BARRE DE NAVIGATION APPS / LIMITLESS */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        padding: '20px', 
        background: '#white', 
        borderBottom: '1px solid #D2B795' 
      }}>
        <button 
          onClick={() => setCurrentTab('reseau')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: currentTab === 'reseau' ? '1px solid #D6AF37' : '1px solid #ccc',
            background: currentTab === 'reseau' ? '#F5EFE8' : 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🌐 Mon Réseau
        </button>
        <button 
          onClick={() => setCurrentTab('catalogue')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: currentTab === 'catalogue' ? '1px solid #D6AF37' : '1px solid #ccc',
            background: currentTab === 'catalogue' ? '#F5EFE8' : 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📖 Catalogue
        </button>
        <button 
          onClick={() => setCurrentTab('coach')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: currentTab === 'coach' ? '1px solid #D6AF37' : '1px solid #ccc',
            background: currentTab === 'coach' ? '#F5EFE8' : 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🎙️ Coach Vocal
        </button>
      </nav>

      {/* 📲 ZONE D'AFFICHAGE DYNAMIQUE DES APPLICATIONS */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {currentTab === 'reseau' && (
          <Reseau tree={tree} saveTree={saveTree} getCAByCur={getCAByCur} />
        )}
        
        {currentTab === 'catalogue' && (
          <Catalogue />
        )}
        
        {currentTab === 'coach' && (
          <CoachVocal />
        )}
      </main>
    </div>
  );
}

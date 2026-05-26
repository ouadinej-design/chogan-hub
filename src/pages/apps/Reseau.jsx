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

  // 1. Génération et injection automatique de l'organisation de la Limitless Team
  useEffect(() => {
    const consultants Existants = store.get('consultants', []);

    // Si aucun conseiller n'est créé (à part l'admin), on injecte toute l'équipe d'un coup
    if (consultantsExistants.length === 0) {
      const equipeInitiale = [
        {
          id: "marraine-marie",
          firstName: "Marie",
          lastName: "Limitless",
          displayName: "Marie Limitless",
          role: "marraine",
          email: "marie@limitless.com",
          password: "Marie#2026",
          parentId: "admin-root",
          genre: "femme",
          locked: false,
          createdAt: new Date().toISOString(),
          objNum: 5000,
          objectif: "Atteindre le statut Platine avec mon groupe"
        },
        {
          id: "cons-nawel",
          firstName: "Nawel",
          lastName: "Chogan",
          displayName: "Nawel Chogan",
          role: "consultante",
          email: "nawel@limitless.com",
          password: "Nawel#2026",
          parentId: "marraine-marie",
          genre: "femme",
          locked: false,
          createdAt: new Date().toISOString(),
          objNum: 1500,
          objectif: "Valider 10 ventes de Parfums Prestige"
        },
        {
          id: "cons-karim",
          firstName: "Karim",
          lastName: "Elite",
          displayName: "Karim Elite",
          role: "consultante",
          email: "karim@limitless.com",
          password: "Karim#2026",
          parentId: "marraine-marie",
          genre: "homme",
          locked: false,
          createdAt: new Date().toISOString(),
          objNum: 2000,
          objectif: "Développer mon portefeuille clients sur la gamme Homme"
        },
        {
          id: "marraine-sarah",
          firstName: "Sarah",
          lastName: "Leader",
          displayName: "Sarah Leader",
          role: "marraine",
          email: "sarah@limitless.com",
          password: "Sarah#2026",
          parentId: "admin-root",
          genre: "femme",
          locked: false,
          createdAt: new Date().toISOString(),
          objNum: 4000,
          objectif: "Former 3 nouvelles consultantes ce mois-ci"
        },
        {
          id: "cons-yasmine",
          firstName: "Yasmine",
          lastName: "Beauty",
          displayName: "Yasmine Beauty",
          role: "consultante",
          email: "yasmine@limitless.com",
          password: "Yasmine#2026",
          parentId: "marraine-sarah",
          genre: "femme",
          locked: false,
          createdAt: new Date().toISOString(),
          objNum: 1200,
          objectif: "Organiser 2 ateliers de démonstration vocale et visuelle"
        }
      ];

      store.set('consultants', equipeInitiale);
      log('Réseau', 'Initialisation automatique de toute la structure de la Limitless Team');
    }
  }, [log]);

  // 2. Chargement et calcul dynamique des statistiques réelles de l'équipe
  useEffect(() => {
    const consultants = getAllConsultants();

    const dynamicNodes = consultants.map(c => {
      // Accès au store unique de chaque consultante via son ID ou prénom
      const userDb = userStore(c.id);
      
      // Récupération et calcul du CA réel à partir de ses commandes sauvegardées
      const orders = userDb?.get('orders', []) || [];
      const totalCA = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

      // Récupération de ses clients pour trouver son top client
      const clients = userDb?.get('clients', []) || [];
      let topClientName = "Aucun client";
      if (clients.length > 0) {
        const topC = [...clients].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];
        topClientName = `${topC.firstName} ${topC.lastName}`;
      }

      // Extraction des événements enregistrés dans son propre agenda
      const events = userDb?.get('agenda', []) || [];
      const eventTitles = events.length > 0 
        ? events.map(e => e.title).join(', ') 
        : 'Aucun atelier validé';

      // Détermination automatique du niveau d'équipe global basé sur son CA
      let autoLevel = "Initial (0 pts)";
      if (totalCA >= 5000) autoLevel = "Platine (1500 pts)";
      else if (totalCA >= 3000) autoLevel = "Or (900 pts)";
      else if (totalCA >= 1500) autoLevel = "Argent (450 pts)";
      else if (totalCA >= 500) autoLevel = "Bronze (150 pts)";

      return {
        id: c.id,
        name: c.displayName || `${c.firstName} ${c.lastName}`,
        role: c.role === 'marraine' ? 'Marraine' : (c.role === 'admin' ? 'Manager' : 'Consultante'),
        genre: c.genre || 'femme',
        parentId: c.parentId || (c.role === 'admin' ? null : 'admin-root'),
        ca: `${totalCA.toLocaleString()} €`,
        caNum: totalCA,
        objNum: parseFloat(c.objNum) || 1000, 
        objectif: c.objectif || "Fixer un objectif personnel", 
        events: eventTitles,
        fidelity: autoLevel,
        mdp: c.password || "Non défini",
        topClient: topClientName,
        bestSeller: c.bestSeller || "Parfum Prestige Luxury",
        meilleuresVentes: "Suivi des gammes en cours"
      };
    });

    // Ajout systématique du compte Administrateur au sommet
    const hasAdmin = dynamicNodes.some(n => n.id === 'admin-root');
    if (!hasAdmin) {
      dynamicNodes.unshift({
        id: "admin-root",
        name: "Administratrice",
        role: "Manager",
        genre: "femme",
        parentId: null,
        ca: "Calcul global €",
        caNum: dynamicNodes.reduce((s, n) => s + n.caNum, 0),
        objNum: 50000,
        objectif: "Piloter la croissance globale de la Limitless Team",
        events: "Séminaire Annuel, Conférence Nationale",
        fidelity: "Ligne Directrice",
        mdp: "Masqué",
        topClient: "Global Réseau",
        bestSeller: "Gamme Complète",
        meilleuresVentes: "Packs Élite"
      });
    }

    setTreeNodes(dynamicNodes);
  }, [getAllConsultants]);

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = treeNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          onClick={() => {
            setSelectedMember(node);
            log('Réseau', `Consultation de la fiche de ${node.name}`);
          }}
          style={{
            background: 'white', border: '1px solid #D2B795', borderRadius: '12px',
            padding: '12px', minWidth: '140px', textAlign: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(210,183,149,0.15)', margin: '5px'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', color: node.genre === 'homme' ? '#3d6b9e' : '#8C6D4F', textTransform: 'uppercase' }}>
            {displayRole(node.role, node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#4A3E3D', fontSize: '14px', margin: '4px 0' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#2d7a4a' }}>🟢 En ligne</div>
        </div>
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const pctProgress = selectedMember 
    ? Math.min(100, Math.round((selectedMember.caNum / (selectedMember.objNum || 1)) * 100)) 
    : 0;

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', background: '#FAF7F2', minHeight: '100vh' }}>
      
      {/* 👑 BOUTONS ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre Généalogique</button>
        <button onClick={() => setActiveTab('tableau')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'tableau' ? '#D2B795' : 'white', color: activeTab === 'tableau' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>📊 Vue Globale & Mots de passe</button>
      </div>

      {/* 🌳 VUE ARBRE */}
      {activeTab === 'arbre' && (
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
            {treeNodes.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
          </div>
        </div>
      )}

      {/* 📊 VUE TABLEAU RÉCAPITULATIF ADMINISTRATEUR */}
      {activeTab === 'tableau' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', background: 'white', borderRadius: '14px', border: '1px solid #D2B795' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px' }}>Conseiller(e)</th>
                  <th style={{ padding: '12px' }}>Rôle officiel</th>
                  <th style={{ padding: '12px', color: '#8C6D4F' }}>🔑 Code d'accès Hub</th>
                  <th style={{ padding: '12px' }}>Chiffre d'Affaires Actuel</th>
                  <th style={{ padding: '12px' }}>Objectif Personnel Saisi</th>
                  <th style={{ padding: '12px' }}>Progression</th>
                </tr>
              </thead>
              <tbody>
                {treeNodes.map(n => {
                  const pct = Math.min(100, Math.round((n.caNum / (n.objNum || 1)) * 100));
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#4A3E3D' }}>
                        {n.genre === 'homme' ? '👨 ' : '👩 '}{n.name}
                      </td>
                      <td style={{ padding: '12px' }}>{displayRole(n.role, n.genre)}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: '#B39266' }}>
                        {n.mdp}
                      </td>
                      <td style={{ padding: '12px', color: '#2d7a4a', fontWeight: '600' }}>{n.ca}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '12px' }}>"{n.objectif}"</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: pct >= 80 ? '#2d7a4a' : '#8C6D4F' }}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👑 FENÊTRE MODALE DES PERFORMANCES */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', border: '2px solid #D2B795', borderRadius: '16px', padding: '20px', width: '90%', maxWidth: '360px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '12px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#777' }}>✕</button>
            
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '1px solid #F0E6DA', paddingBottom: '10px' }}>
              <div style={{ fontSize: '32px', marginBottom: '5px' }}>{selectedMember.genre === 'homme' ? '👨' : '👩'}</div>
              <h3 style={{ margin: '5px 0', color: '#4A3E3D', fontSize: '18px' }}>{selectedMember.name}</h3>
              <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                {displayRole(selectedMember.role, selectedMember.genre)}
              </span>
            </div>

            {/* JAUGE DE PROGRESSION DYNAMIQUE */}
            <div style={{ background: '#FAF5EE', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.4)', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4A3E3D', fontWeight: '700', marginBottom: '4px' }}>
                <span>🎯 Objectif Personnel :</span>
                <span style={{ color: '#8C6D4F' }}>{pctProgress}% Réalisé</span>
              </div>
              <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>
                "{selectedMember.objectif}"
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pctProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #2d7a4a' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>📊 CA Réel Automatique :</span>
                <span style={{ color: '#2d7a4a', fontWeight: '700', fontSize: '14px' }}>{selectedMember.ca}</span>
              </div>

              <div style={{ background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>📅 Événements Agenda :</span>
                <div style={{ color: '#4A3E3D', fontWeight: '600', marginTop: '2px', fontSize: '12px' }}>{selectedMember.events}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>👤 Meilleur Client :</span>
                <span style={{ color: '#4A3E3D', fontWeight: '600' }}>{selectedMember.topClient}</span>
              </div>

              <div style={{ background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>💄 Produit Phare :</span>
                <div style={{ color: '#8C6D4F', fontWeight: '600', marginTop: '2px' }}>{selectedMember.bestSeller}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDFBF9', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#666', fontWeight: '500' }}>🏆 Statut Équipe :</span>
                <span style={{ color: '#B39266', fontWeight: '700' }}>{selectedMember.fidelity}</span>
              </div>

            </div>

            <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '11px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', marginTop: '12px', cursor: 'pointer' }}>Fermer la fiche</button>
          </div>
        </div>
      )}

    </div>
  );
}

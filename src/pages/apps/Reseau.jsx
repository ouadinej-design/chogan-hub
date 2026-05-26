import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // --- 👥 DONNÉES SIMULÉES DE PERFORMANCE (Ventes, Fidélité, Clients, Planning) ---
  const [salesData] = useState([
    { id: 'v1', memberId: 'marie', client: 'Alice Benguerba', detail: 'Pack Premium Or', amt: 45000, cur: 'DA', date: '2026-05-20', loyaltyPts: 45, status: 'Livré' },
    { id: 'v2', memberId: 'soumia', client: 'Fatiha N', detail: 'Sérum Éclat x2', amt: 9500, cur: 'DA', date: '2026-05-24', loyaltyPts: 10, status: 'En cours' },
    { id: 'v3', memberId: 'karim', client: 'Yacine Ouadi', detail: 'Suivi Business Trimestre', amt: 350, cur: '€', date: '2026-05-22', loyaltyPts: 35, status: 'Payé' },
    { id: 'v4', memberId: 'nadia_n', client: 'Chahinez B', detail: 'Gamme Cheveux Luxe', amt: 18000, cur: 'DA', date: '2026-05-18', loyaltyPts: 20, status: 'Livré' },
    { id: 'v5', memberId: 'tracy', client: 'Julie Simon', detail: 'Consultation Coaching', amt: 120, cur: '€', date: '2026-05-25', loyaltyPts: 12, status: 'Payé' },
    { id: 'v6', memberId: 'adam', client: 'Mourad K', detail: 'Pack Démo Homme', amt: 15000, cur: 'DA', date: '2026-05-23', loyaltyPts: 15, status: 'Expédié' },
  ]);

  const [plannerData] = useState([
    { id: 'p1', memberId: 'marie', title: 'Réunion Stratégique Limitless', date: '2026-05-28 14:00', type: 'Team' },
    { id: 'p2', memberId: 'soumia', title: 'Coaching Client : Bilan Peau', date: '2026-05-27 10:30', type: 'Client' },
    { id: 'p3', memberId: 'nadia_n', title: 'Onboarding Nouvelle Filleule', date: '2026-05-29 16:00', type: 'Réseau' },
    { id: 'p4', memberId: 'adam', title: 'Présentation Opportunité', date: '2026-05-30 11:00', type: 'Client' },
  ]);

  // --- 🏢 STRUCTURE INITIALE DE L'ORGANIGRAMME ---
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira B", role: "Manager", genre: "femme", parentId: null },
      { id: "marie", name: "Marie", role: "Marraine", genre: "femme", parentId: "kheira_b" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "nawel", name: "Nawel", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "selma", name: "Selma", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "sophia", name: "Sophia", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "baya", name: "Baya", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "milene", name: "Milène", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "sarah", name: "Sarah", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "nadia_b", name: "Nadia B", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "shaima", name: "Shaïma", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "melissa", name: "Mélissa", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "cassandra", name: "Cassandra", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "meryem", name: "Meryem", role: "Consultante", genre: "femme", parentId: "marie" },
      { id: "karim", name: "Karim", role: "Consultante", genre: "homme", parentId: "marie" },
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine" }
    ]
  };

  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      return savedData ? JSON.parse(savedData) : defaultTree;
    } catch (error) {
      return defaultTree;
    }
  });

  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  const currentNodes = tree.nodes || [];

  // --- 🔐 GESTION SIMULÉE DES SESSIONS (QUI VISUALISE L'APPLICATION ?) ---
  const [currentUser, setCurrentUser] = useState('marie'); // Par défaut on simule Marie
  
  // --- 👁️ FONCTION HIÉRARCHIQUE : Trouver tout le réseau descendant (Downline) ---
  const getDownlineIds = (userId) => {
    const ids = [userId];
    const collect = (pid) => {
      currentNodes.filter(n => n.parentId === pid).forEach(c => {
        ids.push(c.id);
        collect(c.id);
      });
    };
    collect(userId);
    return ids;
  };

  // Liste des IDs visibles selon l'utilisateur connecté
  const visibleMemberIds = currentNodes.find(n => n.id === currentUser)?.role === 'Manager' 
    ? currentNodes.map(n => n.id) // Le Manager voit TOUT
    : getDownlineIds(currentUser); // La Marraine ou Consultante ne voit que son arbre descendant

  // --- 🧮 CALCUL DES COMPTES ET MOTS DE PASSE AUTOMATIQUES ---
  const generatedAccounts = currentNodes.map(node => {
    const cleanFirstName = node.name.split(' ')[0].toLowerCase();
    const cleanLastName = node.name.split(' ')[1] ? node.name.split(' ')[1].toLowerCase() : 'l';
    return {
      id: node.id,
      name: node.name,
      role: node.role,
      genre: node.genre,
      username: `${cleanFirstName}.${cleanLastName}_limitless`,
      password: `LT_${node.role.substring(0,3).toUpperCase()}_${node.name.split(' ')[0]}${node.id.length}`
    };
  });

  // --- 📊 ÉTAT POUR LA SOURIS / CLIC SUR UN MEMBRE (DRILLDOWN) ---
  const [selectedMember, setSelectedMember] = useState(null);

  const handleCardClick = (node) => {
    const downIds = getDownlineIds(node.id);
    const relatedSales = salesData.filter(s => downIds.includes(s.memberId));
    const relatedEvents = plannerData.filter(p => downIds.includes(p.memberId));

    const caDA = relatedSales.filter(s => s.cur === 'DA').reduce((sum, s) => sum + s.amt, 0);
    const caEU = relatedSales.filter(s => s.cur === '€').reduce((sum, s) => sum + s.amt, 0);
    const ptsFid = relatedSales.reduce((sum, s) => sum + s.loyaltyPts, 0);

    setSelectedMember({
      name: node.name,
      role: node.role,
      genre: node.genre,
      caDA,
      caEU,
      ptsFid,
      sales: relatedSales,
      events: relatedEvents
    });
  };

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // --- 🌳 RENDU RÉCURSIF DE L'ARBRE VISUEL ---
  const renderTreeNodes = (node) => {
    if (!node) return null;
    const enfants = currentNodes.filter(n => n.parentId === node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          onClick={() => handleCardClick(node)}
          style={{
            background: 'white', border: '1px solid #D2B795', borderRadius: '12px',
            padding: '14px', minWidth: '160px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            textAlign: 'center', cursor: 'pointer', transition: '0.2s',
            transform: selectedMember?.name === node.name ? 'scale(1.05)' : 'none',
            boxShadow: selectedMember?.name === node.name ? '0 6px 20px rgba(210,183,149,0.4)' : '0 4px 15px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '6px', color: node.genre === 'homme' ? '#3d6b9e' : '#a17a4a' }}>
            {displayRole(node.role, node.genre).toUpperCase()}
          </div>
          <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>{node.name}</div>
          <div style={{ fontSize: '11px', marginTop: '6px', color: '#2d7a4a' }}>📊 Voir Stats</div>
        </div>

        {enfants.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = currentNodes.filter(n => !n.parentId);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#FCFAF7', minHeight: '100vh' }}>
      
      {/* 👑 BARRE TOP : SÉLECTION DE SESSION DE TEST */}
      <div style={{ background: '#fff', border: '1px solid #D2B795', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontWeight: '700', color: '#4A3E3D' }}>🔑 Mode Vision Utilisateur : </span>
          <select value={currentUser} onChange={e => { setCurrentUser(e.target.value); setSelectedMember(null); }} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D2B795', background: '#fff', fontWeight: '600' }}>
            {currentNodes.map(n => (
              <option key={n.id} value={n.id}>{n.name} ({displayRole(n.role, n.genre)})</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          💡 *Les marraines ne voient que leur propre descendance d'après les règles de sécurité choisies.*
        </div>
      </div>

      {/* 🧭 NAVIGATION ONGLETS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('arbre')} style={{ padding: '10px 25px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'arbre' ? '#D2B795' : 'white', color: activeTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>
          🌳 Organigramme & Performance
        </button>
        <button onClick={() => setActiveTab('parametres')} style={{ padding: '10px 25px', borderRadius: '20px', border: '1px solid #D2B795', background: activeTab === 'parametres' ? '#D2B795' : 'white', color: activeTab === 'parametres' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>
          ⚙️ Paramètres Comptes Auto
        </button>
      </div>

      {/* 🌳 ONGLET 1 : ORGANIGRAMME + DRILL DOWN SIDEBAR */}
      {activeTab === 'arbre' && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* L'ARBRE FLUIDE */}
          <div style={{ flex: 1, minWidth: '600px', background: '#fff', border: '1px solid rgba(210,183,149,0.3)', borderRadius: '16px', padding: '30px', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#4A3E3D', textAlign: 'center' }}>Arbre d'Équipe de la Limitless Team</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {rootNodes.map(root => renderTreeNodes(root))}
            </div>
          </div>

          {/* 📊 SIDEBAR COMPLÈTE DE PERFORMANCE (FIDÉLITÉ, CA, PLANNER, CLIENTS) */}
          <div style={{ width: '420px', background: 'white', border: '1px solid #D2B795', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
            {selectedMember ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #F5EFE8', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#4A3E3D' }}>{selectedMember.name}</h3>
                    <span style={{ fontSize: '12px', color: '#a17a4a', fontWeight: '600' }}>{displayRole(selectedMember.role, selectedMember.genre)}</span>
                  </div>
                  <button onClick={() => setSelectedMember(null)} style={{ border: 'none', background: '#F5EFE8', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                </div>

                {/* BLOCS DE CHIFFRES ACCUMULÉS DU RÉSEAU VISIBLE */}
                <h4 style={{ margin: '15px 0 8px 0', color: '#4A3E3D', fontSize: '14px' }}>📈 Performance Globale Réseau</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#888' }}>Chiffre CA (DA)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#3d6b9e' }}>{selectedMember.caDA.toLocaleString()} DA</div>
                  </div>
                  <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#888' }}>Chiffre CA (€)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#D2B795' }}>{selectedMember.caEU.toLocaleString()} €</div>
                  </div>
                  <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '10px', border: '1px solid rgba(210,183,149,0.3)', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888' }}>✨ Total Points Fidélité</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#2d7a4a' }}>{selectedMember.ptsFid} Pts</div>
                    </div>
                    <div style={{ fontSize: '20px' }}>🎁</div>
                  </div>
                </div>

                {/* 📋 LISTE DES COMMANDES / CLIENTS */}
                <h4 style={{ margin: '0 0 8px 0', color: '#4A3E3D', fontSize: '14px' }}>📦 Suivi Commandes & Clients</h4>
                <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                  {selectedMember.sales.length === 0 ? (
                    <p style={{ padding: '10px', margin: 0, fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Aucune vente enregistrée.</p>
                  ) : (
                    selectedMember.sales.map(s => (
                      <div key={s.id} style={{ padding: '8px 10px', borderBottom: '1px solid #eee', fontSize: '12px', display: 'flex', justifyContent: 'space-between', background: '#fff' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{s.client}</div>
                          <div style={{ color: '#666' }}>{s.detail}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: '600', color: '#4A3E3D' }}>{s.amt} {s.cur}</span>
                          <div style={{ fontSize: '10px', color: '#2d7a4a' }}>{s.status}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 🗓️ LISTE DU PLANNER / AGENDAS DES FILLEULS */}
                <h4 style={{ margin: '0 0 8px 0', color: '#4A3E3D', fontSize: '14px' }}>📅 Événements & Planner Réseau</h4>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                  {selectedMember.events.length === 0 ? (
                    <p style={{ padding: '10px', margin: 0, fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Aucun événement au planning.</p>
                  ) : (
                    selectedMember.events.map(e => (
                      <div key={e.id} style={{ padding: '8px 10px', borderBottom: '1px solid #eee', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#4A3E3D' }}>{e.title}</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>{e.date}</div>
                        </div>
                        <span style={{ fontSize: '10px', background: '#EFEFEF', padding: '2px 6px', borderRadius: '4px' }}>{e.type}</span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                <p style={{ margin: 0, fontSize: '14px' }}>Cliquez sur une carte de l'équipe pour ouvrir le panneau complet (Fidélité, Clients, Commandes, CA et Planner).</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ⚙️ ONGLET 2 : PARAMÈTRES (TABLEAU RÉCAPITULATIF DES MOTS DE PASSE AUTOMATIQUES) */}
      {activeTab === 'parametres' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', border: '1px solid #D2B795', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#4A3E3D' }}>⚙️ Paramètres d'Accès de l'Équipe</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
              Les comptes ci-dessous sont générés automatiquement par l'application dès qu'un membre rejoint l'organigramme.
            </p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                  <th style={{ padding: '12px' }}>Nom complet</th>
                  <th style={{ padding: '12px' }}>Rôle structure</th>
                  <th style={{ padding: '12px' }}>💻 Identifiant de connexion</th>
                  <th style={{ padding: '12px' }}>🔑 Mot de passe par défaut</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Autorisations</th>
                </tr>
              </thead>
              <tbody>
                {generatedAccounts.map(acc => {
                  const hasAccess = visibleMemberIds.includes(acc.id);
                  return (
                    <tr key={acc.id} style={{ borderBottom: '1px solid #F3F4F6', background: hasAccess ? '#fff' : '#FAFAFA', opacity: hasAccess ? 1 : 0.6 }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{acc.name}</td>
                      <td style={{ padding: '12px' }}>{displayRole(acc.role, acc.genre)}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#3d6b9e', fontWeight: '600' }}>{acc.username}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#a17a4a', fontWeight: '600' }}>{acc.password}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {acc.role === 'Manager' ? (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Total (Manager)</span>
                        ) : acc.role === 'Marraine' ? (
                          <span style={{ background: '#fae8ff', color: '#86198f', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Tout son réseau</span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Personnel</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

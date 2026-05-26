import React, { useState, useEffect } from 'react';

export default function ChoganApp() {
  // Navigation principale : 'hub' | 'commandes' | 'reseau'
  const [currentView, setCurrentView] = useState('hub');
  const [activeSubTab, setActiveSubTab] = useState('arbre'); // Pour le réseau : 'arbre' | 'gestion'
  const [activeOrderTab, setActiveOrderTab] = useState('bon_commande'); // Pour commandes : 'bon_commande' | 'ventes'
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeRootId, setTreeRootId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 1. BASE DE DONNÉES INITIALE DES MEMBRES
  const defaultTree = {
    nodes: [
      { id: "kheira_b", name: "Kheira BELARIBI", role: "Manager", genre: "femme", parentId: null, baseCa: 12500, objectif: "Atteindre 15 000 € de CA d'équipe", objNum: 15000, fidelity: "Platine (1500 pts)", mdp: "Limitless*2026A" },
      { id: "marie", name: "Marie OUADI", role: "Marraine", genre: "femme", parentId: "kheira_b", baseCa: 8400, objectif: "Atteindre 10 000 € de CA perso", objNum: 10000, fidelity: "Or (900 pts)", mdp: "Limitless*2026B" },
      { id: "soumia", name: "Soumia", role: "Consultante", genre: "femme", parentId: "marie", baseCa: 2100, objectif: "Atteindre 3 000 € de CA", objNum: 3000, fidelity: "Argent (320 pts)", mdp: "Soumia#Lmtl" },
      { id: "nej", name: "Nej", role: "Consultante", genre: "homme", parentId: "marie", baseCa: 0, objectif: "Atteindre niveau diamant", objNum: 5000, fidelity: "Initial (0 pts)", mdp: "Adim81#" }
    ]
  };

  // 2. BASE DE DONNÉES INITIALE DES VENTES (Associer au nom exact du conseiller)
  const defaultSales = [
    { id: "sale_1", client: "Test", total: 88, date: "26 Mai 2026", consultant: "Nej", products: [{ name: "N°004 The One 70ml", qty: 1, price: 35 }, { name: "N°003 Fahrenheit 30ml", qty: 1, price: 18 }, { name: "N°007 J'Adore 70ml", qty: 1, price: 35 }] },
    { id: "sale_2", client: "Farid", total: 35, date: "26 Mai 2026", consultant: "Nej", products: [{ name: "N°001 One Million 70ml", qty: 1, price: 35 }] }
  ];

  // Chargement LocalStorage
  const [tree, setTree] = useState(() => {
    const local = localStorage.getItem('chogan_tree_connected');
    return local ? JSON.parse(local) : defaultTree;
  });

  const [sales, setSales] = useState(() => {
    const local = localStorage.getItem('chogan_sales_connected');
    return local ? JSON.parse(local) : defaultSales;
  });

  useEffect(() => {
    localStorage.setItem('chogan_tree_connected', JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    localStorage.setItem('chogan_sales_connected', JSON.stringify(sales));
  }, [sales]);

  // Formulaire d'inscription de l'équipe
  const [newMember, setNewMember] = useState({ 
    name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', objectif: '', objNum: '1000' 
  });

  // Formulaire de simulation de vente rapide
  const [quickSale, setQuickSale] = useState({ client: '', total: '', consultant: 'Nej', product: '' });

  // 🔄 FONCTION DE CONNEXION : Calculer dynamiquement les stats d'un membre à partir des ventes
  const getComputedMemberData = (node) => {
    const memberSales = sales.filter(s => s.consultant.toLowerCase().trim() === node.name.toLowerCase().trim());
    
    // CA Total = CA de base configuré à l'inscription + somme des ventes réelles
    const salesTotal = memberSales.reduce((sum, s) => sum + s.total, 0);
    const dynamicCaNum = node.baseCa + salesTotal;

    // Trouver le meilleur produit (Best-seller)
    const productCounts = {};
    let topProduct = "Non défini";
    let topQty = 0;

    memberSales.forEach(s => {
      s.products?.forEach(p => {
        productCounts[p.name] = (productCounts[p.name] || 0) + p.qty;
        if (productCounts[p.name] > topQty) {
          topQty = productCounts[p.name];
          topProduct = p.name;
        }
      });
    });

    // Trouver le dernier ou meilleur client
    const lastClient = memberSales.length > 0 ? memberSales[memberSales.length - 1].client : "Aucun";

    // Préparer la liste des meilleures ventes formatée pour la carte
    const topVentesList = memberSales.map(s => ({
      name: `Commande - Client ${s.client}`,
      total: `${s.total} €`
    }));

    return {
      ...node,
      caNum: dynamicCaNum,
      ca: `${dynamicCaNum.toLocaleString()} €`,
      bestSeller: topProduct,
      bestSellerQty: topQty > 0 ? `${topQty} un.` : "1 un.",
      topClient: lastClient,
      meilleuresVentesList: topVentesList.length > 0 ? topVentesList : [{ name: "Non défini", total: "0 €" }]
    };
  };

  // Calculs collectifs de la team
  const computedNodes = tree.nodes.map(node => getComputedMemberData(node));
  const totalCA = computedNodes.reduce((sum, node) => sum + node.caNum, 0);
  const totalObjectifs = computedNodes.reduce((sum, node) => sum + (parseFloat(node.objNum) || 0), 0);
  const globalPerformance = totalObjectifs > 0 ? Math.min(100, Math.round((totalCA / totalObjectifs) * 100)) : 0;

  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // Actions de gestion
  const handleDeleteMember = (id, name) => {
    if (window.confirm(`Supprimer ${name} de l'équipe ?`)) {
      const parentId = tree.nodes.find(n => n.id === id)?.parentId || null;
      setTree({
        nodes: tree.nodes.filter(n => n.id !== id).map(n => n.parentId === id ? { ...n, parentId } : n)
      });
    }
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null,
      baseCa: 0,
      objNum: parseFloat(newMember.objNum) || 1000,
      id_objectif: newMember.objectif || "Fixer un objectif",
      fidelity: "Initial (0 pts)",
      mdp: newMember.mdp || "Limitless#123"
    };
    setTree({ nodes: [...tree.nodes, newNode] });
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '', mdp: '', objectif: '', objNum: '1000' });
  };

  const handleAddSale = () => {
    if (!quickSale.client.trim() || !quickSale.total) return;
    const newS = {
      id: Date.now().toString(),
      client: quickSale.client.trim(),
      total: parseFloat(quickSale.total),
      date: "26 Mai 2026",
      consultant: quickSale.consultant,
      products: [{ name: quickSale.product || "Parfum Sélection", qty: 1, price: parseFloat(quickSale.total) }]
    };
    setSales([...sales, newS]);
    setQuickSale({ client: '', total: '', consultant: 'Nej', product: '' });
  };

  const renderTreeNodes = (node) => {
    const enfants = computedNodes.filter(n => n.parentId === node.id);
    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          onClick={() => setSelectedMember(node)}
          style={{
            background: 'white', border: '1px solid #D2B795', borderRadius: '12px',
            padding: '12px', minWidth: '140px', textAlign: 'center', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(210,183,149,0.08)', margin: '5px'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', color: node.genre === 'homme' ? '#3d6b9e' : '#8C6D4F', textTransform: 'uppercase' }}>
            {displayRole(node.role, node.genre)}
          </div>
          <div style={{ fontWeight: '600', color: '#4A3E3D', fontSize: '14px', margin: '4px 0' }}>{node.name}</div>
          <div style={{ fontSize: '11px', color: '#2d7a4a' }}>🟢 {node.ca}</div>
        </div>
        {enfants.length > 0 && (
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            {enfants.map(enfant => renderTreeNodes(enfant))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif', color: '#4A3E3D' }}>
      
      {/* 1. ÉCRAN CHOGAN HUB */}
      {currentView === 'hub' && (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '16px', letterSpacing: '2px', fontFamily: 'serif', fontWeight: 'bold' }}>CHOGAN HUB</span>
            <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>👑 Admin</span>
          </div>

          <h2 style={{ fontFamily: 'serif', fontWeight: 'normal', fontSize: '24px', marginBottom: '25px' }}>BONJOUR, <span style={{ fontWeight: 'bold' }}>ADMIN 👑</span></h2>
          
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '16px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#8C6D4F', fontSize: '12px', letterSpacing: '1px' }}>📢 ANNONCES</h4>
            <div style={{ fontSize: '14px', borderBottom: '1px solid #FAF7F2', paddingBottom: '10px', marginBottom: '10px' }}>
              🌸 Bienvenue dans votre espace Chogan Hub ! Connecté en temps réel.
            </div>
            <div style={{ fontSize: '14px', color: '#777' }}>✨ Les ventes s'actualisent désormais directement sur l'arbre généalogique.</div>
          </div>

          {/* MENUS ACCÈS RAPIDE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
            <button onClick={() => setCurrentView('commandes')} style={{ background: 'white', border: '1px solid #D2B795', padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>🛒 Gestion des Commandes & Ventes</span>
              <span style={{ color: '#8C6D4F' }}>➔</span>
            </button>
            <button onClick={() => setCurrentView('reseau')} style={{ background: 'white', border: '1px solid #D2B795', padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>👥 Suivi du Réseau (Limitless Team)</span>
              <span style={{ color: '#2d7a4a', fontWeight: 'bold' }}>{totalCA.toLocaleString()} € CA ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ÉCRAN COMMANDES & VENTES */}
      {currentView === 'commandes' && (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setCurrentView('hub')} style={{ background: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>⬅ Hub</button>
          
          <h2 style={{ fontFamily: 'serif', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '20px', marginBottom: '20px' }}>🛒 Commandes</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #E6DCD0' }}>
            <button onClick={() => setActiveOrderTab('bon_commande')} style={{ padding: '10px', background: 'none', border: 'none', borderBottom: activeOrderTab === 'bon_commande' ? '2px solid #8C6D4F' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>📋 Enregistrer une vente</button>
            <button onClick={() => setActiveOrderTab('ventes')} style={{ padding: '10px', background: 'none', border: 'none', borderBottom: activeOrderTab === 'ventes' ? '2px solid #8C6D4F' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>💰 Historique ({sales.length})</button>
          </div>

          {activeOrderTab === 'bon_commande' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #D2B795' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#8C6D4F' }}>🛍️ Nouvelle vente directe</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nom de la Cliente :</label>
                  <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px' }} placeholder="Ex: Farid" value={quickSale.client} onChange={e => setQuickSale({...quickSale, client: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Produit vendu :</label>
                  <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px' }} placeholder="Ex: N°001 One Million 70ml" value={quickSale.product} onChange={e => setQuickSale({...quickSale, product: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Montant total (€) :</label>
                  <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px' }} placeholder="Ex: 35" value={quickSale.total} onChange={e => setQuickSale({...quickSale, total: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d7a4a' }}>🔗 ASSOCIER AU CONSEILLER (RÉSEAU) :</label>
                  <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', background: 'white', fontWeight: 'bold' }} value={quickSale.consultant} onChange={e => setQuickSale({...quickSale, consultant: e.target.value})}>
                    {tree.nodes.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <button onClick={handleAddSale} style={{ background: '#2d7a4a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>Valider et synchroniser la vente</button>
              </div>
            </div>
          )}

          {activeOrderTab === 'ventes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {sales.map(s => (
                <div key={s.id} style={{ background: 'white', border: '1px solid #D2B795', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>Client : {s.client}</strong>
                    <span style={{ color: '#2d7a4a', fontWeight: 'bold' }}>{s.total} €</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#777' }}>
                    {s.products?.map((p, i) => <div key={i}>📦 {p.name} (x{p.qty})</div>)}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', background: '#FAF5EE', padding: '6px 10px', borderRadius: '6px', display: 'inline-block', color: '#8C6D4F', fontWeight: 'bold' }}>
                    👤 Vente rattachée à : {s.consultant}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ÉCRAN SUIVI DU RÉSEAU CONNECTÉ */}
      {currentView === 'reseau' && (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => setCurrentView('hub')} style={{ background: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>⬅ Hub</button>

          {/* TABLEAU DE BORD DU RÉSEAU */}
          <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '14px', padding: '15px 25px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>📈 Chiffre d'Affaires Global Réseau</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d7a4a', marginTop: '4px' }}>{totalCA.toLocaleString()} €</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#8C6D4F', fontWeight: '700', textTransform: 'uppercase' }}>🎯 Performance Équipe</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4A3E3D' }}>{globalPerformance}%</div>
                <div style={{ width: '120px', height: '8px', background: '#E6DCD0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${globalPerformance}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button onClick={() => setActiveSubTab('arbre')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeSubTab === 'arbre' ? '#D2B795' : 'white', color: activeSubTab === 'arbre' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>🌳 Arbre</button>
            <button onClick={() => setActiveSubTab('gestion')} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #D2B795', background: activeSubTab === 'gestion' ? '#D2B795' : 'white', color: activeSubTab === 'gestion' ? 'white' : '#4A3E3D', cursor: 'pointer', fontWeight: '600' }}>⚙️ Gestion / Inscriptions</button>
          </div>

          {activeSubTab === 'arbre' && (
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%', gap: '20px' }}>
                {computedNodes.filter(n => !n.parentId).map(root => renderTreeNodes(root))}
              </div>
            </div>
          )}

          {activeSubTab === 'gestion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Formulaire complet */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '14px', border: '1px solid #D2B795' }}>
                <h3 style={{ marginTop: 0, color: '#4A3E3D', marginBottom: '20px', fontSize: '15px', textTransform: 'uppercase' }}>✨ FORMULAIRE D'INSCRIPTION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Nom & Prénom *</label>
                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} placeholder="Ex: Nej" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>Rattaché à (Marraine)</label>
                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', background: 'white' }} value={newMember.parentId} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
                      <option value="">Aucun (Racine)</option>
                      {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8C6D4F' }}>🔑 Mot de passe</label>
                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E6DCD0', marginTop: '4px', boxSizing: 'border-box' }} value={newMember.mdp} onChange={e => setNewMember({...newMember, mdp: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleAddMember} style={{ width: '100%', background: '#2d7a4a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}>AJOUTER AU RÉSEAU</button>
              </div>

              {/* Tableau de l'équipe */}
              <div style={{ overflowX: 'auto', background: 'white', borderRadius: '14px', border: '1px solid #D2B795' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F5EFE8', color: '#4A3E3D' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Conseiller(e)</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Rôle</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Chiffre d'Affaires Connecté</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedNodes.map(n => (
                      <tr key={n.id} style={{ borderBottom: '1px solid rgba(210,183,149,0.15)' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{n.name}</td>
                        <td style={{ padding: '12px' }}>{displayRole(n.role, n.genre)}</td>
                        <td style={{ padding: '12px', color: '#2d7a4a', fontWeight: '700' }}>{n.ca}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteMember(n.id, n.name)} style={{ background: '#FFF0F0', border: '1px solid #FFA3A3', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', color: '#D32F2F' }}>🗑️ Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 💳 MODAL : DETAILED PROFILE CARD (AUTOMATIQUEMENT CONNECTÉE ET REMPLIE) */}
      {selectedMember && (() => {
        const liveData = computedNodes.find(n => n.id === selectedMember.id) || selectedMember;
        const pctProgress = Math.min(100, Math.round((liveData.caNum / (liveData.objNum || 1)) * 100));
        
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '10px' }}>
            <div style={{ background: 'white', border: '1px solid #D2B795', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontFamily: 'serif' }}>{liveData.name}</h2>
                <span style={{ background: '#F5EFE8', color: '#8C6D4F', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {displayRole(liveData.role, liveData.genre)}
                </span>
              </div>

              <div style={{ background: '#FAF5EE', padding: '12px 15px', borderRadius: '10px', marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 Objectif : {liveData.objectif || "Non défini"}</span>
                  <span>{pctProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E6DCD0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctProgress}%`, height: '100%', background: 'linear-gradient(90deg, #D2B795, #8C6D4F)' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                  <span style={{ color: '#8C6D4F' }}>💰 Chiffre d'Affaires :</span><strong style={{ color: '#2d7a4a' }}>{liveData.ca}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                  <span style={{ color: '#8C6D4F' }}>💎 Statut Fidélité :</span><strong>{liveData.fidelity || "Initial (0 pts)"}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EAE1' }}>
                  <span style={{ color: '#8C6D4F' }}>🔑 Mot de passe :</span><span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{liveData.mdp}</span>
                </div>
              </div>

              {/* HISTORIQUE DU TOP DES VENTES */}
              <div style={{ marginTop: '15px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🛍️ TOP VENTES & COMMANDES (EN DIRECT)</span>
                {liveData.meilleuresVentesList.map((mv, idx) => (
                  <div key={idx} style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>{mv.name}</span>
                    <span style={{ color: '#2d7a4a', fontWeight: '700' }}>{mv.total}</span>
                  </div>
                ))}
              </div>

              {/* PRODUIT BEST-SELLER */}
              <div style={{ marginTop: '15px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>💄 PRODUIT PHARE (BEST-SELLER)</span>
                <div style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{liveData.bestSeller || "Non défini"}</span>
                  <span style={{ fontWeight: 'bold', color: '#8C6D4F' }}>{liveData.bestSellerQty || "0 un."}</span>
                </div>
              </div>

              {/* FIIDÉLITÉ CLIENTS */}
              <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#8C6D4F', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>👥 DERNIER CLIENT FAVORIS</span>
                <div style={{ background: '#FDFBF7', border: '1px solid #F0EAE1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                  {liveData.topClient || "Aucun client"}
                </div>
              </div>

              <button onClick={() => setSelectedMember(null)} style={{ width: '100%', padding: '11px', background: '#4A3E3D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

import React, { useState } from 'react';

export default function Reseau({ tree, saveTree, getCAByCur }) {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // États locaux pour la gestion du tableau d'administration
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  // État pour le formulaire d'ajout d'un NOUVEAU membre
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];

  // Sécurité pour s'assurer que tree et tree.nodes existent toujours
  const currentNodes = tree && tree.nodes ? tree.nodes : [];

  // Fonction pour adapter le rôle selon le genre
  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // ➕ AJOUTER UN NOUVEAU MEMBRE (Corrigé et Sécurisé)
  const handleAddMember = (e) => {
    if (e) {
      e.preventDefault(); // Bloque le rechargement de la page HTML
      e.stopPropagation();
    }

    if (!newMember.name || !newMember.name.trim()) {
      alert("Veuillez saisir un nom ou un prénom.");
      return;
    }

    const newNode = {
      id: Date.now().toString(), // Identifiant unique basé sur le temps
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null
    };

    // Sauvegarde en injectant le nouveau membre dans la liste existante
    if (typeof saveTree === 'function') {
      saveTree({
        nodes: [...currentNodes, newNode]
      });
    } else {
      console.error("La fonction saveTree n'est pas passée correctement au composant Reseau.");
    }

    // Réinitialiser le champ du formulaire après l'ajout réussi
    setNewMember({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });
  };

  // ✏️ ÉDITION EN LIGNE
  const startEdit = (n) => {
    setEditId(n.id);
    setEditForm({
      name: n.name,
      role: n.role || 'Consultante',
      genre: n.genre || 'femme',
      parentId: n.parentId || ''
    });
  };

  const handleSaveRow = () => {
    if (!editForm.name.trim()) return;
    if (editForm.parentId === editId) {
      alert("Un membre ne peut pas être son propre parrain/marraine !");
      return;
    }

    saveTree({
      nodes: currentNodes.map(n => n.id === editId ? {
        ...n,
        name: editForm.name.trim(),
        role: editForm.role,
        genre: editForm.genre,
        parentId: editForm.parentId || null
      } : n)
    });
    setEditId(null);
  };

  // 🗑️ SUPPRESSION
  const handleDeleteRow = (id) => {
    if (!window.confirm('Supprimer définitivement ce membre ? Ses filleuls seront rattachés à la racine.')) return;
    saveTree({
      nodes: currentNodes
        .filter(n => n.id !== id)
        .map(n => n.parentId === id ? { ...n, parentId: null } : n)
    });
    if (editId === id) setEditId(null);
  };

  // Filtrage et recherche pour le tableau
  const filteredNodes = currentNodes
    .filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase());
      const displayedRoleName = displayRole(n.role, n.genre);
      const matchesRole = filterRole === 'tous' || n.role === filterRole || displayedRoleName === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // 🌳 RENDU DE L'ARBRE (RÉCURSIF)
  const renderTreeNodes = (node) => {
    if (!node) return null;

    const enfants = currentNodes.filter(n => n.parentId ===

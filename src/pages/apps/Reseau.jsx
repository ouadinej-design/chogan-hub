import React, { useState, useEffect } from 'react';

export default function Reseau() {
  const [activeTab, setActiveTab] = useState('arbre');
  
  // 🏢 Structure complète de la Limitless Team intégrée directement par défaut
  const defaultTree = {
    nodes: [
      // Échelon 1 : La Racine
      { id: "kheira_b", name: "Kheira B", role: "Manager", genre: "femme", parentId: null },

      // Échelon 2 : Marie (rattachée à Kheira B)
      { id: "marie", name: "Marie", role: "Marraine", genre: "femme", parentId: "kheira_b" },

      // Échelon 3 : Les Consultantes rattachées directement à Marie
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

      // Échelon 3 : Les sous-marraines rattachées à Marie
      { id: "nadia_n", name: "Nadia N", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "isabelle", name: "Isabelle", role: "Marraine", genre: "femme", parentId: "marie" },
      { id: "blandine", name: "Blandine", role: "Marraine", genre: "femme", parentId: "marie" },

      // Échelon 4 : Filleuls de Nadia N
      { id: "tracy", name: "Tracy", role: "Consultante", genre: "femme", parentId: "nadia_n" },
      { id: "yasmin", name: "Yasmin", role: "Consultante", genre: "femme", parentId: "nadia_n" },

      // Échelon 4 : Filleuls d'Isabelle
      { id: "anita", name: "Anita", role: "Consultante", genre: "femme", parentId: "isabelle" },
      { id: "khayra", name: "Khayra", role: "Consultante", genre: "femme", parentId: "isabelle" },

      // Échelon 4 : Filleuls de Blandine
      { id: "yasmina", name: "Yasmina", role: "Consultante", genre: "femme", parentId: "blandine" },
      { id: "adam", name: "Adam", role: "Consultante", genre: "homme", parentId: "blandine" }
    ]
  };

  // 📁 Chargement initial (prend le localStorage s'il existe déjà, sinon met l'organisation par défaut)
  const [tree, setTree] = useState(() => {
    try {
      const savedData = localStorage.getItem('limitless_team_tree');
      return savedData ? JSON.parse(savedData) : defaultTree;
    } catch (error) {
      console.error("Erreur de lecture du localStorage", error);
      return defaultTree;
    }
  });

  // 💾 Sauvegarde automatique dans le localStorage
  useEffect(() => {
    localStorage.setItem('limitless_team_tree', JSON.stringify(tree));
  }, [tree]);

  // États locaux pour les filtres et l'édition
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  // État pour le formulaire d'un NOUVEAU membre
  const [newMember, setNewMember] = useState({ name: '', role: 'Consultante', genre: 'femme', parentId: '' });

  const ROLES_LIST = ['Consultante', 'Manager', 'Marraine', 'VIP'];
  const currentNodes = tree && tree.nodes ? tree.nodes : [];

  // Fonction pour adapter le rôle selon le genre
  const displayRole = (role, genre) => {
    if (genre === 'homme') {
      if (role === 'Consultante') return 'Consultant';
      if (role === 'Marraine') return 'Parrain';
    }
    return role;
  };

  // ➕ FONCTION D'AJOUT
  const handleAddMember = (e) => {
    if (e) e.preventDefault();

    if (!newMember.name || !newMember.name.trim()) {
      alert("Veuillez saisir un nom ou un prénom.");
      return;
    }

    const newNode = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      role: newMember.role,
      genre: newMember.genre,
      parentId: newMember.parentId || null
    };

    setTree({
      nodes: [...currentNodes, newNode]
    });

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

    setTree({
      nodes: currentNodes.map(

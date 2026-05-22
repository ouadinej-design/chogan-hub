import { createContext, useContext, useCallback } from 'react';
import { userStore, logActivity } from '../utils/storage';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const db = user ? userStore(user.username) : null;

  const log = useCallback((section, action) => {
    if (user) logActivity(user.username, section, action);
  }, [user]);

  // ── CLIENTS ──────────────────────────────────────
  const getClients = () => db?.get('clients', []) ?? [];
  const addClient = (data) => {
    const clients = getClients();
    const existing = clients.find(c => c.email === data.email || c.phone === data.phone);
    if (existing) return existing;
    const client = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      points: 0,
      ...data,
    };
    db.set('clients', [...clients, client]);
    log('Clients', `Nouveau client: ${client.firstName} ${client.lastName}`);
    // Auto-create loyalty card
    createLoyaltyCard(client);
    return client;
  };
  const updateClient = (id, updates) => {
    const clients = getClients();
    const idx = clients.findIndex(c => c.id === id);
    if (idx !== -1) { clients[idx] = { ...clients[idx], ...updates }; db.set('clients', clients); }
  };
  const deleteClient = (id) => db.set('clients', getClients().filter(c => c.id !== id));

  // ── LOYALTY CARDS ────────────────────────────────
  const getLoyaltyCards = () => db?.get('loyalty', []) ?? [];
  const createLoyaltyCard = (client) => {
    const cards = getLoyaltyCards();
    if (cards.find(c => c.clientId === client.id)) return;
    const card = {
      id: `CARD-${Date.now()}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      createdAt: new Date().toISOString(),
      points: 0,
      totalPurchases: 0,
      level: 'Bronze',
      stamps: [],
    };
    db.set('loyalty', [...cards, card]);
    log('Fidélité', `Carte créée pour ${client.firstName} ${client.lastName}`);
  };
  const addPoints = (clientId, amount) => {
    const cards = getLoyaltyCards();
    const idx = cards.findIndex(c => c.clientId === clientId);
    if (idx !== -1) {
      const pts = cards[idx].points + Math.floor(amount / 10);
      const total = cards[idx].totalPurchases + amount;
      cards[idx] = {
        ...cards[idx],
        points: pts,
        totalPurchases: total,
        level: total >= 500 ? 'Or' : total >= 200 ? 'Argent' : 'Bronze',
        stamps: [...cards[idx].stamps, { date: new Date().toISOString(), amount }],
      };
      db.set('loyalty', cards);
    }
  };

  // ── ORDERS ───────────────────────────────────────
  const getOrders = () => db?.get('orders', []) ?? [];
  const addOrder = (data) => {
    // 1. Create or find client
    let client = getClients().find(c => c.email === data.clientEmail || c.phone === data.clientPhone);
    if (!client) {
      client = addClient({
        firstName: data.clientFirstName,
        lastName: data.clientLastName,
        email: data.clientEmail,
        phone: data.clientPhone,
        address: data.clientAddress || '',
      });
    }
    // 2. Create order
    const order = {
      id: `CMD-${Date.now()}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      items: data.items || [],
      total: data.total || 0,
      status: 'En cours',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    db.set('orders', [...getOrders(), order]);
    log('Commandes', `Commande ${order.id} - ${order.clientName} - ${order.total}€`);
    // 3. Update client stats
    updateClient(client.id, {
      totalOrders: (client.totalOrders || 0) + 1,
      totalSpent: (client.totalSpent || 0) + order.total,
    });
    // 4. Add loyalty points
    addPoints(client.id, order.total);
    // 5. Add to agenda
    addAgendaEvent({
      title: `Livraison: ${client.firstName} ${client.lastName}`,
      description: `Commande ${order.id} — ${order.total}€`,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      type: 'livraison',
      orderId: order.id,
      clientId: client.id,
    });
    return order;
  };
  const updateOrderStatus = (id, status) => {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) { orders[idx].status = status; db.set('orders', orders); }
  };

  // ── AGENDA ───────────────────────────────────────
  const getAgendaEvents = () => db?.get('agenda', []) ?? [];
  const addAgendaEvent = (event) => {
    const events = getAgendaEvents();
    const ev = { id: Date.now().toString(), ...event };
    db.set('agenda', [...events, ev]);
    log('Agenda', `Événement: ${event.title}`);
    return ev;
  };
  const updateAgendaEvent = (id, updates) => {
    const events = getAgendaEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) { events[idx] = { ...events[idx], ...updates }; db.set('agenda', events); }
  };
  const deleteAgendaEvent = (id) => db.set('agenda', getAgendaEvents().filter(e => e.id !== id));

  // ── WALLET ───────────────────────────────────────
  const getWalletEntries = () => db?.get('wallet', []) ?? [];
  const addWalletEntry = (entry) => {
    const entries = getWalletEntries();
    const e = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...entry };
    db.set('wallet', [...entries, e]);
    log('Wallet', `Entrée: ${entry.type} ${entry.amount}€`);
  };
  const getWalletStats = () => {
    const entries = getWalletEntries();
    const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { income, expense, balance: income - expense, entries };
  };

  // ── RÉSEAU ───────────────────────────────────────
  const getTeam = () => db?.get('team', []) ?? [];
  const addTeamMember = (data) => {
    const team = getTeam();
    const member = { id: Date.now().toString(), joinedAt: new Date().toISOString(), status: 'Actif', ...data };
    db.set('team', [...team, member]);
    log('Réseau', `Nouveau membre: ${data.name}`);
    return member;
  };

  return (
    <DataContext.Provider value={{
      log,
      getClients, addClient, updateClient, deleteClient,
      getLoyaltyCards, addPoints,
      getOrders, addOrder, updateOrderStatus,
      getAgendaEvents, addAgendaEvent, updateAgendaEvent, deleteAgendaEvent,
      getWalletEntries, addWalletEntry, getWalletStats,
      getTeam, addTeamMember,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

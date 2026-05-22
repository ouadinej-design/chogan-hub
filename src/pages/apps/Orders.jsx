import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

const PRODUCTS = [
  { id: 'p1', name: 'Parfum Homme N°001', price: 35 },
  { id: 'p2', name: 'Parfum Femme N°002', price: 35 },
  { id: 'p3', name: 'Parfum Mixte N°003', price: 38 },
  { id: 'p4', name: 'Eau de Toilette N°010', price: 28 },
  { id: 'p5', name: 'Crème Visage Gold', price: 42 },
  { id: 'p6', name: 'Coffret Découverte', price: 65 },
  { id: 'p7', name: 'Parfum Maison', price: 30 },
  { id: 'p8', name: 'Soin Corps Luxe', price: 45 },
];

const STATUS_COLORS = {
  'En cours': 'gold', 'Livré': 'green', 'Annulé': 'red',
};

export default function Orders() {
  const { getOrders, addOrder, updateOrderStatus } = useData();
  const [tab, setTab] = useState('list');
  const [form, setForm] = useState({ clientFirstName:'',clientLastName:'',clientEmail:'',clientPhone:'',items:[],notes:'' });
  const [cart, setCart] = useState([]);
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const orders = getOrders();

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSubmit = () => {
    if (!form.clientFirstName || !form.clientLastName || cart.length === 0) {
      alert('Remplissez le nom du client et ajoutez au moins un produit.');
      return;
    }
    const order = addOrder({ ...form, items: cart, total: cartTotal });
    setSuccess(`✓ Commande ${order.id} créée ! Client enregistré, carte fidélité créée, agenda mis à jour.`);
    setForm({ clientFirstName:'',clientLastName:'',clientEmail:'',clientPhone:'',items:[],notes:'' });
    setCart([]);
    setTimeout(() => { setSuccess(''); setTab('list'); }, 3500);
  };

  const filtered = filterStatus === 'Tous' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <AppLayout title="Commandes" icon="🛒">
      <div style={S.tabs}>
        {['list','new'].map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>setTab(t)}>
            {t==='list' ? `📋 Liste (${orders.length})` : '➕ Nouvelle'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div style={S.pad}>
          <div style={S.filterRow}>
            {['Tous','En cours','Livré','Annulé'].map(s => (
              <button key={s} style={{ ...S.filterBtn, ...(filterStatus===s?S.filterActive:{}) }} onClick={()=>setFilterStatus(s)}>{s}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={S.empty}>Aucune commande</div>
          ) : (
            filtered.slice().reverse().map(o => (
              <div key={o.id} style={S.orderCard} className="fade-in">
                <div style={S.orderRow}>
                  <span style={S.orderId}>{o.id}</span>
                  <span className={`badge badge-${STATUS_COLORS[o.status]||'gold'}`}>{o.status}</span>
                </div>
                <div style={S.orderClient}>{o.clientName}</div>
                <div style={S.orderMeta}>
                  <span>{o.items?.length || 0} produit(s)</span>
                  <span style={S.orderTotal}>{o.total}€</span>
                </div>
                <div style={S.orderDate}>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</div>
                <div style={S.statusBtns}>
                  {['En cours','Livré','Annulé'].map(s => (
                    <button key={s} style={{ ...S.sBtn, opacity: o.status===s?1:0.45 }}
                      onClick={() => updateOrderStatus(o.id, s)}>{s}</button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'new' && (
        <div style={S.pad}>
          {success && <div style={S.success}>{success}</div>}
          <div style={S.section}>
            <div style={S.sectionTitle}>👤 Client</div>
            <div className="grid-2">
              <div className="field">
                <label className="label">Prénom *</label>
                <input value={form.clientFirstName} onChange={e=>setForm(p=>({...p,clientFirstName:e.target.value}))} placeholder="Prénom" />
              </div>
              <div className="field">
                <label className="label">Nom *</label>
                <input value={form.clientLastName} onChange={e=>setForm(p=>({...p,clientLastName:e.target.value}))} placeholder="Nom" />
              </div>
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input value={form.clientEmail} onChange={e=>setForm(p=>({...p,clientEmail:e.target.value}))} placeholder="email@exemple.com" type="email" />
            </div>
            <div className="field">
              <label className="label">Téléphone</label>
              <input value={form.clientPhone} onChange={e=>setForm(p=>({...p,clientPhone:e.target.value}))} placeholder="06 00 00 00 00" type="tel" />
            </div>
          </div>

          <div style={S.section}>
            <div style={S.sectionTitle}>💎 Produits</div>
            <div style={S.productsGrid}>
              {PRODUCTS.map(p => (
                <div key={p.id} style={S.product} onClick={() => addToCart(p)}>
                  <span style={S.productName}>{p.name}</span>
                  <span style={S.productPrice}>{p.price}€</span>
                </div>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div style={S.section}>
              <div style={S.sectionTitle}>🛒 Panier</div>
              {cart.map(i => (
                <div key={i.id} style={S.cartItem}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'var(--text)' }}>{i.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{i.qty} × {i.price}€</div>
                  </div>
                  <span style={S.cartItemTotal}>{i.qty*i.price}€</span>
                  <button style={S.removeBtn} onClick={()=>removeFromCart(i.id)}>✕</button>
                </div>
              ))}
              <div style={S.totalRow}>
                <span>Total</span>
                <span style={S.totalAmount}>{cartTotal}€</span>
              </div>
            </div>
          )}

          <div className="field">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Instructions spéciales..." rows={3} />
          </div>

          <button className="btn-gold" onClick={handleSubmit}>
            CRÉER LA COMMANDE
          </button>
          <p style={S.hint}>Crée automatiquement : fiche client, carte fidélité, rendez-vous agenda</p>
        </div>
      )}
    </AppLayout>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)' },
  tab: { flex:1, padding:'12px', background:'none', color:'var(--text-muted)', fontSize:13, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  pad: { padding: '16px' },
  filterRow: { display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' },
  filterBtn: { background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:20, padding:'5px 12px', fontSize:12 },
  filterActive: { background:'var(--gold-pale)', border:'1px solid var(--gold)', color:'var(--gold)' },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'40px 0', fontSize:14 },
  orderCard: {
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12,
    padding:'14px', marginBottom:10,
  },
  orderRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  orderId: { fontSize:11, color:'var(--text-dim)', letterSpacing:'0.06em' },
  orderClient: { fontSize:15, fontWeight:600, marginBottom:6 },
  orderMeta: { display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' },
  orderTotal: { color:'var(--gold)', fontWeight:700 },
  orderDate: { fontSize:11, color:'var(--text-dim)', marginTop:4 },
  statusBtns: { display:'flex', gap:6, marginTop:10 },
  sBtn: { flex:1, padding:'6px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', fontSize:11, cursor:'pointer' },
  section: { background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:12, padding:'14px', marginBottom:14 },
  sectionTitle: { fontSize:12, fontWeight:700, color:'var(--gold)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 },
  productsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  product: {
    background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:10,
    padding:'10px', cursor:'pointer', transition:'all 0.2s',
  },
  productName: { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:4 },
  productPrice: { display:'block', fontSize:14, fontWeight:700, color:'var(--gold)' },
  cartItem: {
    display:'flex', alignItems:'center', gap:10,
    padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:8, marginBottom:8,
  },
  cartItemTotal: { fontWeight:700, color:'var(--gold)', fontSize:14 },
  removeBtn: { background:'none', color:'var(--red)', fontSize:12, padding:'4px 6px' },
  totalRow: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'10px 0 0', borderTop:'1px solid var(--border)', marginTop:8,
    fontSize:15, fontWeight:600,
  },
  totalAmount: { color:'var(--gold)', fontSize:18, fontWeight:700 },
  success: {
    background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)',
    borderRadius:10, padding:'12px 14px', color:'var(--green)', fontSize:13, marginBottom:16,
  },
  hint: { textAlign:'center', fontSize:11, color:'var(--text-dim)', marginTop:10 },
};

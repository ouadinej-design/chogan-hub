import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

export default function Clients() {
  const { getClients, addClient, deleteClient, getLoyaltyCards } = useData();
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',phone:'',address:'',birthday:'' });
  const [saved, setSaved] = useState('');

  const clients = getClients();
  const cards = getLoyaltyCards();

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  const handleAdd = () => {
    if (!form.firstName || !form.lastName) { alert('Prénom et nom requis.'); return; }
    addClient(form);
    setSaved(`✓ Client ${form.firstName} ${form.lastName} ajouté.`);
    setForm({ firstName:'',lastName:'',email:'',phone:'',address:'',birthday:'' });
    setTimeout(() => { setSaved(''); setTab('list'); }, 2000);
  };

  const getCard = (clientId) => cards.find(c => c.clientId === clientId);
  const LEVELS = { Bronze: '#cd7f32', Argent: '#a8a9ad', Or: '#C9A84C' };

  return (
    <AppLayout title="Clients" icon="👥">
      <div style={S.tabs}>
        {['list','add'].map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>{ setSelected(null); setTab(t); }}>
            {t==='list' ? `📋 Liste (${clients.length})` : '➕ Ajouter'}
          </button>
        ))}
      </div>

      {tab === 'list' && !selected && (
        <div style={{ padding:16 }}>
          <input placeholder="🔍 Rechercher un client..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:14 }} />
          {filtered.length === 0 && <div style={S.empty}>Aucun client trouvé</div>}
          {filtered.map(c => {
            const card = getCard(c.id);
            const level = card?.level || 'Bronze';
            return (
              <div key={c.id} style={S.card} onClick={() => setSelected(c)} className="fade-in">
                <div style={S.avatar}>{c.firstName.charAt(0)}{c.lastName.charAt(0)}</div>
                <div style={{ flex:1 }}>
                  <div style={S.name}>{c.firstName} {c.lastName}</div>
                  {c.email && <div style={S.meta}>{c.email}</div>}
                  {c.phone && <div style={S.meta}>{c.phone}</div>}
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <span className="badge badge-gold">{c.totalOrders||0} cdes</span>
                    <span className="badge" style={{ background:`${LEVELS[level]}22`, color:LEVELS[level], border:`1px solid ${LEVELS[level]}44` }}>
                      {level}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'var(--gold)', fontWeight:700, fontSize:14 }}>{c.totalSpent||0}€</div>
                  <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:2 }}>{card?.points||0} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'list' && selected && (
        <ClientDetail client={selected} card={getCard(selected.id)} onBack={() => setSelected(null)} deleteClient={deleteClient} />
      )}

      {tab === 'add' && (
        <div style={{ padding:16 }}>
          {saved && <div style={S.success}>{saved}</div>}
          {[
            ['firstName','Prénom *','text'], ['lastName','Nom *','text'],
            ['email','Email','email'], ['phone','Téléphone','tel'],
            ['address','Adresse','text'], ['birthday','Date de naissance','date'],
          ].map(([k,l,t]) => (
            <div className="field" key={k}>
              <label className="label">{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l} />
            </div>
          ))}
          <button className="btn-gold" onClick={handleAdd}>AJOUTER LE CLIENT</button>
        </div>
      )}
    </AppLayout>
  );
}

function ClientDetail({ client, card, onBack, deleteClient }) {
  const LEVELS = { Bronze: '#cd7f32', Argent: '#a8a9ad', Or: '#C9A84C' };
  const level = card?.level || 'Bronze';
  return (
    <div style={{ padding:16 }}>
      <button style={S.backBtn} onClick={onBack}>← Retour</button>
      <div style={S.detailCard}>
        <div style={{ ...S.avatar, width:52, height:52, fontSize:18, margin:'0 auto 14px' }}>
          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
        </div>
        <h2 style={{ textAlign:'center', fontFamily:'var(--font-display)', color:'var(--gold)', letterSpacing:'0.08em', marginBottom:4 }}>
          {client.firstName} {client.lastName}
        </h2>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span className="badge" style={{ background:`${LEVELS[level]}22`, color:LEVELS[level], border:`1px solid ${LEVELS[level]}44` }}>
            ✦ {level}
          </span>
        </div>
        {[
          ['Email', client.email], ['Téléphone', client.phone],
          ['Adresse', client.address], ['Anniversaire', client.birthday],
          ['Inscrit le', new Date(client.createdAt).toLocaleDateString('fr-FR')],
        ].filter(([,v])=>v).map(([l,v]) => (
          <div key={l} style={S.detailRow}><span style={S.detailLabel}>{l}</span><span>{v}</span></div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:16 }}>
          {[
            ['Commandes', client.totalOrders||0, '🛒'],
            ['Dépenses', `${client.totalSpent||0}€`, '💰'],
            ['Points', card?.points||0, '⭐'],
          ].map(([l,v,ic]) => (
            <div key={l} style={S.statBox}>
              <span style={{ fontSize:18 }}>{ic}</span>
              <span style={{ fontWeight:700, color:'var(--gold)', fontSize:16 }}>{v}</span>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
        <button style={{ ...S.deleteBtn, marginTop:20 }} onClick={() => { deleteClient(client.id); onBack(); }}>
          🗑 Supprimer ce client
        </button>
      </div>
    </div>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)' },
  tab: { flex:1, padding:'12px', background:'none', color:'var(--text-muted)', fontSize:13, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'40px 0', fontSize:14 },
  card: {
    display:'flex', alignItems:'center', gap:12,
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12,
    padding:'12px 14px', marginBottom:10, cursor:'pointer',
    transition:'background 0.2s',
  },
  avatar: {
    width:40, height:40, borderRadius:'50%', flexShrink:0,
    background:'linear-gradient(135deg, var(--gold), var(--gold-dark))',
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'#07070f', fontWeight:700, fontSize:13,
  },
  name: { fontSize:14, fontWeight:600 },
  meta: { fontSize:12, color:'var(--text-muted)', marginTop:2 },
  success: { background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, marginBottom:14 },
  backBtn: { background:'none', color:'var(--text-muted)', fontSize:13, padding:'8px 0', marginBottom:12, display:'block' },
  detailCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px' },
  detailRow: { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 },
  detailLabel: { color:'var(--text-muted)' },
  statBox: { background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'12px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, textAlign:'center' },
  deleteBtn: { width:'100%', padding:'10px', background:'rgba(224,85,85,0.1)', border:'1px solid rgba(224,85,85,0.3)', color:'var(--red)', borderRadius:10, fontSize:13, cursor:'pointer' },
};

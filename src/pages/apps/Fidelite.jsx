import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

const LEVELS = { Bronze: '#cd7f32', Argent: '#a8a9ad', Or: '#C9A84C' };
const LEVEL_THRESHOLDS = { Bronze: 0, Argent: 200, Or: 500 };

export default function Fidelite() {
  const { getLoyaltyCards, getClients } = useData();
  const cards = getLoyaltyCards();
  const clients = getClients();

  const getNextLevel = (level, total) => {
    if (level === 'Or') return { name: 'Or (Max)', progress: 100, needed: 0 };
    if (level === 'Argent') return { name: 'Or', progress: Math.min(100, (total / 500) * 100), needed: Math.max(0, 500 - total) };
    return { name: 'Argent', progress: Math.min(100, (total / 200) * 100), needed: Math.max(0, 200 - total) };
  };

  const sorted = [...cards].sort((a,b) => b.points - a.points);

  return (
    <AppLayout title="Cartes Fidélité" icon="🎁">
      <div style={{ padding:16 }}>
        {/* Summary */}
        <div style={S.summary}>
          {Object.entries(LEVELS).map(([lvl, color]) => (
            <div key={lvl} style={S.sumItem}>
              <span style={{ fontSize:20 }}>
                {lvl==='Or'?'🥇':lvl==='Argent'?'🥈':'🥉'}
              </span>
              <span style={{ fontSize:18, fontWeight:700, color }}>{cards.filter(c=>c.level===lvl).length}</span>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>{lvl}</span>
            </div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div style={S.empty}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎁</div>
            <div>Les cartes fidélité se créent automatiquement</div>
            <div style={{ marginTop:4 }}>lors de chaque nouvelle commande.</div>
          </div>
        )}

        {sorted.map(card => {
          const next = getNextLevel(card.level, card.totalPurchases);
          const color = LEVELS[card.level] || LEVELS.Bronze;
          const client = clients.find(c => c.id === card.clientId);
          return (
            <div key={card.id} style={{ ...S.card, borderColor: color + '44' }} className="fade-in">
              {/* Card header */}
              <div style={{ ...S.cardHeader, background: `linear-gradient(135deg, ${color}18, ${color}08)` }}>
                <div style={{ flex:1 }}>
                  <div style={S.cardId}>Carte Chogan ✦</div>
                  <div style={S.cardName}>{card.clientName}</div>
                  {client?.birthday && (
                    <div style={S.cardMeta}>🎂 {client.birthday}</div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ ...S.levelBadge, color, borderColor: color + '55' }}>✦ {card.level}</div>
                  <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:4 }}>{card.id}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={S.cardStats}>
                <div style={S.statItem}>
                  <span style={{ fontSize:18, fontWeight:700, color:'var(--gold)' }}>{card.points}</span>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>Points</span>
                </div>
                <div style={S.statDiv} />
                <div style={S.statItem}>
                  <span style={{ fontSize:18, fontWeight:700, color:'var(--gold)' }}>{card.totalPurchases}€</span>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>Total achats</span>
                </div>
                <div style={S.statDiv} />
                <div style={S.statItem}>
                  <span style={{ fontSize:18, fontWeight:700, color:'var(--gold)' }}>{card.stamps?.length||0}</span>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>Achats</span>
                </div>
              </div>

              {/* Progress to next level */}
              {card.level !== 'Or' && (
                <div style={S.progress}>
                  <div style={S.progressLabel}>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>Vers {next.name}</span>
                    <span style={{ fontSize:11, color }}>{next.needed > 0 ? `${next.needed}€ restants` : '✓ Niveau atteint'}</span>
                  </div>
                  <div style={S.progressBar}>
                    <div style={{ ...S.progressFill, width: `${next.progress}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
                  </div>
                </div>
              )}

              {/* Last stamps */}
              {card.stamps?.length > 0 && (
                <div style={S.stamps}>
                  {card.stamps.slice(-8).map((s,i) => (
                    <div key={i} style={{ ...S.stamp, background: color + '22', borderColor: color + '44' }}>
                      <span style={{ fontSize:9, color }}>✦</span>
                    </div>
                  ))}
                  {card.stamps.length > 8 && <span style={{ fontSize:10, color:'var(--text-dim)' }}>+{card.stamps.length-8}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

const S = {
  summary: {
    display:'flex', justifyContent:'space-around', alignItems:'center',
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14,
    padding:'14px 20px', marginBottom:16,
  },
  sumItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  empty: { textAlign:'center', color:'var(--text-muted)', padding:'40px 0', fontSize:13, lineHeight:1.7 },
  card: {
    background:'var(--bg-card)', border:'1px solid', borderRadius:16,
    overflow:'hidden', marginBottom:14,
  },
  cardHeader: { padding:'16px' },
  cardId: { fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:4 },
  cardName: { fontSize:16, fontWeight:700, fontFamily:'var(--font-display)', color:'var(--text)' },
  cardMeta: { fontSize:11, color:'var(--text-muted)', marginTop:4 },
  levelBadge: { fontSize:12, fontWeight:700, border:'1px solid', borderRadius:20, padding:'3px 10px', display:'inline-block' },
  cardStats: {
    display:'flex', alignItems:'center', justifyContent:'space-around',
    padding:'12px 16px', borderTop:'1px solid var(--border)',
  },
  statItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  statDiv: { width:1, height:30, background:'var(--border)' },
  progress: { padding:'0 16px 12px' },
  progressLabel: { display:'flex', justifyContent:'space-between', marginBottom:6 },
  progressBar: { height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:3, transition:'width 0.4s ease' },
  stamps: { display:'flex', gap:6, padding:'8px 16px 12px', flexWrap:'wrap', alignItems:'center' },
  stamp: { width:24, height:24, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid' },
};

import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';
import { getTodayLogs } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function Stats() {
  const { getOrders, getClients, getLoyaltyCards, getWalletStats, getTeam } = useData();
  const { user } = useAuth();

  const orders = getOrders();
  const clients = getClients();
  const cards = getLoyaltyCards();
  const wallet = getWalletStats();
  const team = getTeam();
  const todayLogs = getTodayLogs(user?.username);

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0,7);

  const todayOrders = orders.filter(o => o.createdAt?.startsWith(today));
  const monthOrders = orders.filter(o => o.createdAt?.startsWith(thisMonth));
  const monthRevenue = monthOrders.reduce((s,o) => s+o.total, 0);

  const sectionCounts = {};
  todayLogs.forEach(l => { sectionCounts[l.section] = (sectionCounts[l.section]||0)+1; });

  const levelCounts = { Bronze:0, Argent:0, Or:0 };
  cards.forEach(c => { levelCounts[c.level] = (levelCounts[c.level]||0)+1; });

  return (
    <AppLayout title="Statistiques" icon="📊">
      <div style={{ padding:16 }}>
        {/* Today */}
        <div style={S.sectionTitle}>📅 Aujourd'hui</div>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <StatBox label="Connexions & actions" value={todayLogs.length} color="var(--gold)" icon="⚡" />
          <StatBox label="Commandes du jour" value={todayOrders.length} color="var(--blue)" icon="🛒" />
        </div>

        {/* This month */}
        <div style={S.sectionTitle}>📆 Ce mois-ci</div>
        <div className="grid-2" style={{ marginBottom:8 }}>
          <StatBox label="Commandes" value={monthOrders.length} color="var(--blue)" icon="📦" />
          <StatBox label="Chiffre affaires" value={`${monthRevenue}€`} color="var(--gold)" icon="💰" />
        </div>
        <div style={{ marginBottom:16 }}>
          <StatBox label="Revenus wallet" value={`${wallet.income}€`} color="var(--green)" icon="💚" wide />
        </div>

        {/* Overall */}
        <div style={S.sectionTitle}>🏆 Global</div>
        <div className="grid-3" style={{ marginBottom:16 }}>
          <StatBox label="Clients" value={clients.length} color="var(--blue)" icon="👥" />
          <StatBox label="Commandes" value={orders.length} color="var(--purple)" icon="🛒" />
          <StatBox label="Équipe" value={team.length} color="var(--gold)" icon="🌐" />
        </div>

        {/* Loyalty */}
        <div style={S.sectionTitle}>🎁 Fidélité</div>
        <div className="grid-3" style={{ marginBottom:16 }}>
          <StatBox label="Bronze" value={levelCounts.Bronze} color="#cd7f32" icon="🥉" />
          <StatBox label="Argent" value={levelCounts.Argent} color="#a8a9ad" icon="🥈" />
          <StatBox label="Or" value={levelCounts.Or} color="var(--gold)" icon="🥇" />
        </div>

        {/* Today's activity */}
        {Object.keys(sectionCounts).length > 0 && (
          <>
            <div style={S.sectionTitle}>🔍 Activité aujourd'hui</div>
            {Object.entries(sectionCounts).map(([sec, count]) => (
              <div key={sec} style={S.activityRow} className="fade-in">
                <span style={{ fontSize:13 }}>{sec}</span>
                <div style={{ flex:1, margin:'0 12px' }}>
                  <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'var(--gold)', borderRadius:3, width:`${Math.min(100,(count/Math.max(...Object.values(sectionCounts)))*100)}%` }} />
                  </div>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--gold)', minWidth:20, textAlign:'right' }}>{count}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function StatBox({ label, value, color, icon, wide }) {
  return (
    <div style={{ ...S.box, ...(wide?{ gridColumn:'span 2' }:{}) }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color }}>{value}</span>
      <span style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
    </div>
  );
}

const S = {
  sectionTitle: { fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:10, fontWeight:700 },
  box: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  activityRow: { display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid var(--border)' },
};

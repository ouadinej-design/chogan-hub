import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

export default function Reseau() {
  const { getTeam, addTeamMember } = useData();
  const [tab, setTab] = useState('tree');
  const [form, setForm] = useState({ name:'', email:'', phone:'', level:'1', sponsor:'' });
  const [saved, setSaved] = useState('');
  const team = getTeam();

  const handleAdd = () => {
    if (!form.name) return;
    addTeamMember(form);
    setSaved(`✓ ${form.name} ajouté(e) à votre équipe.`);
    setForm({ name:'', email:'', phone:'', level:'1', sponsor:'' });
    setTimeout(() => setSaved(''), 2500);
  };

  const lvl1 = team.filter(m => m.level === '1');
  const lvl2 = team.filter(m => m.level === '2');
  const lvl3 = team.filter(m => m.level === '3');

  return (
    <AppLayout title="Mon Réseau" icon="🌐">
      <div style={S.tabs}>
        {['tree','list','add'].map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>setTab(t)}>
            {t==='tree'?'🌳 Équipe':t==='list'?`📋 Liste (${team.length})`:'➕ Ajouter'}
          </button>
        ))}
      </div>

      {tab === 'tree' && (
        <div style={{ padding:16 }}>
          {/* Summary boxes */}
          <div style={S.summary}>
            {[['Niveau 1', lvl1.length,'#C9A84C'],['Niveau 2',lvl2.length,'#5584e0'],['Niveau 3',lvl3.length,'#8b5cf6']].map(([l,n,c]) => (
              <div key={l} style={S.sumBox}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:22, color:c }}>{n}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', padding:'12px 0', fontFamily:'var(--font-display)', fontSize:14, color:'var(--gold)', letterSpacing:'0.1em', marginBottom:8 }}>
            MOI
          </div>
          {lvl1.length > 0 && (
            <div>
              <div style={S.levelLabel}>─── Niveau 1 ───</div>
              <div style={S.levelGrid}>
                {lvl1.map(m => <MemberBubble key={m.id} member={m} color="#C9A84C" />)}
              </div>
            </div>
          )}
          {lvl2.length > 0 && (
            <div>
              <div style={S.levelLabel}>─── Niveau 2 ───</div>
              <div style={S.levelGrid}>
                {lvl2.map(m => <MemberBubble key={m.id} member={m} color="#5584e0" />)}
              </div>
            </div>
          )}
          {lvl3.length > 0 && (
            <div>
              <div style={S.levelLabel}>─── Niveau 3 ───</div>
              <div style={S.levelGrid}>
                {lvl3.map(m => <MemberBubble key={m.id} member={m} color="#8b5cf6" />)}
              </div>
            </div>
          )}
          {team.length === 0 && <div style={S.empty}>Aucun membre dans votre équipe. Commencez à recruter !</div>}
        </div>
      )}

      {tab === 'list' && (
        <div style={{ padding:16 }}>
          {team.map(m => (
            <div key={m.id} style={S.memberCard} className="fade-in">
              <div style={{ ...S.avatar, background: m.level==='1'?'rgba(201,168,76,0.2)':m.level==='2'?'rgba(85,132,224,0.2)':'rgba(139,92,246,0.2)' }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={S.name}>{m.name}</div>
                {m.email && <div style={S.meta}>{m.email}</div>}
                {m.phone && <div style={S.meta}>{m.phone}</div>}
                {m.sponsor && <div style={S.meta}>Parrain: {m.sponsor}</div>}
              </div>
              <div style={{ textAlign:'right' }}>
                <span className={`badge badge-${m.level==='1'?'gold':m.level==='2'?'blue':'gold'}`}>N{m.level}</span>
                <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:4 }}>{m.status}</div>
              </div>
            </div>
          ))}
          {team.length === 0 && <div style={S.empty}>Aucun membre.</div>}
        </div>
      )}

      {tab === 'add' && (
        <div style={{ padding:16 }}>
          {saved && <div style={S.success}>{saved}</div>}
          <div className="field">
            <label className="label">Nom complet *</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Prénom Nom" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@exemple.com" />
          </div>
          <div className="field">
            <label className="label">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label">Niveau</label>
              <select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>
                <option value="1">Niveau 1</option>
                <option value="2">Niveau 2</option>
                <option value="3">Niveau 3</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Parrain/Marraine</label>
              <input value={form.sponsor} onChange={e=>setForm(p=>({...p,sponsor:e.target.value}))} placeholder="Nom du parrain" />
            </div>
          </div>
          <button className="btn-gold" onClick={handleAdd}>AJOUTER AU RÉSEAU</button>
        </div>
      )}
    </AppLayout>
  );
}

function MemberBubble({ member, color }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:42, height:42, borderRadius:'50%', background:`${color}22`, border:`2px solid ${color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color, margin:'0 auto 4px' }}>
        {member.name.charAt(0)}
      </div>
      <div style={{ fontSize:10, color:'var(--text-muted)', maxWidth:50, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {member.name.split(' ')[0]}
      </div>
    </div>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)' },
  tab: { flex:1, padding:'12px 6px', background:'none', color:'var(--text-muted)', fontSize:12, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  summary: { display:'flex', justifyContent:'space-around', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'14px', marginBottom:20 },
  sumBox: { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  levelLabel: { textAlign:'center', fontSize:11, color:'var(--text-dim)', margin:'10px 0 10px', letterSpacing:'0.1em' },
  levelGrid: { display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center', marginBottom:8 },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'40px 0', fontSize:13 },
  memberCard: { display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:10 },
  avatar: { width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--gold)', flexShrink:0 },
  name: { fontSize:14, fontWeight:600 },
  meta: { fontSize:12, color:'var(--text-muted)', marginTop:2 },
  success: { background:'rgba(76,175,125,0.1)', border:'1px solid rgba(76,175,125,0.3)', borderRadius:10, padding:'12px', color:'var(--green)', fontSize:13, marginBottom:14 },
};

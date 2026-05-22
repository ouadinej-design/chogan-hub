import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { CHECKLIST_DEFAULT } from '../../utils/choganData';
import { store } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function Checklist() {
  const { user } = useAuth();
  const key = `checklist_${user?.id}`;
  const [list, setList] = useState(() => store.get(key, CHECKLIST_DEFAULT));

  const toggle = (id) => {
    const updated = list.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setList(updated);
    store.set(key, updated);
  };
  const reset = () => {
    const fresh = CHECKLIST_DEFAULT.map(i => ({ ...i, done: false }));
    setList(fresh);
    store.set(key, fresh);
  };

  const done = list.filter(i => i.done).length;
  const pct  = Math.round((done / list.length) * 100);

  return (
    <AppLayout title="Check-list" icon="✨"
      actions={<button style={S.resetBtn} onClick={() => { if (window.confirm('Réinitialiser ?')) reset(); }}>↺</button>}
    >
      <div style={{ padding:16 }}>
        {/* Progress */}
        <div style={S.progressCard}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{done}/{list.length} étapes</span>
            <span className={`badge ${pct===100?'badge-green':'badge-gold'}`}>{pct}%</span>
          </div>
          <div style={S.barWrap}>
            <div style={{ ...S.bar, width:`${pct}%` }} />
          </div>
          {pct === 100 && (
            <div style={S.congrats}>
              <span style={{ fontSize:28 }}>🎓</span>
              <p style={{ fontWeight:700, color:'var(--or-deep)', fontSize:14 }}>Onboarding complété ! Félicitations !</p>
            </div>
          )}
        </div>

        {/* Items */}
        {list.map(item => (
          <div key={item.id} style={S.item} onClick={() => toggle(item.id)}>
            <div style={{ ...S.checkbox, ...(item.done ? S.checked : {}) }}>
              {item.done && <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>✓</span>}
            </div>
            <span style={{ fontSize:13, lineHeight:1.5, flex:1, textDecoration: item.done?'line-through':'none', color: item.done?'var(--text-muted)':'var(--taupe)' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

const S = {
  resetBtn: { background:'transparent', border:'1px solid var(--or-border)', color:'var(--text-muted)', borderRadius:8, padding:'5px 10px', fontSize:14, cursor:'pointer' },
  progressCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:16, marginBottom:16 },
  barWrap: { height:8, background:'rgba(210,183,149,0.2)', borderRadius:4, overflow:'hidden' },
  bar: { height:'100%', background:'linear-gradient(90deg, var(--or), var(--or-deep))', borderRadius:4, transition:'width 0.4s ease' },
  congrats: { textAlign:'center', padding:'14px 0 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  item: { display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, marginBottom:8, cursor:'pointer' },
  checkbox: { width:22, height:22, borderRadius:6, border:'2px solid var(--or-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' },
  checked: { background:'linear-gradient(135deg, var(--or), var(--or-deep))', borderColor:'var(--or-deep)' },
};

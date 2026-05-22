import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { FAMILLES, PERFUMES } from '../../utils/choganData';

export default function Familles() {
  const [open, setOpen] = useState(null);

  return (
    <AppLayout title="Familles Olfactives" icon="💐">
      <div style={{ padding:16 }}>
        <div style={S.infoCard}>
          <p style={S.infoTitle}>💐 Les 7 Familles Olfactives</p>
          <p style={S.infoText}>Guide pour orienter vos clientes vers le parfum qui leur correspond. Appuyez sur une famille pour voir les détails et les références.</p>
        </div>
        {FAMILLES.map(f => (
          <div key={f.id} style={{ ...S.card, borderLeftColor: f.couleur }}>
            <div style={S.header} onClick={() => setOpen(open === f.id ? null : f.id)}>
              <span style={{ fontSize:26 }}>{f.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ ...S.name, color: f.couleur }}>{f.nom}</p>
                <p style={S.style}>{f.style}</p>
              </div>
              <span style={{ color: f.couleur, fontSize:16 }}>{open === f.id ? '▲' : '▼'}</span>
            </div>
            {open === f.id && (
              <div style={S.body}>
                <div style={S.row}>
                  <p style={S.rowLabel}>🎵 Notes</p>
                  <p style={S.rowVal}>{f.notes}</p>
                </div>
                <div style={S.row}>
                  <p style={S.rowLabel}>👤 Pour qui</p>
                  <p style={S.rowVal}>{f.pourQui}</p>
                </div>
                <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>
                  Références ({f.refs.length})
                </p>
                <div style={S.refs}>
                  {f.refs.map(ref => {
                    const p = PERFUMES.find(x => x.ref === ref);
                    return p ? (
                      <span key={ref} style={{ ...S.refTag, borderColor: f.couleur + '55', color: f.couleur }}>
                        {ref} · {p.name}
                      </span>
                    ) : (
                      <span key={ref} style={{ ...S.refTag, borderColor: f.couleur + '33', color:'var(--text-muted)' }}>
                        {ref}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

const S = {
  infoCard: { background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 14px', marginBottom:14 },
  infoTitle: { fontSize:12, fontWeight:700, color:'var(--or-deep)', marginBottom:4 },
  infoText: { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  card: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderLeft:'3px solid', borderRadius:14, marginBottom:10, overflow:'hidden' },
  header: { display:'flex', alignItems:'center', gap:12, padding:'14px', cursor:'pointer' },
  name: { fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.06em' },
  style: { fontSize:10, color:'var(--text-muted)', marginTop:3, letterSpacing:'0.08em' },
  body: { padding:'0 14px 14px', borderTop:'1px solid var(--or-border)' },
  row: { background:'rgba(210,183,149,0.06)', borderRadius:8, padding:'10px 12px', marginTop:10, marginBottom:6 },
  rowLabel: { fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.08em', marginBottom:4, textTransform:'uppercase' },
  rowVal: { fontSize:12, color:'var(--taupe)', lineHeight:1.6 },
  refs: { display:'flex', flexWrap:'wrap', gap:6 },
  refTag: { fontSize:10, padding:'3px 8px', borderRadius:20, border:'1px solid', background:'transparent', display:'inline-block' },
};

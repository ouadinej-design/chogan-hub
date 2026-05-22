import AppLayout from '../../components/AppLayout';
import { CATALOGUES } from '../../utils/choganData';

export default function Catalogues() {
  return (
    <AppLayout title="Catalogues" icon="📖">
      <div style={{ padding:16 }}>
        <div style={S.infoCard}>
          <p style={S.infoTitle}>📖 Catalogues officiels Chogan</p>
          <p style={S.infoText}>Appuyez sur un catalogue pour l'ouvrir directement sur le site officiel Chogan.</p>
        </div>
        {CATALOGUES.map((c,i) => (
          <a key={i} href={c.url} target="_blank" rel="noreferrer" style={S.link}>
            <span style={{ fontSize:26, flexShrink:0 }}>{c.ic}</span>
            <div style={{ flex:1 }}>
              <p style={S.linkTitle}>{c.titre}</p>
              <p style={S.linkSub}>{c.desc}</p>
            </div>
            <span style={S.arrow}>↗</span>
          </a>
        ))}
      </div>
    </AppLayout>
  );
}

const S = {
  infoCard: { background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 14px', marginBottom:14 },
  infoTitle: { fontSize:12, fontWeight:700, color:'var(--or-deep)', marginBottom:4 },
  infoText: { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  link: { display:'flex', alignItems:'center', gap:12, padding:'14px', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, marginBottom:10, textDecoration:'none' },
  linkTitle: { fontSize:14, fontWeight:600, color:'var(--taupe)' },
  linkSub: { fontSize:11, color:'var(--text-muted)', marginTop:3 },
  arrow: { color:'var(--or-deep)', fontSize:16, flexShrink:0 },
};

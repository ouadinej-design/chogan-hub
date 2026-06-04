import { useState } from 'react';

import AppLayout from '../../components/AppLayout';
import { SCRIPTS } from '../../utils/choganData';

const QUIZ = [
  { id:1, q:"Quelle est la différence entre les familles Fougère et Chyprée ?",
    opts:["Fougère = boisé aquatique, Chyprée = floral oriental","Fougère = lavande/géranium/viril, Chyprée = bergamote/jasmin/caractère","Fougère = femme, Chyprée = homme","Aucune différence notable"], correct:1 },
  { id:2, q:"Une cliente aime les parfums 'chauds, sensuels, qui laissent un sillage'. Quelle famille ?",
    opts:["Hespéridée","Fleurie","Ambrée/Orientale","Fougère"], correct:2 },
  { id:3, q:"Quelle est la concentration des parfums Chogan par rapport aux grandes marques ?",
    opts:["Inférieure (10-15%)","Équivalente (20-30% luxe)","Supérieure (50%)","Variable"], correct:1 },
  { id:4, q:"Un homme de 45 ans cherche un parfum 'sûr de lui, mature et précieux'. Quelle famille ?",
    opts:["Hespéridée","Aromatique","Boisée","Fougère"], correct:2 },
  { id:5, q:"Quelle est l'ERREUR à ne pas faire lors de l'envoi du lien parrainage ?",
    opts:["L'envoyer par WhatsApp","Envoyer le lien CONSULTANT à la place du lien CLIENT","Préciser que c'est sans engagement","Personnaliser le message"], correct:1 },
];

export default function Formation() {
  const [tab, setTab]       = useState('modules');
  const [openSc, setOpenSc] = useState(null);
  const [qa, setQa]         = useState({});
  const [qdone, setQdone]   = useState(false);
  const score = QUIZ.filter(q => qa[q.id] === q.correct).length;

  return (
    <AppLayout appId="formation" onHelp={resetTuto} title="Formation" icon="🚀">
      <div style={S.tabs}>
        {[['modules','📚 Modules'],['scripts','💬 Scripts'],['quiz','📝 Quiz']].map(([v,l]) => (
          <button key={v} style={{ ...S.tab, ...(tab===v?S.tabActive:{}) }} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* MODULES */}
      {tab === 'modules' && (
        <div style={S.pad}>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>🎬 Académie Chogan</p>
            <p style={S.infoText}>3 modules vidéos pour maîtriser chaque aspect de ton activité. Complète-les dans l'ordre.</p>
          </div>
          {[
            { ic:"📝", t:"Module 1 – Inscription",   d:"Créer ton espace consultant et comprendre la plateforme Chogan", url:"https://mylimitless.be/" },
            { ic:"👜", t:"Module 2 – La Mallette",   d:"Présentation des produits et tes premières ventes",             url:"https://drive.google.com/file/d/1s3EKcodYivoV1wVBnkWlG3Uk4gGWkp48/view" },
            { ic:"💰", t:"Module 3 – La Vente",      d:"Techniques de vente, objections et closing efficace",           url:"https://drive.google.com/file/d/1XLsJsyvHPe7GHSrRHvxScbligxILIcvH/view" },
          ].map((m,i) => (
            <a key={i} href={m.url} target="_blank" rel="noreferrer" style={S.link}>
              <span style={{ fontSize:22 }}>{m.ic}</span>
              <div style={{ flex:1 }}>
                <p style={S.linkTitle}>{m.t}</p>
                <p style={S.linkSub}>{m.d}</p>
              </div>
              <span style={S.arrow}>▶</span>
            </a>
          ))}

          <div style={S.divider} />
          <p style={S.secLabel}>📚 Documents</p>
          {[
            { ic:"🌟", t:"Programme Ambassadeur", url:"https://drive.google.com/file/d/1d952VZyjBs6XM7rVmpr1K07GnP0is1U2/view" },
            { ic:"📖", t:"Book 1",                url:"https://drive.google.com/file/d/1wrZCau12O-JQ3Pfkmu2Mu2qHQCP9_cdb/view" },
            { ic:"📗", t:"Book 2",                url:"https://drive.google.com/file/d/1V4JLCN7rIqWnd7UYTH8MTLzsN0UKybzQ/view" },
          ].map((r,i) => (
            <a key={i} href={r.url} target="_blank" rel="noreferrer" style={S.link}>
              <span style={{ fontSize:22 }}>{r.ic}</span>
              <div style={{ flex:1 }}><p style={S.linkTitle}>{r.t}</p><p style={S.linkSub}>Ouvrir via Google Drive</p></div>
              <span style={S.arrowBlue}>↗</span>
            </a>
          ))}
        </div>
      )}

      {/* SCRIPTS */}
      {tab === 'scripts' && (
        <div style={S.pad}>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>💬 Scripts de contact</p>
            <p style={S.infoText}>4 scripts éprouvés. Personnalise toujours avec le prénom et adapte au contexte.</p>
          </div>
          {SCRIPTS.map(s => (
            <div key={s.id} style={S.scriptCard}>
              <div style={S.scriptHeader} onClick={() => setOpenSc(openSc === s.id ? null : s.id)}>
                <div>
                  <p style={S.scriptTitle}>{s.title}</p>
                  <p style={S.scriptCtx}>{s.ctx}</p>
                </div>
                <span style={{ color:'var(--or-deep)' }}>{openSc === s.id ? '▲' : '▼'}</span>
              </div>
              {openSc === s.id && (
                <div style={S.scriptBody}>
                  <div style={S.scriptText}>{s.text}</div>
                  <div style={S.tip}>💡 {s.tip}</div>
                  <button className="btn-outline" style={{ width:'100%', marginTop:8 }}
                    onClick={() => navigator.clipboard?.writeText(s.text).then(() => alert('Script copié ! 📋'))}>
                    📋 Copier le script
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QUIZ */}
      {tab === 'quiz' && (
        <div style={S.pad}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontWeight:600, fontSize:14 }}>Quiz de Certification</p>
            <span className="badge badge-gold">4/5 requis</span>
          </div>
          {!qdone ? (
            <>
              {QUIZ.map((q,qi) => (
                <div key={q.id} style={S.qCard}>
                  <p style={S.qText}>{qi+1}. {q.q}</p>
                  {q.opts.map((opt,oi) => (
                    <button key={oi} style={{ ...S.qOpt, ...(qa[q.id]===oi?S.qOptSel:{}) }}
                      onClick={() => setQa(p => ({...p,[q.id]:oi}))}>
                      {opt}
                    </button>
                  ))}
                </div>
              ))}
              <button className="btn-gold" onClick={() => {
                if (Object.keys(qa).length < QUIZ.length) { alert('Réponds à toutes les questions !'); return; }
                setQdone(true);
              }}>VALIDER LE QUIZ</button>
            </>
          ) : (
            <>
              <div style={{ ...S.qCard, textAlign:'center', padding:24 }}>
                <p style={{ fontSize:40 }}>{score >= 4 ? '🎓' : '📚'}</p>
                <p style={{ fontSize:28, fontWeight:700, color: score>=4?'var(--or-deep)':'var(--red)', marginTop:8 }}>{score}/5</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:8 }}>
                  {score >= 4 ? 'Certification obtenue ! Félicitations ! 🎉' : 'Score insuffisant — révise et réessaie'}
                </p>
              </div>
              {QUIZ.map((q,qi) => (
                <div key={q.id} style={S.qCard}>
                  <p style={S.qText}>{qi+1}. {q.q}</p>
                  {q.opts.map((opt,oi) => (
                    <button key={oi} style={{ ...S.qOpt,
                      ...(oi===q.correct?{borderColor:'var(--green)',background:'rgba(74,124,89,0.08)',color:'var(--green)'}:{}),
                      ...(qa[q.id]===oi&&oi!==q.correct?{borderColor:'var(--red)',background:'rgba(192,57,43,0.08)',color:'var(--red)'}:{})
                    }}>{opt}</button>
                  ))}
                </div>
              ))}
              <button className="btn-outline" style={{ width:'100%' }} onClick={() => { setQa({}); setQdone(false); }}>
                ↺ Reprendre le quiz
              </button>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--or-border)' },
  tab: { flex:1, padding:'12px 6px', background:'none', color:'var(--text-muted)', fontSize:12, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  pad: { padding:16 },
  infoCard: { background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 14px', marginBottom:14 },
  infoTitle: { fontSize:12, fontWeight:700, color:'var(--or-deep)', marginBottom:4 },
  infoText: { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  link: { display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, marginBottom:8, textDecoration:'none' },
  linkTitle: { fontSize:13, fontWeight:600, color:'var(--taupe)' },
  linkSub: { fontSize:11, color:'var(--text-muted)', marginTop:2 },
  arrow: { color:'var(--or-deep)', fontSize:14 },
  arrowBlue: { color:'var(--blue)', fontSize:14 },
  divider: { height:1, background:'var(--or-border)', margin:'16px 0 12px' },
  secLabel: { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  scriptCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, marginBottom:10, overflow:'hidden' },
  scriptHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', cursor:'pointer' },
  scriptTitle: { fontSize:13, fontWeight:600, color:'var(--taupe)' },
  scriptCtx: { fontSize:11, color:'var(--text-muted)', marginTop:2 },
  scriptBody: { padding:'0 14px 14px', borderTop:'1px solid var(--or-border)' },
  scriptText: { background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:10, padding:12, fontSize:13, lineHeight:1.7, margin:'12px 0', color:'var(--taupe)', fontStyle:'italic' },
  tip: { fontSize:11, color:'var(--green)', padding:'7px 11px', background:'rgba(74,124,89,0.08)', borderRadius:8 },
  qCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:14, marginBottom:10 },
  qText: { fontSize:13, fontWeight:600, marginBottom:10, lineHeight:1.5, color:'var(--taupe)' },
  qOpt: { display:'block', width:'100%', textAlign:'left', padding:'9px 12px', marginBottom:6, borderRadius:8, border:'1px solid var(--or-border)', background:'transparent', color:'var(--text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)' },
  qOptSel: { borderColor:'var(--or-deep)', background:'var(--or-pale)', color:'var(--or-deep)' },
};

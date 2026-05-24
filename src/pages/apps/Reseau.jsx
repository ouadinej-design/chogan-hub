import { useState } from 'react';
import AppLayout from '../../components/AppLayout';

export default function Reseau() {
  const [tree, setTree]         = useState(() => { try { return JSON.parse(localStorage.getItem('le_tree')||'{"nodes":[]}'); } catch { return {nodes:[]}; } });
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('Consultante');
  const [parentId, setParentId] = useState('');
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState('tree');

  const sales = (() => { try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; } })();

  const saveTree = (t) => { setTree(t); localStorage.setItem('le_tree', JSON.stringify(t)); };

  const addNode = () => {
    if (!name.trim()) return;
    // Vérifier doublon
    const exists = tree.nodes.some(n => n.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (exists) {
      alert(`"${name.trim()}" existe déjà dans le réseau.`);
      return;
    }
    const n = { id:Date.now().toString(), name:name.trim(), role, parentId:parentId||null };
    saveTree({ nodes:[...tree.nodes, n] });
    setName(''); setParentId('');
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const deduped = tree.nodes.filter(n => {
      const key = n.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (deduped.length < tree.nodes.length) {
      saveTree({ nodes:deduped });
      alert(`✅ ${tree.nodes.length - deduped.length} doublon(s) supprimé(s).`);
    } else {
      alert('Aucun doublon trouvé.');
    }
  };

  const delNode = (id) => {
    if (!window.confirm('Supprimer ce membre et ses filleuls ?')) return;
    const keep = tree.nodes.filter(n => n.id!==id && n.parentId!==id);
    saveTree({ nodes:keep }); setSelected(null);
  };

  const roots    = tree.nodes.filter(n => !n.parentId);
  const getCA    = (nodeName) => sales.filter(s=>s.consultant===nodeName).reduce((t,s)=>t+(parseFloat(s.amount||s.amt)||0),0);
  const getTeamCA = (nodeId) => {
    const node = tree.nodes.find(n=>n.id===nodeId);
    if (!node) return 0;
    const direct = getCA(node.name);
    const children = tree.nodes.filter(n=>n.parentId===nodeId);
    return direct + children.reduce((t,c)=>t+getTeamCA(c.id),0);
  };

  const NodeCard = ({ node }) => {
    const ca = getCA(node.name);
    const isManager = node.role === 'Manager' || node.role === 'Marraine';
    return (
      <div onClick={() => setSelected(node.id === selected ? null : node.id)}
        style={{ background:isManager?'linear-gradient(135deg,rgba(184,154,106,0.15),rgba(184,154,106,0.05))':'var(--bg-card)', border:`1px solid ${isManager?'var(--or-border)':'rgba(210,183,149,0.2)'}`, borderRadius:12, padding:'10px', textAlign:'center', cursor:'pointer', width:90, flexShrink:0 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:isManager?'linear-gradient(135deg,var(--or),var(--or-deep))':'rgba(210,183,149,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 5px', fontSize:13 }}>
          {isManager ? '👑' : '👤'}
        </div>
        <p style={{ fontSize:9, fontWeight:700, color:'var(--taupe)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>{node.name}</p>
        <p style={{ fontSize:7, color: isManager?'var(--or-deep)':'var(--text-muted)', fontWeight:600, marginTop:2 }}>{node.role}</p>
        {ca > 0 && <p style={{ fontSize:7, color:'var(--text-dim)', marginTop:2 }}>{ca.toFixed(0)} DA</p>}
        {selected === node.id && (
          <button onClick={e=>{e.stopPropagation();delNode(node.id);}} style={{ marginTop:6, background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:6, padding:'3px 8px', fontSize:9, color:'var(--red)', cursor:'pointer', fontFamily:'var(--font-body)', width:'100%' }}>🗑 Suppr.</button>
        )}
      </div>
    );
  };

  const RenderLevel = ({ parentId:pid, depth=0 }) => {
    const children = tree.nodes.filter(n => n.parentId === pid);
    if (!children.length) return null;
    return (
      <div style={{ paddingLeft:depth>0?16:0, marginTop:8 }}>
        {depth > 0 && <div style={{ width:2, height:12, background:'var(--or-border)', marginLeft:44, marginBottom:-4 }}/>}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {children.map(node => (
            <div key={node.id}>
              <NodeCard node={node}/>
              <RenderLevel parentId={node.id} depth={depth+1}/>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Stats équipe
  const totalCA    = tree.nodes.reduce((t,n) => t+getCA(n.name), 0);
  const activeCount = tree.nodes.filter(n => getCA(n.name) > 0).length;

  return (
    <AppLayout title="Mon Réseau" icon="🌐">
      <div style={{ display:'flex', borderBottom:'1px solid var(--or-border)' }}>
        {[['tree','🌳 Organigramme'],['add','➕ Ajouter'],['stats','📊 Stats équipe']].map(([k,l]) => (
          <button key={k} style={{ flex:1, padding:'11px 4px', background:'none', color:tab===k?'var(--or-deep)':'var(--text-muted)', fontSize:11, borderBottom:tab===k?'2px solid var(--or-deep)':'2px solid transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ORGANIGRAMME */}
      {tab === 'tree' && (
        <div style={S.pad}>
          {tree.nodes.length === 0 ? (
            <div style={S.empty}>
              <p style={{ fontSize:32, marginBottom:8 }}>🌐</p>
              <p>Votre réseau est vide.</p>
              <p style={{ fontSize:12, marginTop:4 }}>Ajoutez vos membres depuis l'onglet ➕ Ajouter.</p>
            </div>
          ) : (
            <>
              {roots.length > 0 && (
                <div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {roots.map(node => (
                      <div key={node.id}>
                        <NodeCard node={node}/>
                        <RenderLevel parentId={node.id} depth={1}/>
                      </div>
                    ))}
                  </div>
                  <RenderLevel parentId={null} depth={0}/>
                </div>
              )}
              {roots.length === 0 && <RenderLevel parentId={null} depth={0}/>}
            </>
          )}
        </div>
      )}

      {/* AJOUTER */}
      {tab === 'add' && (
        <div style={S.pad}>
          <div style={S.section}>
            <p style={S.secLabel}>Nouveau membre</p>
            <div className="field"><label className="label">Nom *</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom Nom" /></div>
            <div className="field"><label className="label">Rôle</label>
              <select value={role} onChange={e=>setRole(e.target.value)}>
                {['Consultante','Manager','Marraine','VIP'].map(r => <option key={r}>{r}</option>)}
              </select></div>
            <div className="field"><label className="label">Parrainée par (optionnel)</label>
              <select value={parentId} onChange={e=>setParentId(e.target.value)}>
                <option value="">— Racine (moi) —</option>
                {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.role})</option>)}
              </select></div>
            <button className="btn-gold" onClick={addNode} disabled={!name.trim()}>➕ Ajouter au réseau</button>
          </div>
          <div style={{marginTop:8}}>
            <button className="btn-outline" style={{width:'100%',fontSize:11}} onClick={removeDuplicates}>🧹 Supprimer les doublons existants</button>
          </div>
          {tree.nodes.length > 0 && (
            <div style={S.section}>
              <p style={S.secLabel}>Membres ({tree.nodes.length})</p>
              {tree.nodes.map(n => {
                const parent = tree.nodes.find(x=>x.id===n.parentId);
                return (
                  <div key={n.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(210,183,149,0.12)' }}>
                    <span style={{ fontSize:16 }}>{n.role==='Manager'||n.role==='Marraine'?'👑':'👤'}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--taupe)' }}>{n.name}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)' }}>{n.role}{parent?` · Filleule de ${parent.name}`:''}</p>
                    </div>
                    <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:14 }} onClick={() => delNode(n.id)}>🗑</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATS ÉQUIPE */}
      {tab === 'stats' && (
        <div style={S.pad}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            {[{v:tree.nodes.length,l:'Membres'},{v:activeCount,l:'Actifs'},{v:totalCA.toFixed(0)+' DA',l:'CA total'}].map((x,i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px', textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:700, color:'var(--or-deep)', fontFamily:'var(--font-display)' }}>{x.v}</p>
                <p style={{ fontSize:9, color:'var(--text-muted)' }}>{x.l}</p>
              </div>
            ))}
          </div>
          {tree.nodes.length === 0 ? (
            <div style={S.empty}>Ajoutez des membres pour voir les statistiques équipe.</div>
          ) : (
            <div style={S.section}>
              <p style={S.secLabel}>Performance par membre</p>
              {tree.nodes.sort((a,b) => getCA(b.name)-getCA(a.name)).map((n,i) => {
                const ca = getCA(n.name);
                const maxCA = Math.max(...tree.nodes.map(x=>getCA(x.name)),1);
                return (
                  <div key={n.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:18, height:18, borderRadius:4, background:i===0?'linear-gradient(135deg,var(--or),var(--or-deep))':'rgba(210,183,149,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:i===0?'#fff':'var(--text-muted)' }}>{i+1}</div>
                        <span style={{ fontWeight:600, color:'var(--taupe)' }}>{n.name}</span>
                        <span style={{ fontSize:10, color:'var(--text-muted)' }}>({n.role})</span>
                      </div>
                      <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{ca.toFixed(0)} DA</span>
                    </div>
                    <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:3, height:5, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:3, width:Math.round((ca/maxCA)*100)+'%', background:'linear-gradient(90deg,var(--or),var(--or-deep))' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

const S = {
  pad:      { padding:16 },
  section:  { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:12 },
  secLabel: { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  empty:    { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
};

import { useState } from 'react';
import AppLayout from '../../components/AppLayout';

const ROLE_STYLE = {
  'Consultante': { cardBg:'#EFF4FB', border:'#A8C0E0', color:'#3d6b9e', avatarBg:'#3d6b9e', icon:'👤' },
  'Manager':     { cardBg:'#FDF6E3', border:'#D4AF37', color:'#8a6800', avatarBg:'#D4AF37', icon:'⭐' },
  'Marraine':    { cardBg:'#F9EEF5', border:'#C97FB3', color:'#9e5a7a', avatarBg:'#9e5a7a', icon:'👑' },
  'VIP':         { cardBg:'#F5EFE8', border:'#B89A6A', color:'#6b4a1e', avatarBg:'#B89A6A', icon:'💎' },
};
const DEF = { cardBg:'#EFF7F1', border:'#7EC8A0', color:'#2d7a4a', avatarBg:'#4a7c59', icon:'👤' };

export default function Reseau() {
  const [tree, setTree]         = useState(() => { try { return JSON.parse(localStorage.getItem('le_tree')||'{"nodes":[]}'); } catch { return {nodes:[]}; } });
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('Consultante');
  const [parentId, setParentId] = useState('');
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState('tree');
  const [editNode, setEditNode] = useState(null);
  const [editForm, setEditForm] = useState({name:'',role:'Consultante',parentId:''});

  const sales = (() => { try { return JSON.parse(localStorage.getItem('le_sales')||'[]'); } catch { return []; } })();
  const saveTree = t => { setTree(t); localStorage.setItem('le_tree', JSON.stringify(t)); };
  const getCA    = name => sales.filter(s=>s.consultant===name).reduce((t,s)=>t+(parseFloat(s.amount||s.amt)||0),0);

  const addNode = () => {
    if (!name.trim()) return;
    if (tree.nodes.some(n=>n.name.toLowerCase().trim()===name.toLowerCase().trim())) {
      alert(`"${name.trim()}" existe déjà.`); return;
    }
    saveTree({ nodes:[...tree.nodes, { id:Date.now().toString(), name:name.trim(), role, parentId:parentId||null }] });
    setName(''); setParentId('');
  };

  const delNode = id => {
    if (!window.confirm('Supprimer ?')) return;
    saveTree({ nodes:tree.nodes.filter(n=>n.id!==id&&n.parentId!==id) });
    setSelected(null);
  };

  const openEdit = node => {
    setEditNode(node.id);
    setEditForm({ name:node.name, role:node.role, parentId:node.parentId||'' });
    setTab('add');
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) return;
    saveTree({ nodes:tree.nodes.map(n=>n.id!==editNode?n:{...n,name:editForm.name.trim(),role:editForm.role,parentId:editForm.parentId||null}) });
    setEditNode(null); setEditForm({name:'',role:'Consultante',parentId:''});
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const deduped = tree.nodes.filter(n=>{ const k=n.name.toLowerCase().trim(); if(seen.has(k)) return false; seen.add(k); return true; });
    saveTree({nodes:deduped});
    alert(deduped.length < tree.nodes.length ? `✅ ${tree.nodes.length-deduped.length} doublon(s) supprimé(s).` : 'Aucun doublon.');
  };

  // ── Mini carte membre ──────────────────────────────────
  const MemberCard = ({ node }) => {
    const st       = ROLE_STYLE[node.role] || DEF;
    const ca       = getCA(node.name);
    const sel      = selected === node.id;
    const hasKids  = tree.nodes.some(n => n.parentId === node.id);
    const kidCount = tree.nodes.filter(n => n.parentId === node.id).length;
    return (
      <div onClick={() => setSelected(sel ? null : node.id)}
        style={{ background:st.cardBg, border:`2px solid ${sel?st.border:st.border+'88'}`, borderRadius:14, padding:'10px 8px', textAlign:'center', cursor:'pointer', minWidth:90, maxWidth:110, flexShrink:0, boxShadow:sel?`0 0 0 2px ${st.border}`:'none', position:'relative' }}>
        {/* Badge Parrain si a des filleul(e)s */}
        {hasKids && (
          <div style={{ position:'absolute', top:-8, left:'50%', transform:'translateX(-50%)', background:'#9e5a7a', color:'#fff', fontSize:8, fontWeight:700, padding:'2px 8px', borderRadius:20, whiteSpace:'nowrap' }}>
            👑 Parrain · {kidCount}
          </div>
        )}
        <div style={{ width:34, height:34, borderRadius:'50%', background:st.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', margin:`${hasKids?'8':'0'}px auto 6px`, fontSize:13, color:'#fff', fontWeight:700 }}>
          {node.name[0]?.toUpperCase()}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:'#2d2520', lineHeight:1.2, marginBottom:3 }}>{node.name}</p>
        <span style={{ fontSize:9, color:st.color, fontWeight:600 }}>{st.icon} {node.role}</span>
        {ca>0 && <p style={{ fontSize:8, color:'var(--or-deep)', fontWeight:700, marginTop:4 }}>{ca.toFixed(0)} DA</p>}
        {sel && (
          <div style={{ display:'flex', gap:4, marginTop:8 }}>
            <button onClick={e=>{e.stopPropagation();openEdit(node);}} style={S.actBtn}>✏️</button>
            <button onClick={e=>{e.stopPropagation();delNode(node.id);}} style={{...S.actBtn,color:'var(--red)',background:'rgba(192,57,43,0.08)',borderColor:'rgba(192,57,43,0.2)'}}>🗑</button>
          </div>
        )}
      </div>
    );
  };

  // ── Flèche connecteur horizontal ──────────────────────
  const Arrow = () => (
    <div style={{ display:'flex', alignItems:'center', flexShrink:0, padding:'0 4px' }}>
      <div style={{ width:24, height:2, background:'var(--or-border)' }}/>
      <div style={{ width:0, height:0, borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderLeft:'7px solid var(--or-border)' }}/>
    </div>
  );

  // ── Construire les chaînes horizontales depuis les racines ──
  const getChildren = parentId => tree.nodes.filter(n => n.parentId === parentId);

  // Rendu récursif horizontal : node → enfant → enfant...
  const RenderChain = ({ nodeId }) => {
    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = getChildren(nodeId);
    return (
      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
        <MemberCard node={node}/>
        {children.map(child => (
          <div key={child.id} style={{ display:'flex', alignItems:'center' }}>
            <Arrow/>
            <RenderChain nodeId={child.id}/>
          </div>
        ))}
      </div>
    );
  };

  const roots = tree.nodes.filter(n => !n.parentId);
  const totalCA = tree.nodes.reduce((t,n)=>t+getCA(n.name),0);
  const active  = tree.nodes.filter(n=>getCA(n.name)>0).length;

  return (
    <AppLayout title="Mon Réseau" icon="🌐">
      <div style={S.tabs}>
        {[['tree','🌳 Organigramme'],['add','➕ Ajouter'],['stats','📊 Stats']].map(([k,l]) => (
          <button key={k} style={{ ...S.tab, ...(tab===k?S.tabActive:{}) }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ORGANIGRAMME */}
      {tab === 'tree' && (
        <div style={{ padding:16 }}>


          {tree.nodes.length === 0 ? (
            <div style={S.empty}>
              <p style={{ fontSize:32, marginBottom:8 }}>🌐</p>
              <p>Réseau vide. Ajoutez des membres.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {roots.map(root => (
                <div key={root.id} style={{ overflowX:'auto', paddingBottom:4 }}>
                  <RenderChain nodeId={root.id}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AJOUTER / MODIFIER */}
      {tab === 'add' && (
        <div style={{ padding:16 }}>
          <div style={S.section}>
            <p style={S.secLabel}>{editNode ? '✏️ Modifier' : '➕ Nouveau membre'}</p>
            {editNode ? (<>
              <div className="field"><label className="label">Nom *</label>
                <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/></div>
              <div className="field"><label className="label">Rôle</label>
                <select value={editForm.role} onChange={e=>setEditForm(p=>({...p,role:e.target.value}))}>
                  {['Consultante','Manager','Marraine','VIP'].map(r=><option key={r}>{r}</option>)}
                </select></div>
              <div className="field"><label className="label">Filleule de</label>
                <select value={editForm.parentId} onChange={e=>setEditForm(p=>({...p,parentId:e.target.value}))}>
                  <option value="">— Personne (racine) —</option>
                  {tree.nodes.filter(n=>n.id!==editNode).map(n=><option key={n.id} value={n.id}>{n.name} ({n.role})</option>)}
                </select></div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn-gold" style={{ flex:1 }} onClick={saveEdit}>💾 Enregistrer</button>
                <button className="btn-outline" style={{ padding:'10px 14px', width:'auto' }} onClick={()=>{setEditNode(null);setEditForm({name:'',role:'Consultante',parentId:''});}}>Annuler</button>
              </div>
            </>) : (<>
              <div className="field"><label className="label">Nom *</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom Nom"/></div>
              <div className="field"><label className="label">Rôle</label>
                <select value={role} onChange={e=>setRole(e.target.value)}>
                  {['Consultante','Manager','Marraine','VIP'].map(r=><option key={r}>{r}</option>)}
                </select></div>
              <div className="field"><label className="label">Filleule de</label>
                <select value={parentId} onChange={e=>setParentId(e.target.value)}>
                  <option value="">— Personne (racine) —</option>
                  {tree.nodes.map(n=><option key={n.id} value={n.id}>{n.name} ({n.role})</option>)}
                </select></div>
              <button className="btn-gold" onClick={addNode} disabled={!name.trim()}>➕ Ajouter</button>
            </>)}
          </div>

          {/* Liste membres */}
          {tree.nodes.length > 0 && (
            <div style={S.section}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <p style={S.secLabel}>Membres ({tree.nodes.length})</p>
                <button style={{ fontSize:10, background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:8, padding:'4px 10px', color:'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font-body)' }} onClick={removeDuplicates}>🧹 Doublons</button>
              </div>
              {tree.nodes.map(n => {
                const parent = tree.nodes.find(x=>x.id===n.parentId);
                const st = ROLE_STYLE[n.role]||DEF;
                return (
                  <div key={n.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(210,183,149,0.12)' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:st.bg, border:`1.5px solid ${st.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:st.color, flexShrink:0 }}>{n.name[0]?.toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--taupe)' }}>{n.name}</p>
                      <p style={{ fontSize:10, color:st.color }}>{st.icon} {n.role}{parent?` · Filleule de ${parent.name}`:''}</p>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      <button style={S.actBtn} onClick={()=>openEdit(n)}>✏️</button>
                      <button style={{...S.actBtn,color:'var(--red)',background:'rgba(192,57,43,0.08)',borderColor:'rgba(192,57,43,0.2)'}} onClick={()=>delNode(n.id)}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATS */}
      {tab === 'stats' && (
        <div style={{ padding:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            {[{v:tree.nodes.length,l:'Membres'},{v:active,l:'Actifs'},{v:totalCA.toFixed(0)+' DA',l:'CA total'}].map((x,i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, padding:'10px', textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:700, color:'var(--or-deep)', fontFamily:'var(--font-display)' }}>{x.v}</p>
                <p style={{ fontSize:9, color:'var(--text-muted)' }}>{x.l}</p>
              </div>
            ))}
          </div>
          {tree.nodes.length === 0
            ? <div style={S.empty}>Ajoutez des membres pour voir les statistiques.</div>
            : <div style={S.section}>
                <p style={S.secLabel}>Performance</p>
                {tree.nodes.sort((a,b)=>getCA(b.name)-getCA(a.name)).map((n,i)=>{
                  const ca=getCA(n.name), maxCA=Math.max(...tree.nodes.map(x=>getCA(x.name)),1), st=ROLE_STYLE[n.role]||DEF;
                  return (
                    <div key={n.id} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, marginBottom:4 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:18,height:18,borderRadius:4,background:i===0?'linear-gradient(135deg,var(--or),var(--or-deep))':st.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:i===0?'#fff':st.color }}>{i+1}</div>
                          <span style={{ fontWeight:600, color:'var(--taupe)' }}>{n.name}</span>
                          <span style={{ fontSize:10, color:st.color }}>{st.icon}</span>
                        </div>
                        <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{ca.toFixed(0)} DA</span>
                      </div>
                      <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:3, height:5, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:3, width:Math.round((ca/maxCA)*100)+'%', background:`linear-gradient(90deg,${st.color},${st.color}88)` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}
    </AppLayout>
  );
}

const S = {
  tabs:      { display:'flex', borderBottom:'1px solid var(--or-border)' },
  tab:       { flex:1, padding:'12px 6px', background:'none', color:'var(--text-muted)', fontSize:11, borderBottom:'2px solid transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  section:   { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:12 },
  secLabel:  { fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--or-deep)', marginBottom:10 },
  actBtn:    { flex:1, background:'var(--or-pale)', border:'1px solid var(--or-border)', borderRadius:8, padding:'4px 6px', fontSize:11, color:'var(--or-deep)', cursor:'pointer', fontFamily:'var(--font-body)' },
  empty:     { textAlign:'center', color:'var(--text-muted)', padding:'40px 20px', fontSize:13, lineHeight:1.7 },
};

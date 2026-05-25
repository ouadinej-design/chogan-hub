import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const ROLE_STYLE = {
  'Consultante': { cardBg:'#EFF4FB', border:'#A8C0E0', color:'#3d6b9e', avatarBg:'#3d6b9e', icon:'👤' },
  'Manager':     { cardBg:'#FDF6E3', border:'#D4AF37', color:'#8a6800', avatarBg:'#D4AF37', icon:'⭐' },
  'Marraine':    { cardBg:'#F9EEF5', border:'#C97FB3', color:'#9e5a7a', avatarBg:'#9e5a7a', icon:'👑' },
  'VIP':         { cardBg:'#F5EFE8', border:'#B89A6A', color:'#6b4a1e', avatarBg:'#B89A6A', icon:'💎' },
};
const DEF = { cardBg:'#EFF7F1', border:'#7EC8A0', color:'#2d7a4a', avatarBg:'#4a7c59', icon:'👤' };

export default function Reseau() {
  const { user } = useAuth();
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
          <div style={{ background:'#9e5a7a', color:'#fff', fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:20, marginBottom:8, display:'inline-block', boxShadow:'0 2px 8px rgba(158,90,122,0.4)' }}>
            👑 Parrain ({kidCount})
          </div>
        )}
        <div style={{ width:34, height:34, borderRadius:'50%', background:st.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px', fontSize:13, color:'#fff', fontWeight:700 }}>
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'2px 0', paddingLeft:20 }}>
      <div style={{ width:2, height:18, background:'var(--or-border)' }}/>
      <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'7px solid var(--or-border)' }}/>
    </div>
  );

  // ── Construire les chaînes horizontales depuis les racines ──
  const getChildren = parentId => tree.nodes.filter(n => n.parentId === parentId);

  // Rendu récursif horizontal : node → enfant → enfant...
  const RenderChain = ({ nodeId, depth = 0 }) => {
    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = getChildren(nodeId);
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
        <div style={{ marginLeft: depth * 24 }}>
          <MemberCard node={node}/>
        </div>
        {children.map(child => (
          <div key={child.id} style={{ display:'flex', flexDirection:'column', marginLeft: depth * 24 }}>
            <Arrow/>
            <RenderChain nodeId={child.id} depth={depth + 1}/>
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


          {(() => {
            const vips      = roots.filter(n => n.role === 'VIP');
            const managers  = roots.filter(n => n.role === 'Manager');
            const others    = roots.filter(n => n.role !== 'VIP' && n.role !== 'Manager');

            const SectionLabel = ({ label, color }) => (
              <p style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color, marginBottom:6, paddingLeft:2 }}>{label}</p>
            );

            const CardRow = ({ nodes }) => (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                {nodes.map(n => <MemberCard key={n.id} node={n}/>)}
              </div>
            );

            return (
              <div>
                {/* 1. VIP */}
                {vips.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <SectionLabel label="💎 VIP" color="#8b5a2b"/>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {vips.map(root => (
                        <div key={root.id} style={{ paddingBottom:4 }}>
                          <RenderChain nodeId={root.id}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ height:1, background:'var(--or-border)', marginBottom:10, marginTop:10 }}/>
                  </div>
                )}

                {/* 2. Manager */}
                {managers.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <SectionLabel label="⭐ Manager" color="#B89A6A"/>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {managers.map(root => (
                        <div key={root.id} style={{ paddingBottom:4 }}>
                          <RenderChain nodeId={root.id}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ height:1, background:'var(--or-border)', marginBottom:10, marginTop:10 }}/>
                  </div>
                )}

                {/* 3. Marraine (compte connecté) */}
                {user && (user.role === 'marraine' || user.role === 'admin') && (
                  <div style={{ marginBottom:14 }}>
                    <SectionLabel label="👑 Marraine" color="#9e5a7a"/>
                    <div style={{ background:'rgba(158,90,122,0.08)', border:'2px solid rgba(158,90,122,0.3)', borderRadius:14, padding:'10px 12px', display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'#9e5a7a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:700, flexShrink:0 }}>
                        {(user.firstName||'?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:12, fontWeight:700, color:'var(--taupe)' }}>{user.firstName} {user.lastName}</p>
                        <p style={{ fontSize:9, color:'#9e5a7a', fontWeight:600 }}>👑 Marraine</p>
                      </div>
                    </div>
                    <div style={{ height:1, background:'var(--or-border)', marginBottom:10 }}/>
                  </div>
                )}

                {/* 4. Marraines du réseau (racines avec rôle Marraine) */}
                {others.filter(n=>n.role==='Marraine'||n.role==='Parrain').length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <SectionLabel label="👑 Marraines / Parrains" color="#9e5a7a"/>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {others.filter(n=>n.role==='Marraine'||n.role==='Parrain').map(root => (
                        <div key={root.id} style={{ paddingBottom:4 }}>
                          <RenderChain nodeId={root.id}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ height:1, background:'var(--or-border)', marginTop:10, marginBottom:10 }}/>
                  </div>
                )}

                {/* 5. Consultantes sans parrain (racines) */}
                {others.filter(n=>n.role==='Consultante').length > 0 && (
                  <div>
                    <SectionLabel label="👤 Consultantes" color="#3d6b9e"/>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {others.filter(n=>n.role==='Consultante').map(root => (
                        <div key={root.id} style={{ paddingBottom:4 }}>
                          <RenderChain nodeId={root.id}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tree.nodes.length === 0 && (
                  <div style={S.empty}>
                    <p style={{ fontSize:32, marginBottom:8 }}>🌐</p>
                    <p>Réseau vide. Ajoutez des membres.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* AJOUTER / MODIFIER */}
      {tab === 'add' && (
        <div style={{ padding:16 }}>
          <div style={S.section}>
            <p style={S.secLabel}>{editNode ? '✏️ Modifier' : '➕ Ajouter une consultante'}</p>
            {!editNode && user?.role === 'marraine' && (
              <div style={{ background:'rgba(158,90,122,0.08)', border:'1px solid rgba(158,90,122,0.2)', borderRadius:10, padding:'8px 12px', marginBottom:12, fontSize:11, color:'#9e5a7a' }}>
                👑 En tant que Marraine, vous gérez votre équipe de consultantes.
              </div>
            )}
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
            : (() => {
                // Only Consultantes in performance stats
                const consultantes = tree.nodes
                  .filter(n => n.role === 'Consultante')
                  .map(n => ({ ...n, ...getCAByCur(n.name) }))
                  .sort((a,b) => (b.eu*245+b.da) - (a.eu*245+a.da));
                const maxEU = Math.max(...consultantes.map(n=>n.eu), 1);
                const maxDA = Math.max(...consultantes.map(n=>n.da), 1);

                return <>
                  {/* Stats globales équipe */}
                  <div style={S.section}>
                    <p style={S.secLabel}>CA Équipe</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {[
                        { v:`${consultantes.reduce((t,n)=>t+n.eu,0).toFixed(0)} €`, l:'Total €', c:'var(--or-deep)' },
                        { v:`${consultantes.reduce((t,n)=>t+n.da,0).toLocaleString('fr-FR')} DA`, l:'Total DA', c:'var(--blue)' },
                      ].map((x,i) => (
                        <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:10, padding:'10px', textAlign:'center' }}>
                          <p style={{ fontSize:16, fontWeight:700, color:x.c, fontFamily:'var(--font-display)' }}>{x.v}</p>
                          <p style={{ fontSize:9, color:'var(--text-muted)' }}>{x.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classement consultantes en € */}
                  {consultantes.some(n=>n.eu>0) && (
                    <div style={S.section}>
                      <p style={S.secLabel}>Classement € (Euros)</p>
                      {consultantes.filter(n=>n.eu>0).map((n,i) => (
                        <div key={n.id} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, marginBottom:3 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ width:18,height:18,borderRadius:4,background:i===0?'linear-gradient(135deg,var(--or),var(--or-deep))':'rgba(210,183,149,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:i===0?'#fff':'var(--text-muted)' }}>{i+1}</div>
                              <span style={{ fontWeight:600, color:'var(--taupe)' }}>{n.name}</span>
                            </div>
                            <span style={{ fontWeight:700, color:'var(--or-deep)' }}>{n.eu.toFixed(0)} €</span>
                          </div>
                          <div style={{ background:'rgba(210,183,149,0.2)', borderRadius:3, height:4, overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:3, width:Math.round((n.eu/maxEU)*100)+'%', background:'linear-gradient(90deg,var(--or),var(--or-deep))' }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Classement consultantes en DA */}
                  {consultantes.some(n=>n.da>0) && (
                    <div style={S.section}>
                      <p style={S.secLabel}>Classement DA (Dinars)</p>
                      {consultantes.filter(n=>n.da>0).map((n,i) => (
                        <div key={n.id} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, marginBottom:3 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ width:18,height:18,borderRadius:4,background:i===0?'linear-gradient(135deg,#3d6b9e,#1a4a8e)':'rgba(61,107,158,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:i===0?'#fff':'var(--text-muted)' }}>{i+1}</div>
                              <span style={{ fontWeight:600, color:'var(--taupe)' }}>{n.name}</span>
                            </div>
                            <span style={{ fontWeight:700, color:'var(--blue)' }}>{Math.round(n.da).toLocaleString('fr-FR')} DA</span>
                          </div>
                          <div style={{ background:'rgba(61,107,158,0.15)', borderRadius:3, height:4, overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:3, width:Math.round((n.da/maxDA)*100)+'%', background:'linear-gradient(90deg,#3d6b9e,#1a4a8e)' }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {consultantes.length === 0 && <div style={S.empty}>Aucune consultante dans le réseau.</div>}
                </>;
              })()
          }
        </div>
      )}
      {/* TABLEAU ADMIN */}
      {tab === 'table' && user?.role === 'admin' && (
        <TableauTab tree={tree} saveTree={saveTree} getCAByCur={getCAByCur}/>
      )}

      {/* TABLEAU ADMIN */}
      {tab === 'table' && user?.role === 'admin' && (
        <TableauTab tree={tree} saveTree={saveTree} getCAByCur={getCAByCur}/>
      )}
    </AppLayout>
  );
}

// ── TABLEAU ADMIN ─────────────────────────────────────────────────

function TableauTab({ tree, saveTree, getCAByCur }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ name:'', lastName:'', role:'Consultante', parentId:'' });
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('tous');

  const ROLES_LIST = ['VIP','Manager','Marraine','Consultante','Parrain'];
  const ROLE_STYLE_T = {
    'VIP':'#8b5a2b','Manager':'#B89A6A','Marraine':'#9e5a7a',
    'Consultante':'#3d6b9e','Parrain':'#9e5a7a'
  };

  const openEdit = (n) => {
    setEditId(n.id);
    setEditForm({ name:n.name, lastName:n.lastName||'', role:n.role, parentId:n.parentId||'' });
  };

  const saveEdit = () => {
    saveTree({ nodes: tree.nodes.map(n => n.id !== editId ? n : {
      ...n, name:editForm.name.trim(), lastName:editForm.lastName.trim(),
      role:editForm.role, parentId:editForm.parentId||null
    })});
    setEditId(null);
  };

  const deleteNode = (id) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    saveTree({ nodes: tree.nodes.filter(n => n.id !== id && n.parentId !== id) });
  };

  const addNode = () => {
    if (!addForm.name.trim()) return;
    const n = {
      id: Date.now().toString(),
      name: addForm.name.trim(),
      lastName: addForm.lastName.trim(),
      role: addForm.role,
      parentId: addForm.parentId || null
    };
    saveTree({ nodes:[...tree.nodes, n] });
    setAddForm({ name:'', lastName:'', role:'Consultante', parentId:'' });
    setShowAdd(false);
  };

  let nodes = [...tree.nodes].sort((a,b) => {
    const order = {'VIP':0,'Manager':1,'Marraine':2,'Parrain':3,'Consultante':4};
    return (order[a.role]??5) - (order[b.role]??5) || (a.name||'').localeCompare(b.name||'');
  });
  if (search) nodes = nodes.filter(n => (n.name+' '+(n.lastName||'')).toLowerCase().includes(search.toLowerCase()));
  if (filterRole !== 'tous') nodes = nodes.filter(n => n.role === filterRole);

  return (
    <div style={{ padding:16 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--taupe)', fontFamily:'var(--font-display)' }}>
          📋 {tree.nodes.length} membres
        </p>
        <button className="btn-gold" style={{ padding:'8px 14px', width:'auto', fontSize:12 }}
          onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Annuler' : '➕ Nouveau'}
        </button>
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:14 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Ajouter un membre</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <div className="field"><label className="label">Prénom *</label>
              <input value={addForm.name} onChange={e=>setAddForm(p=>({...p,name:e.target.value}))} placeholder="Marie" /></div>
            <div className="field"><label className="label">Nom</label>
              <input value={addForm.lastName} onChange={e=>setAddForm(p=>({...p,lastName:e.target.value}))} placeholder="O" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div className="field"><label className="label">Statut</label>
              <select value={addForm.role} onChange={e=>setAddForm(p=>({...p,role:e.target.value}))}>
                {ROLES_LIST.map(r => <option key={r}>{r}</option>)}
              </select></div>
            <div className="field"><label className="label">Rattaché à</label>
              <select value={addForm.parentId} onChange={e=>setAddForm(p=>({...p,parentId:e.target.value}))}>
                <option value="">— Aucun —</option>
                {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name} {n.lastName||''} ({n.role})</option>)}
              </select></div>
          </div>
          <button className="btn-gold" onClick={addNode} disabled={!addForm.name.trim()}>✦ Ajouter</button>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display:'flex', gap:6, marginBottom:10, overflowX:'auto', scrollbarWidth:'none' }}>
        <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:120 }}/>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
          style={{ fontSize:11, padding:'7px 8px', borderRadius:10, border:'1px solid var(--or-border)', background:'var(--bg-card)', color:'var(--taupe)', fontFamily:'var(--font-body)', flexShrink:0 }}>
          <option value="tous">Tous</option>
          {ROLES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, overflow:'hidden' }}>
        {/* En-tête */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 90px 70px', background:'rgba(210,183,149,0.12)', padding:'9px 12px', borderBottom:'1px solid var(--or-border)' }}>
          {['Prénom','Nom','Statut','Actions'].map(h => (
            <span key={h} style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</span>
          ))}
        </div>

        {nodes.length === 0 && (
          <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'24px', fontSize:13 }}>Aucun membre trouvé.</p>
        )}

        {nodes.map((n, idx) => {
          const { eu, da } = getCAByCur(n.name);
          const isEven = idx % 2 === 0;
          const color = ROLE_STYLE_T[n.role] || '#6b7280';
          const parent = tree.nodes.find(x => x.id === n.parentId);

          if (editId === n.id) {
            return (
              <div key={n.id} style={{ padding:'10px 12px', background:'rgba(210,183,149,0.06)', borderBottom:'1px solid var(--or-border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 90px', gap:6, marginBottom:8 }}>
                  <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} placeholder="Prénom" style={{ fontSize:12 }}/>
                  <input value={editForm.lastName} onChange={e=>setEditForm(p=>({...p,lastName:e.target.value}))} placeholder="Nom" style={{ fontSize:12 }}/>
                  <select value={editForm.role} onChange={e=>setEditForm(p=>({...p,role:e.target.value}))} style={{ fontSize:11, borderRadius:8, border:'1px solid var(--or-border)', padding:'5px 6px', background:'var(--bg)', fontFamily:'var(--font-body)' }}>
                    {ROLES_LIST.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:6 }}>
                  <select value={editForm.parentId} onChange={e=>setEditForm(p=>({...p,parentId:e.target.value}))} style={{ fontSize:11, borderRadius:8, border:'1px solid var(--or-border)', padding:'5px 6px', background:'var(--bg)', fontFamily:'var(--font-body)' }}>
                    <option value="">— Aucun —</option>
                    {tree.nodes.filter(x=>x.id!==n.id).map(x=><option key={x.id} value={x.id}>{x.name} {x.lastName||''}</option>)}
                  </select>
                  <button className="btn-gold" style={{ padding:'6px 12px', width:'auto', fontSize:11 }} onClick={saveEdit}>💾</button>
                  <button className="btn-outline" style={{ padding:'6px 12px', width:'auto', fontSize:11 }} onClick={() => setEditId(null)}>✕</button>
                </div>
              </div>
            );
          }

          return (
            <div key={n.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 90px 70px', padding:'10px 12px', background:isEven?'transparent':'rgba(210,183,149,0.03)', borderBottom:'1px solid rgba(210,183,149,0.1)', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--taupe)' }}>{n.name}</p>
                {parent && <p style={{ fontSize:9, color:'var(--text-dim)' }}>↑ {parent.name}</p>}
                {(eu>0||da>0) && <p style={{ fontSize:9, color:'var(--or-deep)', fontWeight:700 }}>{eu>0?`${eu.toFixed(0)}€`:''}{eu>0&&da>0?' · ':''}{da>0?`${Math.round(da).toLocaleString('fr-FR')}DA`:''}</p>}
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{n.lastName||'—'}</p>
              <span style={{ fontSize:10, fontWeight:700, color, background:`${color}15`, padding:'3px 8px', borderRadius:20, border:`1px solid ${color}30`, width:'fit-content' }}>{n.role}</span>
              <div style={{ display:'flex', gap:4 }}>
                <button onClick={() => openEdit(n)} style={{ background:'var(--or-pale)', border:'1px solid var(--or-border)', borderRadius:6, padding:'4px 8px', fontSize:12, cursor:'pointer', color:'var(--or-deep)' }}>✏️</button>
                <button onClick={() => deleteNode(n.id)} style={{ background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:6, padding:'4px 8px', fontSize:12, cursor:'pointer', color:'var(--red)' }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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

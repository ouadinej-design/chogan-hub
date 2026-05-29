// Hook réutilisable — filtre équipe pour toutes les apps
// Source des consultants : chogan_hub_consultants (comptes enregistrés)
import { useState, useEffect } from 'react';

const PREFIX = 'chogan_hub_';

const C_COLORS = [
  { bg:'rgba(80,130,200,0.12)',  border:'#5082C8', text:'#2d5a9e' },
  { bg:'rgba(100,180,100,0.12)', border:'#64B464', text:'#2d7a2d' },
  { bg:'rgba(180,100,200,0.12)', border:'#B464C8', text:'#7a2d9e' },
  { bg:'rgba(210,160,50,0.12)',  border:'#D2A032', text:'#8C6D00' },
  { bg:'rgba(50,190,180,0.12)',  border:'#32BEB4', text:'#1a7a74' },
  { bg:'rgba(220,120,60,0.12)',  border:'#DC783C', text:'#9e4a1a' },
];
const OWNER_C = { bg:'rgba(220,80,120,0.10)', border:'#DC5078', text:'#a03060' };

function normalize(str) {
  return (str||'').trim().toLowerCase().replace(/\s+/g,' ');
}

function getConsultants() {
  try {
    const list = JSON.parse(localStorage.getItem(PREFIX + 'consultants') || '[]');
    const filtered = list.filter(c => c?.firstName && c.role !== 'admin');
    
    // Dédoublonner : "Nej Ouadi" et "Ouadi Nej" = même personne
    const seen = new Map();
    filtered.forEach(c => {
      const fn = normalize(c.firstName);
      const ln = normalize(c.lastName||'');
      // Clé normalisée : mots triés alphabétiquement
      const key = [fn, ln].filter(Boolean).sort().join('_');
      if (!seen.has(key)) {
        seen.set(key, c);
      } else {
        // Garder celui dont le prénom ressemble à un vrai prénom (plus court)
        const existing = seen.get(key);
        if (fn.length <= normalize(existing.firstName).length) {
          seen.set(key, c);
        }
      }
    });
    return Array.from(seen.values());
  } catch { return []; }
}

export function useTeamFilter(user) {
  const myName    = user ? `${user.firstName||''} ${user.lastName||''}`.trim() : '';
  const myFirst   = (user?.firstName||'').toLowerCase();
  const myFull    = myName.toLowerCase();
  const [selected, setSelected] = useState('tous');
  const [teamList, setTeamList] = useState([]);

  // Charger la liste des consultants (+ refresh si changement)
  useEffect(() => {
    const load = () => setTeamList(getConsultants());
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, []);

  // Match flexible : "Nej Ouadi", "Ouadi Nej", "Nej" → même personne
  const matchConsultant = (consStr, firstName, lastName) => {
    const cons = normalize(consStr);
    const fn   = normalize(firstName);
    const ln   = normalize(lastName||'');
    if (!cons || !fn) return false;
    // Match exact
    if (cons === fn || cons === `${fn} ${ln}`.trim() || cons === `${ln} ${fn}`.trim()) return true;
    // Match prénom seul
    if (cons.includes(fn) || fn.includes(cons.split(' ')[0])) return true;
    // Match nom seul si non vide
    if (ln && (cons.includes(ln) || ln.includes(cons.split(' ')[0]))) return true;
    return false;
  };

  // Filtre générique — fonctionne pour ventes, clients, événements
  const filterByConsultant = (items) => {
    if (!user || user.role !== 'marraine' || selected === 'tous') return items;
    return items.filter(item => {
      const cons = (item.consultant || '').trim();
      if (!cons) return selected === 'moi';
      if (selected === 'moi') return matchConsultant(cons, user.firstName, user.lastName);
      const selC = teamList.find(c => c.id === selected);
      if (selC) return matchConsultant(cons, selC.firstName, selC.lastName);
      return false;
    });
  };

  const FilterDropdown = ({ style }) => {
    if (!user || user.role !== 'marraine') return null;
    const opts = [
      { v:'tous', l:"👥 Toute l'équipe", col:'#4A3E3D', bg:'#F5EFE8', bd:'#D2B795' },
      { v:'moi',  l:`🌸 Moi — ${myName}`, col:OWNER_C.text, bg:OWNER_C.bg, bd:OWNER_C.border },
      ...teamList
        .filter(c => c.role !== 'marraine')
        .map((c, i) => {
          const name = `${c.firstName} ${c.lastName||''}`.trim();
          const col  = C_COLORS[i % C_COLORS.length];
          return { v: c.id, l: `👤 ${name}`, col: col.text, bg: col.bg, bd: col.border };
        })
    ];
    const cur = opts.find(o => o.v === selected) || opts[0];
    return (
      <div style={{ marginBottom:12, position:'relative', ...style }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            width:'100%', padding:'10px 14px', borderRadius:10,
            border:`1.5px solid ${cur.bd}`, background:cur.bg,
            color:cur.col, fontWeight:700, fontSize:13, cursor:'pointer',
            appearance:'none', WebkitAppearance:'none', boxSizing:'border-box'
          }}
        >
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <span style={{
          position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
          pointerEvents:'none', color:cur.col, fontSize:12
        }}>▾</span>
      </div>
    );
  };

  return { selected, setSelected, filterByConsultant, FilterDropdown, teamList };
}

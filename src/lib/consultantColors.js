// Palette de couleurs unique par consultant
const PALETTE = [
  { bg:'rgba(212,100,100,0.12)', border:'#D46464', text:'#a33', label:'Rose Corail' },
  { bg:'rgba(80,130,200,0.12)',  border:'#5082C8', text:'#2d5a9e', label:'Bleu Saphir' },
  { bg:'rgba(100,180,100,0.12)', border:'#64B464', text:'#2d7a2d', label:'Vert Jade' },
  { bg:'rgba(180,100,200,0.12)', border:'#B464C8', text:'#7a2d9e', label:'Violet Améthyste' },
  { bg:'rgba(210,160,50,0.12)',  border:'#D2A032', text:'#8C6D00', label:'Or Ambré' },
  { bg:'rgba(50,190,180,0.12)',  border:'#32BEB4', text:'#1a7a74', label:'Turquoise' },
  { bg:'rgba(220,120,60,0.12)',  border:'#DC783C', text:'#9e4a1a', label:'Orange Terracotta' },
  { bg:'rgba(100,100,220,0.12)', border:'#6464DC', text:'#3a3a9e', label:'Indigo' },
];

// Couleur fixe pour la Marraine (propriétaire)
export const OWNER_COLOR = {
  bg:'rgba(220,80,120,0.10)', border:'#DC5078', text:'#a03060', label:'Marraine'
};

// Cache : consultant → couleur
const _cache = {};
let _idx = 0;

export function getConsultantColor(consultantName, ownerName) {
  if (!consultantName) return PALETTE[0];
  const n = consultantName.toLowerCase().trim();
  const o = (ownerName||'').toLowerCase().trim();
  // Si c'est la marraine elle-même
  if (o && (n === o || n.includes(o.split(' ')[0]) || o.includes(n.split(' ')[0]))) {
    return OWNER_COLOR;
  }
  if (!_cache[n]) {
    _cache[n] = PALETTE[_idx % PALETTE.length];
    _idx++;
  }
  return _cache[n];
}

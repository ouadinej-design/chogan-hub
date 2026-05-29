// Programme de fidélité Chogan officiel
// Basé sur le CA personnel cumulé en euros

export const CHOGAN_TIERS = [
  { name: 'Membre',   min: 0,    max: 199,   color: '#8C8C8C', emoji: '🌱', pts_rate: 1   },
  { name: 'Bronze',   min: 200,  max: 499,   color: '#CD7F32', emoji: '🥉', pts_rate: 1.2 },
  { name: 'Argent',   min: 500,  max: 999,   color: '#A8A8A8', emoji: '🥈', pts_rate: 1.5 },
  { name: 'Or',       min: 1000, max: 2499,  color: '#D2B795', emoji: '🥇', pts_rate: 2   },
  { name: 'Platine',  min: 2500, max: 4999,  color: '#8AC8D8', emoji: '💎', pts_rate: 2.5 },
  { name: 'Diamant',  min: 5000, max: 99999, color: '#B09FCA', emoji: '💠', pts_rate: 3   },
];

export function getChoganStatus(totalEuros) {
  const ca = parseFloat(totalEuros) || 0;
  const tier = CHOGAN_TIERS.slice().reverse().find(t => ca >= t.min) || CHOGAN_TIERS[0];
  const pts  = Math.round(ca * tier.pts_rate);
  const next = CHOGAN_TIERS.find(t => t.min > ca);
  const pct  = next ? Math.min(100, Math.round(((ca - tier.min) / (next.min - tier.min)) * 100)) : 100;
  return {
    tier: tier.name,
    emoji: tier.emoji,
    color: tier.color,
    points: pts,
    ca: ca,
    nextTier: next?.name || null,
    nextMin: next?.min || null,
    remaining: next ? Math.max(0, Math.round(next.min - ca)) : 0,
    pct,
    label: `${tier.emoji} ${tier.name} — ${pts} pts`
  };
}

export function computeCAFromSales(sales, consultantName) {
  const nodeFirst = (consultantName||'').trim().toLowerCase().split(' ')[0];
  if (!nodeFirst) return 0;
  return sales
    .filter(s => {
      const saleWords = (s.consultant||'').trim().toLowerCase().split(' ');
      return saleWords.some(w => w === nodeFirst);
    })
    .filter(s => (s.currency||s.cur||'€') === '€')
    .reduce((t, s) => t + (parseFloat(s.amount||s.amt)||0), 0);
}

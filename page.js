'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AppLayout from '../../components/AppLayout';

const NIVEAUX = {
  bronze:  { label: 'Bronze',  color: '#cd7f32', min: 0,    max: 500,  icon: '🥉' },
  argent:  { label: 'Argent',  color: '#c0c0c0', min: 500,  max: 1000, icon: '🥈' },
  or:      { label: 'Or',      color: '#C9A84C', min: 1000, max: 2000, icon: '🏆' },
  platine: { label: 'Platine', color: '#e8f4f8', min: 2000, max: 9999, icon: '💎' },
};

export default function WalletPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [fidelites, setFidelites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_commissions: 0, commandes_mois: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { router.replace('/'); return; }
      setSession(s);
      await Promise.all([loadFidelites(s.user.id), loadStats(s.user.id)]);
      setLoading(false);
      supabase.from('usage_logs').insert({ consultant_id: s.user.id, action: 'visite', module: 'wallet' });
    });
  }, []);

  async function loadFidelites(cid) {
    const { data } = await supabase
      .from('fidelite')
      .select('*, clients(nom, prenom, email)')
      .eq('consultant_id', cid)
      .order('total_achats', { ascending: false });
    setFidelites(data || []);
  }

  async function loadStats(cid) {
    const debut_mois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: cmds } = await supabase
      .from('commandes')
      .select('commission, total_ttc')
      .eq('consultant_id', cid)
      .eq('statut', 'validee')
      .gte('created_at', debut_mois);

    const total_commissions = (cmds || []).reduce((s, c) => s + (c.commission || 0), 0);
    setStats({ total_commissions, commandes_mois: cmds?.length || 0 });
  }

  if (loading) return <div style={{ minHeight: '100dvh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#f59e0b' }}>Chargement...</span></div>;

  return (
    <AppLayout title="Fidélité & Wallet" icon="💎" color="#f59e0b">
      {/* Mes commissions du mois */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '18px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          💰 Commissions ce mois
        </p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '48px', fontWeight: '700', background: 'linear-gradient(135deg, #C9A84C, #e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {stats.total_commissions.toFixed(2)} €
        </p>
        <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
          {stats.commandes_mois} commande(s) validée(s)
        </p>
      </div>

      {/* Distribution niveaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {Object.entries(NIVEAUX).map(([key, n]) => {
          const count = fidelites.filter(f => f.niveau === key).length;
          return (
            <div key={key} style={{ background: `${n.color}11`, border: `1px solid ${n.color}33`, borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px' }}>{n.icon}</div>
              <div style={{ color: n.color, fontWeight: '700', fontSize: '20px' }}>{count}</div>
              <div style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase' }}>{n.label}</div>
            </div>
          );
        })}
      </div>

      <p style={{ color: '#555', fontSize: '12px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {fidelites.length} client(s) avec carte fidélité
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {fidelites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
            <p>Les cartes fidélité apparaissent ici après la première commande</p>
          </div>
        ) : fidelites.map((f) => {
          const n = NIVEAUX[f.niveau] || NIVEAUX.bronze;
          const progress = Math.min(((f.total_achats - n.min) / (n.max - n.min)) * 100, 100);
          return (
            <div key={f.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${n.color}22`, borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{n.icon}</span>
                    <p style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{f.clients?.nom} {f.clients?.prenom}</p>
                  </div>
                  {f.clients?.email && <p style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>{f.clients.email}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: n.color, fontWeight: '700', fontSize: '18px' }}>{f.points}</p>
                  <p style={{ color: '#555', fontSize: '10px' }}>points</p>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(90deg, ${n.color}, ${n.color}aa)`, width: `${progress}%`, height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <p style={{ color: '#555', fontSize: '10px' }}>Total achats: <span style={{ color: '#888' }}>{f.total_achats?.toFixed(2)} €</span></p>
                <p style={{ color: n.color, fontSize: '10px', fontWeight: '600' }}>{n.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

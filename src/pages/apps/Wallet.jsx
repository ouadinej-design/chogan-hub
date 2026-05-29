import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

export default function Wallet() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    // Admin et marraine ont toujours accès
    if (!user || user.role === 'admin' || user.role === 'marraine') { setAllowed(true); return; }
    // Vérifier l'accès VIP depuis Supabase + localStorage
    const check = async () => {
      try {
        const res = await fetch('/api/data?key=chogan_vip_access');
        const d = await res.json();
        const access = d?.value || JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        const userApps = access[user.id] || [];
        setAllowed(userApps.includes('wallet'));
      } catch {
        const access = JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        setAllowed((access[user.id] || []).includes('wallet'));
      }
    };
    check();
  }, [user]);

  if (allowed === null) return <AppLayout title="Wallet Chogan" icon="💰"><div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Vérification...</div></AppLayout>;

  if (!allowed) return (
    <AppLayout title="Wallet Chogan" icon="💰">
      <div style={{padding:40,textAlign:'center'}}>
        <p style={{fontSize:48,marginBottom:16}}>🔒</p>
        <p style={{fontWeight:700,fontSize:16,color:'var(--text)',marginBottom:8}}>Accès restreint</p>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>Demandez l'accès à votre administratrice.</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Wallet Chogan" icon="💰">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe src="/wallet-app.html" style={{ flex: 1, border: 'none', width: '100%' }} title="Wallet Chogan" />
      </div>
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

export default function CoachVocal() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!user || user.role === 'admin') { setAllowed(true); return; }
    const check = async () => {
      try {
        const res = await fetch('/api/data?key=chogan_vip_access');
        const d = await res.json();
        const access = d?.value || JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        setAllowed((access[user.id] || []).includes('coach-vocal'));
      } catch {
        const access = JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        setAllowed((access[user.id] || []).includes('coach-vocal'));
      }
    };
    check();
  }, [user]);

  if (allowed === null) return <AppLayout title="Coach Vocal" icon="🎤"><div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Vérification...</div></AppLayout>;

  if (!allowed) return (
    <AppLayout title="Coach Vocal" icon="🎤">
      <div style={{padding:40,textAlign:'center'}}>
        <p style={{fontSize:48,marginBottom:16}}>🔒</p>
        <p style={{fontWeight:700,fontSize:16,color:'var(--text)',marginBottom:8}}>Accès restreint</p>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>Demandez l'accès à votre administratrice.</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Coach Vocal" icon="🎤">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe src="/coach-vocal-app.html" style={{ flex: 1, border: 'none', width: '100%' }} title="Coach Vocal Chogan" />
      </div>
    </AppLayout>
  );
}

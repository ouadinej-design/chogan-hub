import AppLayout from '../../components/AppLayout';

export default function Prospection() {
  return (
    <AppLayout title="Prospecter les Pros" icon="🎯">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="/PROSPECTER_PROS.html"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Prospecter les Professionnels"
        />
      </div>
    </AppLayout>
  );
}

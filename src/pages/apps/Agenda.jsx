import AppLayout from '../../components/AppLayout';

export default function Agenda() {
  return (
    <AppLayout title="Agenda Chogan" icon="📅">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="/agenda-app.html"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Agenda Chogan"
        />
      </div>
    </AppLayout>
  );
}

import AppLayout from '../../components/AppLayout';

export default function Agenda() {
  return (
    <AppLayout title="Agenda" icon="📅">
      <div style={{ height:'calc(100vh - 60px)' }}>
        <iframe
          src="/agenda-app.html"
          style={{ width:'100%', height:'100%', border:'none' }}
          title="Agenda Chogan"
        />
      </div>
    </AppLayout>
  );
}

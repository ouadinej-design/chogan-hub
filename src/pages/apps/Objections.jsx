import AppLayout from '../../components/AppLayout';

export default function Objections() {
  return (
    <AppLayout title="Coach Objections" icon="💬">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="/coach-objections-app.html"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Coach Objections Chogan"
        />
      </div>
    </AppLayout>
  );
}

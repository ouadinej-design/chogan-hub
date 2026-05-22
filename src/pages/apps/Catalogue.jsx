import AppLayout from '../../components/AppLayout';

export default function Catalogue() {
  return (
    <AppLayout title="Chogan Élite" icon="💎">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="https://limitless-app-seven.vercel.app/"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Chogan Elite"
        />
      </div>
    </AppLayout>
  );
}

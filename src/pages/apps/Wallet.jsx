import AppLayout from '../../components/AppLayout';

export default function Wallet() {
  return (
    <AppLayout title="Wallet Chogan" icon="💰">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="/wallet-app.html"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Wallet Chogan"
        />
      </div>
    </AppLayout>
  );
}

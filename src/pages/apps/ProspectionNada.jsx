import AppLayout from '../../components/AppLayout';

export default function ProspectionNada() {
  return (
    <AppLayout title="Prospecter les Pros (Nada)" icon="🌷">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="/PROSPECTER_PROS_NADA.html"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Prospecter les Professionnels — Méthode Nada"
        />
      </div>
    </AppLayout>
  );
}

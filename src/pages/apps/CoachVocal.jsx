import AppLayout from '../../components/AppLayout';

export default function CoachVocal() {
  return (
    <AppLayout title="Coach Vocal" icon="🎤">
      <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="https://chogan-coach.vercel.app/"
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Coach Vocal Chogan"
        />
      </div>
    </AppLayout>
  );
}

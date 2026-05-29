import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { sendDailyReport, shouldSendReport, buildDailyStats } from './utils/emailReport';
import { store } from './utils/storage';
import Login      from './pages/Login';
import Home       from './pages/Home';
import Orders      from './pages/apps/Orders';
import Ventes      from './pages/apps/Ventes';
import Inspirations from './pages/apps/Inspirations';
import Clients    from './pages/apps/Clients';
import Fidelite   from './pages/apps/Fidelite';
import Agenda     from './pages/apps/Agenda';
import Planner    from './pages/apps/Planner';
import Wallet     from './pages/apps/Wallet';
import Reseau     from './pages/apps/Reseau';
import Catalogue  from './pages/apps/Catalogue';
import CoachVocal from './pages/apps/CoachVocal';
import Objections from './pages/apps/Objections';
import Stats      from './pages/apps/Stats';
import Settings   from './pages/apps/Settings';
import Formation  from './pages/apps/Formation';
import Familles   from './pages/apps/Familles';
import Catalogues from './pages/apps/Catalogues';
import Checklist  from './pages/apps/Checklist';
import './styles/globals.css';

function AppRoutes() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const delay = setTimeout(async () => {
      if (shouldSendReport(user.id)) {
        const adminEmail = store.get('admin_email') || user.email;
        if (adminEmail) {
          const { logs, stats } = buildDailyStats(user.id);
          await sendDailyReport({
            consultantName: user.displayName || `${user.firstName} ${user.lastName}`,
            consultantEmail: user.email || '',
            adminEmail,
            logs,
            stats,
          });
        }
      }
    }, 5000);
    return () => clearTimeout(delay);
  }, [user]);

  if (!user) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  return (
    <DataProvider>
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/app/orders"         element={<Orders />} />
        <Route path="/app/ventes"         element={<Ventes />} />
        <Route path="/app/inspirations"    element={<Inspirations />} />
        <Route path="/app/clients"        element={<Clients />} />
        <Route path="/app/fidelite"       element={<Fidelite />} />
        <Route path="/app/agenda"         element={<Agenda />} />
        <Route path="/app/planner"        element={<Planner />} />
        <Route path="/app/wallet"         element={<Wallet />} />
        <Route path="/app/reseau"         element={<Reseau />} />
        <Route path="/app/catalogue"      element={<Catalogue />} />
        <Route path="/app/coach-vocal"    element={<CoachVocal />} />
        <Route path="/app/objections"     element={<Objections />} />
        <Route path="/app/stats"          element={<Stats />} />
        <Route path="/app/settings"       element={<Settings />} />
        <Route path="/app/formation"      element={<Formation />} />
        <Route path="/app/familles"       element={<Familles />} />
        <Route path="/app/catalogues"     element={<Catalogues />} />
        <Route path="/app/checklist"      element={<Checklist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

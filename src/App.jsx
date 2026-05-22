import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { sendDailyReport, shouldSendReport } from './utils/emailReport';
import { getTodayLogs, store } from './utils/storage';
import Login from './pages/Login';
import Home from './pages/Home';
import Orders from './pages/apps/Orders';
import Clients from './pages/apps/Clients';
import Fidelite from './pages/apps/Fidelite';
import Agenda from './pages/apps/Agenda';
import Wallet from './pages/apps/Wallet';
import Reseau from './pages/apps/Reseau';
import Catalogue from './pages/apps/Catalogue';
import CoachVocal from './pages/apps/CoachVocal';
import Objections from './pages/apps/Objections';
import Stats from './pages/apps/Stats';
import Settings from './pages/apps/Settings';
import './styles/globals.css';

function AppRoutes() {
  const { user } = useAuth();

  // Daily email report trigger
  useEffect(() => {
    if (!user) return;
    const delay = setTimeout(async () => {
      if (shouldSendReport(user.username)) {
        const logs = getTodayLogs(user.username);
        const adminEmail = store.get('admin_email') || user.email;
        if (adminEmail) {
          await sendDailyReport({
            consultantName: user.name || user.username,
            consultantEmail: user.email || '',
            adminEmail,
            logs,
            stats: { orders: 0, clients: 0, revenue: 0 },
          });
        }
      }
    }, 3000);
    return () => clearTimeout(delay);
  }, [user]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/orders" element={<Orders />} />
        <Route path="/app/clients" element={<Clients />} />
        <Route path="/app/fidelite" element={<Fidelite />} />
        <Route path="/app/agenda" element={<Agenda />} />
        <Route path="/app/wallet" element={<Wallet />} />
        <Route path="/app/reseau" element={<Reseau />} />
        <Route path="/app/catalogue" element={<Catalogue />} />
        <Route path="/app/coach-vocal" element={<CoachVocal />} />
        <Route path="/app/objections" element={<Objections />} />
        <Route path="/app/stats" element={<Stats />} />
        <Route path="/app/settings" element={<Settings />} />
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

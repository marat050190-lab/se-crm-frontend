import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import PipelinePage from './pages/PipelinePage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import OrdersPage from './pages/OrdersPage';
import IncomingCallPopup from './components/IncomingCallPopup';
import DispatcherQueuePage from './pages/DispatcherQueuePage';
import PricingPage from './pages/PricingPage';
import DispatcherStatsPage from './pages/DispatcherStatsPage';
import ScriptsPage from './pages/ScriptsPage';
import ScriptsAdminPage from './pages/ScriptsAdminPage';
import CSDashboardPage from './pages/CSDashboardPage';
import MFLDashboardPage from './pages/MFLDashboardPage';
import ContractorsPage from './pages/ContractorsPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--gray-400)' }}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
                <Route path="/queue" element={<DispatcherQueuePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/my-stats" element={<DispatcherStatsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/scripts-admin" element={<ScriptsAdminPage />} />
          <Route path="/cs-dashboard" element={<CSDashboardPage />} />
          <Route path="/mfl-dashboard" element={<MFLDashboardPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
        </Routes>
      </main>
      <IncomingCallPopup />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from 'react';
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
import AccountantPage from './pages/AccountantPage';
import AccountantCashierPage from './pages/AccountantCashierPage';
import CSDashboardPersonal from './pages/CSDashboardPersonal';
import ClientDetailPage from './pages/ClientDetailPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--gray-400)' }}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="mobile-header">
          <button className="burger-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontWeight:700, fontSize:16, color:'var(--gray-900)' }}>SEcrm</span>
          <div style={{ width:38 }} />
        </div>
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
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/scripts-admin" element={<ScriptsAdminPage />} />
          <Route path="/cs-dashboard" element={<CSDashboardPage />} />
          <Route path="/mfl-dashboard" element={<MFLDashboardPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/accountant" element={<AccountantPage />} />
          <Route path="/accountant-cashier" element={<AccountantCashierPage />} />
          <Route path="/my-dashboard" element={<CSDashboardPersonal />} />
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

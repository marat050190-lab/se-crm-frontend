import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../utils/api.jsx';
import { STATUSES } from '../utils/constants.js';
import DeptDashboardPage from './DeptDashboardPage.jsx';

const TABS = [
  { key: 'sales', label: 'Отдел продаж' },
  { key: 'cs', label: 'Клиентский сервис' },
  { key: 'mfl', label: 'МФЛ' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);
  const [tab, setTab] = useState('sales');
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    api.get('/api/stats/dashboard').then(r => setStats(r.data)).catch(() => {});
    api.get('/api/tasks/my').then(r => setTasks(r.data)).catch(() => {});
    api.get('/api/leads?limit=5').then(r => setRecentLeads(r.data.leads || [])).catch(() => {});
  }, []);

  const convRate = stats?.conversion
    ? Math.round((stats.conversion.won / Math.max(1, stats.conversion.total)) * 100)
    : 0;

  if (!isAdmin) {
    // Для РОП — обычный дашборд продаж
    return (
      <>
        <div className="page-header">
          <h2>Добро пожаловать, {user?.name?.split(' ')[0]}</h2>
          <span className="text-muted">{new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}</span>
        </div>
        <div className="page-body">
          <SalesDashboard stats={stats} tasks={tasks} recentLeads={recentLeads} convRate={convRate} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header" style={{ flexDirection:'column', alignItems:'flex-start', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
          <h2>Дашборд</h2>
          <span className="text-muted">{new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}</span>
        </div>
        {/* Вкладки */}
        <div style={{ display:'flex', gap:4, background:'var(--gray-100)', padding:4, borderRadius:10 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding:'8px 20px', border:'none', borderRadius:8, cursor:'pointer',
                fontSize:13, fontWeight:600, transition:'all 0.15s',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? 'var(--gray-900)' : 'var(--gray-500)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {tab === 'sales' && <SalesDashboard stats={stats} tasks={tasks} recentLeads={recentLeads} convRate={convRate} />}
        {tab === 'cs' && <DeptDashboardPage embedded endpoint="/api/stats/cs" title="" tableTitle="Отдел по работе с клиентами" />}
        {tab === 'mfl' && <DeptDashboardPage embedded endpoint="/api/stats/mfl" title="" tableTitle="МФЛ менеджеры" />}
      </div>
    </>
  );
}

function SalesDashboard({ stats, tasks, recentLeads, convRate }) {
  return (
    <div>
      {/* Статы */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Лидов за 30 дней</div>
          <div className="stat-card-value">{stats?.leads_total ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Новых</div>
          <div className="stat-card-value" style={{ color:'var(--primary)' }}>{stats?.leads_new ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">В работе</div>
          <div className="stat-card-value">{stats?.leads_in_progress ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Конверсия</div>
          <div className="stat-card-value">{convRate}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Задач открыто</div>
          <div className="stat-card-value">{tasks.filter(t => t.status === 'pending').length}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Последние лиды */}
        <div className="card">
          <div className="card-header">Последние лиды</div>
          <div className="card-body" style={{ padding:0 }}>
            {recentLeads.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--gray-400)' }}>Нет лидов</div>
            ) : recentLeads.map(lead => {
              const st = STATUSES[lead.status];
              return (
                <div key={lead.id} style={{ padding:'12px 18px', borderBottom:'1px solid var(--gray-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{lead.client_name || lead.client_phone || '—'}</div>
                    <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{lead.lead_number}</div>
                  </div>
                  <span className="badge" style={{ color: st?.color, background: st?.bg, fontSize:11 }}>{st?.label || lead.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Мои задачи */}
        <div className="card">
          <div className="card-header">Мои задачи</div>
          <div className="card-body" style={{ padding:0 }}>
            {tasks.filter(t => t.status === 'pending').length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--gray-400)' }}>Задач нет</div>
            ) : tasks.filter(t => t.status === 'pending').slice(0, 6).map(task => {
              const due = task.due_date ? new Date(task.due_date) : null;
              const overdue = due && due < new Date();
              return (
                <div key={task.id} style={{ padding:'12px 18px', borderBottom:'1px solid var(--gray-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{task.title}</div>
                  {due && <div style={{ fontSize:11, color: overdue ? '#DC2626' : 'var(--gray-400)' }}>{due.toLocaleDateString('ru-RU')}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

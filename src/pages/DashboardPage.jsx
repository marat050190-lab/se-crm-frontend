import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../utils/api.jsx';
import { STATUSES } from '../utils/constants.js';
import DeptDashboardPage from './DeptDashboardPage.jsx';

const TABS = [
  { key: 'sales', label: 'Отдел продаж' },
  { key: 'cs', label: 'Клиентский сервис' },
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

      <DepartmentBreakdown />

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

const DEPT_LABELS = {
  dispatcher: 'Диспетчеры',
  b2b_manager: 'B2B менеджеры',
  mfl_manager: 'МФЛ менеджеры',
};

function DepartmentBreakdown() {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const iso = (d) => d.toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(iso(first));
  const [dateTo, setDateTo] = useState(iso(today));
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/stats/sales-departments', { params: { date_from: dateFrom, date_to: dateTo } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const dept = (key) => data?.departments?.[key];

  return (
    <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
      <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <span>Подразделения отдела продаж</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding:'6px 10px', border:'1px solid var(--border)', borderRadius:6, fontSize:13 }} />
          <span style={{ color:'var(--gray-400)', fontSize:13 }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding:'6px 10px', border:'1px solid var(--border)', borderRadius:6, fontSize:13 }} />
          <button className="btn btn-primary" onClick={load} disabled={loading} style={{ fontSize:13, padding:'6px 14px' }}>
            {loading ? '…' : 'Показать'}
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {Object.keys(DEPT_LABELS).map(key => {
            const d = dept(key);
            const isOpen = expanded === key;
            return (
              <div key={key}
                onClick={() => setExpanded(isOpen ? null : key)}
                style={{
                  border: '1px solid ' + (isOpen ? 'var(--primary)' : 'var(--border)'),
                  borderRadius: 10, padding: 14, cursor: 'pointer',
                  background: isOpen ? 'rgba(0,177,79,0.04)' : '#fff',
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {DEPT_LABELS[key]}
                  <span style={{ fontSize:11, color:'var(--gray-400)' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                  <div><div style={{ color:'var(--gray-400)' }}>Лидов</div><div style={{ fontWeight:600, fontSize:16 }}>{d?.leads_total ?? '—'}</div></div>
                  <div><div style={{ color:'var(--gray-400)' }}>Новых</div><div style={{ fontWeight:600, fontSize:16, color:'var(--primary)' }}>{d?.leads_new ?? '—'}</div></div>
                  <div><div style={{ color:'var(--gray-400)' }}>В работе</div><div style={{ fontWeight:600, fontSize:16 }}>{d?.leads_in_progress ?? '—'}</div></div>
                  <div><div style={{ color:'var(--gray-400)' }}>Задач</div><div style={{ fontWeight:600, fontSize:16 }}>{d?.tasks_open ?? '—'}</div></div>
                </div>
              </div>
            );
          })}
        </div>

        {expanded && dept(expanded) && (
          <div style={{ marginTop: 16 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th style={{ textAlign:'right' }}>Лидов</th>
                    <th style={{ textAlign:'right' }}>Новых</th>
                    <th style={{ textAlign:'right' }}>В работе</th>
                    <th style={{ textAlign:'right' }}>Конверсия</th>
                    <th style={{ textAlign:'right' }}>Задач открыто</th>
                  </tr>
                </thead>
                <tbody>
                  {dept(expanded).employees.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'#9CA3AF' }}>Нет сотрудников</td></tr>
                  ) : dept(expanded).employees.map(e => {
                    const conv = e.leads_total ? Math.round((e.leads_won / e.leads_total) * 100) : 0;
                    return (
                      <tr key={e.id}>
                        <td style={{ fontWeight:500 }}>{e.name}</td>
                        <td style={{ textAlign:'right' }}>{e.leads_total}</td>
                        <td style={{ textAlign:'right' }}>{e.leads_new}</td>
                        <td style={{ textAlign:'right' }}>{e.leads_in_progress}</td>
                        <td style={{ textAlign:'right' }}>{conv}%</td>
                        <td style={{ textAlign:'right' }}>{e.tasks_open}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

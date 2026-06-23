import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { STATUSES } from '../utils/constants.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    api.get('/api/stats/dashboard').then(r => setStats(r.data));
    api.get('/api/tasks/my').then(r => setTasks(r.data));
    api.get('/api/leads?limit=5').then(r => setRecentLeads(r.data.leads));
  }, []);

  const STATUS_ORDER = ['new', 'in_progress', 'kp_sent', 'negotiation', 'won', 'lost'];

  const convRate = stats?.conversion
    ? Math.round((stats.conversion.won / Math.max(1, stats.conversion.total)) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <h2>Добро пожаловать, {user?.name?.split(' ')[0]}</h2>
        <span className="text-muted">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <div className="page-body">

        {/* Stats */}
        <div className="stats-grid">
          {STATUS_ORDER.map(s => (
            <div className="stat-card" key={s}>
              <div className="stat-label">{STATUSES[s]?.label}</div>
              <div className="stat-value" style={{ color: STATUSES[s]?.color }}>
                {stats?.byStatus?.[s] || 0}
              </div>
              <div className="stat-sub">за 30 дней</div>
            </div>
          ))}
          <div className="stat-card">
            <div className="stat-label">Конверсия</div>
            <div className="stat-value" style={{ color: convRate > 20 ? '#059669' : '#D97706' }}>
              {convRate}%
            </div>
            <div className="stat-sub">выиграно / всего</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

          {/* Recent leads */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              Последние лиды
              <a href="/leads" className="btn btn-sm btn-ghost">Все лиды →</a>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map(lead => {
                    const st = STATUSES[lead.status];
                    return (
                      <tr key={lead.id}>
                        <td><a href={`/leads/${lead.id}`} className="lead-link">{lead.lead_number}</a></td>
                        <td>{lead.client_name || <span className="text-muted">—</span>}</td>
                        <td><span className="phone">{lead.client_phone}</span></td>
                        <td>
                          <span className="badge" style={{ color: st?.color, background: st?.bg }}>
                            {st?.label}
                          </span>
                        </td>
                        <td className="text-muted">{new Date(lead.created_at).toLocaleDateString('ru-RU')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <div className="card-header">
              Задачи на сегодня
              {stats?.todayTasks > 0 && (
                <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', marginLeft: 8 }}>
                  {stats.todayTasks}
                </span>
              )}
            </div>
            <div className="card-body">
              {tasks.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-icon">✓</div>
                  <p>Задач нет</p>
                </div>
              ) : (
                tasks.slice(0, 8).map(task => {
                  const due = task.due_date ? new Date(task.due_date) : null;
                  const isOverdue = due && due < new Date();
                  return (
                    <div className="task-item" key={task.id}>
                      <div className="task-check" />
                      <div>
                        <a href={`/leads/${task.lead_id}`} style={{ textDecoration: 'none' }}>
                          <div className="task-title">{task.title}</div>
                          <div className="text-muted">{task.lead_number} · {task.client_name || task.client_phone}</div>
                        </a>
                        {due && (
                          <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                            {due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

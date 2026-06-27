import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const load = () => api.get('/api/tasks/my').then(r => setTasks(r.data));
  useEffect(() => { load(); }, []);

  const complete = async (id) => {
    await api.patch(`/api/tasks/${id}/done`);
    load();
  };

  const today = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    const now = new Date();
    return d.toDateString() === now.toDateString() || d < now;
  });
  const later = tasks.filter(t => {
    if (!t.due_date) return true;
    const d = new Date(t.due_date);
    const now = new Date();
    return d > now && d.toDateString() !== now.toDateString();
  });

  const TaskRow = ({ task }) => {
    const due = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = due && due < new Date() && due.toDateString() !== new Date().toDateString();
    return (
      <div className="task-item">
        <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0 }} onChange={() => complete(task.id)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="task-title">{task.title}</div>
            {due && <div className={`task-due ${isOverdue ? 'overdue' : ''}`} style={{ marginLeft: 8, flexShrink: 0 }}>
              {due.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </div>}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 4px', fontSize: 12, color: 'var(--brand)', marginTop: 2 }}
            onClick={() => navigate(`/leads/${task.lead_id}`)}
          >
            {task.lead_number} · {task.client_name || task.client_phone}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <h2>Мои задачи</h2>
      </div>
      <div className="page-body" style={{ maxWidth: 720 }}>
        {tasks.length === 0 ? (
          <div className="empty-state card card-body">
            <div style={{ fontSize:40, marginBottom:12, color:"var(--primary)", opacity:0.5 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <p>Задач нет</p>
            <p className="text-muted">Отличная работа!</p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header" style={{ color: '#D97706' }}>
                  Сегодня и просроченные · {today.length}
                </div>
                <div className="card-body">
                  {today.map(t => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            )}
            {later.length > 0 && (
              <div className="card">
                <div className="card-header">Предстоящие · {later.length}</div>
                <div className="card-body">
                  {later.map(t => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

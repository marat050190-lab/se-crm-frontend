import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const ROLE_LABELS = { admin: 'Администратор', rop: 'РОП', manager: 'Менеджер' };

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>СЭ CRM</h1>
        <span>Отдел продаж</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <span className="nav-icon">📊</span> Дашборд
        </NavLink>
        <NavLink to="/leads">
          <span className="nav-icon">📋</span> Лиды
        </NavLink>
        <NavLink to="/pipeline">
          <span className="nav-icon">🔄</span> Воронка
        </NavLink>
        <NavLink to="/tasks">
          <span className="nav-icon">✓</span> Мои задачи
        </NavLink>
        {(user?.role === 'admin' || user?.role === 'rop') && (
          <NavLink to="/users">
            <span className="nav-icon">👥</span> Сотрудники
          </NavLink>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="user-name">{user?.name}</div>
        <div className="user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
        <button onClick={logout}>Выйти</button>
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ROLES } from '../../utils/constants.js';

const ADMIN_ROLES = ['super_admin', 'admin', 'rop', 'cs_head'];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>SEcrm</h1>
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
          <NavLink to="/clients">
            <span className="nav-icon">👥</span> Клиенты
          </NavLink>
          <NavLink to="/orders">
            <span className="nav-icon">📋</span> Заявки КС
          </NavLink>
        {ADMIN_ROLES.includes(user?.role) && (
          <NavLink to="/users">
            <span className="nav-icon">👥</span> Сотрудники
          </NavLink>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="user-name">{user?.name}</div>
        <div className="user-role">{ROLES[user?.role] || user?.role}</div>
        <button onClick={logout}>Выйти</button>
      </div>
    </aside>
  );
}

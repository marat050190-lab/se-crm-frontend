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
        {['super_admin', 'admin', 'rop', 'cs_head', 'dispatcher', 'b2b_manager', 'mfl_manager'].includes(user?.role) && (
          <NavLink to="/leads">
            <span className="nav-icon">📋</span> Лиды
          </NavLink>
        )}
        {user?.role === 'dispatcher' && (
          <NavLink to="/queue">
            <span className="nav-icon">🚦</span> Очередь
          </NavLink>
        )}
        {user?.role === 'dispatcher' && (
          <NavLink to="/my-stats">
            <span className="nav-icon">📈</span> Мои KPI
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'dispatcher', 'b2b_manager'].includes(user?.role) && (
          <NavLink to="/pipeline">
            <span className="nav-icon">🔄</span> Воронка
          </NavLink>
        )}
        {!['accountant_cashier', 'accountant'].includes(user?.role) && (
          <NavLink to="/tasks">
            <span className="nav-icon">✓</span> Мои задачи
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'cs_head', 'b2b_manager', 'mfl_manager', 'cs_manager'].includes(user?.role) && (
          <NavLink to="/clients">
            <span className="nav-icon">👥</span> Клиенты
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'cs_head', 'b2b_manager', 'mfl_manager', 'cs_manager'].includes(user?.role) && (
          <NavLink to="/orders">
            <span className="nav-icon">📋</span> Заявки КС
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'cs_head'].includes(user?.role) && (
          <NavLink to="/users">
            <span className="nav-icon">👥</span> Сотрудники
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop'].includes(user?.role) && (
          <NavLink to="/pricing">
            <span className="nav-icon">💰</span> Прайс
          </NavLink>
        )}
        {user?.role === 'dispatcher' && (
          <NavLink to="/scripts">
            <span className="nav-icon">📞</span> Скрипты
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'cs_head'].includes(user?.role) && (
          <NavLink to="/cs-dashboard">
            <span className="nav-icon">📊</span> Дашборд КС
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop', 'cs_head'].includes(user?.role) && (
          <NavLink to="/mfl-dashboard">
            <span className="nav-icon">📊</span> Дашборд МФЛ
          </NavLink>
        )}
        {['super_admin', 'admin', 'rop'].includes(user?.role) && (
          <NavLink to="/scripts-admin">
            <span className="nav-icon">📞</span> Скрипты
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

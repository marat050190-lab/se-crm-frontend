import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Icons } from '../../utils/icons.jsx';

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''} onClick={onClick}>
    <span className="nav-icon" style={{ display:'flex', alignItems:'center' }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const role = user?.role;
  const isAdmin = ['super_admin', 'admin'].includes(role);
  const isRop = role === 'rop';
  const isCsHead = role === 'cs_head';
  const isDispatcher = role === 'dispatcher';
  const isB2b = role === 'b2b_manager';
  const isMfl = role === 'mfl_manager';
  const isCs = role === 'cs_manager';
  const isAccCashier = role === 'accountant_cashier';
  const isAcc = role === 'accountant';

  const close = () => onClose?.();

  return (
    <>
      {/* Оверлей на мобильном */}
      {open && (
        <div onClick={close} style={{
          display:'none',
          position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
          zIndex:99, backdropFilter:'blur(2px)',
        }} className="sidebar-overlay" />
      )}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h1>SEcrm</h1>
              <span>Отдел продаж</span>
            </div>
            <button onClick={close} className="sidebar-close-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {(isCs || isMfl) && <NavItem to="/my-dashboard" icon={Icons.dashboard()} label="Мой дашборд" onClick={close} />}
          {(isAdmin || isRop) && <NavItem to="/" icon={Icons.dashboard()} label="Дашборд" onClick={close} />}
          {(isAdmin || isRop || isDispatcher || isB2b) && <NavItem to="/leads" icon={Icons.leads()} label="Лиды" onClick={close} />}
          {isDispatcher && <NavItem to="/queue" icon={Icons.funnel()} label="Очередь" onClick={close} />}
          {(isDispatcher || isB2b) && <NavItem to="/my-stats" icon={Icons.kpi()} label="Мои KPI" onClick={close} />}
          {(isAdmin || isRop || isB2b) && <NavItem to="/pipeline" icon={Icons.funnel()} label="Воронка" onClick={close} />}
          {!isAccCashier && !isAcc && <NavItem to="/tasks" icon={Icons.tasks()} label="Мои задачи" onClick={close} />}
          {!isAccCashier && !isAcc && <NavItem to="/clients" icon={Icons.clients()} label="Клиенты" onClick={close} />}
          {(isAdmin || isRop || isCsHead || isAcc || isAccCashier) && <NavItem to="/orders" icon={Icons.orders()} label="Заявки КС" onClick={close} />}
          {(isCs || isMfl) && <NavItem to="/orders" icon={Icons.orders()} label="Мои заявки" onClick={close} />}
          {(isAdmin || isRop || isCsHead) && <NavItem to="/users" icon={Icons.users()} label="Сотрудники" onClick={close} />}
          {(isAdmin || isDispatcher) && <NavItem to="/pricing" icon={Icons.price()} label="Прайс" onClick={close} />}
          {(isAdmin || isDispatcher || isB2b) && <NavItem to="/scripts" icon={Icons.scripts()} label="Скрипты" onClick={close} />}
          {isCsHead && <NavItem to="/cs-dashboard" icon={Icons.chart()} label="Дашборд КС" onClick={close} />}
          
          {isCsHead && <NavItem to="/scripts" icon={Icons.scripts()} label="Скрипты" onClick={close} />}
          {(isAdmin || isCsHead || isCs || isMfl) && <NavItem to="/contractors" icon={Icons.workers()} label="Исполнители" onClick={close} />}
          {(isAdmin || isAcc) && <NavItem to="/accountant" icon={Icons.invoice()} label="Счета" onClick={close} />}
          {(isAdmin || isAccCashier) && <NavItem to="/accountant-cashier" icon={Icons.payment()} label="Выплаты" onClick={close} />}
        </nav>
        <div className="sidebar-user">
          <div className="user-name">{user?.name || 'Пользователь'}</div>
          <div className="user-role">{user?.role_label || user?.role}</div>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:6 }}>
            {Icons.logout(14)} Выйти
          </button>
        </div>
      </aside>
    </>
  );
}

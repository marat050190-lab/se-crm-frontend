import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Icons } from '../../utils/icons.jsx';

const ADMIN_ROLES = ['super_admin', 'admin', 'rop', 'cs_head'];

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
    <span className="nav-icon" style={{ display:'flex', alignItems:'center' }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
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

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>SEcrm</h1>
        <span>Отдел продаж</span>
      </div>
      <nav className="sidebar-nav">
        {/* Личный дашборд КС */}
        {isCs && <NavItem to="/cs-dashboard-personal" icon={Icons.dashboard()} label="Мой дашборд" />}

        {/* Дашборд */}
        {(isAdmin || isRop) && <NavItem to="/dashboard" icon={Icons.dashboard()} label="Дашборд" />}

        {/* Лиды */}
        {(isAdmin || isRop || isDispatcher || isB2b || isMfl) && <NavItem to="/leads" icon={Icons.leads()} label="Лиды" />}

        {/* Очередь диспетчера */}
        {isDispatcher && <NavItem to="/dispatcher-queue" icon={Icons.funnel()} label="Очередь" />}

        {/* Мои KPI */}
        {(isDispatcher || isB2b) && <NavItem to="/my-kpi" icon={Icons.kpi()} label="Мои KPI" />}

        {/* Воронка */}
        {(isAdmin || isRop || isB2b) && <NavItem to="/funnel" icon={Icons.funnel()} label="Воронка" />}

        {/* Мои задачи */}
        {!isAccCashier && !isAcc && <NavItem to="/tasks" icon={Icons.tasks()} label="Мои задачи" />}

        {/* Клиенты */}
        {!isAccCashier && !isAcc && <NavItem to="/clients" icon={Icons.clients()} label="Клиенты" />}

        {/* Заявки КС */}
        {(isAdmin || isRop || isCsHead || isCs || isAcc || isAccCashier) && <NavItem to="/orders" icon={Icons.orders()} label="Заявки КС" />}

        {/* Сотрудники */}
        {(isAdmin || isRop || isCsHead) && <NavItem to="/users" icon={Icons.users()} label="Сотрудники" />}

        {/* Прайс */}
        {(isAdmin || isDispatcher) && <NavItem to="/pricing" icon={Icons.price()} label="Прайс" />}

        {/* Скрипты */}
        {(isAdmin || isDispatcher || isB2b) && <NavItem to="/scripts" icon={Icons.scripts()} label="Скрипты" />}

        {/* Дашборд КС */}
        {(isAdmin || isCsHead || isCs) && <NavItem to="/cs-dashboard" icon={Icons.chart()} label="Дашборд КС" />}

        {/* Дашборд МФЛ */}
        {(isAdmin || isMfl) && <NavItem to="/mfl-dashboard" icon={Icons.chart()} label="Дашборд МФЛ" />}

        {/* Скрипты для КС */}
        {(isCsHead || isCs) && <NavItem to="/scripts" icon={Icons.scripts()} label="Скрипты" />}

        {/* Исполнители */}
        {(isAdmin || isCsHead || isCs) && <NavItem to="/contractors" icon={Icons.workers()} label="Исполнители" />}

        {/* Счета */}
        {(isAdmin || isAcc) && <NavItem to="/accountant" icon={Icons.invoice()} label="Счета" />}

        {/* Выплаты */}
        {(isAdmin || isAccCashier) && <NavItem to="/accountant-cashier" icon={Icons.payment()} label="Выплаты" />}
      </nav>
      <div className="sidebar-user">
        <div className="user-name">{user?.name || 'Пользователь'}</div>
        <div className="user-role">{user?.role_label || user?.role}</div>
        <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:6 }}>
          {Icons.logout(14)} Выйти
        </button>
      </div>
    </aside>
  );
}

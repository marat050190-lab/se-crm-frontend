import DeptDashboardPage from './DeptDashboardPage.jsx';
export default function CSDashboardPage() {
  return (
    <DeptDashboardPage endpoint="/api/stats/cs" title="Показатели — Клиентский сервис" tableTitle="Отдел по работе с клиентами" />
  );
}

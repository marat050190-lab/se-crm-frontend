import DeptDashboardPage from './DeptDashboardPage.jsx';
export default function MFLDashboardPage() {
  return (
    <DeptDashboardPage endpoint="/api/stats/mfl" title="Показатели — Менеджеры МФЛ" tableTitle="Менеджеры МФЛ" />
  );
}

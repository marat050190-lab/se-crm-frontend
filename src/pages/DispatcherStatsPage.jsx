import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { STATUSES } from '../utils/constants.js';

const REJECT_LABELS = {
  expensive: 'Дорого',
  no_answer: 'Не дозвонились',
  found_another: 'Нашли другого',
  not_our_service: 'Не наша услуга',
  spam: 'Спам',
  rejected: 'Отказ',
  clarified_early: 'Уточнили ранее',
  postponed: 'Отложили',
};

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--card-bg, #1e2a3a)', borderRadius: 12, padding: '20px 24px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--primary)' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DispatcherStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/api/stats/dispatcher')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const conv = data?.conversion;
  const convPct = conv?.total > 0 ? Math.round(conv.converted / conv.total * 100) : 0;

  return (
    <>
      <div className="page-header">
        <h2>Мои KPI</h2>
      </div>
      <div className="page-body">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Загрузка...</div>
        ) : !data ? null : (
          <>
            {/* Сегодня */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Сегодня</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <StatCard label="Лидов получено" value={data.today?.today_total} color="var(--primary)" />
              <StatCard label="В работе" value={data.today?.in_progress} color="#d97706" />
              <StatCard label="Конвертировано" value={data.today?.today_converted} color="#16a34a" />
              <StatCard label="Отказов" value={data.today?.today_rejected} color="#dc2626" />
            </div>

            {/* За 30 дней */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>За 30 дней</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <StatCard label="Конверсия" value={convPct + '%'} color={convPct >= 30 ? '#16a34a' : convPct >= 15 ? '#d97706' : '#dc2626'} sub={`${conv?.converted} из ${conv?.total} лидов`} />
              <StatCard label="Среднее время ответа" value={data.avgResponseMinutes + ' мин'} color={data.avgResponseMinutes <= 5 ? '#16a34a' : data.avgResponseMinutes <= 15 ? '#d97706' : '#dc2626'} sub="от создания до взятия" />
            </div>

            {/* Отказы */}
            {data.rejectReasons?.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Причины отказов (30 дней)</div>
                <div className="card" style={{ marginBottom: 28 }}>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Причина</th><th>Количество</th></tr>
                      </thead>
                      <tbody>
                        {data.rejectReasons.map(r => (
                          <tr key={r.lost_reason}>
                            <td>{REJECT_LABELS[r.lost_reason] || r.lost_reason}</td>
                            <td><strong>{r.count}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* По статусам */}
            {data.byStatus?.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>По статусам (30 дней)</div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Статус</th><th>Количество</th></tr>
                      </thead>
                      <tbody>
                        {data.byStatus.map(s => {
                          const st = STATUSES[s.status];
                          return (
                            <tr key={s.status}>
                              <td>
                                <span className="badge" style={{ color: st?.color, background: st?.bg }}>
                                  {st?.label || s.status}
                                </span>
                              </td>
                              <td><strong>{s.count}</strong></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

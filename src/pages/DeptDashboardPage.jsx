import { useState } from 'react';
import api from '../utils/api.jsx';

const ORDER_STATUSES = [
  { key: 'new',          label: 'Новая' },
  { key: 'pay_executor', label: 'Оплата исполнителям' },
  { key: 'paid',         label: 'Оплачено' },
  { key: 'invoice',      label: 'Счёт выставлен' },
  { key: 'done',         label: 'Завершено' },
  { key: 'cancelled',    label: 'Отменено' },
];

const fmt = (n) => (Number(n) || 0).toLocaleString('ru-RU');

function LineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
        Нет данных за выбранный период
      </div>
    );
  }
  const W = 900, H = 240, padL = 60, padR = 20, padT = 20, padB = 30;
  const xs = data.map((_, idx) => idx);
  const maxV = Math.max(1, ...data.map(d => Math.max(d.revenue, d.net_profit)));
  const x = (idx) => padL + (xs.length === 1 ? 0 : (idx / (xs.length - 1)) * (W - padL - padR));
  const y = (v) => H - padB - (v / maxV) * (H - padT - padB);
  const path = (key) => data.map((d, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  const gridLines = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {Array.from({ length: gridLines + 1 }).map((_, g) => {
        const gy = padT + (g / gridLines) * (H - padT - padB);
        const val = Math.round(maxV * (1 - g / gridLines));
        return (
          <g key={g}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#EEE" strokeWidth="1" />
            <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{fmt(val)}</text>
          </g>
        );
      })}
      {data.map((d, idx) => (idx % Math.ceil(data.length / 12 || 1) === 0) && (
        <text key={idx} x={x(idx)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">
          {String(d.day).slice(8, 10)}.{String(d.day).slice(5, 7)}
        </text>
      ))}
      <path d={path('revenue')} fill="none" stroke="#2563EB" strokeWidth="2" />
      <path d={path('net_profit')} fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="5 4" />
    </svg>
  );
}

export default function DeptDashboardPage({ endpoint, title, tableTitle, embedded }) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const iso = (d) => d.toISOString().slice(0, 10);

  const [filters, setFilters] = useState({
    date_from: iso(first), date_to: iso(today), region: '', city: '', legal_entity: '',
  });
  const [statuses, setStatuses] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const toggleStatus = (key) =>
    setStatuses(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);

  const calc = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      if (statuses.length) params.status = statuses;
      const r = await api.get(endpoint, { params });
      setData(r.data);
    } catch (e) {
      console.error(e);
      alert('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFilters({ date_from: iso(first), date_to: iso(today), region: '', city: '', legal_entity: '' });
    setStatuses([]);
    setData(null);
  };

  const m = data?.metrics;

  return (
    <>
      {!embedded && <div className="page-header">
        <h2>{title}</h2>
      </div>}
      <div className="page-body">

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Дата с</label>
              <input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Дата по</label>
              <input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Регион</label>
              <input type="text" placeholder="Все" value={filters.region} onChange={e => set('region', e.target.value)} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Населённый пункт</label>
              <input type="text" placeholder="Все" value={filters.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Юрлицо</label>
              <select value={filters.legal_entity} onChange={e => set('legal_entity', e.target.value)}>
                <option value="">Все</option>
                <option value="ip">ИП</option>
                <option value="ooo">ООО</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="text-muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Статус заявки</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ORDER_STATUSES.map(s => (
                <button key={s.key} onClick={() => toggleStatus(s.key)} className="btn btn-sm"
                  style={{ background: statuses.includes(s.key) ? '#2563EB' : '#F3F4F6', color: statuses.includes(s.key) ? '#fff' : '#374151', border: 'none' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={calc} disabled={loading}>
              {loading ? 'Загрузка…' : '📊 Рассчитать'}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Сброс</button>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-label">Выручка</div><div className="stat-value">₽ {fmt(m?.revenue)}</div><div className="stat-sub">за период</div></div>
          <div className="stat-card"><div className="stat-label">Чистая прибыль</div><div className="stat-value" style={{ color: '#059669' }}>₽ {fmt(m?.net_profit)}</div><div className="stat-sub">за период</div></div>
          <div className="stat-card"><div className="stat-label">Оплата рабочим</div><div className="stat-value">₽ {fmt(m?.executor_cost)}</div><div className="stat-sub">за период</div></div>
          <div className="stat-card"><div className="stat-label">Заявок</div><div className="stat-value">{fmt(m?.orders_count)}</div><div className="stat-sub">за период</div></div>
          <div className="stat-card"><div className="stat-label">Средний чек</div><div className="stat-value">₽ {fmt(m?.avg_check)}</div><div className="stat-sub">за период</div></div>
          <div className="stat-card"><div className="stat-label">% чист. приб.</div><div className="stat-value">{m?.profit_pct || 0}%</div><div className="stat-sub">за период</div></div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header flex justify-between items-center">
            Выручка и чистая прибыль по дням
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#2563EB', display: 'inline-block' }}></span>Выручка</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#059669', display: 'inline-block' }}></span>Чистая прибыль</span>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <LineChart data={data?.daily} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">{tableTitle}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Менеджер</th>
                  <th style={{ textAlign: 'right' }}>Выручка</th>
                  <th style={{ textAlign: 'right' }}>Не выст. счёт</th>
                  <th style={{ textAlign: 'right' }}>Оплата раб.</th>
                  <th style={{ textAlign: 'right' }}>Кол-во чел.</th>
                  <th style={{ textAlign: 'right' }}>Чист. приб.</th>
                  <th style={{ textAlign: 'right' }}>% чист.</th>
                  <th style={{ textAlign: 'right' }}>Заказов</th>
                  <th style={{ textAlign: 'right' }}>Ср. чек</th>
                </tr>
              </thead>
              <tbody>
                {!data || data.managers.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#9CA3AF' }}>
                    {data ? 'Нет данных за выбранный период' : 'Нажмите «Рассчитать»'}
                  </td></tr>
                ) : data.managers.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.revenue)}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.revenue_no_invoice)}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.executor_cost)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(r.people)}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.net_profit)}</td>
                    <td style={{ textAlign: 'right' }}>{r.profit_pct}%</td>
                    <td style={{ textAlign: 'right' }}>{fmt(r.orders_count)}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.avg_check)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

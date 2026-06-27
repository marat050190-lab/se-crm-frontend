import { useState, useRef, useEffect } from 'react';
import api from '../utils/api.jsx';

const ORDER_STATUSES = [
  { key: 'new', label: 'Новая' },
  { key: 'pay_executor', label: 'Оплата исполнителям' },
  { key: 'paid', label: 'Оплачено' },
  { key: 'invoice', label: 'Счёт выставлен' },
  { key: 'done', label: 'Завершено' },
  { key: 'cancelled', label: 'Отменено' },
];

const fmt = (n) => (Number(n) || 0).toLocaleString('ru-RU');

const inp = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 8, fontSize: 13,
  color: 'var(--gray-800)',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const lbl = {
  fontSize: 11, fontWeight: 700,
  color: 'var(--gray-500)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: 6,
};

function AutoInput({ value, onChange, placeholder, suggestFn }) {
  const [suggests, setSuggests] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (v) => {
    onChange(v);
    clearTimeout(timer.current);
    if (v.length >= 2 && suggestFn) {
      timer.current = setTimeout(async () => {
        const res = await suggestFn(v);
        setSuggests(res);
        setOpen(res.length > 0);
      }, 300);
    } else {
      setSuggests([]);
      setOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={inp}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,177,79,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 220, overflowY: 'auto', marginTop: 2 }}>
          {suggests.map((s, i) => (
            <div key={i} onClick={() => { onChange(typeof s === 'string' ? s : s.name); setOpen(false); }}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--gray-100)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              {typeof s === 'string' ? s : <><span style={{ fontWeight: 600 }}>{s.name}</span>{s.inn && <span style={{ color: 'var(--gray-400)', fontSize: 11, marginLeft: 8 }}>ИНН {s.inn}</span>}</>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Нет данных за выбранный период</div>;
  }
  const W = 900, H = 240, padL = 60, padR = 20, padT = 20, padB = 30;
  const maxV = Math.max(1, ...data.map(d => Math.max(d.revenue, d.net_profit)));
  const x = (idx) => padL + (data.length === 1 ? 0 : (idx / (data.length - 1)) * (W - padL - padR));
  const y = (v) => H - padB - (v / maxV) * (H - padT - padB);
  const path = (key) => data.map((d, idx) => `${idx === 0 ? 'M' : 'L'}${x(idx).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {Array.from({ length: 5 }).map((_, g) => {
        const gy = padT + (g / 4) * (H - padT - padB);
        return <g key={g}>
          <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#EEE" strokeWidth="1" />
          <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{fmt(Math.round(maxV * (1 - g / 4)))}</text>
        </g>;
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
    date_from: iso(first), date_to: iso(today),
    region: '', city: '', legal_entity: '', client_name: '',
  });
  const [statuses, setStatuses] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const toggleStatus = (key) => setStatuses(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);

  const suggestClients = async (q) => {
    try { const r = await api.get('/api/clients/suggest', { params: { q } }); return r.data; }
    catch { return []; }
  };

  const suggestCities = async (q) => {
    try {
      const r = await fetch(`https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Token 6421f0a948e4a3df5098151b4372a636665ba3f5' },
        body: JSON.stringify({ query: q, count: 7, locations: [{ country: 'Россия' }], from_bound: { value: 'city' }, to_bound: { value: 'city' } })
      });
      const d = await r.json();
      return d.suggestions?.map(s => s.data.city || s.value) || [];
    } catch { return []; }
  };

  const calc = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      if (statuses.length) params.status = statuses;
      const r = await api.get(endpoint, { params });
      setData(r.data);
    } catch (e) {
      alert('Ошибка загрузки статистики');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setFilters({ date_from: iso(first), date_to: iso(today), region: '', city: '', legal_entity: '', client_name: '' });
    setStatuses([]);
    setData(null);
  };

  const m = data?.metrics;

  return (
    <>
      {!embedded && <div className="page-header"><h2>{title}</h2></div>}
      <div className="page-body">

        {/* Фильтры */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14, marginBottom: 16 }}>

            <div>
              <label style={lbl}>Дата с</label>
              <input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)}
                style={inp}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,177,79,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div>
              <label style={lbl}>Дата по</label>
              <input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)}
                style={inp}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,177,79,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div>
              <label style={lbl}>Юрлицо</label>
              <select value={filters.legal_entity} onChange={e => set('legal_entity', e.target.value)}
                style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Все</option>
                <option value="ip">ИП Лукманов</option>
                <option value="ooo">ООО СЭ</option>
              </select>
            </div>

            <div>
              <label style={lbl}>Клиент</label>
              <AutoInput value={filters.client_name} onChange={v => set('client_name', v)}
                placeholder="Название клиента..." suggestFn={suggestClients} />
            </div>

            <div>
              <label style={lbl}>Город</label>
              <AutoInput value={filters.city} onChange={v => set('city', v)}
                placeholder="Все города..." suggestFn={suggestCities} />
            </div>

          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Статус заявки</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ORDER_STATUSES.map(s => (
                <button key={s.key} onClick={() => toggleStatus(s.key)}
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: statuses.includes(s.key) ? 'var(--primary)' : 'var(--gray-100)',
                    color: statuses.includes(s.key) ? '#fff' : 'var(--gray-600)',
                    transition: 'all 0.15s' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={calc} disabled={loading}>
              {loading ? 'Загрузка…' : 'Рассчитать'}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Сброс</button>
          </div>
        </div>

        {/* Статы */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Выручка', value: `₽ ${fmt(m?.revenue)}`, color: null },
            { label: 'Чистая прибыль', value: `₽ ${fmt(m?.net_profit)}`, color: '#059669' },
            { label: 'Оплата рабочим', value: `₽ ${fmt(m?.executor_cost)}`, color: null },
            { label: 'Заявок', value: fmt(m?.orders_count), color: null },
            { label: 'Средний чек', value: `₽ ${fmt(m?.avg_check)}`, color: null },
            { label: '% чист. приб.', value: `${m?.profit_pct || 0}%`, color: null },
          ].map(({ label, value, color }) => (
            <div className="stat-card" key={label}>
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-value" style={color ? { color } : {}}>{value}</div>
              <div className="stat-card-sub">за период</div>
            </div>
          ))}
        </div>

        {/* График */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header flex justify-between items-center">
            Выручка и чистая прибыль по дням
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#2563EB', display: 'inline-block', borderRadius: 2 }}></span>Выручка</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#059669', display: 'inline-block', borderRadius: 2 }}></span>Чистая прибыль</span>
            </div>
          </div>
          <div style={{ padding: 16 }}><LineChart data={data?.daily} /></div>
        </div>

        {/* Таблица */}
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
                {!data || !data.managers || data.managers.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                    {data ? 'Нет данных за выбранный период' : 'Нажмите «Рассчитать»'}
                  </td></tr>
                ) : data.managers.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₽ {fmt(r.revenue)}</td>
                    <td style={{ textAlign: 'right', color: '#DC2626' }}>₽ {fmt(r.revenue_no_invoice)}</td>
                    <td style={{ textAlign: 'right' }}>₽ {fmt(r.executor_cost)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(r.people)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>₽ {fmt(r.net_profit)}</td>
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

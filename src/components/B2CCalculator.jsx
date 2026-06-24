import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.jsx';

export default function B2CCalculator({ form, onSetPrice }) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tariff, setTariff] = useState('prr');
  const [workers, setWorkers] = useState(form.workers_count || 2);
  const [hours, setHours] = useState(form.hours_estimate || 2);
  const [withGazel, setWithGazel] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    api.get('/api/pricing/movers').then(r => setCities(r.data)).catch(() => {});
  }, []);

  const handleCityInput = (v) => {
    setCityInput(v);
    setSelected(null);
    setResult(null);
    clearTimeout(timer.current);
    if (v.length < 2) { setSuggestions([]); return; }
    timer.current = setTimeout(() => {
      const filtered = cities.filter(c => c.city.toLowerCase().includes(v.toLowerCase())).slice(0, 8);
      setSuggestions(filtered);
    }, 200);
  };

  const pickCity = (c) => {
    setSelected(c);
    setCityInput(c.city);
    setSuggestions([]);
    setResult(null);
  };

  const calc = async () => {
    if (!selected) { setError('Выберите город из списка'); return; }
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/api/pricing/movers/calc', {
        city: selected.city, tariff, workers: Number(workers), hours: Number(hours), withGazel
      });
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка расчёта');
    }
    setLoading(false);
  };

  const apply = () => {
    if (result) { onSetPrice(result.total); setOpen(false); setResult(null); }
  };

  const TARIFF_LABELS = { prr: 'ПРР (почасовая)', shift8: 'Смена 8 часов', shift12: 'Смена 12 часов' };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={btnCalc}>🧮 Рассчитать стоимость</button>
  );

  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Калькулятор B2C — Грузчики</strong>
        <button onClick={() => { setOpen(false); setResult(null); }} style={btnClose}>✕</button>
      </div>

      {/* Город */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <label style={lbl}>Город</label>
        <input value={cityInput} onChange={e => handleCityInput(e.target.value)}
          placeholder="Начните вводить город..."
          style={inp} autoComplete="off" />
        {suggestions.length > 0 && (
          <ul style={dropdown}>
            {suggestions.map(c => (
              <li key={c.id} onMouseDown={() => pickCity(c)} style={dropItem}>
                {c.city}
                <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 8 }}>
                  ПРР {c.prr_rate}₽/ч · мин {c.min_hours}ч
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Тариф */}
      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>Тариф</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(TARIFF_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => { setTariff(v); setResult(null); }}
              style={{ ...btnTab, background: tariff === v ? '#2563eb' : '#f3f4f6', color: tariff === v ? '#fff' : '#374151' }}>
              {l}
            </button>
          ))}
        </div>
        {selected && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Ставка: {tariff === 'shift12' ? selected.shift12_rate : tariff === 'shift8' ? selected.shift8_rate : selected.prr_rate} ₽/час
            {' · '} Минимум {selected.min_hours} ч
          </div>
        )}
      </div>

      {/* Грузчики и часы */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={lbl}>Грузчиков</label>
          <input type="number" min="1" value={workers} onChange={e => { setWorkers(e.target.value); setResult(null); }} style={inp} />
        </div>
        <div>
          <label style={lbl}>Часов</label>
          <input type="number" min="1" step="0.5" value={hours} onChange={e => { setHours(e.target.value); setResult(null); }} style={inp} />
          {selected && Number(hours) < selected.min_hours && (
            <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
              Будет применён минимум {selected.min_hours} ч
            </div>
          )}
        </div>
      </div>

      {/* Газель */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={withGazel} onChange={e => { setWithGazel(e.target.checked); setResult(null); }} />
        Газель ({selected ? selected.gazel_price.toLocaleString('ru') : '2 000'} ₽)
      </label>

      {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <button onClick={calc} disabled={loading || !selected} style={{ ...btnPrimary, opacity: !selected ? 0.5 : 1, cursor: !selected ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Считаю...' : 'Рассчитать'}
      </button>

      {result && (
        <div style={resultBox}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            <span>Труд: {result.labor.toLocaleString('ru')} ₽</span>
            {result.gazel > 0 && <span>Газель: {result.gazel.toLocaleString('ru')} ₽</span>}
            <span>Грузчиков: {result.workers} × {result.hours} ч × {result.rate} ₽</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginBottom: 10 }}>
            Итого: {result.total.toLocaleString('ru')} ₽
          </div>
          {result.note && <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8 }}>⚠️ {result.note}</div>}
          <button onClick={apply} style={{ ...btnPrimary, width: '100%' }}>
            ✓ Применить — {result.total.toLocaleString('ru')} ₽
          </button>
        </div>
      )}
    </div>
  );
}

const box = { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 16, marginBottom: 12 };
const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 };
const inp = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
const btnCalc = { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 8 };
const btnClose = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280' };
const btnTab = { padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12 };
const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, width: '100%' };
const dropdown = { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const dropItem = { padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f3f4f6' };
const resultBox = { marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #bae6fd' };

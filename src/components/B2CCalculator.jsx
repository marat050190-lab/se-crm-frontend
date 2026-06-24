import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

// ===== ТАКЕЛАЖ =====
function calcRigging({ weight, carry_distance, floors, basement, dismantle }) {
  let base = 0;
  const w = Number(weight) || 0;
  if (w <= 0) return 0;
  if (w <= 250) base = w * 50;
  else if (w <= 499) base = w * 38;
  else if (w <= 999) base = w * 27;
  else base = w * 20;

  let extras = 0;
  const dist = Number(carry_distance) || 0;
  if (dist > 100) extras += (dist - 100) * 500;

  const fl = Number(floors) || 1;
  if (fl > 1) extras += (fl - 1) * 5000;
  if (basement) extras += 10000;
  if (dismantle) extras += 10000;

  return Math.round(base + extras);
}

// ===== ГРУЗОПЕРЕВОЗКА =====
const TRUCKS = [
  { value: 'gazel', label: 'Газель 1.5т', hourly: 2000, min_hours: 2, rate_mid: 45, rate_far: 40 },
  { value: 't3', label: '3 тонны', hourly: 2500, min_hours: 3, rate_mid: 60, rate_far: 55 },
  { value: 't5', label: '5 тонн', hourly: 3000, min_hours: 4, rate_mid: 80, rate_far: 75 },
  { value: 't20', label: '20 тонн', hourly: 4500, min_hours: 4, rate_mid: 120, rate_far: 110 },
];

function calcFreight({ truck, hours, distance }) {
  const t = TRUCKS.find(x => x.value === truck);
  if (!t) return 0;
  const h = Math.max(Number(hours) || 0, t.min_hours);
  const d = Number(distance) || 0;

  if (d < 30) return h * t.hourly;
  if (d <= 100) return h * t.hourly + d * t.rate_mid;
  return d * t.rate_far;
}

// ===== ГРУЗЧИКИ (существующий) =====
function MoversCalc({ onApply, onClose }) {
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [cityDropdown, setCityDropdown] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [tariff, setTariff] = useState('prr');
  const [workers, setWorkers] = useState(2);
  const [hours, setHours] = useState(2);
  const [gazel, setGazel] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/pricing/movers').then(r => setCities(r.data || []));
  }, []);

  const handleCityInput = (val) => {
    setCityInput(val);
    if (val.length < 2) { setCityDropdown([]); return; }
    const filtered = cities.filter(c => c.city.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
    setCityDropdown(filtered);
  };

  const calcPrice = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const res = await api.post('/api/pricing/movers/calc', { city: selectedCity.city, tariff, workers: Number(workers), hours: Number(hours), gazel });
      setResult(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const box = { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 16, marginBottom: 12 };
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 };
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const btnTab = { padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12 };
  const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, width: '100%' };
  const dropdown = { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
  const dropItem = { padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f3f4f6' };
  const resultBox = { marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #bae6fd' };

  return (
    <div style={box}>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <label style={lbl}>Город</label>
        <input style={inp} value={cityInput} onChange={e => handleCityInput(e.target.value)} placeholder="Начните вводить город..." />
        {cityDropdown.length > 0 && (
          <ul style={dropdown}>
            {cityDropdown.map(c => (
              <li key={c.id} style={dropItem} onClick={() => { setSelectedCity(c); setCityInput(c.city); setCityDropdown([]); }}>
                {c.city}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Тариф</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['prr','ПРР (почасовая)'],['shift8','Смена 8 часов'],['shift12','Смена 12 часов']].map(([v,l]) => (
            <button key={v} style={{ ...btnTab, background: tariff===v ? '#2563eb' : '#f3f4f6', color: tariff===v ? '#fff' : '#374151' }} onClick={() => setTariff(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Грузчиков</label>
          <input style={inp} type="number" min={1} value={workers} onChange={e => setWorkers(e.target.value)} />
        </div>
        {tariff === 'prr' && (
          <div style={{ flex: 1 }}>
            <label style={lbl}>Часов</label>
            <input style={inp} type="number" min={1} value={hours} onChange={e => setHours(e.target.value)} />
          </div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={gazel} onChange={e => setGazel(e.target.checked)} />
          Газель (+2 000 ₽)
        </label>
      </div>
      <button style={btnPrimary} onClick={calcPrice} disabled={loading || !selectedCity}>
        {loading ? 'Считаем...' : 'Рассчитать'}
      </button>
      {result && (
        <div style={resultBox}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>
            {result.total?.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{result.breakdown}</div>
          <button style={btnPrimary} onClick={() => onApply(result.total)}>
            ✓ Применить — {result.total?.toLocaleString('ru-RU')} ₽
          </button>
        </div>
      )}
    </div>
  );
}

// ===== ТАКЕЛАЖ =====
function RiggingCalc({ onApply }) {
  const [form, setForm] = useState({ weight: '', carry_distance: '0', floors: '1', basement: false, dismantle: false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const total = calcRigging(form);

  const box = { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 12 };
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 };
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, width: '100%' };
  const resultBox = { marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #bbf7d0' };

  return (
    <div style={box}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Вес груза (кг)</label>
          <input style={inp} type="number" min={1} value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="500" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Пронос (м)</label>
          <input style={inp} type="number" min={0} value={form.carry_distance} onChange={e => set('carry_distance', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Этажей подъёма</label>
        <input style={inp} type="number" min={1} value={form.floors} onChange={e => set('floors', e.target.value)} placeholder="1" />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={form.basement} onChange={e => set('basement', e.target.checked)} />
          Цоколь (+10 000 ₽)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={form.dismantle} onChange={e => set('dismantle', e.target.checked)} />
          Демонтаж/монтаж проёмов (+10 000 ₽)
        </label>
      </div>
      {total > 0 && (
        <div style={resultBox}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            {Number(form.weight) <= 250 ? '50 ₽/кг' : Number(form.weight) <= 499 ? '38 ₽/кг' : Number(form.weight) <= 999 ? '27 ₽/кг' : '20 ₽/кг'}
            {Number(form.carry_distance) > 100 ? ` + пронос ${Number(form.carry_distance)-100}м` : ''}
            {Number(form.floors) > 1 ? ` + ${Number(form.floors)-1} эт.` : ''}
          </div>
          <button style={btnPrimary} onClick={() => onApply(total)}>
            ✓ Применить — {total.toLocaleString('ru-RU')} ₽
          </button>
        </div>
      )}
    </div>
  );
}

// ===== ГРУЗОПЕРЕВОЗКА =====
function FreightCalc({ onApply }) {
  const [form, setForm] = useState({ truck: 'gazel', hours: '2', distance: '0' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const d = Number(form.distance) || 0;
  const total = calcFreight(form);
  const t = TRUCKS.find(x => x.value === form.truck);

  const box = { background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 12 };
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 };
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const btnTab = { padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12 };
  const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, width: '100%' };
  const resultBox = { marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #fde68a' };

  return (
    <div style={box}>
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Транспорт</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TRUCKS.map(tr => (
            <button key={tr.value} style={{ ...btnTab, background: form.truck===tr.value ? '#2563eb' : '#f3f4f6', color: form.truck===tr.value ? '#fff' : '#374151' }} onClick={() => set('truck', tr.value)}>
              {tr.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Расстояние (км)</label>
          <input style={inp} type="number" min={0} value={form.distance} onChange={e => set('distance', e.target.value)} />
        </div>
        {d < 30 && (
          <div style={{ flex: 1 }}>
            <label style={lbl}>Часов (мин. {t?.min_hours})</label>
            <input style={inp} type="number" min={t?.min_hours || 2} value={form.hours} onChange={e => set('hours', e.target.value)} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#92400e', marginBottom: 12 }}>
        {d < 30 ? `До 30 км — почасовая (${t?.hourly?.toLocaleString('ru-RU')} ₽/ч, мин. ${t?.min_hours} ч)` :
         d <= 100 ? `30-100 км — почасовая + ${t?.rate_mid} ₽/км` :
         `100+ км — ${t?.rate_far} ₽/км`}
      </div>
      {total > 0 && (
        <div style={resultBox}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', marginBottom: 10 }}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
          <button style={btnPrimary} onClick={() => onApply(total)}>
            ✓ Применить — {total.toLocaleString('ru-RU')} ₽
          </button>
        </div>
      )}
    </div>
  );
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
const CALC_TYPES = [
  { value: 'movers', label: '👷 Грузчики', services: ['movers', 'moving_apartment', 'moving_office'] },
  { value: 'rigging', label: '⚙️ Такелаж', services: ['rigging'] },
  { value: 'freight', label: '🚛 Перевозка', services: ['freight'] },
];

export default function B2CCalculator({ onApply, onClose, serviceType }) {
  const defaultTab = CALC_TYPES.find(c => c.services.includes(serviceType))?.value || 'movers';
  const [tab, setTab] = useState(defaultTab);

  const btnTab = { padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
  const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, marginTop: 12 }}>
      <div style={header}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🧮 Калькулятор B2C</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {CALC_TYPES.map(ct => (
          <button key={ct.value} style={{ ...btnTab, background: tab===ct.value ? '#2563eb' : '#f3f4f6', color: tab===ct.value ? '#fff' : '#374151' }} onClick={() => setTab(ct.value)}>
            {ct.label}
          </button>
        ))}
      </div>
      {tab === 'movers' && <MoversCalc onApply={onApply} onClose={onClose} />}
      {tab === 'rigging' && <RiggingCalc onApply={onApply} />}
      {tab === 'freight' && <FreightCalc onApply={onApply} />}
    </div>
  );
}

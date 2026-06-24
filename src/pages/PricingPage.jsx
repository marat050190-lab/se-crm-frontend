import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const EDIT_ROLES = ['super_admin', 'admin', 'cs_head', 'rop'];

export default function PricingPage() {
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const canEdit = EDIT_ROLES.includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pricing/movers');
      setCities(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = cities.filter(c =>
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (city) => {
    setEditingId(city.id);
    setEditForm({
      prr_rate: city.prr_rate,
      min_hours: city.min_hours,
      shift8_rate: city.shift8_rate,
      shift12_rate: city.shift12_rate,
      gazel_price: city.gazel_price,
      note: city.note || '',
    });
  };

  const save = async (id) => {
    setSaving(true);
    try {
      await api.put(`/api/pricing/movers/${id}`, editForm);
      setEditingId(null);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="page-header">
        <h2>Прайс грузчиков B2C <span className="text-muted" style={{ fontWeight: 400, fontSize: 15 }}>({filtered.length} городов)</span></h2>
      </div>
      <div className="page-body">
        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍 Поиск города..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Загрузка...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Город</th>
                    <th>ПРР (₽/ч)</th>
                    <th>Мин. часов</th>
                    <th>Смена 8ч (₽)</th>
                    <th>Смена 12ч (₽)</th>
                    <th>Газель (₽)</th>
                    <th>Примечание</th>
                    {canEdit && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(city => editingId === city.id ? (
                    <tr key={city.id} style={{ background: 'var(--primary-light, #eff6ff)' }}>
                      <td><strong>{city.city}</strong></td>
                      <td><input className="form-control" style={{ width: 80 }} type="number" value={editForm.prr_rate} onChange={e => set('prr_rate', e.target.value)} /></td>
                      <td><input className="form-control" style={{ width: 60 }} type="number" value={editForm.min_hours} onChange={e => set('min_hours', e.target.value)} /></td>
                      <td><input className="form-control" style={{ width: 90 }} type="number" value={editForm.shift8_rate} onChange={e => set('shift8_rate', e.target.value)} /></td>
                      <td><input className="form-control" style={{ width: 90 }} type="number" value={editForm.shift12_rate} onChange={e => set('shift12_rate', e.target.value)} /></td>
                      <td><input className="form-control" style={{ width: 80 }} type="number" value={editForm.gazel_price} onChange={e => set('gazel_price', e.target.value)} /></td>
                      <td><input className="form-control" value={editForm.note} onChange={e => set('note', e.target.value)} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => save(city.id)} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)} style={{ marginLeft: 4 }}>✕</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={city.id}>
                      <td><strong>{city.city}</strong></td>
                      <td>{city.prr_rate ? Number(city.prr_rate).toLocaleString('ru-RU') : '—'}</td>
                      <td>{city.min_hours || '—'}</td>
                      <td>{city.shift8_rate ? Number(city.shift8_rate).toLocaleString('ru-RU') : '—'}</td>
                      <td>{city.shift12_rate ? Number(city.shift12_rate).toLocaleString('ru-RU') : '—'}</td>
                      <td>{city.gazel_price ? Number(city.gazel_price).toLocaleString('ru-RU') : '—'}</td>
                      <td className="text-muted">{city.note || '—'}</td>
                      {canEdit && (
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(city)}>✎</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [suggests, setSuggests] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', client_type: 'legal', company_name: '', inn: '', comment: '' });
  const nav = useNavigate();
  const searchRef = useRef(null);
  const suggestTimer = useRef(null);

  const load = useCallback(async (p = 1, s = search, t = typeFilter) => {
    setLoading(true);
    try {
      const r = await api.get('/api/clients', { params: { search: s, page: p, limit: 30, type: t || undefined } });
      setClients(r.data.clients);
      setTotal(r.data.total);
      setPage(r.data.page);
      setPages(r.data.pages);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(1, '', ''); }, []);

  function onSearchChange(val) {
    setSearch(val);
    setShowSuggest(val.length >= 2);
    clearTimeout(suggestTimer.current);
    if (val.length >= 2) {
      suggestTimer.current = setTimeout(async () => {
        try {
          const r = await api.get('/api/clients/suggest', { params: { q: val } });
          setSuggests(r.data);
        } catch(e) {}
      }, 300);
    } else {
      setSuggests([]);
      if (!val) load(1, '', typeFilter);
    }
  }

  function onSearchKeyDown(e) {
    if (e.key === 'Enter') { setShowSuggest(false); load(1, search, typeFilter); }
    if (e.key === 'Escape') { setShowSuggest(false); }
  }

  function selectSuggest(s) {
    setShowSuggest(false);
    nav('/clients/' + s.id);
  }

  async function save() {
    if (!form.name) return alert('Введите имя клиента');
    await api.post('/api/clients', form);
    setShowForm(false);
    setForm({ name: '', phone: '', client_type: 'legal', company_name: '', inn: '', comment: '' });
    load(1, search, typeFilter);
  }

  const inp = { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Клиенты</h1>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{total.toLocaleString('ru')} клиентов</div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          {showForm ? 'Отмена' : '+ Новый клиент'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <input placeholder="Имя / название *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} />
            <input placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inp} />
            <select value={form.client_type} onChange={e => setForm({...form, client_type: e.target.value})} style={inp}>
              <option value="legal">Юрлицо</option>
              <option value="individual">Физлицо</option>
            </select>
            <input placeholder="Компания" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} style={inp} />
            <input placeholder="ИНН" value={form.inn} onChange={e => setForm({...form, inn: e.target.value})} style={inp} />
            <input placeholder="Комментарий" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} style={inp} />
          </div>
          <button onClick={save} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', marginTop: 12, fontWeight: 600 }}>Сохранить</button>
        </div>
      )}

      {/* Поиск и фильтры */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }} ref={searchRef}>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            onFocus={() => search.length >= 2 && setShowSuggest(true)}
            placeholder="Поиск по названию, ИНН, телефону..."
            style={{ ...inp, paddingLeft: 40, fontSize: 15 }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }}>🔍</span>
          {search && (
            <button onClick={() => { setSearch(''); setSuggests([]); setShowSuggest(false); load(1, '', typeFilter); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>✕</button>
          )}
          {showSuggest && suggests.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 300, overflowY: 'auto' }}>
              {suggests.map(s => (
                <div key={s.id} onClick={() => selectSuggest(s)}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    {s.company_name && s.company_name !== s.name && <div style={{ fontSize: 12, color: '#6b7280' }}>{s.company_name}</div>}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#9ca3af' }}>
                    {s.inn && <div>ИНН: {s.inn}</div>}
                    {s.phone && <div>{s.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); load(1, search, e.target.value); }}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, minWidth: 130 }}>
          <option value="">Все типы</option>
          <option value="legal">Юрлица</option>
          <option value="individual">Физлица</option>
        </select>
        <button onClick={() => load(1, search, typeFilter)}
          style={{ padding: '10px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>
          Найти
        </button>
      </div>

      {/* Таблица */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Загрузка...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div>Клиенты не найдены</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Клиент', 'Телефон', 'Тип', 'ИНН', 'Менеджер'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} onClick={() => nav('/clients/' + c.id)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    {c.company_name && c.company_name !== c.name && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.company_name}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.phone || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: c.client_type === 'legal' ? '#EFF6FF' : '#F0FDF4',
                      color: c.client_type === 'legal' ? '#2563EB' : '#16A34A' }}>
                      {c.client_type === 'legal' ? 'Юрлицо' : 'Физлицо'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.inn || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.manager_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагинация */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => load(page - 1, search, typeFilter)} disabled={page <= 1}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#d1d5db' : '#374151' }}>
            ← Назад
          </button>
          <span style={{ fontSize: 14, color: '#6b7280' }}>Страница {page} из {pages}</span>
          <button onClick={() => load(page + 1, search, typeFilter)} disabled={page >= pages}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: page >= pages ? 'not-allowed' : 'pointer', color: page >= pages ? '#d1d5db' : '#374151' }}>
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}

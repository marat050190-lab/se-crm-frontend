import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api.jsx';
import { STATUSES, SERVICE_TYPES, SOURCES, CLIENT_TYPES } from '../utils/constants.js';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://se-crm-backend-production.up.railway.app';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newLeadFlash, setNewLeadFlash] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, status };
      if (search) params.search = search;
      const res = await api.get('/api/leads', { params });
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  useEffect(() => {
    const timer = setInterval(loadLeads, 30000);
    return () => clearInterval(timer);
  }, [loadLeads]);

  // Socket.IO — живые обновления
  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

    const handleNewLead = (lead) => {
      if (page === 1 && status === 'all' && !search) {
        setLeads(prev => {
          if (prev.find(l => l.id === lead.id)) return prev;
          return [lead, ...prev.slice(0, 29)];
        });
        setTotal(prev => prev + 1);
        setNewLeadFlash(lead.id);
        setTimeout(() => setNewLeadFlash(null), 3000);
      }
    };

    socket.on('new_lead', handleNewLead);
    socket.on('new_email_lead', (data) => {
      // При email лиде просто перезагружаем список
      if (page === 1) loadLeads();
    });

    return () => socket.disconnect();
  }, [page, status, search, loadLeads]);

  return (
    <>
      <div className="page-header">
        <h2>Лиды <span className="text-muted" style={{ fontWeight: 400, fontSize: 15 }}>({total})</span></h2>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>+ Новый лид</button>
      </div>
      <div className="page-body">
        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍 Поиск по имени, телефону, номеру..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="form-control" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">Все статусы</option>
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={loadLeads}>↻ Обновить</button>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Загрузка...</div>
            ) : leads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>Лиды не найдены</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Тип</th>
                    <th>Услуга</th>
                    <th>Источник</th>
                    <th>Менеджер</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => {
                    const st = STATUSES[lead.status];
                    const svc = SERVICE_TYPES.find(s => s.value === lead.service_type);
                    const isNew = newLeadFlash === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        style={{
                          cursor: 'pointer',
                          background: isNew ? '#f0fdf4' : undefined,
                          transition: 'background 0.5s'
                        }}
                        onClick={() => navigate('/leads/' + lead.id)}
                      >
                        <td><span className="lead-link">{lead.lead_number}</span></td>
                        <td>
                          {lead.client_name || <span className="text-muted">—</span>}
                          {lead.client_company && <div className="text-muted">{lead.client_company}</div>}
                        </td>
                        <td><span className="phone">{lead.client_phone}</span></td>
                        <td>
                          <span className="text-muted">
                            {lead.client_type === 'legal' ? '🏢' : '👤'}
                          </span>
                        </td>
                        <td>{svc?.label || <span className="text-muted">—</span>}</td>
                        <td className="text-muted">{SOURCES[lead.source] || lead.source}</td>
                        <td>{lead.assigned_name || <span className="text-muted">—</span>}</td>
                        <td>
                          <span className="badge" style={{ color: st?.color, background: st?.bg }}>
                            {st?.label || lead.status}
                          </span>
                          {lead.pending_tasks > 0 && (
                            <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', marginLeft: 6 }}>
                              {lead.pending_tasks} задач
                            </span>
                          )}
                        </td>
                        <td className="text-muted">{new Date(lead.created_at).toLocaleString('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {pages > 1 && (
          <div className="flex gap-2 items-center mt-4">
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Назад</button>
            <span className="text-muted">Стр. {page} из {pages}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}>Вперёд →</button>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewLeadModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => { setShowNewModal(false); navigate('/leads/' + id); }}
        />
      )}
    </>
  );
}

function NewLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    client_phone: '', client_name: '', client_company: '',
    client_type: 'individual', service_type: '', source: 'call'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const submit = async () => {
    if (!form.client_phone) return setError('Укажите телефон');
    setLoading(true);
    try {
      const res = await api.post('/api/leads', form);
      onCreated(res.data.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Новый лид</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Тип клиента</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CLIENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => set('client_type', ct.value)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                    border: form.client_type === ct.value ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                    background: form.client_type === ct.value ? 'var(--primary-light, #EFF6FF)' : 'transparent',
                    fontWeight: form.client_type === ct.value ? 700 : 400,
                    color: form.client_type === ct.value ? 'var(--primary)' : 'var(--gray-600)',
                  }}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Телефон *</label>
              <input className="form-control" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="+7 (999) 000-00-00" />
            </div>
            <div className="form-group">
              <label className="form-label">Имя клиента</label>
              <input className="form-control" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
            </div>
          </div>
          {form.client_type === 'legal' && (
            <div className="form-group">
              <label className="form-label">Компания</label>
              <input className="form-control" value={form.client_company} onChange={e => set('client_company', e.target.value)} placeholder="ООО Ромашка" />
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Услуга</label>
              <select className="form-control" value={form.service_type} onChange={e => set('service_type', e.target.value)}>
                <option value="">— не выбрано —</option>
                {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Источник</label>
              <select className="form-control" value={form.source} onChange={e => set('source', e.target.value)}>
                {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Создаём...' : 'Создать лид'}
          </button>
        </div>
      </div>
    </div>
  );
}

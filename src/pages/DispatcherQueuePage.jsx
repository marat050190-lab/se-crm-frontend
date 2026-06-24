import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api.jsx';
import { STATUSES, SERVICE_TYPES } from '../utils/constants.js';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://se-crm-backend-production.up.railway.app';

function getElapsed(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60);
}

function TimerBadge({ createdAt }) {
  const [mins, setMins] = useState(getElapsed(createdAt));
  useEffect(() => {
    const t = setInterval(() => setMins(getElapsed(createdAt)), 10000);
    return () => clearInterval(t);
  }, [createdAt]);

  let color = '#16a34a', bg = '#f0fdf4', label = `${mins} мин`;
  if (mins >= 15) { color = '#dc2626'; bg = '#fef2f2'; }
  else if (mins >= 5) { color = '#d97706'; bg = '#fffbeb'; }

  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 700, color, background: bg }}>
      ⏱ {label}
    </span>
  );
}

export default function DispatcherQueuePage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [takingId, setTakingId] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/leads', { params: { page: 1, limit: 100, status: 'new' } });
      const newLeads = res.data.leads || [];
      const res2 = await api.get('/api/leads', { params: { page: 1, limit: 100, status: 'in_progress' } });
      const inProgress = res2.data.leads || [];
      const all = [...newLeads, ...inProgress].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setLeads(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => {
    const t = setInterval(loadLeads, 30000);
    return () => clearInterval(t);
  }, [loadLeads]);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socket.on('new_lead', () => loadLeads());
    socket.on('new_email_lead', () => loadLeads());
    return () => socket.disconnect();
  }, [loadLeads]);

  const takeInWork = async (e, lead) => {
    e.stopPropagation();
    setTakingId(lead.id);
    try {
      await api.patch(`/api/leads/${lead.id}`, { status: 'in_progress' });
      await loadLeads();
      navigate('/leads/' + lead.id);
    } catch (err) {
      console.error(err);
    } finally {
      setTakingId(null);
    }
  };

  const newLeads = leads.filter(l => l.status === 'new');
  const inProgress = leads.filter(l => l.status === 'in_progress');

  return (
    <>
      <div className="page-header">
        <h2>Очередь лидов <span className="text-muted" style={{ fontWeight: 400, fontSize: 15 }}>({leads.length})</span></h2>
        <button className="btn btn-secondary btn-sm" onClick={loadLeads}>↻ Обновить</button>
      </div>
      <div className="page-body">
        {loading && leads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Загрузка...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✅</div><p>Очередь пуста</p></div>
        ) : (
          <>
            {newLeads.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Новые ({newLeads.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {newLeads.map(lead => <LeadCard key={lead.id} lead={lead} onOpen={() => navigate('/leads/' + lead.id)} onTake={(e) => takeInWork(e, lead)} taking={takingId === lead.id} />)}
                </div>
              </div>
            )}
            {inProgress.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  В работе ({inProgress.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {inProgress.map(lead => <LeadCard key={lead.id} lead={lead} onOpen={() => navigate('/leads/' + lead.id)} onTake={null} taking={false} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function LeadCard({ lead, onOpen, onTake, taking }) {
  const svc = SERVICE_TYPES.find(s => s.value === lead.service_type);
  const mins = getElapsed(lead.created_at);
  let borderColor = '#16a34a';
  if (mins >= 15) borderColor = '#dc2626';
  else if (mins >= 5) borderColor = '#d97706';

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--card-bg, #1e2a3a)',
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{lead.lead_number}</span>
          <TimerBadge createdAt={lead.created_at} />
          {lead.status === 'in_progress' && (
            <span style={{ fontSize: 12, color: 'var(--gray-400)', background: 'var(--gray-700, #374151)', padding: '2px 8px', borderRadius: 99 }}>В работе</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>{lead.client_name || lead.client_phone || '—'}</span>
          {lead.client_phone && lead.client_name && <span className="text-muted">{lead.client_phone}</span>}
          {svc && <span className="text-muted">{svc.label}</span>}
          {lead.address_from && <span className="text-muted">📍 {lead.address_from}</span>}
          {lead.price_estimate && <span style={{ color: '#16a34a', fontWeight: 700 }}>{Number(lead.price_estimate).toLocaleString('ru-RU')} ₽</span>}
        </div>
      </div>
      {onTake && (
        <button
          className="btn btn-primary btn-sm"
          onClick={onTake}
          disabled={taking}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {taking ? '...' : 'Взять'}
        </button>
      )}
      <span style={{ color: 'var(--gray-400)', fontSize: 18, flexShrink: 0 }}>→</span>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';
import { STATUSES } from '../utils/constants.js';

const PIPELINE_STAGES = [
  'new', 'in_progress', 'taken',
  'transferred_mfl', 'transferred_b2b',
  'b2b_negotiations', 'b2b_approved',
];

export default function PipelinePage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/api/leads?limit=200&status=all').then(r => setLeads(r.data.leads || r.data || [])).catch(() => setLeads([]));
  }, []);

  const byStatus = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s);
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <h2>Воронка продаж</h2>
      </div>
      <div className="page-body">
        <div className="pipeline">
          {PIPELINE_STAGES.map(stage => {
            const st = STATUSES[stage];
            if (!st) return null;
            const stageleads = byStatus[stage] || [];
            const total = stageleads.reduce((s, l) => s + (parseFloat(l.price_estimate) || 0), 0);
            return (
              <div className="pipeline-col" key={stage}>
                <div className="pipeline-col-header">
                  <span style={{ color: st.color }}>{st.label}</span>
                  <span>{stageleads.length}</span>
                </div>
                {total > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 8 }}>
                    {total.toLocaleString('ru-RU')} ₽
                  </div>
                )}
                {stageleads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--gray-400)' }}>—</div>
                )}
                {stageleads.map(lead => (
                  <div className="pipeline-card" key={lead.id} onClick={() => navigate('/leads/' + lead.id)}>
                    <div className="pipeline-card-num">{lead.lead_number}</div>
                    <div className="pipeline-card-name">{lead.client_name || lead.client_company || '—'}</div>
                    <div className="pipeline-card-phone">{lead.client_phone}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                      {lead.client_type === 'legal' ? 'Юрлицо' : 'Физлицо'}
                    </div>
                    {lead.price_estimate && (
                      <div className="pipeline-card-price">{Number(lead.price_estimate).toLocaleString('ru-RU')} ₽</div>
                    )}
                    {lead.assigned_name && (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{lead.assigned_name}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

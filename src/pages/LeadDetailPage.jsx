import AddressInput from '../components/AddressInput';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';
import {
  STATUSES, SERVICE_TYPES, TASK_TYPES, CLIENT_TYPES, SOURCES,
  DISPATCHER_STATUSES_POSITIVE, DISPATCHER_STATUSES_NEGATIVE, B2B_STATUSES
} from '../utils/constants.js';

const fmtDate = d => d ? new Date(d).toLocaleDateString('ru-RU') : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const load = async () => {
    const [leadRes, usersRes] = await Promise.all([
      api.get('/api/leads/' + id),
      api.get('/api/users'),
    ]);
    setData(leadRes.data);
    setForm(leadRes.data.lead);
    setUsers(usersRes.data);
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Загрузка...</div>;

  const { lead, tasks, history } = data;
  const st = STATUSES[lead.status];
  const svc = SERVICE_TYPES.find(s => s.value === lead.service_type);
  const clientTypeLabel = CLIENT_TYPES.find(c => c.value === lead.client_type)?.label || '—';

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const saveForm = async () => {
    setSaving(true);
    try {
      await api.patch('/api/leads/' + id, form);
      await load();
      setEditing(false);
    } catch (err) {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    await api.post('/api/leads/' + id + '/comment', { comment });
    setComment('');
    await load();
  };

  const completeTask = async (taskId) => {
    await api.patch('/api/tasks/' + taskId + '/done');
    await load();
  };

  const HISTORY_ICONS = { created: '🆕', status_change: '🔄', comment: '💬', field_update: '✏️', task_created: '📌', task_done: '✅' };

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>← Назад</button>
          <h2>{lead.lead_number}</h2>
          <span className="badge" style={{ color: st?.color, background: st?.bg, fontSize: 13 }}>{st?.label || lead.status}</span>
          <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', fontSize: 12 }}>{clientTypeLabel}</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowStatusModal(true)}>Изменить статус</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTaskModal(true)}>+ Задача</button>
          {editing
            ? <>
                <button className="btn btn-primary btn-sm" onClick={saveForm} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setForm(lead); }}>Отмена</button>
              </>
            : <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Редактировать</button>
          }
        </div>
      </div>
      <div className="page-body">
        <div className="lead-detail">
          <div>
            {/* Contact */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">Контакт</div>
              <div className="card-body">
                <div className="detail-grid">
                  <Field label="Имя" editing={editing} value={form.client_name} onChange={v => set('client_name', v)} placeholder="Иванов Иван" />
                  <Field label="Телефон" editing={editing} value={form.client_phone} onChange={v => set('client_phone', v)} mono />
                  {(lead.client_type === 'legal' || form.client_company) && (
                    <Field label="Компания" editing={editing} value={form.client_company} onChange={v => set('client_company', v)} />
                  )}
                  <div className="detail-field">
                    <div className="df-label">Тип клиента</div>
                    <div className="df-value">
                      {editing ? (
                        <select className="form-control" value={form.client_type || 'individual'} onChange={e => set('client_type', e.target.value)}>
                          {CLIENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                        </select>
                      ) : clientTypeLabel}
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="df-label">Источник</div>
                    <div className="df-value">{SOURCES[lead.source] || lead.source}</div>
                  </div>
                </div>
                {lead.beeline_call_id && (
                  <div className="mt-3" style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, fontSize: 12, color: 'var(--gray-600)' }}>
                    📞 Звонок Билайн: {lead.beeline_call_id}
                    {lead.beeline_record_url && <> · <a href={lead.beeline_record_url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>Прослушать запись</a></>}
                  </div>
                )}
              </div>
            </div>

            {/* Brief */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">Бриф заказа</div>
              <div className="card-body">
                <div className="detail-section">
                  <h3>Общее</h3>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label">Тип услуги</label>
                      {editing
                        ? <select className="form-control" value={form.service_type || ''} onChange={e => set('service_type', e.target.value)}>
                            <option value="">— не выбрано —</option>
                            {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        : <div className="df-value">{svc?.label || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label className="form-label">Дата работ</label>
                      {editing
                        ? <input type="date" className="form-control" value={form.move_date?.slice(0,10) || ''} onChange={e => set('move_date', e.target.value)} />
                        : <div className="df-value">{fmtDate(lead.move_date)}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label className="form-label">Время</label>
                      {editing
                        ? <input type="time" className="form-control" value={form.move_time_from || ''} onChange={e => set('move_time_from', e.target.value)} />
                        : <div className="df-value">{lead.move_time_from || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label">Грузчиков</label>
                      {editing
                        ? <input type="number" className="form-control" value={form.workers_count || ''} onChange={e => set('workers_count', e.target.value)} />
                        : <div className="df-value">{lead.workers_count || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label className="form-label">Часов (ориент.)</label>
                      {editing
                        ? <input type="number" className="form-control" value={form.hours_estimate || ''} onChange={e => set('hours_estimate', e.target.value)} />
                        : <div className="df-value">{lead.hours_estimate || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Откуда</h3>
                  <div className="form-group">
                    <label className="form-label">Адрес</label>
                    {editing
                      ? <AddressInput value={form.address_from} onChange={v => set('address_from', v)} />
                      : <div className="df-value">{lead.address_from || <span className="df-value empty">—</span>}</div>
                    }
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Этаж</label>
                      {editing
                        ? <input type="number" className="form-control" value={form.address_from_floor || ''} onChange={e => set('address_from_floor', e.target.value)} />
                        : <div className="df-value">{lead.address_from_floor || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label className="form-label">Лифт</label>
                      {editing
                        ? <select className="form-control" value={form.address_from_elevator ?? ''} onChange={e => set('address_from_elevator', e.target.value === 'true')}>
                            <option value="">—</option>
                            <option value="true">Есть</option>
                            <option value="false">Нет</option>
                          </select>
                        : <div className="df-value">{lead.address_from_elevator === true ? '✓ Есть' : lead.address_from_elevator === false ? '✗ Нет' : <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Куда</h3>
                  <div className="form-group">
                    <label className="form-label">Адрес</label>
                    {editing
                      ? <AddressInput value={form.address_to} onChange={v => set('address_to', v)} />
                      : <div className="df-value">{lead.address_to || <span className="df-value empty">—</span>}</div>
                    }
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Этаж</label>
                      {editing
                        ? <input type="number" className="form-control" value={form.address_to_floor || ''} onChange={e => set('address_to_floor', e.target.value)} />
                        : <div className="df-value">{lead.address_to_floor || <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label className="form-label">Лифт</label>
                      {editing
                        ? <select className="form-control" value={form.address_to_elevator ?? ''} onChange={e => set('address_to_elevator', e.target.value === 'true')}>
                            <option value="">—</option>
                            <option value="true">Есть</option>
                            <option value="false">Нет</option>
                          </select>
                        : <div className="df-value">{lead.address_to_elevator === true ? '✓ Есть' : lead.address_to_elevator === false ? '✗ Нет' : <span className="df-value empty">—</span>}</div>
                      }
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Дополнительно</h3>
                  <div className="form-row">
                    {[['has_packing','📦 Упаковка'],['has_disassembly','🔧 Разборка/Сборка'],['has_rigging','⚙️ Такелаж']].map(([field, label]) => (
                      <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                        <input type="checkbox" checked={form[field] || false} onChange={e => set(field, e.target.checked)} disabled={!editing} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Стоимость (руб.)</label>
                    {editing
                      ? <input type="number" className="form-control" value={form.price_estimate || ''} onChange={e => set('price_estimate', e.target.value)} />
                      : <div className="df-value" style={{ fontSize: 18, color: lead.price_estimate ? 'var(--brand)' : undefined }}>
                          {lead.price_estimate ? Number(lead.price_estimate).toLocaleString('ru-RU') + ' ₽' : <span className="df-value empty">—</span>}
                        </div>
                    }
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ответственный</label>
                    {editing
                      ? <select className="form-control" value={form.assigned_to || ''} onChange={e => set('assigned_to', e.target.value)}>
                          <option value="">— не назначен —</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      : <div className="df-value">{lead.assigned_name || <span className="df-value empty">—</span>}</div>
                    }
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Комментарий по заказу</label>
                  {editing
                    ? <textarea className="form-control" rows={3} value={form.comment || ''} onChange={e => set('comment', e.target.value)} />
                    : <div style={{ padding: '8px 0', fontSize: 14, color: lead.comment ? 'var(--gray-800)' : 'var(--gray-400)', whiteSpace: 'pre-wrap' }}>
                        {lead.comment || '—'}
                      </div>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header flex justify-between items-center">
                Задачи
                <button className="btn btn-sm btn-ghost" onClick={() => setShowTaskModal(true)}>+ Добавить</button>
              </div>
              <div className="card-body">
                {tasks.filter(t => t.status === 'pending').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)', fontSize: 13 }}>Задач нет</div>
                ) : (
                  tasks.filter(t => t.status === 'pending').map(task => {
                    const due = task.due_date ? new Date(task.due_date) : null;
                    const isOverdue = due && due < new Date();
                    return (
                      <div className="task-item" key={task.id}>
                        <input type="checkbox" className="task-check" onChange={() => completeTask(task.id)} />
                        <div>
                          <div className="task-title">{task.title}</div>
                          <div className="text-muted">{task.assigned_name}</div>
                          {due && <div className={'task-due' + (isOverdue ? ' overdue' : '')}>{fmtDateTime(due)}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
                {tasks.filter(t => t.status === 'done').length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Выполнено</div>
                    {tasks.filter(t => t.status === 'done').map(task => (
                      <div key={task.id} style={{ fontSize: 12, color: 'var(--gray-400)', padding: '4px 0', textDecoration: 'line-through' }}>{task.title}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">Добавить комментарий</div>
              <div className="card-body">
                <textarea
                  className="form-control" rows={3} value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Что обсудили с клиентом..."
                  onKeyDown={e => e.key === 'Enter' && e.metaKey && sendComment()}
                />
                <button className="btn btn-primary btn-sm mt-2" onClick={sendComment} disabled={!comment.trim()}>Сохранить</button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">История</div>
              <div className="card-body">
                <div className="timeline">
                  {history.map(h => (
                    <div className="timeline-item" key={h.id}>
                      <div className="timeline-dot">{HISTORY_ICONS[h.action] || '●'}</div>
                      <div className="timeline-content">
                        <div className="timeline-text">
                          {h.action === 'status_change'
                            ? <>Статус: <strong>{STATUSES[h.old_value]?.label || h.old_value}</strong> → <strong>{STATUSES[h.new_value]?.label || h.new_value}</strong></>
                            : h.comment
                          }
                        </div>
                        <div className="timeline-meta">
                          {h.user_name && <>{h.user_name} · </>}
                          {fmtDateTime(h.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && <TaskModal leadId={id} users={users} onClose={() => setShowTaskModal(false)} onCreated={() => { setShowTaskModal(false); load(); }} />}
      {showStatusModal && (
        <StatusModal
          currentStatus={lead.status}
          clientType={lead.client_type}
          onClose={() => setShowStatusModal(false)}
          onChanged={async (status, extra) => {
            await api.patch('/api/leads/' + id + '/status', { status, ...extra });
            setShowStatusModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function Field({ label, value, editing, onChange, placeholder, mono }) {
  return (
    <div className="detail-field">
      <div className="df-label">{label}</div>
      {editing
        ? <input className="form-control" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={mono ? { fontFamily: 'monospace' } : {}} />
        : <div className={'df-value' + (!value ? ' empty' : '') + (mono ? ' font-mono' : '')}>{value || '—'}</div>
      }
    </div>
  );
}

function TaskModal({ leadId, users, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', type: 'call', due_date: '', assigned_to: '' });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const submit = async () => {
    if (!form.title) return;
    await api.post('/api/tasks', { lead_id: leadId, ...form });
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Новая задача</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Тип</label>
            <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
              {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Задача *</label>
            <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Перезвонить и уточнить дату..." autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Срок</label>
              <input type="datetime-local" className="form-control" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Назначить</label>
              <select className="form-control" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
                <option value="">Себе</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit} disabled={!form.title}>Создать</button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ currentStatus, clientType, onClose, onChanged }) {
  const [status, setStatus] = useState(currentStatus);
  const [b2bRejectReason, setB2bRejectReason] = useState('');
  const [postponedUntil, setPostponedUntil] = useState('');

  const StatusGroup = ({ title, statuses }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Object.entries(statuses).map(([k, v]) => (
          <button
            key={k}
            className="btn btn-sm"
            style={{
              background: status === k ? v.color : v.bg,
              color: status === k ? '#fff' : v.color,
              border: '1px solid ' + v.color
            }}
            onClick={() => setStatus(k)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Изменить статус</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <StatusGroup title="✅ Положительные" statuses={DISPATCHER_STATUSES_POSITIVE} />
          <StatusGroup title="❌ Отрицательные" statuses={DISPATCHER_STATUSES_NEGATIVE} />
          {clientType === 'legal' && (
            <StatusGroup title="🏢 B2B" statuses={B2B_STATUSES} />
          )}
          {status === 'postponed' && (
            <div className="form-group">
              <label className="form-label">Отложить до</label>
              <input type="date" className="form-control" value={postponedUntil} onChange={e => setPostponedUntil(e.target.value)} />
            </div>
          )}
          {status === 'b2b_rejected' && (
            <div className="form-group">
              <label className="form-label">Причина отказа</label>
              <textarea className="form-control" rows={2} value={b2bRejectReason} onChange={e => setB2bRejectReason(e.target.value)} placeholder="Причина..." />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={() => onChanged(status, { b2b_reject_reason: b2bRejectReason, postponed_until: postponedUntil })}>
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}

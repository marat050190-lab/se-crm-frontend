import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';

const STATUS_LABELS = { new:'Новая', invoice:'Выставить счёт', pay_executor:'Оплата исполнителю', paid:'Оплачено', done:'Завершена', cancelled:'Отменена' };
const STATUS_COLORS = { new:'#dbeafe', invoice:'#fef3c7', pay_executor:'#fed7aa', paid:'#d1fae5', done:'#e5e7eb', cancelled:'#fee2e2' };

export default function ClientDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/api/clients/' + id).then(r => {
      setClient(r.data.client);
      setForm(r.data.client);
      setOrders(r.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function save() {
    await api.put('/api/clients/' + id, form);
    setClient(form);
    setEditing(false);
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.revenue || 0), 0);
  const totalProfit = orders.reduce((s, o) => s + Number(o.net_profit || 0), 0);

  const inp = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' };
  const lbl = { fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' };

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (!client) return <div style={{ padding: 24 }}>Клиент не найден</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={() => nav('/clients')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Назад к клиентам
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{client.name}</h1>
          {client.company_name && client.company_name !== client.name && (
            <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{client.company_name}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button onClick={save} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Сохранить</button>
              <button onClick={() => { setEditing(false); setForm(client); }} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 500 }}>✏️ Редактировать</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Левая колонка — данные клиента */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Контактные данные</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={lbl}>Название</div>
                {editing ? <input value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={inp} /> : <div style={{ fontSize: 14 }}>{client.name || '—'}</div>}
              </div>
              <div>
                <div style={lbl}>Компания</div>
                {editing ? <input value={form.company_name || ''} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} style={inp} /> : <div style={{ fontSize: 14 }}>{client.company_name || '—'}</div>}
              </div>
              <div>
                <div style={lbl}>Телефон</div>
                {editing ? <input value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={inp} /> : <div style={{ fontSize: 14 }}>{client.phone || '—'}</div>}
              </div>
              <div>
                <div style={lbl}>ИНН</div>
                {editing ? <input value={form.inn || ''} onChange={e => setForm(f => ({...f, inn: e.target.value}))} style={inp} /> : <div style={{ fontSize: 14 }}>{client.inn || '—'}</div>}
              </div>
              <div>
                <div style={lbl}>Тип</div>
                {editing ? (
                  <select value={form.client_type || 'legal'} onChange={e => setForm(f => ({...f, client_type: e.target.value}))} style={inp}>
                    <option value="legal">Юрлицо</option>
                    <option value="individual">Физлицо</option>
                  </select>
                ) : (
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: client.client_type === 'legal' ? '#EFF6FF' : '#F0FDF4', color: client.client_type === 'legal' ? '#2563EB' : '#16A34A' }}>
                    {client.client_type === 'legal' ? 'Юрлицо' : 'Физлицо'}
                  </span>
                )}
              </div>
              <div>
                <div style={lbl}>Комментарий</div>
                {editing ? <textarea value={form.comment || ''} onChange={e => setForm(f => ({...f, comment: e.target.value}))} style={{ ...inp, resize: 'vertical' }} rows={3} /> : <div style={{ fontSize: 14, color: client.comment ? '#111' : '#9ca3af' }}>{client.comment || '—'}</div>}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Статистика</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Всего заявок</span>
                <span style={{ fontWeight: 600 }}>{orders.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Выручка</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{totalRevenue.toLocaleString('ru')} ₽</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Чистая прибыль</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{totalProfit.toLocaleString('ru')} ₽</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Средний чек</span>
                <span style={{ fontWeight: 600 }}>{orders.length ? Math.round(totalRevenue / orders.length).toLocaleString('ru') : 0} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка — заявки */}
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15 }}>
              История заявок ({orders.length})
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Заявок пока нет</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Дата', 'Услуга', 'Юрлицо', 'Выручка', 'Прибыль', 'Статус'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{o.work_date ? new Date(o.work_date).toLocaleDateString('ru') : '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.service_type || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{o.legal_entity === 'ooo' ? 'ООО СЭ' : 'ИП'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{Number(o.revenue || 0).toLocaleString('ru')} ₽</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: Number(o.net_profit) >= 0 ? '#059669' : '#dc2626' }}>{Number(o.net_profit || 0).toLocaleString('ru')} ₽</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, background: STATUS_COLORS[o.status] || '#e5e7eb' }}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

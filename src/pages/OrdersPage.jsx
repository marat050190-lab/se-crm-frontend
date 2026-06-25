import { useEffect, useState } from 'react';
import api from '../utils/api.jsx';
import FileAttachments from '../components/FileAttachments';

const SERVICE_TYPES = ['Грузчики','Переезд квартирный','Переезд офисный','Такелажные работы','Вывоз мусора','Аутсорсинг','Разнорабочие','Грузоперевозка','Спецтехника','Иное'];
const SCHEMES = [
  { v: 'nds_ip', l: 'НДС → ИП/СМЗ/НАЛ' },
  { v: 'nds_nds', l: 'НДС → НДС' },
  { v: 'ip_nal', l: 'ИП → НАЛ' },
  { v: 'ip_ip', l: 'ИП → ИП' },
];
const STATUS_LABELS = {
  new: 'Новая', invoice: 'Выставить счёт', pay_executor: 'Оплата исполнителю',
  paid: 'Оплачено', done: 'Завершена', cancelled: 'Отменена'
};
const STATUS_FLOW = ['new','invoice','pay_executor','paid','done'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filesOrder, setFilesOrder] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const empty = { client_id: '', legal_entity: 'ip', service_type: 'Грузчики', work_date: '', address: '', client_rate: '', executor_rate: '', units: 1, calc_scheme: 'ip_nal', payment_method: 'naimix', comment: '' };
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState(null);

  const load = () => {
    setLoading(true);
    const q = statusFilter ? { status: statusFilter } : {};
    api.get('/api/orders', { params: q }).then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [statusFilter]);
  useEffect(() => { api.get('/api/clients').then(r => setClients(r.data)).catch(() => {}); }, []);

  // живой пересчёт прибыли
  useEffect(() => {
    if (!form.client_rate || !form.executor_rate) { setPreview(null); return; }
    const t = setTimeout(() => {
      api.post('/api/orders/calc', form).then(r => setPreview(r.data)).catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(t);
  }, [form.client_rate, form.executor_rate, form.units, form.calc_scheme]);

  const save = async () => {
    if (!form.client_id) return alert('Выберите клиента');
    if (!form.client_rate || !form.executor_rate) return alert('Укажите ставки');
    await api.post('/api/orders', form);
    setShowForm(false); setForm(empty); setPreview(null); load();
  };

  const changeStatus = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Заявки КС</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>{showForm ? 'Отмена' : '+ Новая заявка'}</button>
      </div>

      {showForm && (
        <div style={card}>
          <div style={formGrid}>
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} style={input}>
              <option value="">— клиент —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
            </select>
            <select value={form.legal_entity} onChange={e => setForm({ ...form, legal_entity: e.target.value })} style={input}>
              <option value="ip">ИП Лукманов</option>
              <option value="ooo">ООО СЭ</option>
            </select>
            <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} style={input}>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={form.work_date} onChange={e => setForm({ ...form, work_date: e.target.value })} style={input} />
            <input placeholder="Адрес" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={input} />
            <select value={form.calc_scheme} onChange={e => setForm({ ...form, calc_scheme: e.target.value })} style={input}>
              {SCHEMES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <input type="number" placeholder="Ставка клиенту" value={form.client_rate} onChange={e => setForm({ ...form, client_rate: e.target.value })} style={input} />
            <input type="number" placeholder="Оплата исполнителю" value={form.executor_rate} onChange={e => setForm({ ...form, executor_rate: e.target.value })} style={input} />
            <input type="number" placeholder="Кол-во (часы/смены)" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} style={input} />
            <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} style={input}>
              <option value="naimix">Наймикс</option>
              <option value="card">На карту</option>
              <option value="cash">Наличные</option>
            </select>
            <input placeholder="Комментарий" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={input} />
          </div>

          {preview && (
            <div style={previewBox}>
              <div>Выручка: <b>{preview.revenue.toLocaleString('ru')} ₽</b></div>
              <div>Расход на исполнителя: <b>{preview.executor_cost.toLocaleString('ru')} ₽</b></div>
              <div style={{ color: preview.net_profit >= 0 ? '#059669' : '#dc2626' }}>
                Чистая прибыль: <b>{preview.net_profit.toLocaleString('ru')} ₽</b>
                {preview.revenue > 0 && <span style={{ color: '#6b7280', marginLeft: 8 }}>({Math.round(preview.net_profit / preview.revenue * 100)}%)</span>}
              </div>
            </div>
          )}

          <button onClick={save} style={{ ...btnPrimary, marginTop: 12 }}>Создать заявку</button>
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <FilterBtn active={statusFilter === ''} onClick={() => setStatusFilter('')}>Все</FilterBtn>
        {STATUS_FLOW.map(s => <FilterBtn key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{STATUS_LABELS[s]}</FilterBtn>)}
      </div>

      {loading ? <p>Загрузка...</p> : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Клиент</th><th style={th}>Услуга</th><th style={th}>Юрлицо</th>
              <th style={th}>Выручка</th><th style={th}>Прибыль</th><th style={th}>Статус</th><th style={th}>Действие</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={td}>{o.client_name || '—'}</td>
                <td style={td}>{o.service_type}</td>
                <td style={td}>{o.legal_entity === 'ooo' ? 'ООО СЭ' : 'ИП'}</td>
                <td style={td}>{Number(o.revenue).toLocaleString('ru')} ₽</td>
                <td style={{ ...td, color: o.net_profit >= 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>{Number(o.net_profit).toLocaleString('ru')} ₽</td>
                <td style={td}><span style={badge(o.status)}>{STATUS_LABELS[o.status] || o.status}</span></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} style={{ ...input, padding: '6px 8px', fontSize: 13 }}>
                      {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <button type="button" onClick={() => setFilesOrder(o)} title="Документы" style={{ ...input, padding: '6px 10px', cursor: 'pointer', background: '#f0f9ff', borderColor: '#2563eb' }}>📎</button>
                  </div>
                </td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#888' }}>Заявок пока нет</td></tr>}
          </tbody>
        </table>
      )}

      {filesOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setFilesOrder(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 480, maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Документы заявки</h2>
              <button onClick={() => setFilesOrder(null)} style={{ ...input, cursor: 'pointer', background: '#fff' }}>Закрыть</button>
            </div>
            <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 14 }}>{filesOrder.client_name || 'Заявка'} · {filesOrder.service_type}</div>
            <FileAttachments entityType="order" entityId={filesOrder.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid ' + (active ? '#2563eb' : '#d1d5db'), background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13 }}>{children}</button>;
}

const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14 };
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 };
const input = { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 };
const previewBox = { marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8, display: 'flex', gap: 24, fontSize: 14 };
const table = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' };
const th = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' };
const td = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };
function badge(status) {
  const colors = { new: '#dbeafe', invoice: '#fef3c7', pay_executor: '#fed7aa', paid: '#d1fae5', done: '#e5e7eb', cancelled: '#fee2e2' };
  return { padding: '4px 10px', borderRadius: 12, fontSize: 12, background: colors[status] || '#e5e7eb' };
}

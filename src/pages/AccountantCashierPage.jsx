import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

const PAYMENT_LABELS = { naimix:'Наймикс', card:'На карту', cash:'Наличные', ip:'ИП (р/сч)' };
const TYPE_LABELS = { self_employed:'Самозанятый', individual:'Физлицо', ip:'ИП' };

export default function AccountantCashierPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/api/orders', { params: { status: 'pay_executor' } });
      setOrders(r.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markPaid(id) {
    if (!window.confirm('Отметить выплату исполнителю как выполненную?')) return;
    await api.put('/api/orders/' + id + '/status', { status: 'done' });
    load();
  }

  function paymentBadge(method) {
    const colors = { naimix:'#EFF6FF', card:'#F0FDF4', cash:'#FFFBEB', ip:'#F5F3FF' };
    const text = { naimix:'#2563EB', card:'#16A34A', cash:'#D97706', ip:'#7C3AED' };
    return { padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:600, background: colors[method]||'#f3f4f6', color: text[method]||'#374151' };
  }

  return (
    <div style={{ padding:24, maxWidth:1100 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700 }}>Выплаты исполнителям</h1>
          <p style={{ margin:'4px 0 0', color:'#6b7280', fontSize:14 }}>Заявки со статусом «Оплата исполнителю»</p>
        </div>
        <button onClick={load} style={{ padding:'8px 16px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:14 }}>Обновить</button>
      </div>

      {loading ? <p>Загрузка...</p> : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>
          <div style={{ fontSize:40, marginBottom:12, color:"var(--primary)", opacity:0.5 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div style={{ fontSize:16 }}>Нет заявок для выплаты</div>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                {['№','Клиент','Услуга','Исполнитель','Тип','Сумма выплаты','Способ','Менеджер','Действие'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#6b7280', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'14px 16px', color:'#6b7280', fontSize:13 }}>#{o.id}</td>
                  <td style={{ padding:'14px 16px', fontWeight:600 }}>{o.client_name || '—'}</td>
                  <td style={{ padding:'14px 16px', color:'#374151' }}>{o.service_type}</td>
                  <td style={{ padding:'14px 16px', fontWeight:600, color: o.contractor_name ? '#111827' : '#9ca3af' }}>{o.contractor_name || 'Не назначен'}</td>
                  <td style={{ padding:'14px 16px', color:'#6b7280', fontSize:13 }}>
                    {o.contractor_type ? (TYPE_LABELS[o.contractor_type] || o.contractor_type) : '—'}
                  </td>
                  <td style={{ padding:'14px 16px', fontWeight:600, color:'#DC2626' }}>{Number(o.executor_cost).toLocaleString('ru')} ₽</td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={paymentBadge(o.payment_method)}>{PAYMENT_LABELS[o.payment_method] || o.payment_method}</span>
                  </td>
                  <td style={{ padding:'14px 16px', color:'#6b7280' }}>{o.manager_name || '—'}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <button onClick={() => markPaid(o.id)}
                      style={{ padding:'8px 16px', background:'#059669', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                      ✓ Выплачено
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

const STATUS_LABELS = { new:'Новая', invoice:'Выставить счёт', pay_executor:'Оплата исполнителю', paid:'Оплачено', done:'Завершена', cancelled:'Отменена' };

export default function AccountantPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/api/orders', { params: { status: 'invoice' } });
      setOrders(r.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markPaid(id) {
    if (!window.confirm('Отметить счёт как выставленный и перевести в "Оплачено"?')) return;
    await api.put('/api/orders/' + id + '/status', { status: 'paid' });
    load();
  }

  const inp = { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 };

  return (
    <div style={{ padding:24, maxWidth:1100 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700 }}>Выставление счетов</h1>
          <p style={{ margin:'4px 0 0', color:'#6b7280', fontSize:14 }}>Заявки со статусом «Выставить счёт»</p>
        </div>
        <button onClick={load} style={{ padding:'8px 16px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:14 }}>Обновить</button>
      </div>

      {loading ? <p>Загрузка...</p> : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>
          <div style={{ fontSize:40, marginBottom:12, color:"var(--primary)", opacity:0.5 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div style={{ fontSize:16 }}>Нет заявок для выставления счёта</div>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                {['№','Клиент','Услуга','Юрлицо','Дата','Выручка','Менеджер','Действие'].map(h => (
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
                  <td style={{ padding:'14px 16px', color:'#374151' }}>{o.legal_entity === 'ooo' ? 'ООО СЭ' : 'ИП Лукманов'}</td>
                  <td style={{ padding:'14px 16px', color:'#6b7280' }}>{o.work_date ? new Date(o.work_date).toLocaleDateString('ru') : '—'}</td>
                  <td style={{ padding:'14px 16px', fontWeight:600, color:'#059669' }}>{Number(o.revenue).toLocaleString('ru')} ₽</td>
                  <td style={{ padding:'14px 16px', color:'#6b7280' }}>{o.manager_name || '—'}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <button onClick={() => markPaid(o.id)}
                      style={{ padding:'8px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                      ✓ Счёт выставлен
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

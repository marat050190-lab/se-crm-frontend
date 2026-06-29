import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

const PAYMENT_LABELS = { naimix:'Наймикс', card:'На карту', cash:'Наличные', ip:'ИП (р/сч)' };
const TYPE_LABELS = { self_employed:'Самозанятый', individual:'Физлицо', ip:'ИП' };
const STATUS_LABELS = { pending:'Ожидает', done:'Выполнено', error:'Ошибка' };
const STATUS_COLORS = { pending:'#D97706', done:'#059669', error:'#DC2626' };

export default function AccountantCashierPage() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contractor_id:'', amount:'', legal_entity:'OOO', comment:'' });

  async function load() {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/api/orders', { params: { status: 'pay_executor' } }),
        api.get('/api/payouts'),
        api.get('/api/contractors')
      ]);
      setOrders(r1.data);
      setPayouts(r2.data);
      setContractors(r3.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markPaid(id) {
    if (!window.confirm('Отметить выплату исполнителю как выполненную?')) return;
    await api.put('/api/orders/' + id + '/status', { status: 'done' });
    load();
  }

  async function createPayout() {
    if (!form.contractor_id || !form.amount) return alert('Заполните исполнителя и сумму');
    try {
      await api.post('/api/payouts', form);
      setShowModal(false);
      setForm({ contractor_id:'', amount:'', legal_entity:'OOO', comment:'' });
      load();
    } catch(e) { alert('Ошибка: ' + e.message); }
  }

  async function executePayout(id) {
    if (!window.confirm('Выполнить выплату через Т-Банк?')) return;
    try {
      await api.post('/api/payouts/' + id + '/execute');
      alert('Выплата отправлена в Т-Банк!');
      load();
    } catch(e) { alert('Ошибка: ' + (e.response?.data?.error || e.message)); }
  }

  async function markPayoutDone(id) {
    if (!window.confirm('Отметить выплату как выполненную?')) return;
    await api.patch('/api/payouts/' + id + '/status', { status: 'done' });
    load();
  }

  function paymentBadge(method) {
    const colors = { naimix:'#EFF6FF', card:'#F0FDF4', cash:'#FFFBEB', ip:'#F5F3FF' };
    const text = { naimix:'#2563EB', card:'#16A34A', cash:'#D97706', ip:'#7C3AED' };
    return { padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:600, background: colors[method]||'#f3f4f6', color: text[method]||'#374151' };
  }

  const tabStyle = (t) => ({
    padding:'10px 24px', border:'none', borderBottom: tab===t ? '3px solid #00B14F' : '3px solid transparent',
    background:'none', cursor:'pointer', fontWeight: tab===t ? 700 : 400, color: tab===t ? '#00B14F' : '#6b7280', fontSize:15
  });

  return (
    <div style={{ padding:24, maxWidth:1200 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700 }}>Кабинет бухгалтера-кассира</h1>
        <button onClick={load} style={{ padding:'8px 16px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:14 }}>Обновить</button>
      </div>

      <div style={{ borderBottom:'1px solid #e5e7eb', marginBottom:24, display:'flex' }}>
        <button style={tabStyle('orders')} onClick={() => setTab('orders')}>
          Очередь выплат {orders.length > 0 && <span style={{ background:'#DC2626', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:11, marginLeft:6 }}>{orders.length}</span>}
        </button>
        <button style={tabStyle('payouts')} onClick={() => setTab('payouts')}>
          История выплат {payouts.length > 0 && <span style={{ background:'#6b7280', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:11, marginLeft:6 }}>{payouts.length}</span>}
        </button>
      </div>

      {loading ? <p>Загрузка...</p> : tab === 'orders' ? (
        <>
          {orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>
              <div style={{ fontSize:16 }}>Нет заявок для выплаты</div>
            </div>
          ) : (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                    {['№','Клиент','Услуга','Исполнитель','Тип','Сумма','Способ','Менеджер','Действие'].map(h => (
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
                      <td style={{ padding:'14px 16px', fontWeight:600 }}>{o.contractor_name || 'Не назначен'}</td>
                      <td style={{ padding:'14px 16px', color:'#6b7280', fontSize:13 }}>{o.contractor_type ? (TYPE_LABELS[o.contractor_type] || o.contractor_type) : '—'}</td>
                      <td style={{ padding:'14px 16px', fontWeight:600, color:'#DC2626' }}>{Number(o.executor_cost).toLocaleString('ru')} ₽</td>
                      <td style={{ padding:'14px 16px' }}><span style={paymentBadge(o.payment_method)}>{PAYMENT_LABELS[o.payment_method] || o.payment_method}</span></td>
                      <td style={{ padding:'14px 16px', color:'#6b7280' }}>{o.manager_name || '—'}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <button onClick={() => markPaid(o.id)} style={{ padding:'8px 16px', background:'#059669', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>✓ Выплачено</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button onClick={() => setShowModal(true)} style={{ padding:'10px 20px', background:'#00B14F', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>+ Создать выплату</button>
          </div>

          {payouts.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}><div style={{ fontSize:16 }}>Выплат пока нет</div></div>
          ) : (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                    {['№','Исполнитель','Тип','Сумма','Юрлицо','Банк','Телефон/Карта','Статус','Дата','Действие'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#6b7280', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                      <td style={{ padding:'14px 16px', color:'#6b7280', fontSize:13 }}>#{p.id}</td>
                      <td style={{ padding:'14px 16px', fontWeight:600 }}>{p.contractor_name || '—'}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{TYPE_LABELS[p.contractor_type] || p.contractor_type}</td>
                      <td style={{ padding:'14px 16px', fontWeight:700, color:'#DC2626' }}>{Number(p.amount).toLocaleString('ru')} ₽</td>
                      <td style={{ padding:'14px 16px', fontSize:13 }}>{p.legal_entity}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{p.bank_name || '—'}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{p.payment_phone || p.payment_card || '—'}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:600, background:'#f3f4f6', color: STATUS_COLORS[p.status] || '#374151' }}>
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('ru') : '—'}</td>
                      <td style={{ padding:'14px 16px' }}>
                        {p.status === 'pending' && (
                          <div style={{ display:'flex', gap:6 }}>
                            {(p.contractor_type === 'self_employed') && (
                              <button onClick={() => executePayout(p.id)} style={{ padding:'6px 14px', background:'#00B14F', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }}>Т-Банк</button>
                            )}
                            <button onClick={() => markPayoutDone(p.id)} style={{ padding:'6px 14px', background:'#6b7280', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }}>✓ Вручную</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, width:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin:'0 0 24px', fontSize:20, fontWeight:700 }}>Создать выплату</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Исполнитель</label>
                <select value={form.contractor_id} onChange={e => setForm({...form, contractor_id: e.target.value})}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }}>
                  <option value="">Выберите исполнителя</option>
                  {contractors.map(c => <option key={c.id} value={c.id}>{c.name} ({TYPE_LABELS[c.type] || TYPE_LABELS[c.contractor_type] || '—'})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Сумма, ₽</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  placeholder="0" style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Юрлицо</label>
                <select value={form.legal_entity} onChange={e => setForm({...form, legal_entity: e.target.value})}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14 }}>
                  <option value="OOO">ООО СЭ</option>
                  <option value="IP">ИП Лукманов</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Комментарий</label>
                <input type="text" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                  placeholder="Необязательно" style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button onClick={createPayout} style={{ flex:1, padding:'12px', background:'#00B14F', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:15 }}>Создать</button>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'12px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:15 }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

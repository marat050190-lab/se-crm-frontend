import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function CSDashboardPersonal() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/orders'),
      api.get('/api/tasks/my'),
    ]).then(([ordersRes, tasksRes]) => {
      const myOrders = ordersRes.data;
      setOrders(myOrders);
      const revenue = myOrders.reduce((s, o) => s + Number(o.revenue || 0), 0);
      const profit = myOrders.reduce((s, o) => s + Number(o.net_profit || 0), 0);
      const byStatus = {};
      myOrders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      setStats({ revenue, profit, total: myOrders.length, byStatus, tasks: tasksRes.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STATUS_LABELS = { new:'Новые', invoice:'Выставить счёт', pay_executor:'Оплата исп.', paid:'Оплачено', done:'Завершены', cancelled:'Отменены' };
  const STATUS_COLORS = { new:'#2563eb', invoice:'#d97706', pay_executor:'#ea580c', paid:'#059669', done:'#6b7280', cancelled:'#dc2626' };

  if (loading) return <div style={{ padding:24 }}>Загрузка...</div>;

  return (
    <div style={{ padding:24, maxWidth:900 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Мой дашборд</h1>
          <div style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>{new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:24 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Всего заявок</div>
          <div style={{ fontSize:32, fontWeight:700, color:'#111827' }}>{stats?.total || 0}</div>
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Выручка</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#2563eb' }}>{(stats?.revenue || 0).toLocaleString('ru')} ₽</div>
        </div>
        <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Чистая прибыль</div>
          <div style={{ fontSize:28, fontWeight:700, color: (stats?.profit || 0) >= 0 ? '#059669' : '#dc2626' }}>{(stats?.profit || 0).toLocaleString('ru')} ₽</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Заявки по статусам</div>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
              <span style={{ fontSize:13, color:'#374151' }}>{v}</span>
              <span style={{ fontSize:14, fontWeight:600, color: STATUS_COLORS[k] || '#374151' }}>{stats?.byStatus?.[k] || 0}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Мои задачи</div>
          {!stats?.tasks?.length ? (
            <div style={{ textAlign:'center', padding:20, color:'#9ca3af' }}>✅ Задач нет</div>
          ) : stats.tasks.slice(0, 5).map(t => (
            <div key={t.id} style={{ padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{t.title || t.type}</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>{t.due_date ? new Date(t.due_date).toLocaleDateString('ru') : 'Без срока'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e5e7eb', fontWeight:600 }}>Последние заявки</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f9fafb' }}>
              {['Клиент','Услуга','Дата','Выручка','Прибыль','Статус'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:12, color:'#6b7280', fontWeight:600, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map(o => (
              <tr key={o.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                <td style={{ padding:'12px 16px', fontWeight:500 }}>{o.client_name || '—'}</td>
                <td style={{ padding:'12px 16px', color:'#6b7280', fontSize:13 }}>{o.service_type}</td>
                <td style={{ padding:'12px 16px', color:'#6b7280', fontSize:13 }}>{o.work_date ? new Date(o.work_date).toLocaleDateString('ru') : '—'}</td>
                <td style={{ padding:'12px 16px', fontWeight:600 }}>{Number(o.revenue).toLocaleString('ru')} ₽</td>
                <td style={{ padding:'12px 16px', fontWeight:600, color: o.net_profit >= 0 ? '#059669' : '#dc2626' }}>{Number(o.net_profit).toLocaleString('ru')} ₽</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:12, fontSize:12, background: o.status === 'done' ? '#ECFDF5' : o.status === 'invoice' ? '#FEF3C7' : '#EFF6FF', color: o.status === 'done' ? '#059669' : o.status === 'invoice' ? '#D97706' : '#2563EB' }}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} style={{ padding:20, textAlign:'center', color:'#9ca3af' }}>Заявок пока нет</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

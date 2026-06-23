import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.jsx';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', client_type: 'individual', company_name: '', inn: '', comment: '' });
  const nav = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/api/clients').then(r => { setClients(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!form.name) return alert('Введите имя клиента');
    await api.post('/api/clients', form);
    setShowForm(false);
    setForm({ name: '', phone: '', client_type: 'individual', company_name: '', inn: '', comment: '' });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Клиенты</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
          {showForm ? 'Отмена' : '+ Новый клиент'}
        </button>
      </div>

      {showForm && (
        <div style={card}>
          <div style={formGrid}>
            <input placeholder="Имя / название*" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} />
            <input placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={input} />
            <select value={form.client_type} onChange={e => setForm({ ...form, client_type: e.target.value })} style={input}>
              <option value="individual">Физлицо</option>
              <option value="legal">Юрлицо</option>
            </select>
            <input placeholder="Компания" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} style={input} />
            <input placeholder="ИНН" value={form.inn} onChange={e => setForm({ ...form, inn: e.target.value })} style={input} />
            <input placeholder="Комментарий" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={input} />
          </div>
          <button onClick={save} style={{ ...btnPrimary, marginTop: 12 }}>Сохранить</button>
        </div>
      )}

      {loading ? <p>Загрузка...</p> : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Имя</th><th style={th}>Телефон</th><th style={th}>Тип</th>
              <th style={th}>Компания</th><th style={th}>Менеджер</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} onClick={() => nav('/clients/' + c.id)} style={{ cursor: 'pointer' }}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.phone || '—'}</td>
                <td style={td}>{c.client_type === 'legal' ? 'Юрлицо' : 'Физлицо'}</td>
                <td style={td}>{c.company_name || '—'}</td>
                <td style={td}>{c.manager_name || '—'}</td>
              </tr>
            ))}
            {!clients.length && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#888' }}>Клиентов пока нет</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14 };
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 };
const input = { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 };
const table = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' };
const th = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' };
const td = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };

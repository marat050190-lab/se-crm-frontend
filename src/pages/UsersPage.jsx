import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

const ROLE_LABELS = { admin: 'Администратор', rop: 'РОП', manager: 'Менеджер' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const load = () => api.get('/api/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    await api.patch(`/api/users/${user.id}`, { is_active: !user.is_active });
    load();
  };

  return (
    <>
      <div className="page-header">
        <h2>Сотрудники</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Добавить</button>
      </div>
      <div className="page-body">
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Телефон</th>
                <th>Добавочный Билайн</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="phone">{u.phone || '—'}</td>
                  <td className="phone">{u.beeline_extension || '—'}</td>
                  <td>
                    <span className="badge" style={{ background: u.is_active ? '#ECFDF5' : '#FEF2F2', color: u.is_active ? '#059669' : '#DC2626' }}>
                      {u.is_active ? 'Активен' : 'Отключён'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Отключить' : 'Включить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <NewUserModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />}
    </>
  );
}

function NewUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager', phone: '', beeline_extension: '' });
  const [error, setError] = useState('');
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return setError('Заполните обязательные поля');
    try {
      await api.post('/api/users', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Новый сотрудник</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ФИО *</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Роль</label>
              <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="manager">Менеджер</option>
                <option value="rop">РОП</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль *</label>
              <input type="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Добавочный Билайн</label>
              <input className="form-control" value={form.beeline_extension} onChange={e => set('beeline_extension', e.target.value)} placeholder="101" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit}>Создать</button>
        </div>
      </div>
    </div>
  );
}

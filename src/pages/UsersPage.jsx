import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { ROLES } from '../utils/constants.js';

const ROLE_COLORS = {
  super_admin: { bg: '#FEF3C7', color: '#D97706' },
  admin:       { bg: '#EFF6FF', color: '#2563EB' },
  rop:         { bg: '#F5F3FF', color: '#7C3AED' },
  cs_head:     { bg: '#ECFEFF', color: '#0891B2' },
  dispatcher:  { bg: '#F0FDF4', color: '#16A34A' },
  b2b_manager: { bg: '#FFF7ED', color: '#EA580C' },
  mfl_manager: { bg: '#FDF2F8', color: '#DB2777' },
  cs_manager:  { bg: '#F8FAFC', color: '#475569' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const load = () => api.get('/api/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    await api.patch('/api/users/' + user.id, { is_active: !user.is_active });
    load();
  };

  return (
    <>
      <div className="page-header">
        <h2>Сотрудники <span className="text-muted" style={{ fontWeight: 400, fontSize: 15 }}>({users.length})</span></h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Добавить</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Телефон</th>
                  <th>Добавочный</th>
                  <th>Telegram ID</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROLE_COLORS[u.role] || { bg: '#F3F4F6', color: '#6B7280' };
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className="badge" style={{ background: rc.bg, color: rc.color }}>
                          {ROLES[u.role] || u.role}
                        </span>
                      </td>
                      <td className="text-muted">{u.phone || '—'}</td>
                      <td className="text-muted">{u.beeline_extension || '—'}</td>
                      <td className="text-muted">{u.telegram_id || '—'}</td>
                      <td>
                        <span className="badge" style={{ background: u.is_active ? '#ECFDF5' : '#FEF2F2', color: u.is_active ? '#059669' : '#DC2626' }}>
                          {u.is_active ? 'Активен' : 'Отключён'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                            {u.is_active ? 'Откл.' : 'Вкл.'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
      {editUser && (
        <UserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); load(); }}
        />
      )}
    </>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'dispatcher',
    phone: user?.phone || '',
    beeline_extension: user?.beeline_extension || '',
    telegram_id: user?.telegram_id || '',
    rop_id: user?.rop_id || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const [rops, setRops] = useState([]);
  useEffect(() => {
    api.get('/api/users').then(r => setRops(r.data.filter(u => u.role === 'rop'))).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.name || !form.email) return setError('Заполните обязательные поля');
    if (!isEdit && !form.password) return setError('Укажите пароль');
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (isEdit) {
        await api.patch('/api/users/' + user.id, data);
      } else {
        await api.post('/api/users', data);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h3>
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
                {Object.entries(ROLES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{isEdit ? 'Новый пароль (если нужно сменить)' : 'Пароль *'}</label>
              <input type="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? 'Оставьте пустым чтобы не менять' : ''} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+79001234567" />
            </div>
            <div className="form-group">
              <label className="form-label">Добавочный Билайн</label>
              <input className="form-control" value={form.beeline_extension} onChange={e => set('beeline_extension', e.target.value)} placeholder="101" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Telegram ID (для уведомлений)</label>
            <input className="form-control" value={form.telegram_id} onChange={e => set('telegram_id', e.target.value)} placeholder="364102600" />
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
              Узнать ID: написать @userinfobot в Telegram
            </div>
          </div>
        </div>
        {['dispatcher','b2b_manager','mfl_manager'].includes(form.role) && (
          <div className="form-group">
            <label className="form-label">Руководитель (РОП)</label>
            <select className="form-control" value={form.rop_id || ''} onChange={e => set('rop_id', e.target.value || null)}>
              <option value="">— не назначен —</option>
              {rops.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

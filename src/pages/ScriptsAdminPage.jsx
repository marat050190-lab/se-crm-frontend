import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';
import { Icons } from '../utils/icons.jsx';

const CATEGORIES = [
  { key: 'relocation', label: 'Переезд' },
  { key: 'rigging', label: 'Такелаж' },
  { key: 'garbage', label: 'Вывоз мусора' },
  { key: 'objections', label: 'Возражения' },
  { key: 'regions', label: 'Регионы' },
  { key: 'b2b', label: 'B2B' },
];

export default function ScriptsAdminPage() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ category: 'relocation', title: '', content: '[]', sort_order: 0, is_active: true });

  useEffect(() => { loadScripts(); }, []);

  async function loadScripts() {
    try {
      const { data } = await api.get('/api/scripts/all');
      setScripts(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ category: 'relocation', title: '', content: '[]', sort_order: 0, is_active: true });
    setError(''); setShowForm(true);
  }

  function openEdit(script) {
    setEditingId(script.id);
    setForm({ category: script.category, title: script.title, content: JSON.stringify(script.content, null, 2), sort_order: script.sort_order, is_active: script.is_active });
    setError(''); setShowForm(true);
  }

  async function handleSave() {
    setError('');
    let parsedContent;
    try { parsedContent = JSON.parse(form.content); }
    catch { setError('Ошибка: невалидный JSON в поле "Контент"'); return; }
    setSaving(true);
    try {
      const payload = { category: form.category, title: form.title, content: parsedContent, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active };
      if (editingId) await api.put('/api/scripts/' + editingId, payload);
      else await api.post('/api/scripts', payload);
      setShowForm(false);
      await loadScripts();
    } catch (e) { setError('Ошибка сохранения'); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить этот скрипт?')) return;
    try { await api.delete('/api/scripts/' + id); await loadScripts(); }
    catch (e) { alert('Ошибка удаления'); }
  }

  async function toggleActive(script) {
    try { await api.put('/api/scripts/' + script.id, { ...script, is_active: !script.is_active }); await loadScripts(); }
    catch (e) {}
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--gray-100)', fontSize: '22px' }}>⚙️ Управление скриптами</h2>
        <button onClick={openCreate} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>+ Добавить скрипт</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--gray-900)', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '700px', border: '1px solid var(--gray-700)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--gray-100)' }}>{editingId ? 'Редактировать скрипт' : 'Новый скрипт'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-400)', marginBottom: '6px', fontWeight: '600' }}>КАТЕГОРИЯ</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: '8px', color: 'var(--gray-100)', fontSize: '14px' }}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-400)', marginBottom: '6px', fontWeight: '600' }}>ПОРЯДОК</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: '8px', color: 'var(--gray-100)', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-400)', marginBottom: '6px', fontWeight: '600' }}>НАЗВАНИЕ</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Сценарий 1: Переезд квартиры" style={{ width: '100%', padding: '10px', background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: '8px', color: 'var(--gray-100)', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-400)', marginBottom: '6px', fontWeight: '600' }}>КОНТЕНТ (JSON)</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={14} spellCheck={false} style={{ width: '100%', padding: '10px', background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: '8px', color: 'var(--gray-300)', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--gray-300)', fontSize: '14px' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                Активен (виден диспетчерам)
              </label>
            </div>
            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'var(--gray-700)', color: 'var(--gray-200)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Отмена</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: saving ? 'var(--gray-600)' : 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--gray-400)', padding: '40px', textAlign: 'center' }}>Загрузка...</div>
      ) : (
        <div>
          {CATEGORIES.map(cat => {
            const catScripts = scripts.filter(s => s.category === cat.key);
            if (catScripts.length === 0) return null;
            return (
              <div key={cat.key} style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{cat.label}</div>
                {catScripts.map(script => (
                  <div key={script.id} style={{ background: 'var(--gray-800)', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', border: '1px solid var(--gray-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: script.is_active ? 'var(--gray-100)' : 'var(--gray-500)', fontWeight: '500', fontSize: '14px' }}>{script.title}</span>
                      {!script.is_active && <span style={{ marginLeft: '10px', fontSize: '11px', color: 'var(--gray-500)', background: 'var(--gray-700)', padding: '2px 8px', borderRadius: '10px' }}>скрыт</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleActive(script)} style={{ padding: '6px 10px', background: 'var(--gray-700)', color: 'var(--gray-300)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}><span style={{display:'flex'}}>{script.is_active ? Icons.eye(14) : Icons.eyeOff(14)}</span></button>
                      <button onClick={() => openEdit(script)} style={{ padding: '6px 12px', background: 'var(--gray-700)', color: 'var(--gray-200)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Изменить</button>
                      <button onClick={() => handleDelete(script.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {scripts.length === 0 && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-500)' }}>Скриптов пока нет. Нажмите «+ Добавить скрипт»</div>}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api.jsx';

const TYPES = { self_employed: 'Самозанятый', individual: 'Физлицо', ip: 'ИП' };
const SPECS = ['грузчик', 'бригадир'];
const SKILLS_LIST = ['такелажник', 'сборщик мебели', 'упаковщик', 'есть своя машина'];

const empty = { name:'', phone:'', type:'self_employed', specialization:'грузчик', skills:[], inn:'', card_number:'', sbp_phone:'', ip_name:'', bank_account:'', bank_bik:'', is_active:true };

export default function ContractorsPage() {
  const { user } = useAuth();
  const [contractors, setContractors] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const canEdit = ['super_admin','admin','rop','cs_head','cs_manager','accountant_cashier','accountant'].includes(user?.role);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const res = await api.get('/contractors'); setContractors(res.data); } catch(e) { console.error(e); }
  }

  function openAdd() { setForm(empty); setModal('add'); }
  function openEdit(c) { setForm({ ...c, skills: c.skills || [] }); setModal('edit'); }
  function toggleSkill(sk) {
    setForm(f => ({ ...f, skills: f.skills.includes(sk) ? f.skills.filter(s => s !== sk) : [...f.skills, sk] }));
  }

  async function save() {
    if (!form.name) return alert('Введите ФИО');
    setLoading(true);
    try {
      if (modal === 'add') await api.post('/contractors', form);
      else await api.put('/contractors/' + form.id, form);
      await load();
      setModal(null);
    } catch(e) { alert('Ошибка: ' + e.message); }
    setLoading(false);
  }

  const filtered = contractors.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone||'').includes(search);
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const inp = { width:'100%', padding:'9px 12px', border:'1px solid var(--gray-200)', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box' };
  const lbl = { fontSize:'13px', fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:'6px' };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:700, color:'var(--gray-900)' }}>Исполнители</h1>
        {canEdit && <button onClick={openAdd} style={{ background:'var(--primary)', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', cursor:'pointer', fontWeight:600 }}>+ Добавить</button>}
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или телефону..."
          style={{ flex:1, padding:'10px 14px', border:'1px solid var(--gray-200)', borderRadius:'8px', fontSize:'14px' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding:'10px 14px', border:'1px solid var(--gray-200)', borderRadius:'8px', fontSize:'14px' }}>
          <option value="all">Все типы</option>
          {Object.entries(TYPES).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid var(--gray-200)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--gray-50)', borderBottom:'1px solid var(--gray-200)' }}>
              {['ФИО','Телефон','Тип','Специализация','Навыки','Статус',''].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'var(--gray-400)' }}>Исполнители не найдены</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom:'1px solid var(--gray-100)' }}>
                <td style={{ padding:'14px 16px', fontWeight:600, color:'var(--gray-900)' }}>{c.name}</td>
                <td style={{ padding:'14px 16px', color:'var(--gray-600)' }}>{c.phone || '—'}</td>
                <td style={{ padding:'14px 16px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
                    background: c.type==='self_employed' ? '#EFF6FF' : c.type==='ip' ? '#F0FDF4' : '#FFF7ED',
                    color: c.type==='self_employed' ? '#2563EB' : c.type==='ip' ? '#16A34A' : '#EA580C' }}>
                    {TYPES[c.type]}
                  </span>
                </td>
                <td style={{ padding:'14px 16px', color:'var(--gray-600)', textTransform:'capitalize' }}>{c.specialization || '—'}</td>
                <td style={{ padding:'14px 16px' }}>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    {(c.skills||[]).map(sk => (
                      <span key={sk} style={{ padding:'2px 8px', background:'var(--gray-100)', borderRadius:'12px', fontSize:'12px', color:'var(--gray-600)' }}>{sk}</span>
                    ))}
                    {!(c.skills||[]).length && <span style={{ color:'var(--gray-400)' }}>—</span>}
                  </div>
                </td>
                <td style={{ padding:'14px 16px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
                    background: c.is_active ? '#ECFDF5' : '#FEF2F2', color: c.is_active ? '#059669' : '#DC2626' }}>
                    {c.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td style={{ padding:'14px 16px' }}>
                  {canEdit && <button onClick={() => openEdit(c)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px' }}>✏️</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', width:'560px', maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>{modal === 'add' ? 'Добавить исполнителя' : 'Редактировать исполнителя'}</h2>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>ФИО *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Телефон</label>
                <input value={form.phone||''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={inp} placeholder="+7..." />
              </div>
              <div>
                <label style={lbl}>Тип</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={inp}>
                  {Object.entries(TYPES).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Специализация</label>
                <select value={form.specialization||'грузчик'} onChange={e => setForm(f => ({...f, specialization: e.target.value}))} style={inp}>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Навыки</label>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'4px' }}>
                  {SKILLS_LIST.map(sk => (
                    <label key={sk} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'13px' }}>
                      <input type="checkbox" checked={(form.skills||[]).includes(sk)} onChange={() => toggleSkill(sk)} />
                      {sk}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn:'1/-1', borderTop:'1px solid var(--gray-200)', paddingTop:'14px', marginTop:'4px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'var(--gray-500)', marginBottom:'10px', textTransform:'uppercase' }}>Платёжные данные</div>
              </div>
              <div>
                <label style={lbl}>ИНН</label>
                <input value={form.inn||''} onChange={e => setForm(f => ({...f, inn: e.target.value}))} style={inp} placeholder="123456789012" />
              </div>
              <div>
                <label style={lbl}>Номер карты</label>
                <input value={form.card_number||''} onChange={e => setForm(f => ({...f, card_number: e.target.value}))} style={inp} placeholder="0000 0000 0000 0000" />
              </div>
              <div>
                <label style={lbl}>Телефон СБП</label>
                <input value={form.sbp_phone||''} onChange={e => setForm(f => ({...f, sbp_phone: e.target.value}))} style={inp} placeholder="+7..." />
              </div>
              {form.type === 'ip' && (
                <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={lbl}>Наименование ИП</label>
                    <input value={form.ip_name||''} onChange={e => setForm(f => ({...f, ip_name: e.target.value}))} style={inp} placeholder="ИП Иванов Иван Иванович" />
                  </div>
                  <div>
                    <label style={lbl}>Расчётный счёт</label>
                    <input value={form.bank_account||''} onChange={e => setForm(f => ({...f, bank_account: e.target.value}))} style={inp} placeholder="40802810..." />
                  </div>
                  <div>
                    <label style={lbl}>БИК банка</label>
                    <input value={form.bank_bik||''} onChange={e => setForm(f => ({...f, bank_bik: e.target.value}))} style={inp} placeholder="044525225" />
                  </div>
                </div>
              )}
              {modal === 'edit' && (
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px' }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                    Активен
                  </label>
                </div>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'24px' }}>
              <button onClick={() => setModal(null)} style={{ padding:'10px 20px', border:'1px solid var(--gray-200)', borderRadius:'8px', background:'#fff', cursor:'pointer' }}>Отмена</button>
              <button onClick={save} disabled={loading} style={{ padding:'10px 20px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.jsx';

export default function EmailThread({ leadId, clientEmail }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ to: '', subject: '', text: '' });
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function load() {
    try {
      const r = await api.get('/api/leads/' + leadId + '/emails');
      setEmails(r.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [leadId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [emails]);

  function replyTo(email) {
    setForm({
      to: email.from_email,
      subject: email.subject.startsWith('Re:') ? email.subject : 'Re: ' + email.subject,
      text: '\n\n---\nОт: ' + email.from_name + ' <' + email.from_email + '>\n' + email.body_text,
    });
    setShowCompose(true);
  }

  async function send() {
    if (!form.to || !form.subject || !form.text.trim()) return alert('Заполните все поля');
    setSending(true);
    try {
      await api.post('/api/leads/' + leadId + '/send-email', form);
      setForm({ to: '', subject: '', text: '' });
      setShowCompose(false);
      await load();
    } catch(e) { alert('Ошибка: ' + (e.response?.data?.error || e.message)); }
    setSending(false);
  }

  function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function formatDate(d) {
    return new Date(d).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:400 }}>
      {/* Заголовок */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
        <div style={{ fontWeight:600, fontSize:15 }}>📧 Переписка {emails.length > 0 && <span style={{ color:'#6b7280', fontWeight:400, fontSize:13 }}>({emails.length} писем)</span>}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} style={{ padding:'6px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 }}>↻ Обновить</button>
          <button onClick={() => { setForm({ to: clientEmail || '', subject: '', text: '' }); setShowCompose(true); }}
            style={{ padding:'6px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            ✉️ Написать
          </button>
        </div>
      </div>

      {/* Список писем */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12, background:'#fff' }}>
        {loading && <div style={{ textAlign:'center', color:'#9ca3af', padding:40 }}>Загрузка...</div>}
        {!loading && emails.length === 0 && (
          <div style={{ textAlign:'center', color:'#9ca3af', padding:40 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            <div>Писем пока нет</div>
          </div>
        )}
        {emails.map(email => (
          <div key={email.id} style={{
            display:'flex', flexDirection:'column',
            alignSelf: email.direction === 'out' ? 'flex-end' : 'flex-start',
            maxWidth:'80%',
          }}>
            <div style={{
              background: email.direction === 'out' ? '#EFF6FF' : '#F9FAFB',
              border: '1px solid ' + (email.direction === 'out' ? '#BFDBFE' : '#E5E7EB'),
              borderRadius: email.direction === 'out' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding:'12px 16px',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, gap:16 }}>
                <div style={{ fontSize:12, fontWeight:600, color: email.direction === 'out' ? '#2563EB' : '#374151' }}>
                  {email.direction === 'out' ? '📤 Вы' : '📥 ' + (email.from_name || email.from_email)}
                </div>
                <div style={{ fontSize:11, color:'#9ca3af', whiteSpace:'nowrap' }}>{formatDate(email.sent_at)}</div>
              </div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:8, fontStyle:'italic' }}>
                Тема: {email.subject}
              </div>
              <div style={{ fontSize:13, color:'#1f2937', whiteSpace:'pre-wrap', lineHeight:1.5 }}>
                {stripHtml(email.body_text || email.body_html || '').slice(0, 800)}
                {(email.body_text || '').length > 800 && <span style={{ color:'#9ca3af' }}> ... (обрезано)</span>}
              </div>
            </div>
            {email.direction === 'in' && (
              <button onClick={() => replyTo(email)}
                style={{ alignSelf:'flex-start', marginTop:4, padding:'3px 10px', fontSize:11, color:'#6b7280', background:'none', border:'1px solid #e5e7eb', borderRadius:6, cursor:'pointer' }}>
                ↩ Ответить
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Форма ответа */}
      {showCompose && (
        <div style={{ borderTop:'2px solid #2563eb', background:'#fff', padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>Новое письмо</div>
            <button onClick={() => setShowCompose(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:18 }}>✕</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input value={form.to} onChange={e => setForm(f => ({...f, to: e.target.value}))}
              placeholder="Кому (email)" style={inp} />
            <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
              placeholder="Тема" style={inp} />
            <textarea value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))}
              placeholder="Текст письма..." rows={5}
              style={{ ...inp, resize:'vertical', fontFamily:'inherit', lineHeight:1.5 }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:'#9ca3af' }}>От: info@standart-express.ru</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowCompose(false)} style={{ padding:'8px 16px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 }}>Отмена</button>
                <button onClick={send} disabled={sending}
                  style={{ padding:'8px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  {sending ? 'Отправка...' : '📧 Отправить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:13, width:'100%', boxSizing:'border-box' };

import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.jsx';

export default function EmailThread({ leadId, clientEmail }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ to: '', subject: '', text: '' });
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/api/leads/' + leadId + '/emails');
      setEmails(r.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [leadId]);
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [emails, loading]);

  function openCompose() {
    const lastEmail = emails[emails.length - 1];
    const subject = lastEmail ? (lastEmail.subject.startsWith('Re:') ? lastEmail.subject : 'Re: ' + lastEmail.subject) : '';
    const to = clientEmail || (lastEmail?.from_email || '');
    setForm({ to, subject, text: '' });
    setAttachment(null);
    setShowCompose(true);
  }

  function replyTo(email) {
    setForm({
      to: email.from_email,
      subject: email.subject.startsWith('Re:') ? email.subject : 'Re: ' + email.subject,
      text: '\n\n---\nОт: ' + (email.from_name || email.from_email) + '\n' + stripHtml(email.body_text || email.body_html || '').slice(0, 300),
    });
    setAttachment(null);
    setShowCompose(true);
  }

  async function send() {
    if (!form.to || !form.subject || !form.text.trim()) return alert('Заполните все поля');
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', form.to);
      formData.append('subject', form.subject);
      formData.append('text', form.text);
      if (attachment) formData.append('attachment', attachment);
      await api.post('/api/leads/' + leadId + '/send-email', form);
      setForm({ to: '', subject: '', text: '' });
      setAttachment(null);
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
        <div style={{ fontWeight:600, fontSize:15 }}>
          📧 Переписка {emails.length > 0 && <span style={{ color:'#6b7280', fontWeight:400, fontSize:13 }}>({emails.length} писем)</span>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} style={{ padding:'6px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 }}>↻ Обновить</button>
          <button onClick={openCompose} style={{ padding:'6px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>✉️ Написать</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12, background:'#fff' }}>
        {loading && <div style={{ textAlign:'center', color:'#9ca3af', padding:40 }}>Загрузка...</div>}
        {!loading && emails.length === 0 && (
          <div style={{ textAlign:'center', color:'#9ca3af', padding:40 }}>
            <div style={{ marginBottom:8, opacity:0.3 }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            <div>Писем пока нет</div>
          </div>
        )}
        {emails.map(email => (
          <div key={email.id} style={{ display:'flex', flexDirection:'column', alignSelf: email.direction === 'out' ? 'flex-end' : 'flex-start', maxWidth:'80%' }}>
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
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:8, fontStyle:'italic' }}>Тема: {email.subject}</div>
              <div style={{ fontSize:13, color:'#1f2937', whiteSpace:'pre-wrap', lineHeight:1.5 }}>
                {stripHtml(email.body_text || email.body_html || '').slice(0, 800)}
                {(email.body_text || '').length > 800 && <span style={{ color:'#9ca3af' }}> ... (обрезано)</span>}
              </div>
            </div>
            {email.direction === 'in' && (
              <button onClick={() => replyTo(email)} style={{ alignSelf:'flex-start', marginTop:4, padding:'3px 10px', fontSize:11, color:'#6b7280', background:'none', border:'1px solid #e5e7eb', borderRadius:6, cursor:'pointer' }}>
                ↩ Ответить
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showCompose && (
        <div style={{ borderTop:'2px solid #2563eb', background:'#fff', padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>Новое письмо</div>
            <button onClick={() => setShowCompose(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:18 }}>✕</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input value={form.to} onChange={e => setForm(f => ({...f, to: e.target.value}))} placeholder="Кому (email)" style={inp} />
            <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Тема" style={inp} />
            <div style={{ border:'1px solid #d1d5db', borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'flex', gap:4, padding:'6px 8px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb', flexWrap:'wrap' }}>
                {[['bold','𝐁'],['italic','𝐼'],['underline','U'],['strikeThrough','S']].map(([cmd,label]) => (
                  <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); document.execCommand(cmd); }}
                    style={{ padding:'2px 8px', border:'1px solid #d1d5db', borderRadius:4, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:cmd==='bold'?700:400, fontStyle:cmd==='italic'?'italic':'normal', textDecoration:cmd==='underline'?'underline':cmd==='strikeThrough'?'line-through':'none' }}>
                    {label}
                  </button>
                ))}
                <select onChange={e => { document.execCommand('fontSize', false, e.target.value); e.target.value=''; }}
                  style={{ padding:'2px 6px', border:'1px solid #d1d5db', borderRadius:4, fontSize:13, background:'#fff' }}>
                  <option value="">Размер</option>
                  {[['1','Мелкий'],['3','Обычный'],['5','Крупный'],['7','Очень крупный']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div contentEditable suppressContentEditableWarning
                onInput={e => setForm(f => ({...f, text: e.currentTarget.innerHTML}))}
                style={{ minHeight:150, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', lineHeight:1.6 }}
              />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => fileRef.current?.click()} style={{ padding:'6px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12 }}>
                  📎 Прикрепить файл
                </button>
                {attachment && <span style={{ fontSize:12, color:'#6b7280' }}>{attachment.name}</span>}
                <input ref={fileRef} type="file" style={{ display:'none' }} onChange={e => setAttachment(e.target.files[0])} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ fontSize:12, color:'#9ca3af', alignSelf:'center' }}>От: info@standart-express.ru</div>
                <button onClick={() => setShowCompose(false)} style={{ padding:'8px 16px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 }}>Отмена</button>
                <button onClick={send} disabled={sending} style={{ padding:'8px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
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

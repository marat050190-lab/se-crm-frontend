import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../utils/icons.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0D1117',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Фоновый SVG паттерн — схема цепей */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.15 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FF8C00" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Оранжевые световые эффекты */}
      <div style={{ position:'absolute', bottom:-200, left:-100, width:600, height:600, background:'radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, background:'radial-gradient(circle, rgba(255,140,0,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Декоративные линии */}
      <svg style={{ position:'absolute', left:0, top:0, width:'45%', height:'100%', opacity:0.3 }} xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="0" x2="80" y2="300" stroke="#FF8C00" strokeWidth="1"/>
        <line x1="80" y1="300" x2="200" y2="300" stroke="#FF8C00" strokeWidth="1"/>
        <line x1="200" y1="300" x2="200" y2="500" stroke="#FF8C00" strokeWidth="1"/>
        <line x1="200" y1="500" x2="350" y2="500" stroke="#FF8C00" strokeWidth="1"/>
        <circle cx="80" cy="300" r="4" fill="#FF8C00"/>
        <circle cx="200" cy="500" r="4" fill="#FF8C00"/>
        <line x1="120" y1="0" x2="120" y2="180" stroke="#FF8C00" strokeWidth="0.5" opacity="0.5"/>
        <line x1="120" y1="180" x2="280" y2="180" stroke="#FF8C00" strokeWidth="0.5" opacity="0.5"/>
        <circle cx="120" cy="180" r="3" fill="#FF8C00" opacity="0.5"/>
        {/* Иконки узлов */}
        <rect x="60" y="120" width="40" height="40" rx="20" fill="none" stroke="#FF8C00" strokeWidth="1.5"/>
        <rect x="180" y="390" width="40" height="40" rx="20" fill="none" stroke="#FF8C00" strokeWidth="1.5"/>
        <rect x="300" y="560" width="60" height="60" rx="30" fill="none" stroke="#FF8C00" strokeWidth="1.5"/>
      </svg>

      {/* Левая часть — брендинг */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 80px', position:'relative', zIndex:1 }}>
        <div style={{ marginBottom:60 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg, #FF8C00, #FF6000)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-0.5px', fontFamily:'Inter, sans-serif' }}>Стандарт Экспресс</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>Система управления продажами</div>
            </div>
          </div>
          <h1 style={{ fontSize:42, fontWeight:800, color:'#fff', lineHeight:1.15, letterSpacing:'-1px', marginBottom:16, fontFamily:'Inter, sans-serif' }}>
            Управляйте<br/>
            <span style={{ color:'#FF8C00' }}>продажами</span><br/>
            эффективнее
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', lineHeight:1.6, maxWidth:380 }}>
            CRM-система для команды Стандарт Экспресс — лиды, клиенты, заявки и аналитика в одном месте.
          </p>
        </div>

        <div style={{ display:'flex', gap:32 }}>
          {[['500+', 'заявок в месяц'], ['3400+', 'клиентов'], ['10+', 'менеджеров']].map(([n, l]) => (
            <div key={n}>
              <div style={{ fontSize:24, fontWeight:800, color:'#FF8C00', fontFamily:'Inter, sans-serif' }}>{n}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Правая часть — форма входа */}
      <div style={{ width:460, display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative', zIndex:1 }}>
        <div style={{
          background:'rgba(255,255,255,0.05)',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:24,
          padding:'44px 40px',
          width:'100%',
          boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.4px', fontFamily:'Inter, sans-serif' }}>Вход в систему</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 }}>Введите ваши данные для входа</p>
          </div>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@standart-express.ru"
                required
                autoFocus
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'12px 16px',
                  background:'rgba(255,255,255,0.07)',
                  border:'1.5px solid rgba(255,255,255,0.12)',
                  borderRadius:10,
                  color:'#fff',
                  fontSize:14,
                  outline:'none',
                  fontFamily:'Inter, sans-serif',
                  transition:'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C00'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Пароль</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width:'100%', boxSizing:'border-box',
                    padding:'12px 44px 12px 16px',
                    background:'rgba(255,255,255,0.07)',
                    border:'1.5px solid rgba(255,255,255,0.12)',
                    borderRadius:10,
                    color:'#fff',
                    fontSize:14,
                    outline:'none',
                    fontFamily:'Inter, sans-serif',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C00'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', display:'flex', padding:4, transition:'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPwd ? Icons.eyeOff(18) : Icons.eye(18)}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%',
                padding:'13px 24px',
                background: loading ? 'rgba(255,140,0,0.5)' : 'linear-gradient(135deg, #FF8C00, #FF6000)',
                color:'#fff',
                border:'none',
                borderRadius:10,
                fontSize:15,
                fontWeight:700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:'Inter, sans-serif',
                letterSpacing:'-0.2px',
                marginTop:4,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,140,0,0.35)',
                transition:'all 0.15s',
              }}
            >
              {loading ? 'Вход...' : 'Войти в систему'}
            </button>
          </form>

          <div style={{ marginTop:24, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.2)' }}>
            Стандарт Экспресс © 2026
          </div>
        </div>
      </div>
    </div>
  );
}

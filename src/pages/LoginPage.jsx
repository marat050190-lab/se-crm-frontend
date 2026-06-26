import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../utils/icons.jsx';

const LOGO_SRC = '';

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

  const inpStyle = {
    width:'100%', boxSizing:'border-box',
    padding:'12px 16px',
    background:'#f8fafc',
    border:'1.5px solid #e2e8f0',
    borderRadius:10, color:'#1a2535', fontSize:14,
    outline:'none', fontFamily:'Inter, sans-serif',
    transition:'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      backgroundImage:'url(/bg-login.png)',
      backgroundSize:'cover', backgroundPosition:'center',
      backgroundRepeat:'no-repeat',
      position:'relative',
    }}>
      {/* Лёгкое осветление */}
      <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.25)' }} />

      {/* Карточка входа по центру */}
      <div style={{ position:'relative', zIndex:1, width:420, padding:'0 16px' }}>

        {/* Карточка */}
        <div style={{
          background:'rgba(255,255,255,0.92)',
          backdropFilter:'blur(24px)',
          border:'1px solid rgba(0,0,0,0.08)',
          borderRadius:20,
          padding:'36px 36px 32px',
          boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#1a2535', margin:'0 0 6px', letterSpacing:'-0.4px', fontFamily:'Inter, sans-serif', textAlign:'center' }}>
            Вход в систему
          </h2>
          <p style={{ fontSize:13, color:'#6b7a8d', margin:'0 0 28px', textAlign:'center' }}>
            CRM Отдела продаж
          </p>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'11px 16px', marginBottom:18, fontSize:13, color:'#FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7a8d', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@standart-express.ru"
                required autoFocus
                style={inpStyle}
                onFocus={e => e.target.style.borderColor='#FF8C00'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.13)'}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7a8d', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>Пароль</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inpStyle, paddingRight:44 }}
                  onFocus={e => e.target.style.borderColor='#FF8C00'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.13)'}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', color:'#6b7a8d', display:'flex', padding:6, borderRadius:6 }}
                  onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.75)'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
                  {showPwd ? Icons.eyeOff(18) : Icons.eye(18)}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width:'100%', padding:'13px 24px', marginTop:6,
                background: loading ? 'rgba(255,140,0,0.5)' : 'linear-gradient(135deg, #FF8C00, #FF6000)',
                color:'#fff', border:'none', borderRadius:10,
                fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:'Inter, sans-serif', letterSpacing:'-0.1px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(255,140,0,0.4)',
                transition:'all 0.15s',
              }}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div style={{ marginTop:24, textAlign:'center', fontSize:11, color:'rgba(0,0,0,0.25)' }}>
            Стандарт Экспресс © 2026
          </div>
        </div>
      </div>
    </div>
  );
}

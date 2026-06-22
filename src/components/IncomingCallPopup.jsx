import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://se-crm-backend-production.up.railway.app';

export default function IncomingCallPopup() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('incoming_call', (data) => {
      setCalls(prev => [...prev, { ...data, id: Date.now() }]);
    });
    return () => socket.disconnect();
  }, []);

  const dismiss = (id) => setCalls(prev => prev.filter(c => c.id !== id));
  const openLead = (call) => {
    window.location.href = '/leads/' + call.leadId;
    dismiss(call.id);
  };

  if (calls.length === 0) return null;

  return (
    <div style={{ position:'fixed', top:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:12 }}>
      {calls.map(call => (
        <div key={call.id} style={{
          background:'#1a1a2e', border:'1px solid #4ade80',
          borderRadius:12, padding:'16px 20px', minWidth:300,
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:24 }}>📞</span>
            <div>
              <div style={{ color:'#4ade80', fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:1 }}>
                Входящий звонок
              </div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:20, letterSpacing:2 }}>
                +{call.phone}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {call.leadId && (
              <button
                onClick={() => openLead(call)}
                style={{
                  flex:1, background:'#4ade80', color:'#000',
                  border:'none', borderRadius:8, padding:'8px 0',
                  fontWeight:700, fontSize:13, cursor:'pointer'
                }}
              >
                Открыть лид
              </button>
            )}
            <button
              onClick={() => dismiss(call.id)}
              style={{
                flex:1, background:'transparent', color:'#9ca3af',
                border:'1px solid #374151', borderRadius:8, padding:'8px 0',
                fontWeight:600, fontSize:13, cursor:'pointer'
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

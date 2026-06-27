import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getPhoneRegion } from '../utils/phoneRegion.js';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://se-crm-backend-production.up.railway.app';

export default function IncomingCallPopup() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('incoming_call', (data) => {
      setCalls(prev => {
        const now = Date.now();
        const dup = prev.find(c => c.phone === data.phone && now - c.id < 30000);
        if (dup) return prev;
        return [...prev, { ...data, id: now }];
      });
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
      {calls.map(call => {
        const region = getPhoneRegion(call.phone);
        return (
          <div key={call.id} style={{
            background:'#0f172a', border:'2px solid #4ade80',
            borderRadius:16, padding:'18px 20px', minWidth:320,
            boxShadow:'0 8px 40px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{
                width:44, height:44, borderRadius:'50%',
                background:'#4ade8022', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, flexShrink:0,
                animation:'pulse 1.5s infinite'
              }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.29 6.29l1.17-1.17a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z"/></svg></div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#4ade80', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1.5, marginBottom:2 }}>
                  Входящий звонок
                </div>
                <div style={{ color:'#fff', fontWeight:800, fontSize:22, letterSpacing:2, lineHeight:1 }}>
                  +{call.phone}
                </div>
                {region && (
                  <div style={{ color:'#94a3b8', fontSize:12, marginTop:4 }}>
                    📍 {region}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:8 }}>
              {call.leadId && (
                <button
                  onClick={() => openLead(call)}
                  style={{
                    flex:1, background:'#4ade80', color:'#000',
                    border:'none', borderRadius:10, padding:'10px 0',
                    fontWeight:700, fontSize:13, cursor:'pointer'
                  }}
                >
                  Открыть лид
                </button>
              )}
              <button
                onClick={() => dismiss(call.id)}
                style={{
                  flex:1, background:'transparent', color:'#64748b',
                  border:'1px solid #1e293b', borderRadius:10, padding:'10px 0',
                  fontWeight:600, fontSize:13, cursor:'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

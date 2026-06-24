import { useState, useEffect } from 'react';
import api from '../utils/api.jsx';

const TABS = [
  { key: 'relocation', label: '🚚 Переезд' },
  { key: 'rigging', label: '⚙️ Такелаж' },
  { key: 'garbage', label: '🗑️ Вывоз мусора' },
  { key: 'objections', label: '💬 Возражения' },
  { key: 'regions', label: '🗺️ Регионы' },
  { key: 'b2b', label: '🏢 B2B' },
];

function DialogLine({ line }) {
  const isDispatcher = line.speaker === 'dispatcher';
  return (
    <div style={{ display: 'flex', flexDirection: isDispatcher ? 'row-reverse' : 'row', gap: '8px', marginBottom: '10px', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '11px', color: isDispatcher ? '#f97316' : 'var(--gray-400)', minWidth: '60px', textAlign: isDispatcher ? 'right' : 'left', paddingTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {isDispatcher ? 'Диспетчер' : 'Клиент'}
      </div>
      <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isDispatcher ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: isDispatcher ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'var(--gray-800)', color: isDispatcher ? '#fff' : 'var(--gray-200)', fontSize: '14px', lineHeight: '1.5', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
        {line.text}
        {line.tip && (
          <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', fontSize: '12px', color: isDispatcher ? 'rgba(255,255,255,0.85)' : 'var(--gray-400)', fontStyle: 'italic' }}>
            💡 {line.tip}
          </div>
        )}
      </div>
    </div>
  );
}

function RegionsTable({ data }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: 'var(--gray-800)' }}>
            {data.headers?.map((h, i) => (
              <th key={i} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--gray-300)', fontWeight: '600', borderBottom: '1px solid var(--gray-700)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows?.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--gray-800)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 14px', color: 'var(--gray-300)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ObjectionCard({ obj }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'var(--gray-800)', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden', border: '1px solid var(--gray-700)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', color: 'var(--gray-100)', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
        <span>❝ {obj.objection}</span>
        <span style={{ color: 'var(--gray-400)', fontSize: '18px' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {obj.lines?.map((line, i) => <DialogLine key={i} line={line} />)}
        </div>
      )}
    </div>
  );
}

function ScriptContent({ script }) {
  if (!script) return null;
  const content = script.content || [];
  if (script.category === 'regions') {
    const tableData = content.find(c => c.type === 'table');
    return tableData ? <RegionsTable data={tableData} /> : null;
  }
  if (script.category === 'objections') {
    return <div>{content.map((obj, i) => <ObjectionCard key={i} obj={obj} />)}</div>;
  }
  return (
    <div>
      {content.map((item, i) => {
        if (item.type === 'section') {
          return (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', paddingLeft: '4px' }}>{item.label}</div>
              {item.lines?.map((line, j) => <DialogLine key={j} line={line} />)}
            </div>
          );
        }
        if (item.type === 'line') return <DialogLine key={i} line={item} />;
        return null;
      })}
    </div>
  );
}

export default function ScriptsPage() {
  const [activeTab, setActiveTab] = useState('relocation');
  const [scripts, setScripts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadScripts(); }, []);

  async function loadScripts() {
    try {
      const { data } = await api.get('/scripts');
      const byCategory = {};
      (data || []).forEach(s => {
        if (!byCategory[s.category]) byCategory[s.category] = [];
        byCategory[s.category].push(s);
      });
      setScripts(byCategory);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const currentScripts = scripts[activeTab] || [];

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h2 style={{ margin: '0 0 20px', color: 'var(--gray-100)', fontSize: '22px' }}>📞 Скрипты диспетчера</h2>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '500', background: activeTab === tab.key ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'var(--gray-800)', color: activeTab === tab.key ? '#fff' : 'var(--gray-300)' }}>
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: 'var(--gray-400)', padding: '40px', textAlign: 'center' }}>Загрузка...</div>
      ) : currentScripts.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--gray-500)', background: 'var(--gray-800)', borderRadius: '12px', border: '1px dashed var(--gray-700)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
          <div>Скрипты ещё не добавлены</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>Попросите администратора добавить скрипты</div>
        </div>
      ) : (
        currentScripts.map(script => (
          <div key={script.id} style={{ marginBottom: '32px' }}>
            {currentScripts.length > 1 && (
              <h3 style={{ color: 'var(--gray-200)', fontSize: '16px', marginBottom: '16px' }}>{script.title}</h3>
            )}
            <div style={{ background: 'var(--gray-900)', borderRadius: '12px', padding: '20px', border: '1px solid var(--gray-700)' }}>
              <ScriptContent script={script} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

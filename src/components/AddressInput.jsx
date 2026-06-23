import { useState, useRef, useEffect } from 'react';

const DADATA_TOKEN = '6421f0a948e4a3df5098151b4372a636665ba3f5';

export default function AddressInput({ value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = (query) => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Token ' + DADATA_TOKEN,
          },
          body: JSON.stringify({ query, count: 7, locations: [{ country: 'Россия' }] }),
        });
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setOpen(true);
        setActive(-1);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const handleInput = (e) => {
    const v = e.target.value;
    onChange(v);
    fetchSuggestions(v);
  };

  const pick = (s) => {
    onChange(s.value);
    setSuggestions([]);
    setOpen(false);
  };

  const handleKey = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        className="form-control"
        value={value || ''}
        placeholder={placeholder || 'Начните вводить адрес...'}
        onChange={handleInput}
        onKeyDown={handleKey}
        onFocus={() => suggestions.length && setOpen(true)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul style={dropdown}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => pick(s)}
              onMouseEnter={() => setActive(i)}
              style={{ ...item, background: i === active ? '#eff6ff' : '#fff' }}
            >
              {s.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const dropdown = { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, margin: 0, padding: 0, listStyle: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, marginTop: 4, maxHeight: 280, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const item = { padding: '10px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f3f4f6' };

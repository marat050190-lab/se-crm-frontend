import { useEffect, useState } from 'react';
import api from '../utils/api.jsx';

const fmtSize = (b) => {
  if (!b) return '';
  if (b < 1024) return b + ' Б';
  if (b < 1024 * 1024) return Math.round(b / 1024) + ' КБ';
  return (b / 1024 / 1024).toFixed(1) + ' МБ';
};

export default function FileAttachments({ entityType, entityId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    if (!entityId) return;
    api.get(`/api/files/${entityType}/${entityId}`).then(r => setFiles(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [entityType, entityId]);

  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/api/files/${entityType}/${entityId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } catch (err) {
      alert('Ошибка загрузки файла');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const download = async (f) => {
    try {
      const r = await api.get(`/api/files/download/${f.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Ошибка скачивания');
    }
  };

  const remove = async (id) => {
    if (!confirm('Удалить файл?')) return;
    try { await api.delete(`/api/files/${id}`); load(); } catch (err) { alert('Ошибка удаления'); }
  };

  return (
    <div>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 14px', border: '1px solid #2563eb', borderRadius: 8, color: '#2563eb', fontSize: 13, background: '#f0f9ff' }}>
        {uploading ? 'Загрузка…' : '📎 Прикрепить файл'}
        <input type="file" onChange={onUpload} disabled={uploading} style={{ display: 'none' }} />
      </label>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {files.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>Файлов пока нет</div>}
        {files.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
            <span style={{ cursor: 'pointer', color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} onClick={() => download(f)} title={f.filename}>
              📄 {f.filename}
            </span>
            <span style={{ color: '#9CA3AF', margin: '0 12px', whiteSpace: 'nowrap' }}>{fmtSize(f.size_bytes)}</span>
            <span style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => remove(f.id)}>✕</span>
          </div>
        ))}
      </div>
    </div>
  );
}

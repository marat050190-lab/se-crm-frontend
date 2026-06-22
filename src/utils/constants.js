export const STATUSES = {
  new:         { label: 'Новый',         color: '#6B7280', bg: '#F3F4F6' },
  in_progress: { label: 'В работе',      color: '#2563EB', bg: '#EFF6FF' },
  kp_sent:     { label: 'КП отправлено', color: '#7C3AED', bg: '#F5F3FF' },
  negotiation: { label: 'Переговоры',    color: '#D97706', bg: '#FFFBEB' },
  won:         { label: 'Выиграно',      color: '#059669', bg: '#ECFDF5' },
  lost:        { label: 'Проиграно',     color: '#DC2626', bg: '#FEF2F2' },
  postponed:   { label: 'Отложено',      color: '#9CA3AF', bg: '#F9FAFB' },
};

export const SERVICE_TYPES = [
  { value: 'movers', label: 'Грузчики' },
  { value: 'move',   label: 'Переезд' },
  { value: 'rigging', label: 'Такелаж' },
  { value: 'outsource', label: 'Аутсорсинг персонала' },
  { value: 'other',  label: 'Другое' },
];

export const TASK_TYPES = [
  { value: 'call',    label: '📞 Перезвонить' },
  { value: 'send_kp', label: '📄 Отправить КП' },
  { value: 'meeting', label: '🤝 Встреча' },
  { value: 'other',   label: '✓ Другое' },
];

export const SOURCES = {
  call:     '📞 Звонок',
  site_form: '🌐 Форма с сайта',
  referral: '👥 Рекомендация',
  repeat:   '🔄 Повторный',
};

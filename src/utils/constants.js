// Статусы диспетчера — положительные
export const DISPATCHER_STATUSES_POSITIVE = {
  new:              { label: 'Новое',          color: '#6B7280', bg: '#F3F4F6' },
  in_progress:      { label: 'В обработке',    color: '#2563EB', bg: '#EFF6FF' },
  transferred_mfl:  { label: 'Передан МФЛ',   color: '#059669', bg: '#ECFDF5' },
  transferred_b2b:  { label: 'Передан B2B',   color: '#7C3AED', bg: '#F5F3FF' },
  taken:            { label: 'Взят в работу',  color: '#0891B2', bg: '#ECFEFF' },
};

// Статусы диспетчера — отрицательные
export const DISPATCHER_STATUSES_NEGATIVE = {
  expensive:        { label: 'Дорого',              color: '#DC2626', bg: '#FEF2F2' },
  clarified_early:  { label: 'Уточнял заранее',     color: '#9CA3AF', bg: '#F9FAFB' },
  found_another:    { label: 'Нашёл другую',        color: '#9CA3AF', bg: '#F9FAFB' },
  no_answer:        { label: 'Недозвон',            color: '#D97706', bg: '#FFFBEB' },
  spam:             { label: 'Спам',                color: '#9CA3AF', bg: '#F9FAFB' },
  not_our_service:  { label: 'Не наша услуга',      color: '#9CA3AF', bg: '#F9FAFB' },
  postponed:        { label: 'Перенос',             color: '#D97706', bg: '#FFFBEB' },
  rejected:         { label: 'Отказ',               color: '#DC2626', bg: '#FEF2F2' },
};

// Статусы B2B менеджера
export const B2B_STATUSES = {
  b2b_negotiations: { label: 'B2B — переговоры',  color: '#D97706', bg: '#FFFBEB' },
  b2b_approved:     { label: 'B2B — согласован',  color: '#059669', bg: '#ECFDF5' },
  b2b_rejected:     { label: 'B2B — отказ',       color: '#DC2626', bg: '#FEF2F2' },
};

// Все статусы объединённо (для отображения бейджей)
export const STATUSES = {
  ...DISPATCHER_STATUSES_POSITIVE,
  ...DISPATCHER_STATUSES_NEGATIVE,
  ...B2B_STATUSES,
};

export const CLIENT_TYPES = [
  { value: 'individual', label: 'Физлицо' },
  { value: 'legal',      label: 'Юрлицо' },
];

export const SERVICE_TYPES = [
  { value: 'movers',      label: 'Грузчики' },
  { value: 'move_home',   label: 'Переезд квартирный' },
  { value: 'move_office', label: 'Переезд офисный' },
  { value: 'rigging',     label: 'Такелажные работы' },
  { value: 'garbage',     label: 'Вывоз мусора' },
  { value: 'outsource',   label: 'Аутсорсинг' },
  { value: 'workers',     label: 'Разнорабочие' },
  { value: 'cargo',       label: 'Грузоперевозка' },
  { value: 'special',     label: 'Спецтехника' },
  { value: 'other',       label: 'Иное' },
];

export const TASK_TYPES = [
  { value: 'call',    label: 'Перезвонить' },
  { value: 'send_kp', label: 'Отправить КП' },
  { value: 'meeting', label: '🤝 Встреча' },
  { value: 'other',   label: '✓ Другое' },
];

export const SOURCES = {
  call:      '📞 Звонок',
  site_form: '🌐 Форма с сайта',
  email:     '✉️ Email',
  referral:  '👥 Рекомендация',
  repeat:    '🔄 Повторный',
};

// Роли
export const ROLES = {
  super_admin:        'Супер-админ',
  admin:              'Администратор',
  rop:                'РОП',
  cs_head:            'Руководитель КС',
  dispatcher:         'Диспетчер',
  b2b_manager:        'Менеджер B2B',
  mfl_manager:        'Менеджер МФЛ',
  cs_manager:         'Менеджер КС',
  accountant_cashier: 'Бухгалтер-кассир',
  accountant:         'Бухгалтер',
  debt_specialist:    'Специалист по дебиторке',
};

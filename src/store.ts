import { v4 as uuid } from 'uuid';

// ============ TYPES ============
export type TicketStatus = 'new' | 'classification' | 'in_progress' | 'waiting' | 'paused' | 'closed' | 'archived';
export type TicketType = 'incident' | 'request' | 'problem' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketChannel = 'email' | 'phone' | 'portal' | 'chat';
export type ResolutionChannel = 'remote' | 'phone' | 'correspondence' | 'onsite';
export type WaitingReason = 'client' | 'department' | 'external_system' | 'other';
export type PauseReason = 'client' | 'department' | 'external_system' | 'internal' | 'other';
export type Role = 'operator' | 'engineer' | 'classifier' | 'supervisor' | 'lead' | 'admin' | 'auditor';

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  priority: TicketPriority;
  client: string;
  clientType: 'external' | 'internal';
  line: string;
  assignee: string;
  channel: TicketChannel;
  resolutionChannel?: ResolutionChannel;
  category?: string;
  product?: string;
  contract?: string;
  waitingReason?: WaitingReason;
  pauseReason?: PauseReason;
  pauseDuration?: number; // minutes
  pauseUntil?: number; // timestamp
  autoTransitionAt?: number; // timestamp
  autoArchiveAt?: number;
  slaExternal: number; // minutes
  slaInternal: number;
  slaPaused: boolean;
  slaPauseReason?: string;
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
  resolutionSummary?: string;
  hours?: number;
  clientConfirmed?: boolean;
  interactions: Interaction[];
  auditLog: AuditEntry[];
}

export interface Interaction {
  id: string;
  type: 'message' | 'note' | 'call' | 'connection' | 'system';
  author: string;
  text: string;
  createdAt: number;
  duration?: number;
  visibleToClient: boolean;
}

export interface AuditEntry {
  id: string;
  action: string;
  author: string;
  timestamp: number;
  oldValue?: string;
  newValue?: string;
  comment?: string;
}

export interface Notification {
  id: string;
  type: 'sla' | 'transition' | 'comment' | 'assignment';
  text: string;
  timestamp: number;
  read: boolean;
}

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; soft: string; text: string }> = {
  new: { label: 'Новая', color: '#3B82F6', soft: '#EAF2FF', text: '#1D4ED8' },
  classification: { label: 'Классификация', color: '#F97316', soft: '#FFF3E8', text: '#C2410C' },
  in_progress: { label: 'В работе', color: '#10B981', soft: '#E8F8F1', text: '#047857' },
  waiting: { label: 'Ждём ответа', color: '#F59E0B', soft: '#FFF7E8', text: '#B45309' },
  paused: { label: 'Пауза', color: '#64748B', soft: '#F1F5F9', text: '#475569' },
  closed: { label: 'Закрыта', color: '#8B5CF6', soft: '#F4EEFF', text: '#6D28D9' },
  archived: { label: 'Архив', color: '#475569', soft: '#E2E8F0', text: '#334155' },
};

export const TYPE_LABELS: Record<TicketType, string> = {
  incident: 'Инцидент',
  request: 'Запрос',
  problem: 'Проблема',
  other: 'Другое',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const ROLE_LABELS: Record<Role, string> = {
  operator: 'Оператор',
  engineer: 'Инженер',
  classifier: 'Классификатор',
  supervisor: 'Супервизор',
  lead: 'Лид',
  admin: 'Администратор',
  auditor: 'Аудитор',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  operator: ['dashboard', 'tickets', 'create', 'classify', 'comment'],
  engineer: ['dashboard', 'tickets', 'take', 'waiting', 'pause', 'comment', 'close'],
  classifier: ['dashboard', 'tickets', 'classify', 'assign'],
  supervisor: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel'],
  lead: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel', 'reports', 'export', 'view_settings'],
  admin: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel', 'reports', 'export', 'settings', 'reset'],
  auditor: ['dashboard', 'tickets', 'audit', 'reports'],
};

export const CLIENTS = ['ООО «Ромашка»', 'АО «Технопарк»', 'ИП Иванов И.И.', 'ГУП «Городские системы»'];
export const ASSIGNEES = ['Петров А.В.', 'Сидорова Е.К.', 'Козлов Д.М.', 'Новикова О.С.', 'Морозов И.П.'];
export const LINES = ['Первая линия', 'Вторая линия', 'Третья линия', 'Эскалация'];

// ============ DEMO DATA GENERATION ============
function generateDemoData(): Ticket[] {
  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;
  const tickets: Ticket[] = [];
  let counter = 1042;

  function makeTicket(overrides: Partial<Ticket>): Ticket {
    const id = uuid();
    counter++;
    const createdAt = overrides.createdAt || now - Math.random() * 7 * day;
    return {
      id,
      number: `HD-${counter}`,
      subject: overrides.subject || 'Заявка от клиента',
      description: overrides.description || 'Описание проблемы от клиента. Требуется оперативное решение.',
      status: overrides.status || 'new',
      type: overrides.type || 'incident',
      priority: overrides.priority || 'medium',
      client: overrides.client || CLIENTS[Math.floor(Math.random() * CLIENTS.length)],
      clientType: overrides.clientType || 'external',
      line: overrides.line || LINES[0],
      assignee: overrides.assignee || ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
      channel: overrides.channel || 'email',
      slaExternal: overrides.slaExternal || 480,
      slaInternal: overrides.slaInternal || 240,
      slaPaused: false,
      createdAt,
      updatedAt: overrides.updatedAt || createdAt + Math.random() * hour,
      interactions: overrides.interactions || [],
      auditLog: overrides.auditLog || [{ id: uuid(), action: 'Создание заявки', author: 'Система', timestamp: createdAt }],
      ...overrides,
    };
  }

  // Новая — 4
  tickets.push(makeTicket({ subject: 'Не работает принтер в офисе', client: 'ООО «Ромашка»', status: 'new', type: 'incident', priority: 'high', createdAt: now - 2 * hour }));
  tickets.push(makeTicket({ subject: 'Запрос на установку ПО', client: 'АО «Технопарк»', status: 'new', type: 'request', priority: 'medium', createdAt: now - 4 * hour }));
  tickets.push(makeTicket({ subject: 'Ошибка при выгрузке отчёта', client: 'ИП Иванов И.И.', status: 'new', type: 'incident', priority: 'critical', createdAt: now - 1 * hour }));
  tickets.push(makeTicket({ subject: 'Консультация по договору', client: 'ГУП «Городские системы»', status: 'new', type: 'other', priority: 'low', createdAt: now - 30 * 60000 }));

  // Классификация — 3
  tickets.push(makeTicket({ subject: 'Проблема с авторизацией в системе', client: 'ООО «Ромашка»', status: 'classification', type: 'incident', priority: 'high', createdAt: now - 5 * hour }));
  tickets.push(makeTicket({ subject: 'Запрос на расширение лицензии', client: 'АО «Технопарк»', status: 'classification', type: 'request', priority: 'medium', createdAt: now - 6 * hour }));
  tickets.push(makeTicket({ subject: 'Неясная ошибка модуля', client: 'ИП Иванов И.И.', status: 'classification', type: 'other', priority: 'low', createdAt: now - 3 * hour }));

  // В работе — 8
  tickets.push(makeTicket({ subject: 'Настройка VPN-подключения', client: 'ООО «Ромашка»', status: 'in_progress', type: 'request', priority: 'medium', createdAt: now - 2 * day, assignee: 'Петров А.В.' }));
  tickets.push(makeTicket({ subject: 'Обновление сервера БД', client: 'АО «Технопарк»', status: 'in_progress', type: 'problem', priority: 'high', createdAt: now - 3 * day, assignee: 'Козлов Д.М.', slaExternal: 240 }));
  tickets.push(makeTicket({ subject: 'Перенос данных в новое хранилище', client: 'ГУП «Городские системы»', status: 'in_progress', type: 'request', priority: 'medium', createdAt: now - 1.5 * day, assignee: 'Сидорова Е.К.' }));
  tickets.push(makeTicket({ subject: 'Диагностика сети', client: 'ООО «Ромашка»', status: 'in_progress', type: 'incident', priority: 'high', createdAt: now - 4 * hour, assignee: 'Морозов И.П.' }));
  tickets.push(makeTicket({ subject: 'Замена оборудования', client: 'ИП Иванов И.И.', status: 'in_progress', type: 'request', priority: 'low', createdAt: now - 5 * day, assignee: 'Новикова О.С.' }));
  tickets.push(makeTicket({ subject: 'Ошибка интеграции с CRM', client: 'АО «Технопарк»', status: 'in_progress', type: 'incident', priority: 'critical', createdAt: now - 8 * hour, assignee: 'Петров А.В.', slaExternal: 120 }));
  tickets.push(makeTicket({ subject: 'Настройка резервного копирования', client: 'ГУП «Городские системы»', status: 'in_progress', type: 'request', priority: 'medium', createdAt: now - 2 * day, assignee: 'Козлов Д.М.' }));
  tickets.push(makeTicket({ subject: 'Проблема с почтовым сервером', client: 'ООО «Ромашка»', status: 'in_progress', type: 'incident', priority: 'high', createdAt: now - 10 * hour, assignee: 'Сидорова Е.К.' }));

  // Ждём ответа — 4 (2 with upcoming auto-transition)
  tickets.push(makeTicket({
    subject: 'Ожидание подтверждения от клиента', client: 'АО «Технопарк»', status: 'waiting', type: 'incident', priority: 'medium',
    createdAt: now - 3 * day, waitingReason: 'client', autoTransitionAt: now + 2 * hour, slaPaused: true, assignee: 'Петров А.В.'
  }));
  tickets.push(makeTicket({
    subject: 'Ожидание смежного отдела', client: 'ООО «Ромашка»', status: 'waiting', type: 'problem', priority: 'high',
    createdAt: now - 2 * day, waitingReason: 'department', autoTransitionAt: now + 5 * hour, slaPaused: true, assignee: 'Козлов Д.М.'
  }));
  tickets.push(makeTicket({
    subject: 'Ожидание внешней системы', client: 'ИП Иванов И.И.', status: 'waiting', type: 'incident', priority: 'medium',
    createdAt: now - 4 * day, waitingReason: 'external_system', slaPaused: true, assignee: 'Морозов И.П.'
  }));
  tickets.push(makeTicket({
    subject: 'Ждём ответ от вендора', client: 'ГУП «Городские системы»', status: 'waiting', type: 'request', priority: 'low',
    createdAt: now - 5 * day, waitingReason: 'other', slaPaused: true, assignee: 'Новикова О.С.'
  }));

  // Пауза — 3 (2 with SLA stopped, 1 without)
  tickets.push(makeTicket({
    subject: 'Пауза — ожидание запчастей', client: 'ООО «Ромашка»', status: 'paused', type: 'incident', priority: 'medium',
    createdAt: now - 4 * day, pauseReason: 'external_system', pauseDuration: 480, pauseUntil: now + 6 * hour, slaPaused: true, assignee: 'Петров А.В.'
  }));
  tickets.push(makeTicket({
    subject: 'Пауза — согласование с клиентом', client: 'АО «Технопарк»', status: 'paused', type: 'request', priority: 'high',
    createdAt: now - 3 * day, pauseReason: 'client', pauseDuration: 240, pauseUntil: now + 3 * hour, slaPaused: true, assignee: 'Сидорова Е.К.'
  }));
  tickets.push(makeTicket({
    subject: 'Пауза — внутренний процесс', client: 'ИП Иванов И.И.', status: 'paused', type: 'problem', priority: 'medium',
    createdAt: now - 2 * day, pauseReason: 'internal', pauseDuration: 120, pauseUntil: now + 1 * hour, slaPaused: false, assignee: 'Козлов Д.М.'
  }));

  // Закрыта — 5
  tickets.push(makeTicket({ subject: 'Установка обновления', client: 'ООО «Ромашка»', status: 'closed', type: 'request', priority: 'low', createdAt: now - 7 * day, closedAt: now - 1 * day, resolutionChannel: 'remote', resolutionSummary: 'Обновление установлено успешно', hours: 1.5 }));
  tickets.push(makeTicket({ subject: 'Консультация по API', client: 'АО «Технопарк»', status: 'closed', type: 'request', priority: 'medium', createdAt: now - 6 * day, closedAt: now - 2 * day, resolutionChannel: 'correspondence', resolutionSummary: 'Предоставлена документация', hours: 0.5 }));
  tickets.push(makeTicket({ subject: 'Восстановление данных', client: 'ГУП «Городские системы»', status: 'closed', type: 'incident', priority: 'high', createdAt: now - 5 * day, closedAt: now - 3 * day, resolutionChannel: 'remote', resolutionSummary: 'Данные восстановлены из бэкапа', hours: 3 }));
  tickets.push(makeTicket({ subject: 'Настройка мониторинга', client: 'ИП Иванов И.И.', status: 'closed', type: 'request', priority: 'medium', createdAt: now - 4 * day, closedAt: now - 1 * day, resolutionChannel: 'onsite', resolutionSummary: 'Мониторинг настроен и протестирован', hours: 4 }));
  tickets.push(makeTicket({ subject: 'Инцидент с почтой', client: 'ООО «Ромашка»', status: 'closed', type: 'incident', priority: 'critical', createdAt: now - 3 * day, closedAt: now - 12 * hour, resolutionChannel: 'phone', resolutionSummary: 'Проблема решена перезапуском службы', hours: 2 }));

  // Архив — 3
  tickets.push(makeTicket({ subject: 'Архивная заявка — переезд', client: 'ООО «Ромашка»', status: 'archived', type: 'request', priority: 'low', createdAt: now - 30 * day, closedAt: now - 25 * day, resolutionChannel: 'onsite', resolutionSummary: 'Переезд выполнен', hours: 8 }));
  tickets.push(makeTicket({ subject: 'Архивная заявка — аудит', client: 'АО «Технопарк»', status: 'archived', type: 'request', priority: 'medium', createdAt: now - 45 * day, closedAt: now - 40 * day, resolutionChannel: 'correspondence', resolutionSummary: 'Аудит пройден', hours: 2 }));
  tickets.push(makeTicket({ subject: 'Архивная заявка — замена', client: 'ГУП «Городские системы»', status: 'archived', type: 'incident', priority: 'high', createdAt: now - 60 * day, closedAt: now - 55 * day, resolutionChannel: 'remote', resolutionSummary: 'Оборудование заменено', hours: 5 }));

  // Add SLA overdue tickets (3)
  tickets[7].slaExternal = 60; // already overdue
  tickets[7].createdAt = now - 5 * hour;
  tickets[10].slaExternal = 120; // already overdue
  tickets[10].createdAt = now - 6 * hour;
  tickets[12].slaExternal = 180; // already overdue
  tickets[12].createdAt = now - 4 * hour;

  // Add interactions to some tickets
  tickets[7].interactions = [
    { id: uuid(), type: 'message', author: 'Петров А.В.', text: 'Добрый день! Начал диагностику проблемы.', createdAt: now - 4 * hour, visibleToClient: true },
    { id: uuid(), type: 'note', author: 'Петров А.В.', text: 'Проблема на стороне сетевого оборудования клиента.', createdAt: now - 3 * hour, visibleToClient: false },
    { id: uuid(), type: 'message', author: 'Петров А.В.', text: 'Обнаружил проблему. Требуется перезагрузка коммутатора.', createdAt: now - 2 * hour, visibleToClient: true },
  ];

  tickets[0].interactions = [
    { id: uuid(), type: 'system', author: 'Система', text: 'Заявка создана автоматически из электронной почты', createdAt: now - 2 * hour, visibleToClient: false },
  ];

  return tickets;
}

function generateNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: uuid(), type: 'sla', text: 'HD-1049 — SLA просрочено на 1ч 05м', timestamp: now - 300000, read: false },
    { id: uuid(), type: 'sla', text: 'HD-1051 — SLA истекает через 15 минут', timestamp: now - 600000, read: false },
    { id: uuid(), type: 'transition', text: 'HD-1055 — автопереход в «В работе» через 2ч', timestamp: now - 900000, read: false },
    { id: uuid(), type: 'comment', text: 'Новый комментарий в HD-1048 от Петров А.В.', timestamp: now - 1200000, read: true },
    { id: uuid(), type: 'assignment', text: 'HD-1053 назначена на Козлов Д.М.', timestamp: now - 1800000, read: true },
  ];
}

// ============ STORE ============
const STORAGE_KEY = 'helpdesk_demo_data';
const SETTINGS_KEY = 'helpdesk_settings';
const ROLE_KEY = 'helpdesk_role';
const NOTIFICATIONS_KEY = 'helpdesk_notifications';

export interface Settings {
  autoTransitionHours: number;
  autoArchiveDays: number;
  slaWarningMinutes: number;
  externalSla: number;
  internalSla: number;
}

const DEFAULT_SETTINGS: Settings = {
  autoTransitionHours: 24,
  autoArchiveDays: 30,
  slaWarningMinutes: 30,
  externalSla: 480,
  internalSla: 240,
};

export function loadTickets(): Ticket[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  const tickets = generateDemoData();
  saveTickets(tickets);
  return tickets;
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadRole(): Role {
  return (localStorage.getItem(ROLE_KEY) as Role) || 'admin';
}

export function saveRole(role: Role) {
  localStorage.setItem(ROLE_KEY, role);
}

export function loadNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  const n = generateNotifications();
  saveNotifications(n);
  return n;
}

export function saveNotifications(notifications: Notification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

export function getNextTicketNumber(tickets: Ticket[]): string {
  const maxNum = tickets.reduce((max, t) => {
    const n = parseInt(t.number.replace('HD-', ''));
    return n > max ? n : max;
  }, 0);
  return `HD-${maxNum + 1}`;
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function canChangeStatus(role: Role, from: TicketStatus, to: TicketStatus): boolean {
  if (role === 'auditor') return false;
  if (role === 'operator') {
    return ['new', 'classification', 'in_progress', 'waiting'].includes(to);
  }
  if (role === 'engineer') {
    return !['archived'].includes(to);
  }
  if (role === 'classifier') {
    return to === 'classification';
  }
  return true;
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Просрочено';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}д ${hours % 24}ч`;
  }
  return `${hours}ч ${minutes}м`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

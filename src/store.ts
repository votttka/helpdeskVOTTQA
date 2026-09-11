import { v4 as uuid } from 'uuid';

// ============ TYPES ============
export type TicketStatus = 'new' | 'classification' | 'in_progress' | 'approval' | 'waiting' | 'paused' | 'closed' | 'archived';
export type TicketType = 'incident' | 'request' | 'problem' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketChannel = 'email' | 'phone' | 'portal' | 'chat';
export type ResolutionChannel = 'remote' | 'phone' | 'correspondence' | 'onsite';
export type WaitingReason = 'client' | 'department' | 'external_system' | 'other';
export type PauseReason = 'client' | 'department' | 'external_system' | 'internal' | 'other';
export type Role = 'operator' | 'engineer' | 'classifier' | 'supervisor' | 'lead' | 'admin' | 'auditor';

// NEW: Source / Channel of entry
export type TicketSource = 'usp' | 'phone' | 'email' | 'chat' | 'portal' | 'internal_task' | 'messenger' | 'manual';
export type ContractType = 'government' | 'commercial' | 'internal';

// NEW: Executor priority
export type ExecutorPriority = 'now' | 'today' | 'tomorrow' | 'this_week' | 'none';

// NEW: Call types
export type CallDirection = 'incoming' | 'outgoing' | 'missed';
export type CallAnalysisStatus = 'not_analyzed' | 'transcribing' | 'analyzed';

// ============ TAXONOMY ============
export interface TaxonomyType {
  id: string;
  groupId: string;
  name: string;
  plannedTime: number; // hours
  active: boolean;
}
export interface TaxonomyGroup {
  id: string;
  name: string;
  color: string;
}

export const TAXONOMY_GROUPS: TaxonomyGroup[] = [
  { id: 'config', name: 'Обновление конфигурации', color: '#2563EB' },
  { id: 'errors', name: 'Ошибки и инциденты', color: '#EF4444' },
  { id: 'reports', name: 'Регламентированная отчётность', color: '#F59E0B' },
  { id: 'exchange', name: 'Обмен данными', color: '#10B981' },
  { id: 'access', name: 'Права и доступы', color: '#8B5CF6' },
  { id: 'consult', name: 'Консультации', color: '#06B6D4' },
  { id: 'paid', name: 'Платные работы', color: '#F97316' },
  { id: 'internal', name: 'Внутренние задачи', color: '#64748B' },
];

export const TAXONOMY_TYPES: TaxonomyType[] = [
  { id: 't1', groupId: 'config', name: 'Обновление конфигурации', plannedTime: 2, active: true },
  { id: 't2', groupId: 'config', name: 'Добавление справочника', plannedTime: 0.5, active: true },
  { id: 't3', groupId: 'config', name: 'Изменение печатной формы', plannedTime: 1.5, active: true },
  { id: 't4', groupId: 'config', name: 'Настройка отчёта', plannedTime: 4, active: true },
  { id: 't5', groupId: 'config', name: 'Обновление платформы', plannedTime: 6, active: true },
  { id: 't6', groupId: 'errors', name: 'Ошибка запуска 1С', plannedTime: 1, active: true },
  { id: 't7', groupId: 'errors', name: 'Ошибка проведения документа', plannedTime: 1.5, active: true },
  { id: 't8', groupId: 'errors', name: 'Зависание системы', plannedTime: 2, active: true },
  { id: 't9', groupId: 'errors', name: 'Ошибка обмена данными', plannedTime: 3, active: true },
  { id: 't10', groupId: 'errors', name: 'Потеря данных', plannedTime: 4, active: true },
  { id: 't11', groupId: 'errors', name: 'Массовый инцидент', plannedTime: 8, active: true },
  { id: 't12', groupId: 'reports', name: 'Настройка регламентированного отчёта', plannedTime: 4, active: true },
  { id: 't13', groupId: 'reports', name: 'Формирование отчёта', plannedTime: 1, active: true },
  { id: 't14', groupId: 'reports', name: 'Корректировка отчёта', plannedTime: 2, active: true },
  { id: 't15', groupId: 'reports', name: 'Отправка отчёта', plannedTime: 0.5, active: true },
  { id: 't16', groupId: 'exchange', name: 'Настройка обмена с банком', plannedTime: 3, active: true },
  { id: 't17', groupId: 'exchange', name: 'Настройка EDI', plannedTime: 4, active: true },
  { id: 't18', groupId: 'exchange', name: 'Обмен с сайтом', plannedTime: 3, active: true },
  { id: 't19', groupId: 'exchange', name: 'Обмен с маркировкой', plannedTime: 5, active: true },
  { id: 't20', groupId: 'exchange', name: 'Диагностика обмена', plannedTime: 1.5, active: true },
  { id: 't21', groupId: 'access', name: 'Добавление пользователя', plannedTime: 0.5, active: true },
  { id: 't22', groupId: 'access', name: 'Сброс пароля', plannedTime: 0.3, active: true },
  { id: 't23', groupId: 'access', name: 'Настройка прав доступа', plannedTime: 1, active: true },
  { id: 't24', groupId: 'access', name: 'Блокировка пользователя', plannedTime: 0.2, active: true },
  { id: 't25', groupId: 'access', name: 'Аудит прав', plannedTime: 2, active: true },
  { id: 't26', groupId: 'consult', name: 'Консультация по учёту', plannedTime: 1, active: true },
  { id: 't27', groupId: 'consult', name: 'Консультация по платформе', plannedTime: 1, active: true },
  { id: 't28', groupId: 'consult', name: 'Обучение пользователя', plannedTime: 2, active: true },
  { id: 't29', groupId: 'consult', name: 'Разбор ошибки', plannedTime: 1.5, active: true },
  { id: 't30', groupId: 'consult', name: 'Методологическая консультация', plannedTime: 1, active: true },
  { id: 't31', groupId: 'paid', name: 'Разработка отчёта', plannedTime: 8, active: true },
  { id: 't32', groupId: 'paid', name: 'Разработка обработки', plannedTime: 6, active: true },
  { id: 't33', groupId: 'paid', name: 'Интеграция', plannedTime: 12, active: true },
  { id: 't34', groupId: 'paid', name: 'Миграция данных', plannedTime: 16, active: true },
  { id: 't35', groupId: 'paid', name: 'Доработка интерфейса', plannedTime: 4, active: true },
  { id: 't36', groupId: 'internal', name: 'Внутренняя задача', plannedTime: 2, active: true },
  { id: 't37', groupId: 'internal', name: 'Документирование', plannedTime: 3, active: true },
  { id: 't38', groupId: 'internal', name: 'Тестирование', plannedTime: 4, active: true },
  { id: 't39', groupId: 'internal', name: 'Мониторинг', plannedTime: 1, active: true },
  { id: 't40', groupId: 'internal', name: 'Резервное копирование', plannedTime: 0.5, active: true },
  { id: 't41', groupId: 'errors', name: 'Другое', plannedTime: 1, active: true },
  { id: 't42', groupId: 'consult', name: 'Другое', plannedTime: 1, active: true },
];

export function getTaxonomyType(id: string | undefined): TaxonomyType | undefined {
  return TAXONOMY_TYPES.find(t => t.id === id);
}
export function getTaxonomyGroup(id: string | undefined): TaxonomyGroup | undefined {
  return TAXONOMY_GROUPS.find(g => g.id === id);
}

// ============ EMPLOYEES ============
export interface Employee {
  id: string;
  name: string;
  role: Role;
  line: string;
  avatar: string;
  availableHours: number;
}

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Петров А.В.', role: 'engineer', line: 'Первая линия', avatar: 'П', availableHours: 8 },
  { id: 'e2', name: 'Сидорова Е.К.', role: 'engineer', line: 'Вторая линия', avatar: 'С', availableHours: 8 },
  { id: 'e3', name: 'Козлов Д.М.', role: 'engineer', line: 'Вторая линия', avatar: 'К', availableHours: 8 },
  { id: 'e4', name: 'Новикова О.С.', role: 'engineer', line: 'Третья линия', avatar: 'Н', availableHours: 8 },
  { id: 'e5', name: 'Морозов И.П.', role: 'engineer', line: 'Первая линия', avatar: 'М', availableHours: 8 },
  { id: 'e6', name: 'Белова Т.Н.', role: 'classifier', line: 'Первая линия', avatar: 'Б', availableHours: 8 },
  { id: 'e7', name: 'Орлов С.А.', role: 'supervisor', line: 'Все линии', avatar: 'О', availableHours: 8 },
  { id: 'e8', name: 'Кузнецова Л.В.', role: 'engineer', line: 'Третья линия', avatar: 'Ку', availableHours: 8 },
];

// ============ CALLS ============
export interface Call {
  id: string;
  ticketId: string;
  direction: CallDirection;
  contact: string;
  client: string;
  phone: string;
  timestamp: number;
  duration: number; // minutes
  source: 'telephony' | 'usp' | 'manual';
  hasRecording: boolean;
  analysisStatus: CallAnalysisStatus;
  analysis?: {
    summary: string;
    theses: string[];
    decisions: string[];
    recommendedOutcome: string;
    quality: number;
    clientMood: 'positive' | 'neutral' | 'negative';
  };
  comment?: string;
}

// ============ SUBTASKS ============
export interface Subtask {
  id: string;
  ticketId: string;
  title: string;
  assignee: string;
  status: 'new' | 'in_progress' | 'done';
  plannedTime: number;
  factTime?: number;
}

// ============ CONNECTIONS ============
export interface Connection {
  id: string;
  ticketId: string;
  type: 'AnyDesk' | 'RDP' | 'Remote';
  timestamp: number;
  duration: number;
  comment: string;
}

// ============ SCENARIOS ============
export interface Scenario {
  id: string;
  name: string;
  description: string;
  active: boolean;
  affectedCount: number;
  conditions: {
    source?: TicketSource[];
    taxonomyGroup?: string[];
    minSimilar: number;
    contractType?: ContractType[];
  };
  actions: string[];
  priorityHint?: ExecutorPriority;
  showBanner: boolean;
  lastModified: number;
}

// ============ TICKET ============
export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  taxonomyTypeId?: string;
  taxonomyConfirmed?: boolean;
  priority: TicketPriority;
  client: string;
  clientType: 'external' | 'internal';
  line: string;
  assignee: string;
  assigneeId?: string;
  channel: TicketChannel;
  source: TicketSource;
  uspExternalNumber?: string;
  contractType: ContractType;
  executorPriority?: ExecutorPriority;
  executorPrioritySetAt?: number;
  executorPrioritySetBy?: string;
  scenarioId?: string;
  resolutionChannel?: ResolutionChannel;
  category?: string;
  product?: string;
  contract?: string;
  waitingReason?: WaitingReason;
  pauseReason?: PauseReason;
  pauseDuration?: number;
  pauseUntil?: number;
  autoTransitionAt?: number;
  slaExternal: number;
  slaInternal: number;
  slaPaused: boolean;
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
  resolutionSummary?: string;
  hours?: number;
  clientConfirmed?: boolean;
  interactions: Interaction[];
  auditLog: AuditEntry[];
  calls: Call[];
  connections: Connection[];
  subtasks: Subtask[];
}

export interface Interaction {
  id: string;
  type: 'message' | 'note' | 'call' | 'connection' | 'system' | 'task';
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
  type: 'sla' | 'transition' | 'comment' | 'assignment' | 'scenario' | 'ai';
  text: string;
  timestamp: number;
  read: boolean;
}

// ============ CONFIG ============
export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; soft: string; text: string }> = {
  new: { label: 'Новая', color: '#3B82F6', soft: '#EAF2FF', text: '#1D4ED8' },
  classification: { label: 'Классификация', color: '#F97316', soft: '#FFF3E8', text: '#C2410C' },
  in_progress: { label: 'В работе', color: '#10B981', soft: '#E8F8F1', text: '#047857' },
  approval: { label: 'Согласование', color: '#06B6D4', soft: '#ECFEFF', text: '#0E7490' },
  waiting: { label: 'Ждём ответа', color: '#F59E0B', soft: '#FFF7E8', text: '#B45309' },
  paused: { label: 'Пауза', color: '#64748B', soft: '#F1F5F9', text: '#475569' },
  closed: { label: 'Закрыта', color: '#8B5CF6', soft: '#F4EEFF', text: '#6D28D9' },
  archived: { label: 'Архив', color: '#475569', soft: '#E2E8F0', text: '#334155' },
};

export const SOURCE_CONFIG: Record<TicketSource, { label: string; color: string; soft: string; text: string; icon: string }> = {
  usp: { label: 'УСП', color: '#06B6D4', soft: '#ECFEFF', text: '#0E7490', icon: '🏛' },
  phone: { label: 'Телефон', color: '#2563EB', soft: '#EFF6FF', text: '#1D4ED8', icon: '📞' },
  email: { label: 'Почта', color: '#6B7280', soft: '#F3F6FB', text: '#475569', icon: '✉️' },
  chat: { label: 'Чат', color: '#8B5CF6', soft: '#F4EEFF', text: '#6D28D9', icon: '💬' },
  portal: { label: 'Портал', color: '#10B981', soft: '#ECFDF5', text: '#047857', icon: '🌐' },
  internal_task: { label: 'Внутренняя', color: '#64748B', soft: '#F1F5F9', text: '#475569', icon: '📋' },
  messenger: { label: 'Мессенджер', color: '#A855F7', soft: '#FAF5FF', text: '#7E22CE', icon: '💭' },
  manual: { label: 'Ручной ввод', color: '#9CA3AF', soft: '#F9FAFB', text: '#6B7280', icon: '✍️' },
};

export const EXECUTOR_PRIORITY_CONFIG: Record<ExecutorPriority, { label: string; color: string; soft: string; weight: number }> = {
  now: { label: 'Сейчас', color: '#EF4444', soft: '#FEECEC', weight: 1.0 },
  today: { label: 'Сегодня', color: '#F97316', soft: '#FFF3E8', weight: 0.7 },
  tomorrow: { label: 'Завтра', color: '#3B82F6', soft: '#EAF2FF', weight: 0.3 },
  this_week: { label: 'На этой неделе', color: '#64748B', soft: '#F1F5F9', weight: 0.1 },
  none: { label: 'Не задан', color: '#9CA3AF', soft: '#F9FAFB', weight: 0.7 },
};

export const STATUS_WEIGHTS: Record<TicketStatus, number> = {
  new: 0,
  classification: 0,
  in_progress: 1.0,
  approval: 0.3,
  waiting: 0.2,
  paused: 0.8,
  closed: 0,
  archived: 0,
};

export const TYPE_LABELS: Record<TicketType, string> = {
  incident: 'Инцидент', request: 'Запрос', problem: 'Проблема', other: 'Другое',
};
export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический',
};
export const ROLE_LABELS: Record<Role, string> = {
  operator: 'Оператор', engineer: 'Инженер', classifier: 'Классификатор',
  supervisor: 'Супервизор', lead: 'Лид', admin: 'Администратор', auditor: 'Аудитор',
};
export const CONTRACT_LABELS: Record<ContractType, string> = {
  government: 'Госконтракт', commercial: 'Коммерческий', internal: 'Внутренний',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  operator: ['dashboard', 'tickets', 'create', 'classify', 'comment'],
  engineer: ['dashboard', 'tickets', 'take', 'waiting', 'pause', 'comment', 'close', 'set_priority', 'calls', 'ai'],
  classifier: ['dashboard', 'tickets', 'classify', 'assign', 'see_kz', 'classifier_workspace'],
  supervisor: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel', 'see_kz'],
  lead: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel', 'reports', 'export', 'view_settings', 'view_scenarios'],
  admin: ['dashboard', 'tickets', 'reassign', 'transfer', 'bulk', 'close', 'archive', 'funnel', 'reports', 'export', 'settings', 'reset', 'scenarios', 'taxonomy', 'ai'],
  auditor: ['dashboard', 'tickets', 'audit', 'reports', 'view_scenarios', 'see_kz'],
};

export const CLIENTS = ['ООО «Ромашка»', 'АО «Технопарк»', 'ИП Иванов И.И.', 'ГУП «Городские системы»', 'ООО «Прогресс»', 'АО «Стандарт»', 'ООО «ИнфоСервис»'];
export const LINES = ['Первая линия', 'Вторая линия', 'Третья линия', 'Эскалация'];

// ============ KZ CALCULATION ============
export function calculateEmployeeKZ(employeeId: string, tickets: Ticket[]): {
  activeTickets: number;
  plannedTime: number;
  weightedLoad: number;
  availableTime: number;
  kz: number;
  byPriority: Record<ExecutorPriority, number>;
  byStatus: Record<TicketStatus, number>;
} {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  const employeeTickets = tickets.filter(t => t.assigneeId === employeeId && !['closed', 'archived'].includes(t.status));
  const activeTickets = employeeTickets.length;
  let plannedTime = 0;
  let weightedLoad = 0;
  const byPriority: Record<ExecutorPriority, number> = { now: 0, today: 0, tomorrow: 0, this_week: 0, none: 0 };
  const byStatus: Record<TicketStatus, number> = { new: 0, classification: 0, in_progress: 0, approval: 0, waiting: 0, paused: 0, closed: 0, archived: 0 };

  employeeTickets.forEach(t => {
    const taxType = getTaxonomyType(t.taxonomyTypeId);
    const pt = taxType?.plannedTime || 1;
    plannedTime += pt;
    const sw = STATUS_WEIGHTS[t.status];
    const pw = EXECUTOR_PRIORITY_CONFIG[t.executorPriority || 'none'].weight;
    weightedLoad += pt * sw * pw;
    byPriority[t.executorPriority || 'none']++;
    byStatus[t.status]++;
  });

  const availableTime = employee?.availableHours || 8;
  const kz = availableTime > 0 ? weightedLoad / availableTime : 0;
  return { activeTickets, plannedTime, weightedLoad, availableTime, kz, byPriority, byStatus };
}

// ============ DEMO DATA GENERATION ============
function generateDemoData(): { tickets: Ticket[]; scenarios: Scenario[] } {
  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;
  const tickets: Ticket[] = [];
  let counter = 1042;

  function makeTicket(overrides: Partial<Ticket>): Ticket {
    counter++;
    const createdAt = overrides.createdAt || now - Math.random() * 7 * day;
    const id = uuid();
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
      assignee: overrides.assignee || 'Не назначен',
      assigneeId: overrides.assigneeId,
      channel: overrides.channel || 'email',
      source: overrides.source || 'email',
      uspExternalNumber: overrides.uspExternalNumber,
      contractType: overrides.contractType || 'commercial',
      executorPriority: overrides.executorPriority,
      executorPrioritySetAt: overrides.executorPrioritySetAt,
      executorPrioritySetBy: overrides.executorPrioritySetBy,
      taxonomyTypeId: overrides.taxonomyTypeId,
      taxonomyConfirmed: overrides.taxonomyConfirmed,
      scenarioId: overrides.scenarioId,
      slaExternal: overrides.slaExternal || 480,
      slaInternal: overrides.slaInternal || 240,
      slaPaused: overrides.slaPaused || false,
      createdAt,
      updatedAt: overrides.updatedAt || createdAt + Math.random() * hour,
      interactions: overrides.interactions || [],
      auditLog: overrides.auditLog || [{ id: uuid(), action: 'Создание заявки', author: 'Система', timestamp: createdAt }],
      calls: overrides.calls || [],
      connections: overrides.connections || [],
      subtasks: overrides.subtasks || [],
    };
  }

  const emp = (i: number) => EMPLOYEES[i];
  const audit = (action: string, author = 'Система', ts = now) => [{ id: uuid(), action, author, timestamp: ts }];

  // ============ НОВЫЕ (8) ============
  tickets.push(makeTicket({ subject: 'Не работает принтер в офисе', client: 'ООО «Ромашка»', status: 'new', type: 'incident', priority: 'high', source: 'phone', contractType: 'government', createdAt: now - 2 * hour }));
  tickets.push(makeTicket({ subject: 'Запрос на установку ПО', client: 'АО «Технопарк»', status: 'new', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10234', contractType: 'government', createdAt: now - 4 * hour }));
  tickets.push(makeTicket({ subject: 'Ошибка при выгрузке отчёта', client: 'ИП Иванов И.И.', status: 'new', type: 'incident', priority: 'critical', source: 'usp', uspExternalNumber: 'УСП-10235', contractType: 'government', createdAt: now - 1 * hour }));
  tickets.push(makeTicket({ subject: 'Кон654sultation по договору', client: 'ГУП «Городские системы»', status: 'new', type: 'other', priority: 'low', source: 'email', createdAt: now - 30 * 60000 }));
  tickets.push(makeTicket({ subject: 'Массовая ошибка отчётности', client: 'ООО «Прогресс»', status: 'new', type: 'incident', priority: 'critical', source: 'usp', uspExternalNumber: 'УСП-10236', contractType: 'government', scenarioId: 's1', createdAt: now - 45 * 60000 }));
  tickets.push(makeTicket({ subject: 'Обмен с банком не работает', client: 'АО «Стандарт»', status: 'new', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10237', contractType: 'government', createdAt: now - 1.5 * hour }));
  tickets.push(makeTicket({ subject: 'Внутренняя задача — мониторинг', client: 'Внутренний', clientType: 'internal', status: 'new', type: 'request', priority: 'low', source: 'internal_task', contractType: 'internal', createdAt: now - 3 * hour }));
  tickets.push(makeTicket({ subject: 'Запрос из мессенджера', client: 'ООО «ИнфоСервис»', status: 'new', type: 'request', priority: 'medium', source: 'messenger', createdAt: now - 20 * 60000 }));

  // ============ КЛАССИФИКАЦИЯ (6) ============
  tickets.push(makeTicket({ subject: 'Проблема с авторизацией', client: 'ООО «Ромашка»', status: 'classification', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10200', contractType: 'government', createdAt: now - 5 * hour }));
  tickets.push(makeTicket({ subject: 'Запрос на расширение лицензии', client: 'АО «Технопарк»', status: 'classification', type: 'request', priority: 'medium', source: 'portal', contractType: 'commercial', createdAt: now - 6 * hour }));
  tickets.push(makeTicket({ subject: 'Неясная ошибка модуля', client: 'ИП Иванов И.И.', status: 'classification', type: 'other', priority: 'low', source: 'email', createdAt: now - 3 * hour }));
  tickets.push(makeTicket({ subject: 'Ошибка проведения документа', client: 'ООО «Прогресс»', status: 'classification', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10201', contractType: 'government', createdAt: now - 4 * hour }));
  tickets.push(makeTicket({ subject: 'Настройка прав доступа', client: 'ГУП «Городские системы»', status: 'classification', type: 'request', priority: 'medium', source: 'phone', createdAt: now - 7 * hour }));
  tickets.push(makeTicket({ subject: 'Массовая ошибка УСП — партия 2', client: 'АО «Стандарт»', status: 'classification', type: 'incident', priority: 'critical', source: 'usp', uspExternalNumber: 'УСП-10202', contractType: 'government', scenarioId: 's1', createdAt: now - 2 * hour }));

  // ============ В РАБОТЕ (12) ============
  tickets.push(makeTicket({ subject: 'Настройка VPN', client: 'ООО «Ромашка»', status: 'in_progress', type: 'request', priority: 'medium', source: 'portal', contractType: 'commercial', assignee: 'Петров А.В.', assigneeId: 'e1', taxonomyTypeId: 't16', executorPriority: 'now', executorPrioritySetBy: 'Петров А.В.', createdAt: now - 2 * day }));
  tickets.push(makeTicket({ subject: 'Обновление сервера БД', client: 'АО «Технопарк»', status: 'in_progress', type: 'problem', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10150', contractType: 'government', assignee: 'Козлов Д.М.', assigneeId: 'e3', taxonomyTypeId: 't5', executorPriority: 'now', executorPrioritySetBy: 'Козлов Д.М.', slaExternal: 240, createdAt: now - 3 * day }));
  tickets.push(makeTicket({ subject: 'Перенос данных', client: 'ГУП «Городские системы»', status: 'in_progress', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10151', contractType: 'government', assignee: 'Сидорова Е.К.', assigneeId: 'e2', taxonomyTypeId: 't34', executorPriority: 'today', executorPrioritySetBy: 'Сидорова Е.К.', createdAt: now - 1.5 * day }));
  tickets.push(makeTicket({ subject: 'Диагностика сети', client: 'ООО «Ромашка»', status: 'in_progress', type: 'incident', priority: 'high', source: 'phone', contractType: 'commercial', assignee: 'Морозов И.П.', assigneeId: 'e5', taxonomyTypeId: 't8', executorPriority: 'now', executorPrioritySetBy: 'Морозов И.П.', createdAt: now - 4 * hour }));
  tickets.push(makeTicket({ subject: 'Замена оборудования', client: 'ИП Иванов И.И.', status: 'in_progress', type: 'request', priority: 'low', source: 'email', contractType: 'commercial', assignee: 'Новикова О.С.', assigneeId: 'e4', taxonomyTypeId: 't33', executorPriority: 'tomorrow', executorPrioritySetBy: 'Новикова О.С.', createdAt: now - 5 * day }));
  tickets.push(makeTicket({ subject: 'Ошибка интеграции с CRM', client: 'АО «Технопарк»', status: 'in_progress', type: 'incident', priority: 'critical', source: 'usp', uspExternalNumber: 'УСП-10152', contractType: 'government', assignee: 'Петров А.В.', assigneeId: 'e1', taxonomyTypeId: 't9', executorPriority: 'now', executorPrioritySetBy: 'Петров А.В.', slaExternal: 120, createdAt: now - 8 * hour }));
  tickets.push(makeTicket({ subject: 'Настройка резервного копирования', client: 'ГУП «Городские системы»', status: 'in_progress', type: 'request', priority: 'medium', source: 'portal', contractType: 'government', assignee: 'Козлов Д.М.', assigneeId: 'e3', taxonomyTypeId: 't40', executorPriority: 'today', executorPrioritySetBy: 'Козлов Д.М.', createdAt: now - 2 * day }));
  tickets.push(makeTicket({ subject: 'Проблема с почтовым сервером', client: 'ООО «Ромашка»', status: 'in_progress', type: 'incident', priority: 'high', source: 'phone', contractType: 'commercial', assignee: 'Сидорова Е.К.', assigneeId: 'e2', taxonomyTypeId: 't6', executorPriority: 'now', executorPrioritySetBy: 'Сидорова Е.К.', createdAt: now - 10 * hour }));
  tickets.push(makeTicket({ subject: 'Настройка отчёта по НДС', client: 'ООО «Прогресс»', status: 'in_progress', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10153', contractType: 'government', assignee: 'Новикова О.С.', assigneeId: 'e4', taxonomyTypeId: 't12', executorPriority: 'today', executorPrioritySetBy: 'Новикова О.С.', createdAt: now - 1.2 * day }));
  tickets.push(makeTicket({ subject: 'Доработка печатной формы', client: 'АО «Стандарт»', status: 'in_progress', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10154', contractType: 'commercial', assignee: 'Кузнецова Л.В.', assigneeId: 'e8', taxonomyTypeId: 't3', executorPriority: 'this_week', executorPrioritySetBy: 'Кузнецова Л.В.', createdAt: now - 1.8 * day }));
  tickets.push(makeTicket({ subject: 'Обмен с маркировкой', client: 'ООО «ИнфоСервис»', status: 'in_progress', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10155', contractType: 'government', assignee: 'Морозов И.П.', assigneeId: 'e5', taxonomyTypeId: 't19', executorPriority: 'now', executorPrioritySetBy: 'Морозов И.П.', createdAt: now - 6 * hour }));
  tickets.push(makeTicket({ subject: 'Обучение пользователя', client: 'ГУП «Городские системы»', status: 'in_progress', type: 'request', priority: 'low', source: 'phone', contractType: 'government', assignee: 'Петров А.В.', assigneeId: 'e1', taxonomyTypeId: 't28', executorPriority: 'tomorrow', executorPrioritySetBy: 'Петров А.В.', createdAt: now - 14 * hour }));

  // ============ СОГЛАСОВАНИЕ (5) ============
  tickets.push(makeTicket({ subject: 'Согласование миграции данных', client: 'АО «Технопарк»', status: 'approval', type: 'request', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10100', contractType: 'government', assignee: 'Козлов Д.М.', assigneeId: 'e3', taxonomyTypeId: 't34', executorPriority: 'today', createdAt: now - 2 * day }));
  tickets.push(makeTicket({ subject: 'Согласование изменения прав', client: 'ООО «Ромашка»', status: 'approval', type: 'request', priority: 'medium', source: 'portal', contractType: 'commercial', assignee: 'Сидорова Е.К.', assigneeId: 'e2', taxonomyTypeId: 't23', executorPriority: 'today', createdAt: now - 1.5 * day }));
  tickets.push(makeTicket({ subject: 'Согласование обновления платформы', client: 'ГУП «Городские системы»', status: 'approval', type: 'request', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10101', contractType: 'government', assignee: 'Новикова О.С.', assigneeId: 'e4', taxonomyTypeId: 't5', executorPriority: 'tomorrow', createdAt: now - 3 * day }));
  tickets.push(makeTicket({ subject: 'Согласование интеграции', client: 'ООО «Прогресс»', status: 'approval', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10102', contractType: 'government', assignee: 'Морозов И.П.', assigneeId: 'e5', taxonomyTypeId: 't33', executorPriority: 'this_week', createdAt: now - 2.5 * day }));
  tickets.push(makeTicket({ subject: 'Согласование платных работ', client: 'АО «Стандарт»', status: 'approval', type: 'request', priority: 'medium', source: 'email', contractType: 'commercial', assignee: 'Кузнецова Л.В.', assigneeId: 'e8', taxonomyTypeId: 't31', executorPriority: 'today', createdAt: now - 1 * day }));

  // ============ ЖДЁМ ОТВЕТА (7) ============
  tickets.push(makeTicket({ subject: 'Ожидание подтверждения от клиента', client: 'АО «Технопарк»', status: 'waiting', type: 'incident', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10080', contractType: 'government', createdAt: now - 3 * day, waitingReason: 'client', autoTransitionAt: now + 2 * hour, slaPaused: true, assignee: 'Петров А.В.', assigneeId: 'e1' }));
  tickets.push(makeTicket({ subject: 'Ожидание смежного отдела', client: 'ООО «Ромашка»', status: 'waiting', type: 'problem', priority: 'high', source: 'phone', contractType: 'commercial', createdAt: now - 2 * day, waitingReason: 'department', autoTransitionAt: now + 5 * hour, slaPaused: true, assignee: 'Козлов Д.М.', assigneeId: 'e3' }));
  tickets.push(makeTicket({ subject: 'Ожидание внешней системы', client: 'ИП Иванов И.И.', status: 'waiting', type: 'incident', priority: 'medium', source: 'email', contractType: 'commercial', createdAt: now - 4 * day, waitingReason: 'external_system', slaPaused: true, assignee: 'Морозов И.П.', assigneeId: 'e5' }));
  tickets.push(makeTicket({ subject: 'Ждём ответ от вендора', client: 'ГУП «Городские системы»', status: 'waiting', type: 'request', priority: 'low', source: 'portal', contractType: 'government', createdAt: now - 5 * day, waitingReason: 'other', slaPaused: true, assignee: 'Новикова О.С.', assigneeId: 'e4' }));
  tickets.push(makeTicket({ subject: 'Ожидание данных от клиента', client: 'ООО «Прогресс»', status: 'waiting', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-10081', contractType: 'government', createdAt: now - 1.5 * day, waitingReason: 'client', autoTransitionAt: now + 8 * hour, slaPaused: true, assignee: 'Сидорова Е.К.', assigneeId: 'e2' }));
  tickets.push(makeTicket({ subject: 'Ожидание лицензии', client: 'АО «Стандарт»', status: 'waiting', type: 'request', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10082', contractType: 'commercial', createdAt: now - 2.5 * day, waitingReason: 'external_system', slaPaused: true, assignee: 'Кузнецова Л.В.', assigneeId: 'e8' }));
  tickets.push(makeTicket({ subject: 'Ожидание доступа', client: 'ООО «ИнфоСервис»', status: 'waiting', type: 'request', priority: 'medium', source: 'chat', contractType: 'commercial', createdAt: now - 1 * day, waitingReason: 'client', autoTransitionAt: now + 12 * hour, slaPaused: true, assignee: 'Петров А.В.', assigneeId: 'e1' }));

  // ============ ПАУЗА (6) ============
  tickets.push(makeTicket({ subject: 'Пауза — ожидание запчастей', client: 'ООО «Ромашка»', status: 'paused', type: 'incident', priority: 'medium', source: 'phone', contractType: 'commercial', createdAt: now - 4 * day, pauseReason: 'external_system', pauseDuration: 480, pauseUntil: now + 6 * hour, slaPaused: true, assignee: 'Петров А.В.', assigneeId: 'e1' }));
  tickets.push(makeTicket({ subject: 'Пауза — согласование с клиентом', client: 'АО «Технопарк»', status: 'paused', type: 'request', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10060', contractType: 'government', createdAt: now - 3 * day, pauseReason: 'client', pauseDuration: 240, pauseUntil: now + 3 * hour, slaPaused: true, assignee: 'Сидорова Е.К.', assigneeId: 'e2' }));
  tickets.push(makeTicket({ subject: 'Пауза — внутренний процесс', client: 'ИП Иванов И.И.', status: 'paused', type: 'problem', priority: 'medium', source: 'email', contractType: 'commercial', createdAt: now - 2 * day, pauseReason: 'internal', pauseDuration: 120, pauseUntil: now + 1 * hour, slaPaused: false, assignee: 'Козлов Д.М.', assigneeId: 'e3' }));
  tickets.push(makeTicket({ subject: 'Пауза — ожидание документации', client: 'ГУП «Городские системы»', status: 'paused', type: 'request', priority: 'low', source: 'portal', contractType: 'government', createdAt: now - 5 * day, pauseReason: 'client', pauseDuration: 480, pauseUntil: now + 10 * hour, slaPaused: true, assignee: 'Новикова О.С.', assigneeId: 'e4' }));
  tickets.push(makeTicket({ subject: 'Пауза — ожидание смежников', client: 'ООО «Прогресс»', status: 'paused', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10061', contractType: 'government', createdAt: now - 2 * day, pauseReason: 'department', pauseDuration: 240, pauseUntil: now + 4 * hour, slaPaused: true, assignee: 'Морозов И.П.', assigneeId: 'e5' }));
  tickets.push(makeTicket({ subject: 'Пауза — тестирование', client: 'АО «Стандарт»', status: 'paused', type: 'request', priority: 'medium', source: 'chat', contractType: 'commercial', createdAt: now - 1.5 * day, pauseReason: 'internal', pauseDuration: 180, pauseUntil: now + 2 * hour, slaPaused: false, assignee: 'Кузнецова Л.В.', assigneeId: 'e8' }));

  // ============ ЗАКРЫТА (9) ============
  tickets.push(makeTicket({ subject: 'Установка обновления', client: 'ООО «Ромашка»', status: 'closed', type: 'request', priority: 'low', source: 'portal', contractType: 'commercial', createdAt: now - 7 * day, closedAt: now - 1 * day, resolutionChannel: 'remote', resolutionSummary: 'Обновление установлено успешно', hours: 1.5, taxonomyTypeId: 't1' }));
  tickets.push(makeTicket({ subject: 'Консультация по API', client: 'АО «Технопарк»', status: 'closed', type: 'request', priority: 'medium', source: 'email', contractType: 'commercial', createdAt: now - 6 * day, closedAt: now - 2 * day, resolutionChannel: 'correspondence', resolutionSummary: 'Предоставлена документация', hours: 0.5, taxonomyTypeId: 't27' }));
  tickets.push(makeTicket({ subject: 'Восстановление данных', client: 'ГУП «Городские системы»', status: 'closed', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10030', contractType: 'government', createdAt: now - 5 * day, closedAt: now - 3 * day, resolutionChannel: 'remote', resolutionSummary: 'Данные восстановлены из бэкапа', hours: 3, taxonomyTypeId: 't10' }));
  tickets.push(makeTicket({ subject: 'Настройка мониторинга', client: 'ИП Иванов И.И.', status: 'closed', type: 'request', priority: 'medium', source: 'phone', contractType: 'commercial', createdAt: now - 4 * day, closedAt: now - 1 * day, resolutionChannel: 'onsite', resolutionSummary: 'Мониторинг настроен и протестирован', hours: 4, taxonomyTypeId: 't39' }));
  tickets.push(makeTicket({ subject: 'Инцидент с почтой', client: 'ООО «Ромашка»', status: 'closed', type: 'incident', priority: 'critical', source: 'phone', contractType: 'commercial', createdAt: now - 3 * day, closedAt: now - 12 * hour, resolutionChannel: 'phone', resolutionSummary: 'Проблема решена перезапуском службы', hours: 2, taxonomyTypeId: 't6' }));
  tickets.push(makeTicket({ subject: 'Сброс пароля', client: 'ООО «Прогресс»', status: 'closed', type: 'request', priority: 'low', source: 'usp', uspExternalNumber: 'УСП-10031', contractType: 'government', createdAt: now - 2 * day, closedAt: now - 6 * hour, resolutionChannel: 'remote', resolutionSummary: 'Пароль сброшен, доступ восстановлен', hours: 0.3, taxonomyTypeId: 't22' }));
  tickets.push(makeTicket({ subject: 'Настройка обмена с банком', client: 'АО «Стандарт»', status: 'closed', type: 'request', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-10032', contractType: 'government', createdAt: now - 6 * day, closedAt: now - 2 * day, resolutionChannel: 'remote', resolutionSummary: 'Обмен настроен и протестирован', hours: 3, taxonomyTypeId: 't16' }));
  tickets.push(makeTicket({ subject: 'Добавление пользователя', client: 'ГУП «Городские системы»', status: 'closed', type: 'request', priority: 'low', source: 'portal', contractType: 'government', createdAt: now - 3 * day, closedAt: now - 1 * day, resolutionChannel: 'remote', resolutionSummary: 'Пользователь добавлен, права назначены', hours: 0.5, taxonomyTypeId: 't21' }));
  tickets.push(makeTicket({ subject: 'Консультация по НДС', client: 'ООО «ИнфоСервис»', status: 'closed', type: 'request', priority: 'medium', source: 'chat', contractType: 'commercial', createdAt: now - 4 * day, closedAt: now - 1.5 * day, resolutionChannel: 'correspondence', resolutionSummary: 'Даны разъяснения по учёту НДС', hours: 1, taxonomyTypeId: 't26' }));

  // ============ АРХИВ (5) ============
  tickets.push(makeTicket({ subject: 'Архивная заявка — переезд', client: 'ООО «Ромашка»', status: 'archived', type: 'request', priority: 'low', source: 'phone', contractType: 'commercial', createdAt: now - 30 * day, closedAt: now - 25 * day, resolutionChannel: 'onsite', resolutionSummary: 'Переезд выполнен', hours: 8 }));
  tickets.push(makeTicket({ subject: 'Архивная заявка — аудит', client: 'АО «Технопарк»', status: 'archived', type: 'request', priority: 'medium', source: 'email', contractType: 'commercial', createdAt: now - 45 * day, closedAt: now - 40 * day, resolutionChannel: 'correspondence', resolutionSummary: 'Аудит пройден', hours: 2 }));
  tickets.push(makeTicket({ subject: 'Архивная заявка — замена', client: 'ГУП «Городские системы»', status: 'archived', type: 'incident', priority: 'high', source: 'usp', uspExternalNumber: 'УСП-9900', contractType: 'government', createdAt: now - 60 * day, closedAt: now - 55 * day, resolutionChannel: 'remote', resolutionSummary: 'Оборудование заменено', hours: 5 }));
  tickets.push(makeTicket({ subject: 'Архив — настройка отчёта', client: 'ООО «Прогресс»', status: 'archived', type: 'request', priority: 'medium', source: 'usp', uspExternalNumber: 'УСП-9901', contractType: 'government', createdAt: now - 40 * day, closedAt: now - 35 * day, resolutionChannel: 'remote', resolutionSummary: 'Отчёт настроен', hours: 4 }));
  tickets.push(makeTicket({ subject: 'Архив — внутренняя задача', client: 'Внутренний', clientType: 'internal', status: 'archived', type: 'request', priority: 'low', source: 'internal_task', contractType: 'internal', createdAt: now - 50 * day, closedAt: now - 48 * day, resolutionChannel: 'remote', resolutionSummary: 'Задача выполнена', hours: 2 }));

  // SLA overdue
  tickets[14].slaExternal = 60; tickets[14].createdAt = now - 5 * hour;
  tickets[17].slaExternal = 120; tickets[17].createdAt = now - 6 * hour;
  tickets[20].slaExternal = 180; tickets[20].createdAt = now - 4 * hour;

  // Calls for some tickets
  const analyzedCall: Call = {
    id: uuid(), ticketId: tickets[14].id, direction: 'incoming', contact: 'ООО «Ромашка»',
    client: 'ООО «Ромашка»', phone: '+7 900 000-00-01', timestamp: now - 4 * hour, duration: 12,
    source: 'telephony', hasRecording: true, analysisStatus: 'analyzed',
    analysis: {
      summary: 'Клиент сообщил о проблеме с запуском 1С. Уточнены версии ПО. Согласован удалённый доступ.',
      theses: ['Клиент сообщил о проблеме запуска', 'Уточнены версии ПО', 'Запрошен удалённый доступ', 'Согласован выезд при необходимости'],
      decisions: ['Обновить конфигурацию', 'Клиент пришлёт пароль', 'Повторный звонок завтра'],
      recommendedOutcome: 'Проблема решена удалённо, обновление выполнено',
      quality: 85, clientMood: 'neutral',
    }
  };
  tickets[14].calls = [analyzedCall];

  tickets[15].calls = [{
    id: uuid(), ticketId: tickets[15].id, direction: 'outgoing', contact: 'АО «Технопарк»',
    client: 'АО «Технопарк»', phone: '+7 900 000-00-02', timestamp: now - 3 * hour, duration: 8,
    source: 'usp', hasRecording: true, analysisStatus: 'analyzed',
    analysis: {
      summary: 'Звонок по вопросу обновления сервера. Клиент подтвердил время простоя.',
      theses: ['Обсуждено время обновления', 'Подтверждён простой 2 часа', 'Согласован план работ'],
      decisions: ['Обновление в ночь с пятницы на субботу', 'Клиент обеспечит доступ'],
      recommendedOutcome: 'Обновление запланировано',
      quality: 90, clientMood: 'positive',
    }
  }];

  tickets[21].calls = [{
    id: uuid(), ticketId: tickets[21].id, direction: 'incoming', contact: 'ГУП «Городские системы»',
    client: 'ГУП «Городские системы»', phone: '+7 900 000-00-03', timestamp: now - 2 * hour, duration: 15,
    source: 'telephony', hasRecording: true, analysisStatus: 'analyzed',
    analysis: {
      summary: 'Клиент сообщил о проблеме с почтовым сервером. Проведена диагностика.',
      theses: ['Проблема с доставкой писем', 'Проверены настройки DNS', 'Выявлена ошибка в конфигурации'],
      decisions: ['Перезапустить службу', 'Обновить конфигурацию', 'Проверить через час'],
      recommendedOutcome: 'Проблема решена перезапуском службы',
      quality: 80, clientMood: 'negative',
    }
  }];

  tickets[16].calls = [{
    id: uuid(), ticketId: tickets[16].id, direction: 'incoming', contact: 'ИП Иванов И.И.',
    client: 'ИП Иванов И.И.', phone: '+7 900 000-00-04', timestamp: now - 5 * hour, duration: 6,
    source: 'telephony', hasRecording: false, analysisStatus: 'not_analyzed'
  }];

  tickets[25].calls = [{
    id: uuid(), ticketId: tickets[25].id, direction: 'missed', contact: 'ООО «Прогресс»',
    client: 'ООО «Прогресс»', phone: '+7 900 000-00-05', timestamp: now - 7 * hour, duration: 0,
    source: 'telephony', hasRecording: false, analysisStatus: 'not_analyzed'
  }];

  tickets[26].calls = [{
    id: uuid(), ticketId: tickets[26].id, direction: 'outgoing', contact: 'АО «Стандарт»',
    client: 'АО «Стандарт»', phone: '+7 900 000-00-06', timestamp: now - 4 * hour, duration: 10,
    source: 'usp', hasRecording: true, analysisStatus: 'not_analyzed'
  }];

  tickets[27].calls = [{
    id: uuid(), ticketId: tickets[27].id, direction: 'incoming', contact: 'ООО «ИнфоСервис»',
    client: 'ООО «ИнфоСервис»', phone: '+7 900 000-00-07', timestamp: now - 3 * hour, duration: 7,
    source: 'telephony', hasRecording: true, analysisStatus: 'not_analyzed'
  }];

  tickets[18].calls = [{
    id: uuid(), ticketId: tickets[18].id, direction: 'incoming', contact: 'ГУП «Городские системы»',
    client: 'ГУП «Городские системы»', phone: '+7 900 000-00-08', timestamp: now - 6 * hour, duration: 9,
    source: 'telephony', hasRecording: true, analysisStatus: 'not_analyzed'
  }];

  tickets[19].calls = [{
    id: uuid(), ticketId: tickets[19].id, direction: 'outgoing', contact: 'ООО «Ромашка»',
    client: 'ООО «Ромашка»', phone: '+7 900 000-00-09', timestamp: now - 8 * hour, duration: 14,
    source: 'telephony', hasRecording: true, analysisStatus: 'not_analyzed'
  }];

  tickets[20].calls = [{
    id: uuid(), ticketId: tickets[20].id, direction: 'incoming', contact: 'АО «Технопарк»',
    client: 'АО «Технопарк»', phone: '+7 900 000-00-10', timestamp: now - 5 * hour, duration: 11,
    source: 'telephony', hasRecording: true, analysisStatus: 'not_analyzed'
  }];

  // Connections
  tickets[14].connections = [{ id: uuid(), ticketId: tickets[14].id, type: 'AnyDesk', timestamp: now - 3 * hour, duration: 45, comment: 'Диагностика и обновление' }];
  tickets[15].connections = [{ id: uuid(), ticketId: tickets[15].id, type: 'RDP', timestamp: now - 2 * hour, duration: 120, comment: 'Обновление сервера' }];
  tickets[16].connections = [{ id: uuid(), ticketId: tickets[16].id, type: 'AnyDesk', timestamp: now - 1.5 * hour, duration: 30, comment: 'Перенос данных' }];
  tickets[17].connections = [{ id: uuid(), ticketId: tickets[17].id, type: 'RDP', timestamp: now - 3.5 * hour, duration: 60, comment: 'Диагностика сети' }];
  tickets[21].connections = [{ id: uuid(), ticketId: tickets[21].id, type: 'Remote', timestamp: now - 1 * hour, duration: 40, comment: 'Настройка почты' }];

  // Subtasks
  tickets[14].subtasks = [
    { id: uuid(), ticketId: tickets[14].id, title: 'Диагностика', assignee: 'Петров А.В.', status: 'done', plannedTime: 1, factTime: 0.8 },
    { id: uuid(), ticketId: tickets[14].id, title: 'Обновление', assignee: 'Петров А.В.', status: 'in_progress', plannedTime: 2, factTime: 1 },
  ];
  tickets[15].subtasks = [
    { id: uuid(), ticketId: tickets[15].id, title: 'Бэкап', assignee: 'Козлов Д.М.', status: 'done', plannedTime: 1, factTime: 1.2 },
    { id: uuid(), ticketId: tickets[15].id, title: 'Обновление', assignee: 'Козлов Д.М.', status: 'in_progress', plannedTime: 3, factTime: 2 },
  ];

  // Interactions
  tickets[14].interactions = [
    { id: uuid(), type: 'message', author: 'Петров А.В.', text: 'Добрый день! Начал диагностику проблемы.', createdAt: now - 4 * hour, visibleToClient: true },
    { id: uuid(), type: 'note', author: 'Петров А.В.', text: 'Проблема на стороне сетевого оборудования клиента.', createdAt: now - 3 * hour, visibleToClient: false },
    { id: uuid(), type: 'message', author: 'Петров А.В.', text: 'Обнаружил проблему. Требуется перезагрузка коммутатора.', createdAt: now - 2 * hour, visibleToClient: true },
  ];
  tickets[0].interactions = [
    { id: uuid(), type: 'system', author: 'Система', text: 'Заявка создана автоматически из телефонии', createdAt: now - 2 * hour, visibleToClient: false },
  ];

  // Scenarios
  const scenarios: Scenario[] = [
    {
      id: 's1', name: 'Массовый инцидент УСП',
      description: 'Применяется при массовых заявках из УСП по ошибке отчётности.',
      active: true, affectedCount: 12,
      conditions: { source: ['usp'], taxonomyGroup: ['errors'], minSimilar: 5, contractType: ['government'] },
      actions: ['Добавить тег «Массовый инцидент»', 'Назначить линию 2', 'Статус «Классификация»', 'Показать баннер в списке', 'Предложить общий черновик ответа'],
      priorityHint: 'today', showBanner: true, lastModified: now - 2 * hour,
    },
    {
      id: 's2', name: 'Авария по УСП',
      description: 'Активируется при недоступности сервиса УСП.',
      active: false, affectedCount: 0,
      conditions: { source: ['usp'], minSimilar: 10 },
      actions: ['Автоматически ставить статус «Ждём ответа»', 'Информировать супервизора'],
      showBanner: false, lastModified: now - 1 * day,
    },
    {
      id: 's3', name: 'Пиковая нагрузка',
      description: 'При превышении 20 заявок в очереди.',
      active: false, affectedCount: 0,
      conditions: { minSimilar: 20 },
      actions: ['Перевести часть заявок на линию 2', 'Уведомить лида'],
      showBanner: false, lastModified: now - 3 * day,
    },
    {
      id: 's4', name: 'Срочные госконтракты',
      description: 'Приоритетная обработка заявок по госконтрактам с критическим приоритетом.',
      active: true, affectedCount: 5,
      conditions: { contractType: ['government'], minSimilar: 1 },
      actions: ['Подсказка приоритета «Сейчас»', 'Выделить в отдельную очередь'],
      priorityHint: 'now', showBanner: true, lastModified: now - 5 * hour,
    },
  ];

  return { tickets, scenarios };
}

function generateNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: uuid(), type: 'sla', text: 'HD-1049 — SLA просрочено на 1ч 05м', timestamp: now - 300000, read: false },
    { id: uuid(), type: 'sla', text: 'HD-1051 — SLA истекает через 15 минут', timestamp: now - 600000, read: false },
    { id: uuid(), type: 'transition', text: 'HD-1055 — автопереход в «В работе» через 2ч', timestamp: now - 900000, read: false },
    { id: uuid(), type: 'scenario', text: 'Активирован сценарий «Массовый инцидент УСП»', timestamp: now - 1000000, read: false },
    { id: uuid(), type: 'comment', text: 'Новый комментарий в HD-1048 от Петров А.В.', timestamp: now - 1200000, read: true },
    { id: uuid(), type: 'assignment', text: 'HD-1053 назначена на Козлов Д.М.', timestamp: now - 1800000, read: true },
    { id: uuid(), type: 'ai', text: 'AI-анализ звонка HD-1057 завершён', timestamp: now - 2000000, read: true },
  ];
}

// ============ STORE ============
const STORAGE_KEY = 'helpdesk_demo_data_v2';
const SETTINGS_KEY = 'helpdesk_settings';
const ROLE_KEY = 'helpdesk_role';
const NOTIFICATIONS_KEY = 'helpdesk_notifications';
const SCENARIOS_KEY = 'helpdesk_scenarios';

export interface Settings {
  autoTransitionHours: number;
  autoArchiveDays: number;
  slaWarningMinutes: number;
  externalSla: number;
  internalSla: number;
}

const DEFAULT_SETTINGS: Settings = {
  autoTransitionHours: 24, autoArchiveDays: 30, slaWarningMinutes: 30, externalSla: 480, internalSla: 240,
};

export function loadTickets(): Ticket[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  const { tickets } = generateDemoData();
  saveTickets(tickets);
  return tickets;
}
export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}
export function loadScenarios(): Scenario[] {
  try {
    const data = localStorage.getItem(SCENARIOS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  const { scenarios } = generateDemoData();
  saveScenarios(scenarios);
  return scenarios;
}
export function saveScenarios(scenarios: Scenario[]) {
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
}
export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { ...DEFAULT_SETTINGS };
}
export function saveSettings(settings: Settings) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
export function loadRole(): Role { return (localStorage.getItem(ROLE_KEY) as Role) || 'admin'; }
export function saveRole(role: Role) { localStorage.setItem(ROLE_KEY, role); }
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
  localStorage.removeItem(SCENARIOS_KEY);
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
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Просрочено';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 24) { const days = Math.floor(hours / 24); return `${days}д ${hours % 24}ч`; }
  return `${hours}ч ${minutes}м`;
}
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

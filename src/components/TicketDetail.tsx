import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useToast } from './Toast';
import { Ticket, TicketStatus, STATUS_CONFIG, TYPE_LABELS, PRIORITY_LABELS, SOURCE_CONFIG, EXECUTOR_PRIORITY_CONFIG, CONTRACT_LABELS, getTaxonomyType, getTaxonomyGroup, STATUS_WEIGHTS, formatDate, formatTimeRemaining, hasPermission } from '../store';
import {
  ArrowLeft, MoreHorizontal, ArrowRightLeft, Pause, Play, CheckCircle,
  Archive, Copy, Link, Send, StickyNote, Phone, Monitor, Paperclip,
  Smile, ChevronDown, Clock, AlertTriangle, User, Settings, Zap,
  Globe, Database, Calculator, Key, BarChart3, BookOpen, Shield,
  Sparkles, Building2, Lock
} from 'lucide-react';

export function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, setTickets, role, setStatusChangeTarget, setTransferTarget, setSuflerTarget } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'audit' | 'related'>('overview');
  const [showMore, setShowMore] = useState(false);
  const [messageType, setMessageType] = useState<'message' | 'note' | 'call' | 'connection'>('message');
  const [messageText, setMessageText] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDescFull, setShowDescFull] = useState(false);
  const now = Date.now();

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return <div className="text-center py-20 text-[#6B7280]">Заявка не найдена</div>;

  const sc = STATUS_CONFIG[ticket.status];
  const elapsed = now - ticket.createdAt;
  const remaining = ticket.slaExternal * 60000 - elapsed;
  const isOverdue = !ticket.slaPaused && remaining < 0 && ['new', 'classification', 'in_progress'].includes(ticket.status);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const interaction = {
      id: Math.random().toString(36),
      type: messageType as any,
      author: 'Текущий пользователь',
      text: messageText,
      createdAt: Date.now(),
      visibleToClient: messageType === 'message',
    };
    setTickets(prev => prev.map(t => t.id === ticket.id ? {
      ...t,
      interactions: [...t.interactions, interaction],
      auditLog: [...t.auditLog, {
        id: Math.random().toString(36),
        action: messageType === 'message' ? 'Отправлено сообщение' : 'Добавлена заметка',
        author: 'Текущий пользователь',
        timestamp: Date.now(),
      }],
      updatedAt: Date.now(),
    } : t));
    setMessageText('');
    addToast('Отправлено (демо)', 'success');
  };

  const getSLADisplay = () => {
    if (ticket.slaPaused) return { text: 'SLA остановлен', color: '#6B7280', bg: '#F1F5F9', pct: 100 };
    if (!['new', 'classification', 'in_progress'].includes(ticket.status)) return null;
    if (remaining < 0) return { text: `Просрочено ${formatTimeRemaining(Math.abs(remaining))}`, color: '#B91C1C', bg: '#FEECEC', pct: 100 };
    const pct = Math.min(100, (elapsed / (ticket.slaExternal * 60000)) * 100);
    let color = '#10B981';
    if (pct > 75) color = '#EF4444';
    else if (pct > 50) color = '#F59E0B';
    else if (pct > 25) color = '#F97316';
    return { text: `Осталось ${formatTimeRemaining(remaining)}`, color, bg: '#F0FDF4', pct };
  };

  const slaDisplay = getSLADisplay();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/tickets')} className="text-[13px] text-[#6B7280] hover:text-[#2563EB] flex items-center gap-1">
          <ArrowLeft size={14} /> Заявки
        </button>
        <span className="text-[13px] text-[#9CA3AF]">/</span>
        <span className="text-[13px] text-[#111827] font-mono">{ticket.number}</span>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5 mb-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-mono text-[13px] text-[#6B7280]">{ticket.number}</span>
              {/* Source badge */}
              {(() => { const src = SOURCE_CONFIG[ticket.source]; return (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium" style={{ backgroundColor: src.soft, color: src.text, border: ticket.source === 'usp' ? '1px solid #A5F3FC' : 'none' }}>
                  {src.icon} {src.label}{ticket.uspExternalNumber && ` • ${ticket.uspExternalNumber}`}
                </span>
              ); })()}
              <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold ${isOverdue ? 'border border-[#FCA5A5]' : ''}`}
                style={{ backgroundColor: isOverdue ? '#FEECEC' : sc.soft, color: isOverdue ? '#B91C1C' : sc.text }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOverdue ? '#EF4444' : sc.color }} />
                {isOverdue ? 'Просрочено' : sc.label}
              </span>
              {/* Executor priority */}
              {(() => { const p = EXECUTOR_PRIORITY_CONFIG[ticket.executorPriority || 'none']; return (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold" style={{ backgroundColor: p.soft, color: p.color }}>
                  {p.label}
                </span>
              ); })()}
              <span className={`h-6 px-2 rounded-md text-[11px] font-medium ${ticket.clientType === 'external' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                {ticket.clientType === 'external' ? 'Клиентская' : 'Внутренняя'}
              </span>
              {/* Contract type */}
              <span className="h-6 px-2 rounded-md text-[11px] font-medium bg-[#F8FAFC] text-[#475569]">
                {CONTRACT_LABELS[ticket.contractType]}
              </span>
              {slaDisplay && (
                <span className="h-6 px-2 rounded-md text-[11px] font-medium flex items-center gap-1" style={{ backgroundColor: slaDisplay.bg, color: slaDisplay.color }}>
                  {isOverdue && <AlertTriangle size={12} />}
                  {slaDisplay.text}
                </span>
              )}
            </div>
            <h2 className="text-[22px] font-[650] text-[#111827] mb-2">{ticket.subject}</h2>
            <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
              <span>{ticket.client}</span>
              <span>•</span>
              <span>{TYPE_LABELS[ticket.type]}</span>
              <span>•</span>
              <span>{PRIORITY_LABELS[ticket.priority]}</span>
              <span>•</span>
              <span>{ticket.line}</span>
              <span>•</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative">
                <button onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="h-9 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[13px] text-[#111827] flex items-center gap-2 hover:bg-[#F8FAFF]">
                  <MoreHorizontal size={14} /> Ещё
                </button>
                {showMoreMenu && (
                  <div className="absolute left-0 top-full mt-1 w-[220px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] z-50 py-1 animate-slide-down">
                    <button className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Назначить</button>
                    <button className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Пауза</button>
                    <button className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Закрыть</button>
                    <button className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Архивировать</button>
                    <button onClick={() => { addToast('Интеграция в режиме эмуляции', 'info'); setShowMoreMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Связать с трекером (демо)</button>
                    <button onClick={() => { addToast('Ссылка скопирована (демо)', 'success'); setShowMoreMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Копировать ссылку</button>
                  </div>
                )}
              </div>
              {hasPermission(role, 'transfer') && (
                <button onClick={() => setTransferTarget(ticket)}
                  className="h-9 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[13px] text-[#111827] hover:bg-[#F8FAFF]">
                  Передать
                </button>
              )}
              {hasPermission(role, 'ai') && (
                <button onClick={() => setSuflerTarget(ticket)}
                  className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] text-white text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
                  <Sparkles size={14} /> Суфлёр AI
                </button>
              )}
              {hasPermission(role, 'close') && (
                <button onClick={() => setStatusChangeTarget({ ticket, from: ticket.status })}
                  className="h-9 px-4 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium hover:bg-[#1D4ED8]">
                  Сменить статус
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-16 z-20 bg-[#F6F8FC] border-b border-[#E6EBF2] -mx-0 mb-4">
            <div className="flex gap-0">
              {[
                { key: 'overview', label: 'Обзор' },
                { key: 'interactions', label: 'Взаимодействия' },
                { key: 'audit', label: 'Аудит-лог' },
                { key: 'related', label: 'Связанные' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Description */}
              <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Описание</h3>
                <p className={`text-[14px] text-[#374151] leading-relaxed ${!showDescFull ? 'max-h-[240px] overflow-hidden' : ''}`}>
                  {ticket.description}
                </p>
                {ticket.description.length > 300 && (
                  <button onClick={() => setShowDescFull(!showDescFull)} className="text-[13px] text-[#2563EB] mt-2 hover:underline">
                    {showDescFull ? 'Свернуть' : 'Показать полностью'}
                  </button>
                )}
              </div>

              {/* Parameters */}
              <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Параметры</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                  {[
                    ['Тип', TYPE_LABELS[ticket.type]],
                    ['Приоритет', PRIORITY_LABELS[ticket.priority]],
                    ['Линия', ticket.line],
                    ['Исполнитель', ticket.assignee],
                    ['Канал обращения', ticket.channel === 'email' ? 'Email' : ticket.channel === 'phone' ? 'Телефон' : ticket.channel === 'portal' ? 'Портал' : 'Чат'],
                    ['Клиент', ticket.client],
                    ['Создана', formatDate(ticket.createdAt)],
                    ['Обновлена', formatDate(ticket.updatedAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6B7280]">{label}</span>
                      <span className="text-[13px] text-[#111827] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiting banner */}
              {ticket.status === 'waiting' && (
                <div className="bg-[#FFF7E8] border border-[#FDE68A] rounded-2xl p-4 flex items-center gap-3">
                  <Clock size={20} className="text-[#B45309] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#B45309]">Ждём ответа</p>
                    <p className="text-[13px] text-[#92400E]">
                      Причина: {ticket.waitingReason === 'client' ? 'Ожидание клиента' : ticket.waitingReason === 'department' ? 'Ожидание смежного отдела' : ticket.waitingReason === 'external_system' ? 'Ожидание внешней системы' : 'Другое'}
                      {ticket.autoTransitionAt && ` • Автопереход через ${formatTimeRemaining(ticket.autoTransitionAt - now)}`}
                    </p>
                  </div>
                  <button className="h-8 px-3 rounded-lg bg-[#F59E0B] text-white text-[13px] font-medium hover:bg-[#D97706]">
                    Возобновить
                  </button>
                </div>
              )}

              {/* Paused banner */}
              {ticket.status === 'paused' && (
                <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl p-4 flex items-center gap-3">
                  <Pause size={20} className="text-[#475569] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#475569]">На паузе</p>
                    <p className="text-[13px] text-[#64748B]">
                      {ticket.slaPaused ? 'SLA остановлен' : 'SLA продолжает идти'}
                      {ticket.pauseUntil && ` • До ${formatDate(ticket.pauseUntil)}`}
                    </p>
                  </div>
                  <button className="h-8 px-3 rounded-lg bg-[#64748B] text-white text-[13px] font-medium hover:bg-[#475569]">
                    Возобновить
                  </button>
                </div>
              )}

              {/* Closed info */}
              {ticket.status === 'closed' && (
                <div className="bg-[#F4EEFF] border border-[#DDD6FE] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-[#6D28D9]" />
                    <p className="text-[14px] font-medium text-[#6D28D9]">Заявка закрыта</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <span className="text-[#6B7280]">Канал решения:</span>
                    <span className="text-[#111827]">{ticket.resolutionChannel === 'remote' ? 'Удалённо' : ticket.resolutionChannel === 'phone' ? 'Телефон' : ticket.resolutionChannel === 'correspondence' ? 'Переписка' : 'Выезд'}</span>
                    <span className="text-[#6B7280]">Итог:</span>
                    <span className="text-[#111827]">{ticket.resolutionSummary}</span>
                    <span className="text-[#6B7280]">Часы:</span>
                    <span className="text-[#111827]">{ticket.hours}ч</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div>
              {/* Composer */}
              <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4 mb-4">
                <div className="flex gap-1 mb-3">
                  {[
                    { key: 'message', label: 'Сообщение', color: '#2563EB' },
                    { key: 'note', label: 'Внутренняя заметка', color: '#F59E0B' },
                    { key: 'call', label: 'Звонок (демо)', color: '#6B7280' },
                    { key: 'connection', label: 'Подключение (демо)', color: '#6B7280' },
                  ].map(seg => (
                    <button key={seg.key} onClick={() => setMessageType(seg.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        messageType === seg.key ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'text-[#6B7280] hover:bg-[#F3F6FB]'
                      }`}>
                      {seg.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder={messageType === 'message' ? 'Напишите сообщение клиенту...' : messageType === 'note' ? 'Внутренняя заметка (не видна клиенту)...' : 'Комментарий...'}
                  className="w-full min-h-[96px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F6FB]"><Paperclip size={16} className="text-[#6B7280]" /></button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F6FB]"><Smile size={16} className="text-[#6B7280]" /></button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F6FB]"><Phone size={16} className="text-[#6B7280]" /></button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F6FB]"><Monitor size={16} className="text-[#6B7280]" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] ${messageType === 'message' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {messageType === 'message' ? '👁 Видно клиенту' : '🔒 Только команде'}
                    </span>
                    <button onClick={handleSendMessage} disabled={!messageText.trim()}
                      className={`h-9 px-4 rounded-xl text-[13px] font-medium text-white disabled:opacity-40 ${
                        messageType === 'note' ? 'bg-[#F59E0B] hover:bg-[#D97706]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                      }`}>
                      {messageType === 'note' ? 'Добавить заметку' : 'Отправить'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interaction feed */}
              <div className="space-y-3">
                {ticket.interactions.map(int => (
                  <div key={int.id} className={`rounded-[14px] p-4 border ${
                    int.type === 'note' ? 'bg-[#FFFBEB] border-l-4 border-l-[#F59E0B] border-[#FDE68A]' :
                    int.type === 'system' ? 'bg-[#F8FAFC] border-[#E6EBF2]' :
                    'bg-white border-[#E6EBF2]'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {int.type === 'call' && <Phone size={14} className="text-[#6B7280]" />}
                      {int.type === 'connection' && <Monitor size={14} className="text-[#6B7280]" />}
                      {int.type === 'system' && <Settings size={14} className="text-[#6B7280]" />}
                      {int.type === 'note' && <StickyNote size={14} className="text-[#F59E0B]" />}
                      <span className="text-[13px] font-medium text-[#111827]">{int.author}</span>
                      <span className="text-[12px] text-[#9CA3AF]">{formatDate(int.createdAt)}</span>
                      {int.type === 'note' && <span className="text-[11px] text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded">Заметка</span>}
                    </div>
                    <p className="text-[14px] text-[#374151]">{int.text}</p>
                  </div>
                ))}
                {ticket.interactions.length === 0 && (
                  <div className="text-center py-8 text-[#9CA3AF] text-[14px]">Пока нет взаимодействий</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
              <div className="space-y-4">
                {ticket.auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#F3F6FB] flex items-center justify-center">
                        <Settings size={14} className="text-[#6B7280]" />
                      </div>
                      {i < ticket.auditLog.length - 1 && <div className="w-px h-full bg-[#E6EBF2] mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-[14px] text-[#111827] font-medium">{entry.action}</p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">
                        {entry.author} • {formatDate(entry.timestamp)}
                      </p>
                      {(entry.oldValue || entry.newValue) && (
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          {entry.oldValue && <span className="text-[#EF4444]">{entry.oldValue}</span>}
                          {entry.oldValue && entry.newValue && <span> → </span>}
                          {entry.newValue && <span className="text-[#10B981]">{entry.newValue}</span>}
                        </p>
                      )}
                      {entry.comment && <p className="text-[12px] text-[#9CA3AF] mt-1">{entry.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#9CA3AF] mt-4 pt-4 border-t border-[#E6EBF2]">Записи не удаляются (демо-эмуляция)</p>
            </div>
          )}

          {activeTab === 'related' && (
            <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5 text-center py-12">
              <Link size={32} className="text-[#9CA3AF] mx-auto mb-3" />
              <p className="text-[14px] text-[#6B7280]">Нет связанных заявок</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-[360px] shrink-0 space-y-4">
          {/* SLA Card */}
          {slaDisplay && (
            <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4 sticky top-[88px]">
              <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">SLA</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#111827]">Норматив</span>
                <span className="text-[13px] text-[#6B7280]">{ticket.slaExternal / 60}ч</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-[#111827]">{isOverdue ? 'Просрочено' : 'Осталось'}</span>
                <span className="text-[13px] font-medium" style={{ color: slaDisplay.color }}>{slaDisplay.text}</span>
              </div>
              <div className="w-full h-2 bg-[#F3F6FB] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, slaDisplay.pct)}%`, backgroundColor: slaDisplay.color }} />
              </div>
              {ticket.slaPaused && (
                <p className="text-[12px] text-[#6B7280] mt-2">SLA остановлен — ожидание</p>
              )}
            </div>
          )}

          {/* Assignee */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Исполнитель</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-[13px] font-semibold">
                {ticket.assignee[0]}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#111827]">{ticket.assignee}</p>
                <p className="text-[12px] text-[#6B7280]">{ticket.line}</p>
              </div>
            </div>
            {hasPermission(role, 'reassign') && (
              <button className="w-full mt-3 h-8 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF]">
                Переназначить
              </button>
            )}
          </div>

          {/* Taxonomy */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Таксономия</h4>
            {(() => {
              const tax = getTaxonomyType(ticket.taxonomyTypeId);
              const grp = tax ? getTaxonomyGroup(tax.groupId) : null;
              if (!tax) return <p className="text-[12px] text-[#EF4444]">Не задана</p>;
              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#6B7280]">Группа</span>
                    <span className="text-[12px] text-[#111827]">{grp?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#6B7280]">Тип</span>
                    <span className="text-[12px] text-[#111827]">{tax.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#6B7280]">Плановое время</span>
                    <span className="text-[12px] font-semibold text-[#111827]">{tax.plannedTime} ч</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#6B7280]">Подтверждение</span>
                    <span className={`text-[12px] ${ticket.taxonomyConfirmed ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {ticket.taxonomyConfirmed ? '✓ Подтверждён' : '⚠ Требует подтверждения'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Executor Priority */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Приоритет исполнителя</h4>
            <div className="space-y-2">
              {(() => { const p = EXECUTOR_PRIORITY_CONFIG[ticket.executorPriority || 'none']; return (
                <>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#6B7280]">Текущий</span>
                    <span className="text-[12px] font-semibold" style={{ color: p.color }}>{p.label}</span>
                  </div>
                  {ticket.executorPrioritySetBy && (
                    <div className="flex justify-between">
                      <span className="text-[12px] text-[#6B7280]">Установил</span>
                      <span className="text-[12px] text-[#111827]">{ticket.executorPrioritySetBy}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-[#9CA3AF] mt-2">Приоритет задаёт исполнитель исходя из своего плана дня</p>
                </>
              ); })()}
            </div>
          </div>

          {/* Load impact */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Влияние на загрузку</h4>
            {(() => {
              const tax = getTaxonomyType(ticket.taxonomyTypeId);
              const pt = tax?.plannedTime || 1;
              const sw = STATUS_WEIGHTS[ticket.status];
              const pw = EXECUTOR_PRIORITY_CONFIG[ticket.executorPriority || 'none'].weight;
              const impact = pt * sw * pw;
              return (
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-[#6B7280]">Плановое время:</span><span className="text-[#111827] font-medium">{pt} ч</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280]">Вес статуса ({STATUS_CONFIG[ticket.status].label}):</span><span className="text-[#111827] font-mono">{sw}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280]">Вес приоритета:</span><span className="text-[#111827] font-mono">{pw}</span></div>
                  <div className="flex justify-between pt-1.5 border-t border-[#E6EBF2]"><span className="text-[#6B7280] font-medium">Вклад в КЗ:</span><span className="text-[#111827] font-bold">{impact.toFixed(2)} ч</span></div>
                </div>
              );
            })()}
          </div>

          {/* Calls */}
          {ticket.calls.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
              <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3 flex items-center gap-1.5">
                <Phone size={14} /> Звонки ({ticket.calls.length})
              </h4>
              <div className="space-y-2">
                {ticket.calls.slice(0, 3).map(call => (
                  <div key={call.id} className="p-2 rounded-lg bg-[#F8FAFC] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span>{call.direction === 'incoming' ? '📥' : call.direction === 'outgoing' ? '📤' : '❌'}</span>
                      <span className="text-[#111827] font-medium">{call.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[#6B7280]">
                      <span>{call.duration} мин</span>
                      <span>•</span>
                      <span className={call.analysisStatus === 'analyzed' ? 'text-[#8B5CF6]' : ''}>
                        {call.analysisStatus === 'analyzed' ? '✨ AI проанализирован' : call.analysisStatus === 'transcribing' ? '⏳ Транскрибация' : 'Не анализировался'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI */}
          <div className="bg-gradient-to-br from-[#8B5CF6]/5 to-[#2563EB]/5 rounded-2xl border border-[#8B5CF6]/20 p-4">
            <h4 className="text-[13px] font-semibold text-[#111827] mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#8B5CF6]" /> AI-помощник
            </h4>
            <div className="space-y-1.5">
              <button onClick={() => setSuflerTarget(ticket)} className="w-full h-8 rounded-lg bg-white border border-[#E6EBF2] text-[12px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2 px-3">
                <Sparkles size={12} className="text-[#8B5CF6]" /> Суфлёр AI
              </button>
              <button onClick={() => addToast('Суммаризация запущена (демо)', 'info')} className="w-full h-8 rounded-lg bg-white border border-[#E6EBF2] text-[12px] text-[#111827] hover:bg-[#F8FAFF] px-3 text-left">
                Суммаризировать
              </button>
              <button onClick={() => addToast('Черновик итога предложен (демо)', 'info')} className="w-full h-8 rounded-lg bg-white border border-[#E6EBF2] text-[12px] text-[#111827] hover:bg-[#F8FAFF] px-3 text-left">
                Черновик итога
              </button>
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-2">Демо-режим, без реального AI</p>
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Параметры</h4>
            <div className="space-y-2">
              {[
                ['Тип', TYPE_LABELS[ticket.type]],
                ['Приоритет', PRIORITY_LABELS[ticket.priority]],
                ['Канал', ticket.channel],
                ['Клиент', ticket.client],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[12px] text-[#6B7280]">{label}</span>
                  <span className="text-[12px] text-[#111827]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automation */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3 flex items-center gap-1.5">
              <Zap size={14} /> Автоматика
            </h4>
            {ticket.autoTransitionAt ? (
              <p className="text-[12px] text-[#111827]">Автопереход через {formatTimeRemaining(ticket.autoTransitionAt - now)}</p>
            ) : ticket.pauseUntil ? (
              <p className="text-[12px] text-[#111827]">Возврат из паузы через {formatTimeRemaining(ticket.pauseUntil - now)}</p>
            ) : (
              <p className="text-[12px] text-[#9CA3AF]">Нет запланированных действий</p>
            )}
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
            <h4 className="text-[13px] font-semibold text-[#6B7280] mb-3">Интеграции</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Phone, label: 'Телефия' },
                { icon: Database, label: 'УСП' },
                { icon: Calculator, label: 'Бухгалтерия' },
                { icon: Key, label: 'SSO' },
                { icon: BarChart3, label: 'Трекер' },
                { icon: BookOpen, label: 'Аналитика' },
              ].map(int => (
                <button key={int.label} onClick={() => addToast('Интеграция в режиме эмуляции', 'info')}
                  className="h-9 rounded-lg border border-[#E6EBF2] text-[11px] text-[#6B7280] flex items-center justify-center gap-1.5 hover:bg-[#F8FAFF]">
                  <int.icon size={12} /> {int.label}
                  <span className="text-[9px] bg-[#F3F6FB] px-1 rounded">Mock</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { Ticket, TicketStatus, STATUS_CONFIG, TYPE_LABELS } from '../store';
import { X, AlertTriangle } from 'lucide-react';

const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  new: ['classification', 'closed'],
  classification: ['in_progress', 'new'],
  in_progress: ['waiting', 'paused', 'approval', 'closed'],
  approval: ['in_progress', 'waiting', 'paused', 'closed'],
  waiting: ['in_progress', 'paused', 'closed'],
  paused: ['in_progress', 'closed'],
  closed: ['archived', 'in_progress'],
  archived: [],
};

export function StatusChangeModal() {
  const { statusChangeTarget, setStatusChangeTarget, setTickets } = useApp();
  const { addToast } = useToast();
  if (!statusChangeTarget) return null;
  const { ticket, from } = statusChangeTarget;
  const allowed = TRANSITIONS[from] || [];

  const [newStatus, setNewStatus] = useState<TicketStatus | null>(null);
  const [type, setType] = useState(ticket.type);
  const [comment, setComment] = useState('');
  const [waitingReason, setWaitingReason] = useState('client');
  const [pauseReason, setPauseReason] = useState('client');
  const [pauseDuration, setPauseDuration] = useState(60);
  const [autoTransitionHours, setAutoTransitionHours] = useState(24);
  const [resolutionChannel, setResolutionChannel] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [hours, setHours] = useState(1);
  const [clientConfirmed, setClientConfirmed] = useState(false);

  const sc = STATUS_CONFIG[from];
  const newSc = newStatus ? STATUS_CONFIG[newStatus] : null;

  const canConfirm = (() => {
    if (!newStatus) return false;
    if (from === 'new' && newStatus === 'classification' && type === 'other' && !comment.trim()) return false;
    if (newStatus === 'waiting' && !comment.trim()) return false;
    if (newStatus === 'paused' && !comment.trim()) return false;
    if (newStatus === 'closed' && (!resolutionChannel || !resolutionSummary.trim())) return false;
    return true;
  })();

  const handleConfirm = () => {
    if (!newStatus || !canConfirm) return;
    const now = Date.now();
    const updates: Partial<Ticket> = {
      status: newStatus,
      updatedAt: now,
      auditLog: [...ticket.auditLog, {
        id: Math.random().toString(36),
        action: 'Смена статуса',
        author: 'Текущий пользователь',
        timestamp: now,
        oldValue: sc.label,
        newValue: STATUS_CONFIG[newStatus].label,
        comment: comment || undefined,
      }],
    };

    if (newStatus === 'waiting') {
      updates.waitingReason = waitingReason as any;
      updates.autoTransitionAt = now + autoTransitionHours * 3600000;
      updates.slaPaused = true;
    }
    if (newStatus === 'paused') {
      updates.pauseReason = pauseReason as any;
      updates.pauseDuration = pauseDuration;
      updates.pauseUntil = now + pauseDuration * 60000;
      updates.slaPaused = ['client', 'department', 'external_system'].includes(pauseReason);
    }
    if (newStatus === 'closed') {
      updates.closedAt = now;
      updates.resolutionChannel = resolutionChannel as any;
      updates.resolutionSummary = resolutionSummary;
      updates.hours = hours;
      updates.clientConfirmed = clientConfirmed;
    }
    if (newStatus === 'classification') {
      updates.type = type;
    }

    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...updates } : t));
    setStatusChangeTarget(null);
    addToast(`Статус изменён: ${STATUS_CONFIG[newStatus].label} (демо)`, 'success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm" onClick={() => setStatusChangeTarget(null)} />
      <div className="relative w-[560px] max-h-[85vh] bg-white rounded-[20px] shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E6EBF2] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#111827]">Смена статуса</h2>
            <button onClick={() => setStatusChangeTarget(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB]">
              <X size={18} className="text-[#6B7280]" />
            </button>
          </div>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Текущий статус: <span className="font-medium" style={{ color: sc.text }}>{sc.label}</span>
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Status selection */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-2">Новый статус</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const isAllowed = allowed.includes(s);
                const isSelected = newStatus === s;
                return (
                  <button key={s} disabled={!isAllowed}
                    onClick={() => setNewStatus(s)}
                    className={`h-9 px-3 rounded-full text-[13px] font-semibold flex items-center gap-1.5 border transition-all ${
                      isSelected ? 'ring-2 ring-offset-1' : ''
                    } ${!isAllowed ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                    style={{
                      backgroundColor: isSelected ? cfg.soft : isAllowed ? cfg.soft + '80' : '#F1F5F9',
                      color: isAllowed ? cfg.text : '#9CA3AF',
                      borderColor: isSelected ? cfg.color : 'transparent',
                      boxShadow: isSelected ? `0 0 0 2px ${cfg.color}40` : undefined,
                    }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isAllowed ? cfg.color : '#CBD5E1' }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic fields based on transition */}
          {newStatus === 'classification' && from === 'new' && (
            <div className="space-y-3 p-4 bg-[#F8FAFC] rounded-xl">
              <label className="text-[13px] font-medium text-[#111827]">Тип обращения</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
                <option value="incident">Инцидент</option>
                <option value="request">Запрос</option>
                <option value="problem">Проблема</option>
                <option value="other">Другое</option>
              </select>
              {type === 'other' && (
                <div>
                  <label className="text-[12px] text-[#6B7280]">Комментарий (обязательно для «Другое»)</label>
                  <input value={comment} onChange={e => setComment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white mt-1"
                    placeholder="Уточните тип обращения" />
                </div>
              )}
            </div>
          )}

          {newStatus === 'waiting' && (
            <div className="space-y-3 p-4 bg-[#FFF7E8] rounded-xl">
              <label className="text-[13px] font-medium text-[#B45309]">Причина ожидания *</label>
              <select value={waitingReason} onChange={e => setWaitingReason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#FDE68A] text-[14px] bg-white">
                <option value="client">Ожидание клиента</option>
                <option value="department">Ожидание смежного отдела</option>
                <option value="external_system">Ожидание внешней системы</option>
                <option value="other">Другое</option>
              </select>
              <div>
                <label className="text-[12px] text-[#92400E]">Комментарий *</label>
                <input value={comment} onChange={e => setComment(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#FDE68A] text-[14px] bg-white mt-1"
                  placeholder="Опишите причину" />
              </div>
              <div>
                <label className="text-[12px] text-[#92400E]">Автопереход через (часов)</label>
                <input type="number" value={autoTransitionHours} onChange={e => setAutoTransitionHours(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#FDE68A] text-[14px] bg-white mt-1" />
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#B45309]">
                <AlertTriangle size={14} /> SLA будет остановлен
              </div>
            </div>
          )}

          {newStatus === 'paused' && (
            <div className="space-y-3 p-4 bg-[#F1F5F9] rounded-xl">
              <label className="text-[13px] font-medium text-[#475569]">Причина паузы *</label>
              <select value={pauseReason} onChange={e => setPauseReason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-[14px] bg-white">
                <option value="client">Ожидание клиента</option>
                <option value="department">Ожидание смежного отдела</option>
                <option value="external_system">Ожидание внешней системы</option>
                <option value="internal">Внутренний процесс</option>
                <option value="other">Другое</option>
              </select>
              <div>
                <label className="text-[12px] text-[#64748B]">Комментарий *</label>
                <input value={comment} onChange={e => setComment(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-[14px] bg-white mt-1" />
              </div>
              <div>
                <label className="text-[12px] text-[#64748B]">Длительность паузы</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[30, 60, 120, 240, 480].map(m => (
                    <button key={m} onClick={() => setPauseDuration(m)}
                      className={`h-8 px-3 rounded-lg text-[12px] font-medium ${pauseDuration === m ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#CBD5E1] text-[#64748B]'}`}>
                      {m < 60 ? `${m} мин` : `${m / 60}ч`}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`flex items-center gap-2 text-[12px] ${['client', 'department', 'external_system'].includes(pauseReason) ? 'text-[#B45309]' : 'text-[#10B981]'}`}>
                <AlertTriangle size={14} />
                {['client', 'department', 'external_system'].includes(pauseReason) ? 'SLA остановлен' : 'SLA продолжает идти'}
              </div>
            </div>
          )}

          {newStatus === 'closed' && (
            <div className="space-y-3 p-4 bg-[#F4EEFF] rounded-xl">
              <label className="text-[13px] font-medium text-[#6D28D9]">Канал решения *</label>
              <select value={resolutionChannel} onChange={e => setResolutionChannel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DDD6FE] text-[14px] bg-white">
                <option value="">Выберите</option>
                <option value="remote">Удалённо</option>
                <option value="phone">Телефон</option>
                <option value="correspondence">Переписка</option>
                <option value="onsite">Выезд</option>
              </select>
              <div>
                <label className="text-[12px] text-[#6D28D9]">Итог *</label>
                <textarea value={resolutionSummary} onChange={e => setResolutionSummary(e.target.value)}
                  className="w-full min-h-[72px] p-3 rounded-xl border border-[#DDD6FE] text-[14px] bg-white mt-1 resize-none"
                  placeholder="Опишите результат" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[12px] text-[#6D28D9]">Часы</label>
                  <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))}
                    className="w-20 h-10 px-3 rounded-xl border border-[#DDD6FE] text-[14px] bg-white mt-1" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={clientConfirmed} onChange={e => setClientConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDD6FE]" />
                  <span className="text-[13px] text-[#111827]">Клиент подтвердил</span>
                </label>
              </div>
            </div>
          )}

          {newStatus === 'archived' && (
            <div className="p-4 bg-[#FEF2F2] rounded-xl flex items-center gap-3">
              <AlertTriangle size={20} className="text-[#B91C1C] shrink-0" />
              <p className="text-[13px] text-[#B91C1C]">Заявка будет скрыта из активных очередей</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E6EBF2] flex items-center justify-end gap-3 shrink-0">
          <button onClick={() => setStatusChangeTarget(null)}
            className="h-10 px-4 rounded-xl border border-[#E6EBF2] text-[14px] text-[#111827] hover:bg-[#F8FAFF]">
            Отмена
          </button>
          <button onClick={handleConfirm} disabled={!canConfirm}
            className="h-10 px-5 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed">
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

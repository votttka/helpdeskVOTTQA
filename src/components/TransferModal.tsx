import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { X } from 'lucide-react';

export function TransferModal() {
  const { transferTarget, setTransferTarget, setTickets } = useApp();
  const { addToast } = useToast();
  if (!transferTarget) return null;

  const [line, setLine] = useState('Вторая линия');
  const [assignee, setAssignee] = useState('');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const canTransfer = reason.trim().length > 0;

  const handleTransfer = () => {
    if (!canTransfer) return;
    const now = Date.now();
    setTickets(prev => prev.map(t => t.id === transferTarget.id ? {
      ...t,
      line,
      assignee: assignee || t.assignee,
      updatedAt: now,
      auditLog: [...t.auditLog, {
        id: Math.random().toString(36),
        action: 'Передача заявки',
        author: 'Текущий пользователь',
        timestamp: now,
        comment: `Линия: ${line}${assignee ? `, Исполнитель: ${assignee}` : ''}. Причина: ${reason}`,
      }],
    } : t));
    setTransferTarget(null);
    addToast('Заявка передана (демо)', 'success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm" onClick={() => setTransferTarget(null)} />
      <div className="relative w-[560px] max-h-[85vh] bg-white rounded-[20px] shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E6EBF2] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#111827]">Передача заявки</h2>
            <button onClick={() => setTransferTarget(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB]">
              <X size={18} className="text-[#6B7280]" />
            </button>
          </div>
          <p className="text-[13px] text-[#6B7280] mt-1 font-mono">{transferTarget.number} — {transferTarget.subject}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Линия / Получатель</label>
            <select value={line} onChange={e => setLine(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option>Первая линия</option>
              <option>Вторая линия</option>
              <option>Третья линия</option>
              <option>Эскалация</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Исполнитель</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Не менять</option>
              <option>Петров А.В.</option>
              <option>Сидорова Е.К.</option>
              <option>Козлов Д.М.</option>
              <option>Новикова О.С.</option>
              <option>Морозов И.П.</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Причина передачи *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              className="w-full min-h-[72px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              placeholder="Обязательно укажите причину" />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Комментарий получателю</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              className="w-full min-h-[72px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              placeholder="Дополнительная информация" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E6EBF2] flex items-center justify-end gap-3 shrink-0">
          <button onClick={() => setTransferTarget(null)}
            className="h-10 px-4 rounded-xl border border-[#E6EBF2] text-[14px] text-[#111827] hover:bg-[#F8FAFF]">
            Отмена
          </button>
          <button onClick={handleTransfer} disabled={!canTransfer}
            className="h-10 px-5 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed">
            Передать
          </button>
        </div>
      </div>
    </div>
  );
}

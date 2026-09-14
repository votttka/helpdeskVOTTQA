import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { Ticket, TicketType, TicketPriority, TicketChannel, TYPE_LABELS, PRIORITY_LABELS, getNextTicketNumber } from '../store';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NewTicketDrawer() {
  const { setShowNewTicket, setTickets, tickets } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [clientType, setClientType] = useState<'external' | 'internal'>('external');
  const [client, setClient] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<TicketType | ''>('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [line, setLine] = useState('Первая линия');
  const [assignee, setAssignee] = useState('');
  const [channel, setChannel] = useState<TicketChannel>('email');
  const [otherTypeNote, setOtherTypeNote] = useState('');

  const canSubmit = subject.trim() && type && (type !== 'other' || otherTypeNote.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    const now = Date.now();
    const newTicket: Ticket = {
      id: Math.random().toString(36),
      number: getNextTicketNumber(tickets),
      subject,
      description: description || 'Без описания',
      status: 'new',
      type: type as TicketType,
      priority,
      client: client || 'Не указан',
      clientType,
      line,
      assignee: assignee || 'Не назначен',
      channel,
      source: 'manual',
      contractType: clientType === 'internal' ? 'internal' : 'commercial',
      slaExternal: 480,
      slaInternal: 240,
      slaPaused: false,
      createdAt: now,
      updatedAt: now,
      interactions: [],
      auditLog: [{
        id: Math.random().toString(36),
        action: 'Создание заявки',
        author: 'Текущий пользователь',
        timestamp: now,
      }],
      calls: [],
      connections: [],
      subtasks: [],
    };
    setTickets(prev => [newTicket, ...prev]);
    setShowNewTicket(false);
    addToast(`Заявка ${newTicket.number} создана (демо)`, 'success', {
      label: 'Открыть',
      onClick: () => navigate(`/tickets/${newTicket.id}`)
    });
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowNewTicket(false)} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-[520px] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E6EBF2] shrink-0">
          <h2 className="text-[18px] font-semibold text-[#111827]">Новая заявка</h2>
          <button onClick={() => setShowNewTicket(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB]">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Client type */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Признак</label>
            <div className="flex rounded-xl border border-[#E6EBF2] overflow-hidden">
              <button onClick={() => setClientType('external')}
                className={`flex-1 h-10 text-[13px] ${clientType === 'external' ? 'bg-[#EFF6FF] text-[#1D4ED8] font-medium' : 'bg-white text-[#6B7280]'}`}>
                Клиентская
              </button>
              <button onClick={() => setClientType('internal')}
                className={`flex-1 h-10 text-[13px] ${clientType === 'internal' ? 'bg-[#EFF6FF] text-[#1D4ED8] font-medium' : 'bg-white text-[#6B7280]'}`}>
                Внутренняя
              </button>
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Клиент</label>
            <select value={client} onChange={e => setClient(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Выберите клиента</option>
              <option value="ООО «Ромашка»">ООО «Ромашка»</option>
              <option value="АО «Технопарк»">АО «Технопарк»</option>
              <option value="ИП Иванов И.И.">ИП Иванов И.И.</option>
              <option value="ГУП «Городские системы»">ГУП «Городские системы»</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Тема *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              placeholder="Кратко опишите проблему" />
          </div>

          {/* Type */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Тип обращения *</label>
            <select value={type} onChange={e => setType(e.target.value as TicketType)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Выберите тип</option>
              <option value="incident">Инцидент</option>
              <option value="request">Запрос</option>
              <option value="problem">Проблема</option>
              <option value="other">Другое</option>
            </select>
            {type === 'other' && (
              <input value={otherTypeNote} onChange={e => setOtherTypeNote(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white mt-2 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
                placeholder="Уточните тип" />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full min-h-[96px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              placeholder="Подробное описание..." />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Приоритет</label>
            <select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="critical">Критический</option>
            </select>
          </div>

          {/* Line */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Линия</label>
            <select value={line} onChange={e => setLine(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option>Первая линия</option>
              <option>Вторая линия</option>
              <option>Третья линия</option>
              <option>Эскалация</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Исполнитель</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Не назначен</option>
              <option>Петров А.В.</option>
              <option>Сидорова Е.К.</option>
              <option>Козлов Д.М.</option>
              <option>Новикова О.С.</option>
              <option>Морозов И.П.</option>
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Канал обращения</label>
            <select value={channel} onChange={e => setChannel(e.target.value as TicketChannel)}
              className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="email">Email</option>
              <option value="phone">Телефон</option>
              <option value="portal">Портал</option>
              <option value="chat">Чат</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[72px] px-6 flex items-center justify-end gap-3 border-t border-[#E6EBF2] shrink-0">
          <button onClick={() => setShowNewTicket(false)}
            className="h-10 px-4 rounded-xl border border-[#E6EBF2] text-[14px] text-[#111827] hover:bg-[#F8FAFF]">
            Отмена
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="h-10 px-5 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed">
            Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
}

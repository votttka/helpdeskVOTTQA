import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { Ticket, TicketStatus, TicketSource, STATUS_CONFIG, SOURCE_CONFIG, TYPE_LABELS, getTaxonomyType } from '../store';
import { X, Sparkles, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: { type: string; title: string; body: string; actions?: string[] }[];
}

const QUICK_ACTIONS = [
  { label: 'Суммаризировать заявку', key: 'summary' },
  { label: 'Предложить решение', key: 'solution' },
  { label: 'Черновик ответа клиенту', key: 'answer' },
  { label: 'Черновик итога', key: 'outcome' },
  { label: 'Найти статью', key: 'article' },
  { label: 'Проверить качество', key: 'quality' },
  { label: 'Что дальше?', key: 'next' },
];

function generateResponse(ticket: Ticket, action: string): Message {
  const sc = STATUS_CONFIG[ticket.status];
  const taxType = getTaxonomyType(ticket.taxonomyTypeId);
  const base = {
    summary: {
      text: `Краткое резюме по заявке ${ticket.number}:`,
      cards: [{ type: 'summary', title: 'Суть заявки', body: `${ticket.subject}. Клиент — ${ticket.client}. Статус: ${sc.label}. Тип: ${taxType?.name || 'не задан'}. Источник: ${SOURCE_CONFIG[ticket.source].label}.` }],
    },
    solution: {
      text: 'На основе контекста заявки предлагаю следующие варианты решения:',
      cards: [
        { type: 'solution', title: 'Вариант 1', body: 'Провести диагностику через удалённое подключение. Проверить логи системы.' },
        { type: 'solution', title: 'Вариант 2', body: 'Связаться с клиентом для уточнения деталей. Возможно, проблема на стороне клиента.' },
      ],
    },
    answer: {
      text: 'Черновик ответа клиенту:',
      cards: [{ type: 'draft', title: 'Ответ', body: `Добрый день!\n\nВаша заявка ${ticket.number} принята в работу. Мы изучим описанную проблему и вернёмся с решением в ближайшее время.\n\nС уважением, служба поддержки.` }],
    },
    outcome: {
      text: 'Предлагаемый итог по заявке:',
      cards: [{ type: 'draft', title: 'Итог', body: `Проблема диагностирована. Выполнены необходимые действия. Клиент информирован о результате.` }],
    },
    article: {
      text: 'Нашёл несколько статей по теме:',
      cards: [
        { type: 'article', title: 'Типовые решения по инцидентам', body: 'База знаний, статья #1234' },
        { type: 'article', title: 'Регламент обработки заявок', body: 'Внутренний документ' },
      ],
    },
    quality: {
      text: 'Анализ качества взаимодействия:',
      cards: [{ type: 'quality', title: 'Оценка', body: '✓ Заявка типизирована\n✓ Исполнитель назначен\n⚠ Приоритет не задан\n✓ SLA в норме' }],
    },
    next: {
      text: 'Рекомендуемые следующие шаги:',
      cards: [{ type: 'next', title: 'План действий', body: '1. Установить приоритет\n2. Связаться с клиентом\n3. Провести диагностику\n4. Предложить решение' }],
    },
  };
  const r = (base as any)[action] || base.summary;
  return { id: Math.random().toString(36), role: 'assistant', ...r };
}

export function SuflerDrawer() {
  const { suflerTarget, setSuflerTarget, setTickets } = useApp();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', text: `Здравствуйте! Я — Суфлёр AI, демо-помощник по заявке ${suflerTarget?.number}. Чем могу помочь?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!suflerTarget) return null;

  const send = (text: string, action?: string) => {
    if (!text.trim() && !action) return;
    const userMsg: Message = { id: Math.random().toString(36), role: 'user', text: text || QUICK_ACTIONS.find(a => a.key === action)?.label || '' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = action ? generateResponse(suflerTarget, action) : generateResponse(suflerTarget, 'summary');
      setMessages(prev => [...prev, response]);
      setLoading(false);
    }, 700 + Math.random() * 800);
  };

  const handleInsert = (text: string) => {
    addToast('Текст вставлен в буфер обмена (демо)', 'success');
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/20" onClick={() => setSuflerTarget(null)} />
      <div className="absolute right-0 top-0 bottom-0 w-[460px] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E6EBF2] shrink-0 bg-gradient-to-r from-[#8B5CF6]/5 to-[#2563EB]/5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#8B5CF6]" />
              <h2 className="text-[16px] font-semibold text-[#111827]">Суфлёр AI</h2>
            </div>
            <p className="text-[11px] text-[#6B7280]">Демо-помощник • без реального AI</p>
          </div>
          <button onClick={() => setSuflerTarget(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB]">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#E6EBF2] bg-[#F8FAFC] text-[11px] space-y-0.5">
          <div><span className="text-[#6B7280]">Заявка:</span> <span className="font-mono text-[#111827]">{suflerTarget.number}</span></div>
          <div><span className="text-[#6B7280]">Тип:</span> <span className="text-[#111827]">{getTaxonomyType(suflerTarget.taxonomyTypeId)?.name || 'не задан'}</span></div>
          <div><span className="text-[#6B7280]">Статус:</span> <span style={{ color: STATUS_CONFIG[suflerTarget.status].text }}>{STATUS_CONFIG[suflerTarget.status].label}</span></div>
          <div><span className="text-[#6B7280]">Клиент:</span> <span className="text-[#111827]">{suflerTarget.client}</span></div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${m.role === 'user' ? 'bg-[#2563EB] text-white' : 'bg-[#F3F6FB] text-[#111827]'}`}>
                <p className="text-[13px] whitespace-pre-wrap">{m.text}</p>
                {m.cards?.map((c, i) => (
                  <div key={i} className="mt-2 bg-white rounded-xl p-3 border border-[#E6EBF2]">
                    <p className="text-[12px] font-semibold text-[#111827] mb-1">{c.title}</p>
                    <p className="text-[12px] text-[#374151] whitespace-pre-wrap">{c.body}</p>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => handleInsert(c.body)} className="text-[10px] px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]">Вставить</button>
                      <button onClick={() => addToast('Скопировано (демо)', 'success')} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F3F6FB] text-[#475569] hover:bg-[#E6EBF2]">Копировать</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#F3F6FB] rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-2 border-t border-[#E6EBF2]">
          <div className="flex flex-wrap gap-1 mb-2">
            {QUICK_ACTIONS.map(a => (
              <button key={a.key} onClick={() => send('', a.key)} disabled={loading}
                className="text-[10px] px-2 py-1 rounded-md bg-[#F4EEFF] text-[#6D28D9] hover:bg-[#EDE9FE] disabled:opacity-40">
                {a.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Спросите по заявке..." disabled={loading}
              className="flex-1 h-10 px-3 rounded-xl border border-[#E6EBF2] text-[13px] bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none" />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center hover:bg-[#7C3AED] disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

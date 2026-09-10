import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { Ticket, TicketStatus, STATUS_CONFIG, TYPE_LABELS, PRIORITY_LABELS, formatDate, hasPermission } from '../store';
import {
  Search, ChevronDown, RotateCcw, Download,
  MoreHorizontal, Eye, UserPlus, ArrowRightLeft,
  Copy, Plus
} from 'lucide-react';

export function TicketList() {
  const { tickets, setTickets, role, setShowNewTicket, setStatusChangeTarget, setTransferTarget } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const now = Date.now();

  // Apply URL filters
  const urlStatus = searchParams.get('status');
  const urlMine = searchParams.get('mine');
  const urlSla = searchParams.get('sla');

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (urlStatus) result = result.filter(t => t.status === urlStatus);
    if (urlMine) result = result.filter(t => t.assignee === 'Петров А.В.');
    if (urlSla === 'overdue') {
      result = result.filter(t => {
        if (!['new', 'classification', 'in_progress'].includes(t.status)) return false;
        if (t.slaPaused) return false;
        return (now - t.createdAt) > t.slaExternal * 60000;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.number.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) result = result.filter(t => statusFilter.includes(t.status));
    if (typeFilter) result = result.filter(t => t.type === typeFilter);
    if (assigneeFilter) result = result.filter(t => t.assignee === assigneeFilter);
    if (clientTypeFilter) result = result.filter(t => t.clientType === clientTypeFilter);

    return result;
  }, [tickets, search, statusFilter, typeFilter, assigneeFilter, clientTypeFilter, urlStatus, urlMine, urlSla, now]);

  const paginatedTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredTickets.length / pageSize);

  const getSLAStatus = (t: Ticket) => {
    if (t.slaPaused) return { label: 'SLA остановлен', color: '#9CA3AF', bg: '#F1F5F9' };
    if (!['new', 'classification', 'in_progress'].includes(t.status)) return { label: '—', color: '#9CA3AF', bg: 'transparent' };
    const elapsed = now - t.createdAt;
    const remaining = t.slaExternal * 60000 - elapsed;
    if (remaining < 0) return { label: `Просрочено ${Math.abs(Math.floor(remaining / 3600000))}ч ${Math.abs(Math.floor((remaining % 3600000) / 60000))}м`, color: '#B91C1C', bg: '#FEECEC' };
    if (remaining < 1800000) return { label: `Скоро ${Math.floor(remaining / 3600000)}ч ${Math.floor((remaining % 3600000) / 60000)}м`, color: '#B45309', bg: '#FFF7E8' };
    return { label: `Осталось ${Math.floor(remaining / 3600000)}ч ${Math.floor((remaining % 3600000) / 60000)}м`, color: '#047857', bg: '#E8F8F1' };
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === paginatedTickets.length) setSelected([]);
    else setSelected(paginatedTickets.map(t => t.id));
  };

  const resetFilters = () => {
    setSearch(''); setStatusFilter([]); setTypeFilter(''); setAssigneeFilter(''); setClientTypeFilter('');
  };

  const assignees = [...new Set(tickets.map(t => t.assignee))];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-[650] text-[#111827]">Заявки</h1>
          <span className="text-[14px] text-[#6B7280] bg-[#F3F6FB] px-2.5 py-0.5 rounded-full">{filteredTickets.length}</span>
        </div>
        {hasPermission(role, 'create') && (
          <button onClick={() => setShowNewTicket(true)}
            className="h-10 px-4 bg-[#2563EB] text-white rounded-xl text-[14px] font-medium flex items-center gap-2 hover:bg-[#1D4ED8]">
            <Plus size={16} /> Новая заявка
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="sticky top-16 z-30 bg-white/85 backdrop-blur-[12px] border-b border-[#E6EBF2] -mx-6 px-6 py-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 w-[280px] rounded-xl border border-[#E6EBF2] text-[14px] bg-white focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none"
              placeholder="Поиск..." />
          </div>

          {/* Status multiselect */}
          <div className="relative">
            <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="h-10 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[14px] flex items-center gap-2 hover:bg-[#F8FAFF]">
              Статус {statusFilter.length > 0 && <span className="bg-[#2563EB] text-white text-[11px] px-1.5 rounded-full">{statusFilter.length}</span>}
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 w-[240px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] z-50 p-2 animate-slide-down">
                {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([key, cfg]) => (
                  <label key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F8FAFF] cursor-pointer">
                    <input type="checkbox" checked={statusFilter.includes(key)}
                      onChange={e => {
                        if (e.target.checked) setStatusFilter(prev => [...prev, key]);
                        else setStatusFilter(prev => prev.filter(x => x !== key));
                      }}
                      className="w-4 h-4 rounded border-[#E6EBF2]" />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-[13px] text-[#111827]">{cfg.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
            <option value="">Все типы</option>
            <option value="incident">Инцидент</option>
            <option value="request">Запрос</option>
            <option value="problem">Проблема</option>
            <option value="other">Другое</option>
          </select>

          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
            <option value="">Все исполнители</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <div className="flex rounded-xl border border-[#E6EBF2] overflow-hidden">
            <button onClick={() => setClientTypeFilter('')}
              className={`h-10 px-3 text-[13px] ${!clientTypeFilter ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-white text-[#6B7280]'}`}>Все</button>
            <button onClick={() => setClientTypeFilter('external')}
              className={`h-10 px-3 text-[13px] ${clientTypeFilter === 'external' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-white text-[#6B7280]'}`}>Клиентские</button>
            <button onClick={() => setClientTypeFilter('internal')}
              className={`h-10 px-3 text-[13px] ${clientTypeFilter === 'internal' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-white text-[#6B7280]'}`}>Внутренние</button>
          </div>

          <div className="flex-1" />

          <button onClick={resetFilters} className="h-10 px-3 rounded-xl text-[13px] text-[#6B7280] hover:bg-[#F3F6FB] flex items-center gap-1.5">
            <RotateCcw size={14} /> Сбросить
          </button>
          <button className="h-10 px-3 rounded-xl text-[13px] text-[#6B7280] hover:bg-[#F3F6FB] flex items-center gap-1.5">
            <Download size={14} /> Экспорт
          </button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 mb-3 flex items-center gap-3 animate-fade-in">
          <span className="text-[14px] font-medium text-[#1D4ED8]">Выбрано {selected.length}</span>
          <div className="flex-1" />
          <button className="h-8 px-3 rounded-lg bg-white border border-[#E6EBF2] text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Сменить статус</button>
          <button className="h-8 px-3 rounded-lg bg-white border border-[#E6EBF2] text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Назначить</button>
          <button className="h-8 px-3 rounded-lg bg-white border border-[#E6EBF2] text-[13px] text-[#111827] hover:bg-[#F8FAFF]">Передать</button>
          <button onClick={() => setSelected([])} className="h-8 px-3 rounded-lg text-[13px] text-[#6B7280] hover:bg-white/50">Отмена</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E6EBF2] shadow-[0_1px_2px_rgba(17,24,39,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#F8FAFC] sticky top-0 z-10">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" checked={selected.length === paginatedTickets.length && paginatedTickets.length > 0}
                    onChange={toggleAll} className="w-4 h-4 rounded border-[#E6EBF2]" />
                </th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[110px]">ID</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 min-w-[280px]">Тема</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[180px]">Клиент</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[170px]">Статус</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[130px]">SLA</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[140px]">Тип</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[180px]">Исполнитель</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-2 py-3 w-[140px]">Создана</th>
                <th className="w-14 px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.map(t => {
                const sc = STATUS_CONFIG[t.status];
                const sla = getSLAStatus(t);
                const isOverdue = sla.color === '#B91C1C';
                return (
                  <tr key={t.id}
                    className={`border-b border-[#EEF2F7] hover:bg-[#F8FBFF] cursor-pointer ${selected.includes(t.id) ? 'bg-[#F3F7FF]' : ''} ${isOverdue ? 'bg-[#FFF8F8]' : ''}`}
                    onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-[#E6EBF2]" />
                    </td>
                    <td className="px-2 py-3">
                      <span className="font-mono text-[12px] text-[#6B7280]">{t.number}</span>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[14px] text-[#111827] font-medium truncate max-w-[320px]">{t.subject}</p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">{t.client}</p>
                    </td>
                    <td className="px-2 py-3 text-[13px] text-[#6B7280]">{t.client}</td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold ${isOverdue ? 'border border-[#FCA5A5]' : ''}`}
                        style={{ backgroundColor: isOverdue ? '#FEECEC' : sc.soft, color: isOverdue ? '#B91C1C' : sc.text }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOverdue ? '#EF4444' : sc.color }} />
                        {isOverdue ? 'Просрочено' : sc.label}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-[12px] font-medium px-2 py-1 rounded-lg" style={{ backgroundColor: sla.bg, color: sla.color }}>
                        {sla.label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[13px] text-[#6B7280]">{TYPE_LABELS[t.type]}</td>
                    <td className="px-2 py-3 text-[13px] text-[#111827]">{t.assignee}</td>
                    <td className="px-2 py-3 text-[12px] text-[#6B7280]">{formatDate(t.createdAt)}</td>
                    <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button onClick={() => setContextMenu(contextMenu === t.id ? null : t.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F6FB]">
                          <MoreHorizontal size={16} className="text-[#6B7280]" />
                        </button>
                        {contextMenu === t.id && (
                          <div className="absolute right-0 top-full mt-1 w-[200px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] z-50 py-1 animate-slide-down">
                            <button onClick={() => { navigate(`/tickets/${t.id}`); setContextMenu(null); }}
                              className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                              <Eye size={14} /> Открыть
                            </button>
                            <button onClick={() => { setStatusChangeTarget({ ticket: t, from: t.status }); setContextMenu(null); }}
                              className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                              <ArrowRightLeft size={14} /> Сменить статус
                            </button>
                            <button onClick={() => { setTransferTarget(t); setContextMenu(null); }}
                              className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                              <UserPlus size={14} /> Передать
                            </button>
                            <button onClick={() => { setContextMenu(null); }}
                              className="w-full px-3 py-2 text-left text-[13px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                              <Copy size={14} /> Копировать ссылку
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E6EBF2] flex items-center justify-between">
          <span className="text-[13px] text-[#6B7280]">
            Показано {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredTickets.length)} из {filteredTickets.length}
          </span>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 rounded-lg border border-[#E6EBF2] text-[12px] bg-white">
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 px-3 rounded-lg border border-[#E6EBF2] text-[12px] bg-white hover:bg-[#F8FAFF] disabled:opacity-40">←</button>
            <span className="text-[12px] text-[#6B7280]">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 px-3 rounded-lg border border-[#E6EBF2] text-[12px] bg-white hover:bg-[#F8FAFF] disabled:opacity-40">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../App';
import { STATUS_CONFIG, SOURCE_CONFIG, TicketStatus, formatDate, EMPLOYEES, calculateEmployeeKZ } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  Ticket, AlertTriangle, Clock, CheckCircle, RefreshCw, Download,
  TrendingUp, ArrowUpRight, ArrowDownRight, Phone, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export function Dashboard() {
  const { tickets, setShowNewTicket, scenarios } = useApp();
  const navigate = useNavigate();
  const now = Date.now();

  const openTickets = tickets.filter(t => !['closed', 'archived'].includes(t.status)).length;
  const overdueSLA = tickets.filter(t => {
    if (!['new', 'classification', 'in_progress'].includes(t.status)) return false;
    if (t.slaPaused) return false;
    return (now - t.createdAt) > t.slaExternal * 60000;
  }).length;
  const waitingTickets = tickets.filter(t => t.status === 'waiting').length;
  const closedToday = tickets.filter(t => {
    if (t.status !== 'closed' || !t.closedAt) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return t.closedAt >= today.getTime();
  }).length;
  const uspToday = tickets.filter(t => t.source === 'usp' && !['closed', 'archived'].includes(t.status)).length;
  const unassigned = tickets.filter(t => !t.assigneeId && !['closed', 'archived'].includes(t.status)).length;
  const untyped = tickets.filter(t => !t.taxonomyTypeId && !['closed', 'archived'].includes(t.status)).length;
  const activeScenarios = scenarios.filter(s => s.active);
  const totalCalls = tickets.reduce((sum, t) => sum + t.calls.length, 0);
  const analyzedCalls = tickets.reduce((sum, t) => sum + t.calls.filter(c => c.analysisStatus === 'analyzed').length, 0);

  // Chart data - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const created = tickets.filter(t => t.createdAt >= d.getTime() && t.createdAt < next.getTime()).length;
    const closed = tickets.filter(t => t.closedAt && t.closedAt >= d.getTime() && t.closedAt < next.getTime()).length;
    return {
      day: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }),
      created,
      closed,
    };
  });

  // Status distribution
  const statusData = (Object.keys(STATUS_CONFIG) as TicketStatus[]).map(s => ({
    name: STATUS_CONFIG[s].label,
    value: tickets.filter(t => t.status === s).length,
    color: STATUS_CONFIG[s].color,
  })).filter(d => d.value > 0);

  // Attention required
  const attentionTickets = tickets.filter(t => {
    if (t.status === 'archived' || t.status === 'closed') return false;
    if (t.slaPaused && !t.slaExternal) return false;
    const elapsed = now - t.createdAt;
    const isOverdue = !t.slaPaused && elapsed > t.slaExternal * 60000;
    const isNearSLA = !t.slaPaused && elapsed > (t.slaExternal - 60) * 60000;
    const isWaiting = t.status === 'waiting';
    const isPaused = t.status === 'paused';
    return isOverdue || isNearSLA || isWaiting || isPaused;
  }).slice(0, 8);

  const kpis = [
    { label: 'Открытые заявки', value: openTickets, color: '#2563EB', soft: '#EFF6FF', icon: Ticket, delta: '+3 за день' },
    { label: 'Просрочено SLA', value: overdueSLA, color: '#EF4444', soft: '#FEF2F2', icon: AlertTriangle, delta: overdueSLA > 0 ? 'Требует внимания' : 'Всё в норме' },
    { label: 'Ждём ответа', value: waitingTickets, color: '#F59E0B', soft: '#FFFBEB', icon: Clock, delta: `${waitingTickets} в очереди` },
    { label: 'Закрыто сегодня', value: closedToday, color: '#10B981', soft: '#ECFDF5', icon: CheckCircle, delta: 'За текущий день' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-[650] text-[#111827]">Дашборд</h1>
        <div className="flex items-center gap-2">
          <select className="h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white text-[#111827]">
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
            <option>Этот месяц</option>
          </select>
          <button className="h-10 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[14px] text-[#111827] flex items-center gap-2 hover:bg-[#F8FAFF]">
            <RefreshCw size={16} /> Обновить
          </button>
          <button className="h-10 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[14px] text-[#111827] flex items-center gap-2 hover:bg-[#F8FAFF]">
            <Download size={16} /> Экспорт
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-[#6B7280] mb-1">{kpi.label}</p>
                  <p className="text-[30px] font-bold text-[#111827] leading-tight">{kpi.value}</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">{kpi.delta}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.soft }}>
                  <Icon size={20} style={{ color: kpi.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source distribution + Active scenarios */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2]">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Источники заявок</h3>
          <div className="space-y-2">
            {(Object.entries(SOURCE_CONFIG) as any[]).map(([key, cfg]) => {
              const count = tickets.filter(t => t.source === key && !['closed', 'archived'].includes(t.status)).length;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[14px]">{cfg.icon}</span>
                  <span className="text-[12px] text-[#6B7280] flex-1">{cfg.label}</span>
                  <span className="text-[12px] font-semibold text-[#111827]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2]">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Активные сценарии</h3>
          {activeScenarios.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">Нет активных сценариев</p>
          ) : (
            <div className="space-y-2">
              {activeScenarios.map(s => (
                <div key={s.id} className="p-2 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                  <p className="text-[13px] font-medium text-[#047857]">{s.name}</p>
                  <p className="text-[11px] text-[#065F46]">Затронуто: {s.affectedCount} заявок</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2]">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3 flex items-center gap-2">
            <Phone size={16} /> Звонки
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Всего звонков:</span><span className="text-[14px] font-bold text-[#111827]">{totalCalls}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">AI-проанализировано:</span><span className="text-[14px] font-bold text-[#8B5CF6]">{analyzedCalls}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Средняя длительность:</span><span className="text-[14px] font-bold text-[#111827]">10 мин</span></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
        {/* Area Chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Динамика заявок за 7 дней</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EBF2" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EBF2', fontSize: 13 }} />
                <Area type="monotone" dataKey="created" stroke="#2563EB" fill="url(#colorCreated)" strokeWidth={2} name="Создано" />
                <Area type="monotone" dataKey="closed" stroke="#10B981" fill="url(#colorClosed)" strokeWidth={2} name="Закрыто" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBF2] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Распределение по статусам</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EBF2', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-[#6B7280]">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attention Table */}
      <div className="bg-white rounded-2xl border border-[#E6EBF2] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        <div className="px-5 py-4 border-b border-[#E6EBF2] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#111827]">Требуют внимания</h3>
          <button onClick={() => navigate('/tickets')} className="text-[13px] text-[#2563EB] font-medium hover:underline">
            Все заявки →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-4 py-3">№</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-4 py-3">Тема</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-4 py-3">Клиент</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-4 py-3">Статус</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] px-4 py-3">SLA</th>
              </tr>
            </thead>
            <tbody>
              {attentionTickets.map(t => {
                const sc = STATUS_CONFIG[t.status];
                const elapsed = now - t.createdAt;
                const remaining = t.slaExternal * 60000 - elapsed;
                const isOverdue = !t.slaPaused && remaining < 0;
                return (
                  <tr key={t.id} className={`border-b border-[#EEF2F7] hover:bg-[#F8FBFF] cursor-pointer ${isOverdue ? 'bg-[#FFF8F8]' : ''}`}
                    onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6B7280]">{t.number}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827] max-w-[280px] truncate">{t.subject}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{t.client}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold"
                        style={{ backgroundColor: isOverdue ? '#FEECEC' : sc.soft, color: isOverdue ? '#B91C1C' : sc.text, border: isOverdue ? '1px solid #FCA5A5' : 'none' }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOverdue ? '#EF4444' : sc.color }} />
                        {isOverdue ? 'Просрочено' : sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.slaPaused ? (
                        <span className="text-[12px] text-[#9CA3AF]">SLA остановлен</span>
                      ) : isOverdue ? (
                        <span className="text-[12px] text-[#EF4444] font-medium">Просрочено {Math.abs(Math.floor(remaining / 3600000))}ч</span>
                      ) : (
                        <span className="text-[12px] text-[#6B7280]">{Math.floor(remaining / 3600000)}ч {Math.floor((remaining % 3600000) / 60000)}м</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

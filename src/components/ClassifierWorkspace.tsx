import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useToast } from './Toast';
import {
  Ticket, TicketStatus, STATUS_CONFIG, SOURCE_CONFIG, EXECUTOR_PRIORITY_CONFIG,
  EMPLOYEES, TAXONOMY_GROUPS, TAXONOMY_TYPES, getTaxonomyType, getTaxonomyGroup,
  calculateEmployeeKZ, hasPermission, formatDate, formatTimeRemaining,
  TicketSource, ContractType, ExecutorPriority
} from '../store';
import { RefreshCw, Sparkles, Lock, AlertTriangle, User, ChevronRight, Info } from 'lucide-react';

export function ClassifierWorkspace() {
  const { tickets, setTickets, role, scenarios } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState<TicketSource | ''>('');
  const [lineFilter, setLineFilter] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [classifyTarget, setClassifyTarget] = useState<Ticket | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const now = Date.now();

  const unassigned = tickets.filter(t => !t.assigneeId && !['closed', 'archived'].includes(t.status));
  const untyped = tickets.filter(t => !t.taxonomyTypeId && !['closed', 'archived'].includes(t.status));
  const fromUsp = tickets.filter(t => t.source === 'usp' && !['closed', 'archived'].includes(t.status));
  const overdue = tickets.filter(t => {
    if (!['new', 'classification', 'in_progress'].includes(t.status)) return false;
    if (t.slaPaused) return false;
    return (now - t.createdAt) > t.slaExternal * 60000;
  });

  const queue = tickets.filter(t => {
    if (['closed', 'archived'].includes(t.status)) return false;
    if (t.assigneeId) return false;
    if (sourceFilter && t.source !== sourceFilter) return false;
    if (lineFilter && t.line !== lineFilter) return false;
    return true;
  });

  const employeeKZs = EMPLOYEES.filter(e => e.role === 'engineer').map(e => ({
    employee: e,
    kz: calculateEmployeeKZ(e.id, tickets),
  }));

  const avgKZ = employeeKZs.reduce((s, x) => s + x.kz.kz, 0) / (employeeKZs.length || 1);
  const overloaded = employeeKZs.filter(x => x.kz.kz > 1.0).length;

  const handleAutoDistribute = () => {
    addToast('Автораспределение запущено (демо)', 'info');
  };

  const handleClassify = (ticket: Ticket, taxonomyTypeId: string, assigneeId: string, line: string, comment: string) => {
    const emp = EMPLOYEES.find(e => e.id === assigneeId);
    const now2 = Date.now();
    setTickets(prev => prev.map(t => t.id === ticket.id ? {
      ...t,
      taxonomyTypeId,
      taxonomyConfirmed: true,
      assignee: emp?.name || t.assignee,
      assigneeId,
      line,
      status: 'in_progress' as TicketStatus,
      updatedAt: now2,
      auditLog: [...t.auditLog,
        { id: Math.random().toString(36), action: 'Классификация', author: 'Классификатор', timestamp: now2, newValue: getTaxonomyType(taxonomyTypeId)?.name },
        { id: Math.random().toString(36), action: 'Назначение исполнителя', author: 'Классификатор', timestamp: now2, newValue: emp?.name },
      ],
    } : t));
    setClassifyTarget(null);
    addToast(`Заявка ${ticket.number} классифицирована (демо)`, 'success');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-[650] text-[#111827]">Классификация</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Рабочее место классификатора</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-3 rounded-xl border border-[#E6EBF2] bg-white text-[14px] flex items-center gap-2 hover:bg-[#F8FAFF]">
            <RefreshCw size={16} /> Обновить
          </button>
          <button onClick={handleAutoDistribute} className="h-10 px-4 rounded-xl bg-[#8B5CF6] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#7C3AED]">
            <Sparkles size={16} /> Автораспределение (демо)
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="h-8 px-3 rounded-full bg-[#FEECEC] text-[#B91C1C] text-[13px] font-medium flex items-center gap-1.5">
          Без исполнителя: <b>{unassigned.length}</b>
        </span>
        <span className="h-8 px-3 rounded-full bg-[#FFF7E8] text-[#B45309] text-[13px] font-medium flex items-center gap-1.5">
          Без типа: <b>{untyped.length}</b>
        </span>
        <span className="h-8 px-3 rounded-full bg-[#ECFEFF] text-[#0E7490] text-[13px] font-medium flex items-center gap-1.5">
          Из УСП: <b>{fromUsp.length}</b>
        </span>
        <span className="h-8 px-3 rounded-full bg-[#FEECEC] text-[#B91C1C] text-[13px] font-medium flex items-center gap-1.5">
          Просрочено: <b>{overdue.length}</b>
        </span>
        <div className="flex-1" />
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as any)}
          className="h-9 px-3 rounded-xl border border-[#E6EBF2] text-[13px] bg-white">
          <option value="">Все источники</option>
          {(Object.entries(SOURCE_CONFIG) as any[]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={lineFilter} onChange={e => setLineFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border border-[#E6EBF2] text-[13px] bg-white">
          <option value="">Все линии</option>
          <option>Первая линия</option>
          <option>Вторая линия</option>
          <option>Третья линия</option>
        </select>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Без исполнителя', value: unassigned.length, color: '#EF4444', soft: '#FEECEC' },
          { label: 'Без типа', value: untyped.length, color: '#F59E0B', soft: '#FFF7E8' },
          { label: 'Из УСП', value: fromUsp.length, color: '#06B6D4', soft: '#ECFEFF' },
          { label: 'Средний КЗ', value: avgKZ.toFixed(2), color: avgKZ > 1 ? '#EF4444' : avgKZ > 0.7 ? '#F59E0B' : '#10B981', soft: avgKZ > 1 ? '#FEECEC' : avgKZ > 0.7 ? '#FFF7E8' : '#ECFDF5' },
          { label: 'Перегружены', value: overloaded, color: '#EF4444', soft: '#FEECEC' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-[#E6EBF2]">
            <p className="text-[12px] text-[#6B7280]">{kpi.label}</p>
            <p className="text-[24px] font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-4">
        {/* Queue */}
        <div className="bg-white rounded-2xl border border-[#E6EBF2] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E6EBF2] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#111827]">Очередь на классификацию</h3>
            <span className="text-[12px] text-[#6B7280]">{queue.length} заявок</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="w-10 px-3 py-2"><input type="checkbox" onChange={e => setSelectedTickets(e.target.checked ? queue.map(t => t.id) : [])} className="w-4 h-4" /></th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">№</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">Тема</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">Источник</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">Клиент</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">Статус</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] px-2 py-2">Таксономия</th>
                  <th className="w-32 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {queue.map(t => {
                  const sc = STATUS_CONFIG[t.status];
                  const src = SOURCE_CONFIG[t.source];
                  const taxType = getTaxonomyType(t.taxonomyTypeId);
                  const taxGroup = getTaxonomyGroup(taxType?.groupId);
                  return (
                    <tr key={t.id} className="border-b border-[#EEF2F7] hover:bg-[#F8FBFF]">
                      <td className="px-3 py-2.5"><input type="checkbox" checked={selectedTickets.includes(t.id)} onChange={() => setSelectedTickets(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])} className="w-4 h-4" /></td>
                      <td className="px-2 py-2.5 font-mono text-[11px] text-[#6B7280]">{t.number}</td>
                      <td className="px-2 py-2.5 text-[13px] text-[#111827] max-w-[240px] truncate">{t.subject}</td>
                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium" style={{ backgroundColor: src.soft, color: src.text }}>
                          {src.icon} {src.label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-[12px] text-[#6B7280]">{t.client}</td>
                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold" style={{ backgroundColor: sc.soft, color: sc.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.color }} />{sc.label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-[11px] text-[#6B7280]">
                        {taxType ? <>{taxGroup?.name} / {taxType.name}</> : <span className="text-[#EF4444]">Не задан</span>}
                      </td>
                      <td className="px-2 py-2.5">
                        <button onClick={() => setClassifyTarget(t)} className="h-7 px-2.5 rounded-lg bg-[#2563EB] text-white text-[11px] font-medium hover:bg-[#1D4ED8]">
                          Классифицировать
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employees */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#111827]">Загрузка сотрудников</h3>
            <button onClick={() => setShowFormula(true)} className="text-[12px] text-[#2563EB] flex items-center gap-1 hover:underline">
              <Info size={12} /> Формула
            </button>
          </div>
          {employeeKZs.map(({ employee, kz }) => {
            const kzColor = kz.kz > 1 ? '#EF4444' : kz.kz > 0.7 ? '#F59E0B' : '#10B981';
            const kzBg = kz.kz > 1 ? '#FEECEC' : kz.kz > 0.7 ? '#FFF7E8' : '#ECFDF5';
            return (
              <div key={employee.id} className="bg-white rounded-2xl border border-[#E6EBF2] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-[13px] font-semibold">{employee.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#111827]">{employee.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{employee.line}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold" style={{ color: kzColor }}>{kz.kz.toFixed(2)}</p>
                    <p className="text-[10px] text-[#9CA3AF]">КЗ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 text-[11px] text-[#6B7280]">
                  <span>Заявок: <b className="text-[#111827]">{kz.activeTickets}</b></span>
                  <span>•</span>
                  <span>План: <b className="text-[#111827]">{kz.plannedTime}ч</b></span>
                  <span>•</span>
                  <span>Взвеш.: <b className="text-[#111827]">{kz.weightedLoad.toFixed(1)}ч</b></span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {(['now', 'today', 'tomorrow', 'this_week'] as ExecutorPriority[]).map(p => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: EXECUTOR_PRIORITY_CONFIG[p].soft, color: EXECUTOR_PRIORITY_CONFIG[p].color }}>
                      {EXECUTOR_PRIORITY_CONFIG[p].label}: {kz.byPriority[p]}
                    </span>
                  ))}
                </div>
                <div className="w-full h-2 bg-[#F3F6FB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, kz.kz * 100)}%`, backgroundColor: kzColor }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-[#9CA3AF]">{kz.weightedLoad.toFixed(1)}ч / {kz.availableTime}ч</span>
                  <button onClick={() => navigate('/tickets')} className="text-[11px] text-[#2563EB] hover:underline">Открыть заявки →</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Classify modal */}
      {classifyTarget && <ClassifyModal ticket={classifyTarget} onClose={() => setClassifyTarget(null)} onClassify={handleClassify} />}

      {/* Formula modal */}
      {showFormula && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm" onClick={() => setShowFormula(false)} />
          <div className="relative w-[560px] bg-white rounded-[20px] shadow-2xl p-6 animate-fade-in">
            <h2 className="text-[20px] font-semibold text-[#111827] mb-4">Формула коэффициента загрузки (КЗ)</h2>
            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
              <p className="text-[14px] font-mono text-[#111827]">КЗ = Σ (Плановое время × Вес статуса × Вес приоритета) / Доступное время</p>
            </div>
            <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Веса статусов</h3>
            <div className="grid grid-cols-2 gap-2 mb-4 text-[12px]">
              {Object.entries({ 'В работе': 1.0, 'Пауза': 0.8, 'Согласование': 0.3, 'Ждём ответа': 0.2, 'Новая/Классификация': 0, 'Закрыта/Архив': 0 }).map(([k, v]) => (
                <div key={k} className="flex justify-between px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                  <span className="text-[#6B7280]">{k}</span><span className="font-mono font-semibold text-[#111827]">{v}</span>
                </div>
              ))}
            </div>
            <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Веса приоритетов</h3>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {Object.entries(EXECUTOR_PRIORITY_CONFIG).map(([k, v]) => (
                <div key={k} className="flex justify-between px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                  <span style={{ color: v.color }}>{v.label}</span><span className="font-mono font-semibold text-[#111827]">{v.weight}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowFormula(false)} className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8]">Понятно</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassifyModal({ ticket, onClose, onClassify }: { ticket: Ticket; onClose: () => void; onClassify: (t: Ticket, taxId: string, empId: string, line: string, comment: string) => void }) {
  const { tickets } = useApp();
  const [selectedTax, setSelectedTax] = useState(ticket.taxonomyTypeId || '');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedLine, setSelectedLine] = useState(ticket.line);
  const [comment, setComment] = useState('');
  const [search, setSearch] = useState('');

  const filteredGroups = TAXONOMY_GROUPS.map(g => ({
    ...g,
    types: TAXONOMY_TYPES.filter(t => t.groupId === g.id && t.active && (search === '' || t.name.toLowerCase().includes(search.toLowerCase()))),
  })).filter(g => g.types.length > 0);

  const selectedType = getTaxonomyType(selectedTax);
  const selectedEmpKZ = selectedEmp ? calculateEmployeeKZ(selectedEmp, tickets) : null;
  const canSave = selectedTax && selectedEmp;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[640px] max-h-[85vh] bg-white rounded-[20px] shadow-2xl flex flex-col animate-fade-in">
        <div className="px-6 pt-6 pb-4 border-b border-[#E6EBF2] shrink-0">
          <h2 className="text-[20px] font-semibold text-[#111827]">Классификация заявки</h2>
          <p className="text-[13px] text-[#6B7280] mt-1 font-mono">{ticket.number} — {ticket.subject}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div><span className="text-[#6B7280]">Источник:</span> <span className="text-[#111827] font-medium">{SOURCE_CONFIG[ticket.source].label}</span></div>
            <div><span className="text-[#6B7280]">Клиент:</span> <span className="text-[#111827] font-medium">{ticket.client}</span></div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Таксономия *</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск типа..."
              className="w-full h-9 px-3 rounded-xl border border-[#E6EBF2] text-[13px] bg-white mb-2" />
            <div className="max-h-[240px] overflow-y-auto border border-[#E6EBF2] rounded-xl">
              {filteredGroups.map(g => (
                <div key={g.id}>
                  <div className="px-3 py-1.5 bg-[#F8FAFC] text-[11px] font-semibold text-[#6B7280] uppercase sticky top-0">{g.name}</div>
                  {g.types.map(t => (
                    <button key={t.id} onClick={() => setSelectedTax(t.id)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F8FAFF] ${selectedTax === t.id ? 'bg-[#EFF6FF]' : ''}`}>
                      <span className="text-[13px] text-[#111827]">{t.name}</span>
                      <span className="text-[11px] text-[#6B7280]">{t.plannedTime} ч</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {selectedType && (
              <div className="mt-2 flex items-center gap-2 text-[12px]">
                <span className="px-2 py-1 rounded-md bg-[#EFF6FF] text-[#1D4ED8]">Плановое время: {selectedType.plannedTime} ч</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Линия</label>
            <select value={selectedLine} onChange={e => setSelectedLine(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option>Первая линия</option><option>Вторая линия</option><option>Третья линия</option><option>Эскалация</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Исполнитель *</label>
            <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Выберите</option>
              {EMPLOYEES.filter(e => e.role === 'engineer').map(e => <option key={e.id} value={e.id}>{e.name} — {e.line}</option>)}
            </select>
            {selectedEmpKZ && (
              <div className={`mt-2 p-2 rounded-lg text-[12px] ${selectedEmpKZ.kz > 1 ? 'bg-[#FEECEC] text-[#B91C1C]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
                КЗ исполнителя: {selectedEmpKZ.kz.toFixed(2)} {selectedEmpKZ.kz > 1 && '⚠️ Перегруз'}
              </div>
            )}
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Комментарий классификатора</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full min-h-[72px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E6EBF2] flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-[#E6EBF2] text-[14px] text-[#111827] hover:bg-[#F8FAFF]">Отмена</button>
          <button onClick={() => canSave && onClassify(ticket, selectedTax, selectedEmp, selectedLine, comment)} disabled={!canSave}
            className="h-10 px-5 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] disabled:opacity-40">
            Классифицировать и назначить
          </button>
        </div>
      </div>
    </div>
  );
}

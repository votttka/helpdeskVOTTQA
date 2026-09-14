import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { Scenario, SOURCE_CONFIG, EXECUTOR_PRIORITY_CONFIG, hasPermission, formatDate } from '../store';
import { Plus, Power, Edit2, Copy, History, X } from 'lucide-react';

export function ScenariosPage() {
  const { scenarios, setScenarios, role, tickets } = useApp();
  const { addToast } = useToast();
  const [editTarget, setEditTarget] = useState<Scenario | null>(null);
  const [showNew, setShowNew] = useState(false);
  const canEdit = role === 'admin';
  const canView = role === 'admin' || role === 'lead' || role === 'auditor';

  const toggleScenario = (id: string) => {
    if (!canEdit) { addToast('Недостаточно прав', 'error'); return; }
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, active: !s.active, lastModified: Date.now() } : s));
    addToast('Сценарий переключён (демо)', 'success');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-[650] text-[#111827]">Сценарии и воронки</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Управляемые сценарии обработки заявок</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowNew(true)} className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#1D4ED8]">
            <Plus size={16} /> Новый сценарий
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scenarios.map(s => (
          <div key={s.id} className={`bg-white rounded-2xl border p-5 ${s.active ? 'border-[#10B981] shadow-[0_4px_12px_rgba(16,185,129,0.08)]' : 'border-[#E6EBF2]'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-semibold text-[#111827]">{s.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.active ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                    {s.active ? 'Включён' : 'Выключен'}
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{s.description}</p>
              </div>
              {canEdit && (
                <button onClick={() => toggleScenario(s.id)}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${s.active ? 'bg-[#10B981]' : 'bg-[#E6EBF2]'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${s.active ? 'translate-x-5' : ''}`} />
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-[12px] mb-3">
              <div className="flex justify-between"><span className="text-[#6B7280]">Затронуто заявок:</span><span className="font-semibold text-[#111827]">{s.affectedCount}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">Порог похожих:</span><span className="font-semibold text-[#111827]">{s.conditions.minSimilar}</span></div>
              {s.priorityHint && (
                <div className="flex justify-between"><span className="text-[#6B7280]">Подсказка приоритета:</span>
                  <span className="font-semibold" style={{ color: EXECUTOR_PRIORITY_CONFIG[s.priorityHint].color }}>{EXECUTOR_PRIORITY_CONFIG[s.priorityHint].label}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-[#6B7280]">Изменён:</span><span className="text-[#111827]">{formatDate(s.lastModified)}</span></div>
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase mb-1">Действия</p>
              <div className="flex flex-wrap gap-1">
                {s.actions.map((a, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F3F6FB] text-[#475569]">{a}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-[#E6EBF2]">
              <button onClick={() => setEditTarget(s)} className="h-8 px-2.5 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF] flex items-center gap-1.5">
                <Edit2 size={12} /> Редактировать
              </button>
              {canEdit && (
                <button onClick={() => { setScenarios(prev => [...prev, { ...s, id: Math.random().toString(36), name: s.name + ' (копия)', active: false }]); addToast('Сценарий дублирован (демо)', 'success'); }}
                  className="h-8 px-2.5 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF] flex items-center gap-1.5">
                  <Copy size={12} /> Дубликат
                </button>
              )}
              <button className="h-8 px-2.5 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF] flex items-center gap-1.5">
                <History size={12} /> История
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editTarget || showNew) && (
        <ScenarioEditor scenario={editTarget} onClose={() => { setEditTarget(null); setShowNew(false); }} />
      )}
    </div>
  );
}

function ScenarioEditor({ scenario, onClose }: { scenario: Scenario | null; onClose: () => void }) {
  const { setScenarios } = useApp();
  const { addToast } = useToast();
  const [name, setName] = useState(scenario?.name || '');
  const [description, setDescription] = useState(scenario?.description || '');
  const [minSimilar, setMinSimilar] = useState(scenario?.conditions.minSimilar || 5);
  const [priorityHint, setPriorityHint] = useState(scenario?.priorityHint || '');

  const handleSave = () => {
    if (scenario) {
      setScenarios(prev => prev.map(s => s.id === scenario.id ? { ...s, name, description, conditions: { ...s.conditions, minSimilar }, priorityHint: priorityHint as any, lastModified: Date.now() } : s));
    } else {
      setScenarios(prev => [...prev, {
        id: Math.random().toString(36), name, description, active: false, affectedCount: 0,
        conditions: { minSimilar }, priorityHint: priorityHint as any, actions: ['Добавить тег', 'Назначить линию'], showBanner: true, lastModified: Date.now(),
      }]);
    }
    addToast('Сценарий сохранён (демо)', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-[560px] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E6EBF2] shrink-0">
          <h2 className="text-[18px] font-semibold text-[#111827]">{scenario ? 'Редактирование' : 'Новый'} сценарий</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB]"><X size={18} className="text-[#6B7280]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Название</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full min-h-[96px] p-3 rounded-xl border border-[#E6EBF2] text-[14px] resize-none" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Порог похожих заявок</label>
            <input type="number" value={minSimilar} onChange={e => setMinSimilar(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#111827] block mb-1.5">Подсказка приоритета</label>
            <select value={priorityHint} onChange={e => setPriorityHint(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white">
              <option value="">Не задана</option>
              <option value="now">Сейчас</option>
              <option value="today">Сегодня</option>
              <option value="tomorrow">Завтра</option>
              <option value="this_week">На этой неделе</option>
            </select>
            <p className="text-[11px] text-[#6B7280] mt-1">Подсказка не устанавливает приоритет за исполнителя</p>
          </div>
        </div>
        <div className="h-[72px] px-6 flex items-center justify-end gap-3 border-t border-[#E6EBF2] shrink-0">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-[#E6EBF2] text-[14px] text-[#111827] hover:bg-[#F8FAFF]">Отмена</button>
          <button onClick={handleSave} disabled={!name.trim()} className="h-10 px-5 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] disabled:opacity-40">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../App';
import { useToast } from './Toast';
import { STATUS_CONFIG, TicketStatus, hasPermission, ROLE_LABELS, Role, ROLE_PERMISSIONS } from '../store';
import {
  Save, RotateCcw, Check, X, Plus, GripVertical, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';

const TABS = ['Статусы', 'Переходы', 'Автоматика', 'SLA', 'Воронки', 'Роли', 'Интеграции'];

export function SettingsPage() {
  const { settings, setSettings, role, tickets } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const canEdit = role === 'admin' || role === 'lead';
  const isReadOnly = role === 'auditor';

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    setSettings(localSettings);
    addToast('Сохранено (демо)', 'success');
  };

  const handleReset = () => {
    setLocalSettings({ autoTransitionHours: 24, autoArchiveDays: 30, slaWarningMinutes: 30, externalSla: 480, internalSla: 240 });
    addToast('Настройки сброшены (демо)', 'info');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-[650] text-[#111827]">Настройки</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Демо-конфигурация системы</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="h-10 px-4 rounded-xl border border-[#E6EBF2] bg-white text-[14px] text-[#111827] flex items-center gap-2 hover:bg-[#F8FAFF]">
            <RotateCcw size={16} /> Сбросить настройки
          </button>
          {canEdit && !isReadOnly && (
            <button onClick={handleSave} className="h-10 px-4 rounded-xl bg-[#2563EB] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#1D4ED8]">
              <Save size={16} /> Сохранить
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-[#F6F8FC] border-b border-[#E6EBF2] -mx-6 px-6 mb-6">
        <div className="flex gap-0">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === i ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Statuses */}
      {activeTab === 0 && (
        <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#111827]">Статусы</h3>
            {canEdit && <button className="h-9 px-3 rounded-xl bg-[#2563EB] text-white text-[13px] flex items-center gap-1.5 hover:bg-[#1D4ED8]"><Plus size={14} /> Добавить статус</button>}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EBF2]">
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3 w-8"></th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Статус</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Цвет</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Превью</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">SLA</th>
                <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">В активных</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([key, cfg]) => (
                <tr key={key} className="border-b border-[#EEF2F7]">
                  <td className="py-3"><GripVertical size={14} className="text-[#9CA3AF]" /></td>
                  <td className="py-3 text-[14px] text-[#111827]">{cfg.label}</td>
                  <td className="py-3">
                    <div className="w-6 h-6 rounded-md border border-[#E6EBF2]" style={{ backgroundColor: cfg.color }} />
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: cfg.soft, color: cfg.text }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer ${['new', 'classification', 'in_progress'].includes(key) ? 'bg-[#2563EB]' : 'bg-[#E6EBF2]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${['new', 'classification', 'in_progress'].includes(key) ? 'translate-x-5' : ''}`} />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer ${key !== 'archived' ? 'bg-[#2563EB]' : 'bg-[#E6EBF2]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${key !== 'archived' ? 'translate-x-5' : ''}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transitions */}
      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Матрица переходов</h3>
          <div className="overflow-x-auto">
            <table className="min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] p-2 w-[120px]">Из ↓ / В →</th>
                  {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([key, cfg]) => (
                    <th key={key} className="text-center text-[11px] font-semibold p-2" style={{ color: cfg.text }}>{cfg.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([fromKey, fromCfg]) => (
                  <tr key={fromKey}>
                    <td className="text-[12px] font-medium text-[#111827] p-2">{fromCfg.label}</td>
                    {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(toKey => {
                      const allowed = isTransitionAllowed(fromKey, toKey);
                      return (
                        <td key={toKey} className="text-center p-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
                            allowed ? 'bg-[#E8F8F1] hover:bg-[#D1FAE5]' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0]'
                          }`}>
                            {allowed ? <Check size={14} className="text-[#10B981]" /> : <X size={14} className="text-[#9CA3AF]" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Automation */}
      {activeTab === 2 && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Автопереход из «Ждём ответа»', desc: 'Через N часов автоматически переходит в целевой статус', fields: [
              { label: 'Часов ожидания', value: localSettings.autoTransitionHours, key: 'autoTransitionHours' },
              { label: 'Целевой статус', value: 'В работе', key: 'target' },
            ]},
            { title: 'Возврат с паузы', desc: 'После выбранного срока возвращается в «В работе»', fields: [
              { label: 'Макс. пауза', value: '8 часов', key: 'maxPause' },
            ]},
            { title: 'Автоархивация', desc: 'Через N дней после закрытия переходит в архив', fields: [
              { label: 'Дней после закрытия', value: localSettings.autoArchiveDays, key: 'autoArchiveDays' },
            ]},
            { title: 'SLA-алерты', desc: 'Предупреждение за N минут до истечения SLA', fields: [
              { label: 'Минут до предупреждения', value: localSettings.slaWarningMinutes, key: 'slaWarningMinutes' },
            ]},
            { title: 'Автоклассификация', desc: 'Подсказка типа обращения', fields: [
              { label: 'Режим', value: 'Демо, без реального AI', key: 'mode' },
            ]},
          ].map(card => (
            <div key={card.title} className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[15px] font-semibold text-[#111827]">{card.title}</h4>
                <div className="w-11 h-6 rounded-full bg-[#2563EB] flex items-center px-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-5" />
                </div>
              </div>
              <p className="text-[13px] text-[#6B7280] mb-4">{card.desc}</p>
              {card.fields.map(f => (
                <div key={f.key} className="flex items-center justify-between py-2 border-t border-[#EEF2F7]">
                  <span className="text-[13px] text-[#6B7280]">{f.label}</span>
                  <span className="text-[13px] text-[#111827] font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* SLA */}
      {activeTab === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
            <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Глобальные параметры SLA</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] text-[#6B7280] block mb-1">Внешний SLA (мин)</label>
                <input type="number" value={localSettings.externalSla} onChange={e => setLocalSettings({ ...localSettings, externalSla: Number(e.target.value) })}
                  disabled={isReadOnly}
                  className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white disabled:bg-[#F8FAFC]" />
              </div>
              <div>
                <label className="text-[12px] text-[#6B7280] block mb-1">Внутренний SLA (мин)</label>
                <input type="number" value={localSettings.internalSla} onChange={e => setLocalSettings({ ...localSettings, internalSla: Number(e.target.value) })}
                  disabled={isReadOnly}
                  className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white disabled:bg-[#F8FAFC]" />
              </div>
              <div>
                <label className="text-[12px] text-[#6B7280] block mb-1">Буфер (мин)</label>
                <input type="number" value={30} disabled={isReadOnly}
                  className="w-full h-10 px-3 rounded-xl border border-[#E6EBF2] text-[14px] bg-white disabled:bg-[#F8FAFC]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-[12px] text-[#6B7280]">Пороги:</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#10B981]" /><span className="text-[12px]">&gt;50%</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F59E0B]" /><span className="text-[12px]">25-50%</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F97316]" /><span className="text-[12px]">&lt;25%</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#EF4444]" /><span className="text-[12px]">Просрочка</span></span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
            <h3 className="text-[16px] font-semibold text-[#111827] mb-4">SLA по типам</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6EBF2]">
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Тип</th>
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Внешний SLA</th>
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Внутренний SLA</th>
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Пауза</th>
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Ожидание</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Инцидент', ext: 240, int: 120, pause: true, wait: true },
                  { type: 'Запрос', ext: 480, int: 240, pause: true, wait: true },
                  { type: 'Проблема', ext: 720, int: 360, pause: true, wait: true },
                  { type: 'Другое', ext: 960, int: 480, pause: false, wait: true },
                ].map(row => (
                  <tr key={row.type} className="border-b border-[#EEF2F7]">
                    <td className="py-3 text-[14px] text-[#111827]">{row.type}</td>
                    <td className="py-3 text-[13px] text-[#6B7280]">{row.ext} мин</td>
                    <td className="py-3 text-[13px] text-[#6B7280]">{row.int} мин</td>
                    <td className="py-3">{row.pause ? <Check size={16} className="text-[#10B981]" /> : <X size={16} className="text-[#9CA3AF]" />}</td>
                    <td className="py-3">{row.wait ? <Check size={16} className="text-[#10B981]" /> : <X size={16} className="text-[#9CA3AF]" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Funnels */}
      {activeTab === 4 && (
        <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-6">Воронка статусов</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {(Object.entries(STATUS_CONFIG) as [TicketStatus, typeof STATUS_CONFIG[TicketStatus]][]).map(([key, cfg], i, arr) => {
              const count = tickets.filter(t => t.status === key).length;
              return (
                <React.Fragment key={key}>
                  <div className="min-w-[140px] rounded-xl p-4 text-center border" style={{ backgroundColor: cfg.soft, borderColor: cfg.color + '40' }}>
                    <div className="text-[24px] font-bold" style={{ color: cfg.text }}>{count}</div>
                    <div className="text-[12px] font-medium mt-1" style={{ color: cfg.text }}>{cfg.label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="text-[#9CA3AF] text-xl">→</div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Roles */}
      {activeTab === 5 && (
        <div className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Матрица прав ролей</h3>
          <div className="overflow-x-auto">
            <table className="min-w-[800px]">
              <thead>
                <tr className="border-b border-[#E6EBF2]">
                  <th className="text-left text-[12px] font-semibold text-[#6B7280] pb-3">Право</th>
                  {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([key, label]) => (
                    <th key={key} className="text-center text-[11px] font-semibold text-[#6B7280] pb-3">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['dashboard', 'tickets', 'create', 'classify', 'close', 'archive', 'reassign', 'transfer', 'settings', 'audit', 'export'].map(perm => (
                  <tr key={perm} className="border-b border-[#EEF2F7]">
                    <td className="py-2.5 text-[13px] text-[#111827] capitalize">{perm}</td>
                    {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
                      <td key={r} className="text-center py-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto ${
                          ROLE_PERMISSIONS[r]?.includes(perm) ? 'bg-[#E8F8F1]' : 'bg-[#F1F5F9]'
                        }`}>
                          {ROLE_PERMISSIONS[r]?.includes(perm) ? <Check size={12} className="text-[#10B981]" /> : <X size={12} className="text-[#CBD5E1]" />}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 6 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Телефония', desc: 'Интеграция с IP-АТС для записи звонков' },
            { name: 'УСП', desc: 'Унифицированная система отчётности' },
            { name: 'Бухгалтерия', desc: 'Обмен данными с бухгалтерской системой' },
            { name: 'SSO', desc: 'Единая авторизация через корпоративный каталог' },
            { name: 'Трекер', desc: 'Связь с системой управления задачами' },
            { name: 'Аналитика', desc: 'Выгрузка данных в BI-систему' },
            { name: 'База знаний', desc: 'Интеграция с внутренней базой знаний' },
          ].map(int => (
            <div key={int.name} className="bg-white rounded-2xl border border-[#E6EBF2] p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[15px] font-semibold text-[#111827]">{int.name}</h4>
                <span className="text-[10px] bg-[#F3F6FB] text-[#6B7280] px-2 py-0.5 rounded-full font-medium">Mock</span>
              </div>
              <p className="text-[13px] text-[#6B7280] mb-4">{int.desc}</p>
              <div className="flex gap-2">
                <button onClick={() => addToast('Интеграция в режиме эмуляции', 'info')}
                  className="h-8 px-3 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF]">
                  Проверить обмен
                </button>
                <button onClick={() => addToast('Журнал событий пуст (демо)', 'info')}
                  className="h-8 px-3 rounded-lg border border-[#E6EBF2] text-[12px] text-[#6B7280] hover:bg-[#F8FAFF]">
                  Журнал событий
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isTransitionAllowed(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return false;
  const allowed: Record<TicketStatus, TicketStatus[]> = {
    new: ['classification', 'closed'],
    classification: ['in_progress', 'new'],
    in_progress: ['waiting', 'paused', 'closed'],
    waiting: ['in_progress', 'paused', 'closed'],
    paused: ['in_progress', 'closed'],
    closed: ['archived', 'in_progress'],
    archived: [],
  };
  return allowed[from]?.includes(to) || false;
}

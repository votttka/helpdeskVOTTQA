import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { ROLE_LABELS, Role, hasPermission, STATUS_CONFIG, formatDate, resetDemoData } from '../store';
import {
  LayoutDashboard, Ticket, Filter, FolderOpen, Clock, PauseCircle,
  Archive, Settings, ChevronDown, Search, Bell, Plus, Menu, User,
  Shield, AlertTriangle, CheckCircle, X, Headphones, BarChart3,
  LogOut, RefreshCw, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'Обзор', items: [
    { label: 'Дашборд', icon: LayoutDashboard, path: '/' },
    { label: 'Заявки', icon: Ticket, path: '/tickets' },
    { label: 'Воронка', icon: BarChart3, path: '/funnel' },
  ]},
  { group: 'Очереди', items: [
    { label: 'Мои заявки', icon: FolderOpen, path: '/tickets?mine=true' },
    { label: 'Просрочено SLA', icon: AlertTriangle, path: '/tickets?sla=overdue' },
    { label: 'Ждём ответа', icon: Clock, path: '/tickets?status=waiting' },
    { label: 'На паузе', icon: PauseCircle, path: '/tickets?status=paused' },
    { label: 'Архив', icon: Archive, path: '/tickets?status=archived' },
  ]},
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, sidebarCollapsed, setSidebarCollapsed, setShowNewTicket, notifications, setNotifications, tickets } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setShowAvatarMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  const getNavCount = (path: string) => {
    if (path === '/tickets?sla=overdue') {
      return tickets.filter(t => {
        if (!['new', 'classification', 'in_progress'].includes(t.status)) return false;
        if (t.slaPaused) return false;
        const elapsed = Date.now() - t.createdAt;
        return elapsed > t.slaExternal * 60000;
      }).length;
    }
    if (path === '/tickets?status=waiting') return tickets.filter(t => t.status === 'waiting').length;
    if (path === '/tickets?status=paused') return tickets.filter(t => t.status === 'paused').length;
    return 0;
  };

  const searchResults = searchQuery.length > 1 ? tickets.filter(t =>
    t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-[16px] border-b border-[#E6EBF2] z-50 flex items-center px-4 gap-3">
        {/* Burger */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-10 h-10 rounded-[10px] flex items-center justify-center hover:bg-[#F3F6FB] transition-colors shrink-0"
        >
          <Menu size={20} className="text-[#6B7280]" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Headphones size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && <span className="text-[16px] font-semibold text-[#111827] whitespace-nowrap">HelpDesk Prototype</span>}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-[640px] mx-4 relative">
          <div className={`flex items-center h-10 rounded-xl px-3 gap-2 transition-all ${showSearch ? 'bg-white ring-2 ring-[#2563EB]/30 shadow-sm' : 'bg-[#F3F6FB]'}`}>
            <Search size={18} className="text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              placeholder="Поиск по номеру, клиенту, теме"
              className="flex-1 bg-transparent outline-none text-[14px] text-[#111827] placeholder:text-[#9CA3AF]"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] overflow-hidden z-50 animate-slide-down">
              {searchResults.map(t => (
                <button key={t.id} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#F8FAFF] text-left"
                  onClick={() => { navigate(`/tickets/${t.id}`); setSearchQuery(''); }}>
                  <span className="font-mono text-[12px] text-[#6B7280]">{t.number}</span>
                  <span className="text-[14px] text-[#111827] truncate">{t.subject}</span>
                  <span className="text-[12px] text-[#9CA3AF] ml-auto">{t.client}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div ref={roleRef} className="relative shrink-0">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="h-10 px-3 flex items-center gap-2 bg-white border border-[#E6EBF2] rounded-xl hover:bg-[#F8FAFF] transition-colors"
          >
            <Shield size={16} className="text-[#6B7280]" />
            <span className="text-[13px] font-medium text-[#111827]">{ROLE_LABELS[role]}</span>
            <ChevronDown size={14} className="text-[#9CA3AF]" />
          </button>
          {showRoleDropdown && (
            <div className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] overflow-hidden z-50 animate-slide-down">
              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([key, label]) => (
                <button key={key}
                  className={`w-full px-4 py-2.5 text-left text-[14px] flex items-center gap-2 hover:bg-[#F8FAFF] ${role === key ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'text-[#111827]'}`}
                  onClick={() => { setRole(key); setShowRoleDropdown(false); }}>
                  {role === key && <CheckCircle size={14} />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Ticket */}
        {hasPermission(role, 'create') && (
          <button onClick={() => setShowNewTicket(true)}
            className="h-10 px-4 bg-[#2563EB] text-white rounded-xl text-[14px] font-medium flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors shrink-0">
            <Plus size={16} /> Новая заявка
          </button>
        )}

        {/* Notifications */}
        <div ref={notifRef} className="relative shrink-0">
          <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F3F6FB] transition-colors relative">
            <Bell size={20} className="text-[#6B7280]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 border-b border-[#E6EBF2] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#111827]">Уведомления</span>
                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-[12px] text-[#2563EB] hover:underline">Прочитать все</button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-[#EEF2F7] ${!n.read ? 'bg-[#F8FAFF]' : ''}`}>
                    <p className="text-[13px] text-[#111827]">{n.text}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{formatDate(n.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={avatarRef} className="relative shrink-0">
          <button onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[13px] font-semibold">
            {ROLE_LABELS[role][0]}
          </button>
          {showAvatarMenu && (
            <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 border-b border-[#E6EBF2]">
                <p className="text-[14px] font-semibold text-[#111827]">Демо-пользователь</p>
                <p className="text-[12px] text-[#6B7280]">{ROLE_LABELS[role]}</p>
              </div>
              <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                <User size={16} className="text-[#6B7280]" /> Профиль
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                <Settings size={16} className="text-[#6B7280]" /> Настройки
              </button>
              <button onClick={() => { resetDemoData(); window.location.reload(); }}
                className="w-full px-4 py-2.5 text-left text-[14px] text-[#111827] hover:bg-[#F8FAFF] flex items-center gap-2">
                <RefreshCw size={16} className="text-[#6B7280]" /> Сбросить демо-данные
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2 border-t border-[#E6EBF2]">
                <LogOut size={16} /> Выйти
              </button>
            </div>
          )}
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className="fixed left-0 top-16 bottom-0 bg-white border-r border-[#E6EBF2] z-40 transition-all duration-[220ms] flex flex-col overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        <div className="p-4 flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(group => (
            <div key={group.group} className="mb-4">
              {!sidebarCollapsed && <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 mb-2">{group.group}</p>}
              {group.items.map(item => {
                const isActive = location.pathname === item.path.split('?')[0] && (
                  !item.path.includes('?') || location.search.includes(item.path.split('?')[1] || '')
                );
                const count = getNavCount(item.path);
                const Icon = item.icon;
                return (
                  <button key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full h-11 rounded-xl flex items-center gap-3 px-3 transition-colors ${
                      isActive ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'text-[#111827] hover:bg-[#F3F6FB]'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className={isActive ? 'text-[#2563EB]' : 'text-[#6B7280]'} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-[14px] font-medium flex-1 text-left">{item.label}</span>
                        {count > 0 && (
                          <span className={`h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                            item.path.includes('overdue') ? 'bg-[#FEECEC] text-[#B91C1C]' : 'bg-[#EFF6FF] text-[#1D4ED8]'
                          }`}>{count}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Admin section */}
          {hasPermission(role, 'settings') && (
            <div className="mb-4">
              {!sidebarCollapsed && <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 mb-2">Администрирование</p>}
              <button onClick={() => navigate('/settings')}
                className={`w-full h-11 rounded-xl flex items-center gap-3 px-3 transition-colors ${
                  location.pathname === '/settings' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'text-[#111827] hover:bg-[#F3F6FB]'
                }`}
                title={sidebarCollapsed ? 'Настройки' : undefined}
              >
                <Settings size={20} className={location.pathname === '/settings' ? 'text-[#2563EB]' : 'text-[#6B7280]'} />
                {!sidebarCollapsed && <span className="text-[14px] font-medium">Настройки</span>}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-[#E6EBF2]">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[12px] text-[#6B7280]">Автоматика включена</span>
            </div>
            <button onClick={() => { resetDemoData(); window.location.reload(); }}
              className="w-full mt-2 h-9 rounded-lg text-[13px] text-[#6B7280] hover:bg-[#F3F6FB] flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Сбросить демо-данные
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main
        className="transition-all duration-[220ms] pt-16 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

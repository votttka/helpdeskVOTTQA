import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Ticket, Role, Notification, Settings, TicketStatus,
  loadTickets, saveTickets, loadRole, saveRole, loadSettings, saveSettings,
  loadNotifications, saveNotifications, resetDemoData, getNextTicketNumber,
  hasPermission, STATUS_CONFIG, ROLE_LABELS, formatDate
} from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { SettingsPage } from './components/Settings';
import { NewTicketDrawer } from './components/NewTicketDrawer';
import { StatusChangeModal } from './components/StatusChangeModal';
import { TransferModal } from './components/TransferModal';
import { ToastContext, ToastProvider } from './components/Toast';

interface AppState {
  tickets: Ticket[];
  setTickets: (fn: (prev: Ticket[]) => Ticket[]) => void;
  role: Role;
  setRole: (role: Role) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  notifications: Notification[];
  setNotifications: (fn: (prev: Notification[]) => Notification[]) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  showNewTicket: boolean;
  setShowNewTicket: (v: boolean) => void;
  statusChangeTarget: { ticket: Ticket; from: TicketStatus } | null;
  setStatusChangeTarget: (v: { ticket: Ticket; from: TicketStatus } | null) => void;
  transferTarget: Ticket | null;
  setTransferTarget: (v: Ticket | null) => void;
}

export const AppContext = createContext<AppState>({} as AppState);
export const useApp = () => useContext(AppContext);

function AppContent() {
  const [tickets, setTicketsRaw] = useState<Ticket[]>(() => loadTickets());
  const [role, setRoleRaw] = useState<Role>(() => loadRole());
  const [settings, setSettingsRaw] = useState<Settings>(() => loadSettings());
  const [notifications, setNotificationsRaw] = useState<Notification[]>(() => loadNotifications());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ ticket: Ticket; from: TicketStatus } | null>(null);
  const [transferTarget, setTransferTarget] = useState<Ticket | null>(null);

  const setTickets = useCallback((fn: (prev: Ticket[]) => Ticket[]) => {
    setTicketsRaw(prev => {
      const next = fn(prev);
      saveTickets(next);
      return next;
    });
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleRaw(r);
    saveRole(r);
  }, []);

  const setSettings = useCallback((s: Settings) => {
    setSettingsRaw(s);
    saveSettings(s);
  }, []);

  const setNotifications = useCallback((fn: (prev: Notification[]) => Notification[]) => {
    setNotificationsRaw(prev => {
      const next = fn(prev);
      saveNotifications(next);
      return next;
    });
  }, []);

  // Auto-transition engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTickets(prev => {
        let changed = false;
        const next = prev.map(t => {
          // Auto-transition from waiting
          if (t.status === 'waiting' && t.autoTransitionAt && now >= t.autoTransitionAt) {
            changed = true;
            return {
              ...t,
              status: 'in_progress' as TicketStatus,
              autoTransitionAt: undefined,
              slaPaused: false,
              updatedAt: now,
              auditLog: [...t.auditLog, {
                id: crypto.randomUUID?.() || Math.random().toString(36),
                action: 'Автопереход',
                author: 'Система / Автоматика',
                timestamp: now,
                oldValue: 'Ждём ответа',
                newValue: 'В работе',
                comment: 'Истекло время ожидания'
              }]
            };
          }
          // Auto-return from pause
          if (t.status === 'paused' && t.pauseUntil && now >= t.pauseUntil) {
            changed = true;
            return {
              ...t,
              status: 'in_progress' as TicketStatus,
              pauseUntil: undefined,
              slaPaused: false,
              updatedAt: now,
              auditLog: [...t.auditLog, {
                id: crypto.randomUUID?.() || Math.random().toString(36),
                action: 'Возврат с паузы',
                author: 'Система / Автоматика',
                timestamp: now,
                oldValue: 'Пауза',
                newValue: 'В работе',
                comment: 'Срок паузы истёк'
              }]
            };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [setTickets]);

  // Timer update (visual only)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    resetDemoData();
    setTicketsRaw(loadTickets());
    setSettingsRaw(loadSettings());
    setNotificationsRaw(loadNotifications());
  };

  const value: AppState = {
    tickets, setTickets, role, setRole, settings, setSettings,
    notifications, setNotifications, sidebarCollapsed, setSidebarCollapsed,
    showNewTicket, setShowNewTicket, statusChangeTarget, setStatusChangeTarget,
    transferTarget, setTransferTarget
  };

  return (
    <AppContext.Provider value={value}>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/funnel" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        {showNewTicket && <NewTicketDrawer />}
        {statusChangeTarget && <StatusChangeModal />}
        {transferTarget && <TransferModal />}
      </ToastProvider>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

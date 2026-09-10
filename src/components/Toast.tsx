import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ToastItem {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  addToast: (text: string, type?: ToastItem['type'], action?: ToastItem['action']) => void;
}

export const ToastContext = createContext<ToastContextType>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((text: string, type: ToastItem['type'] = 'info', action?: ToastItem['action']) => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev.slice(-2), { id, text, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-[72px] right-6 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="animate-slide-down bg-white rounded-[14px] shadow-[0_12px_32px_rgba(17,24,39,0.08)] border border-[#E6EBF2] px-4 py-3 w-[360px] flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              t.type === 'success' ? 'bg-[#10B981]' :
              t.type === 'warning' ? 'bg-[#F59E0B]' :
              t.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#2563EB]'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[#111827]">{t.text}</p>
              {t.action && (
                <button onClick={t.action.onClick} className="text-[13px] text-[#2563EB] font-medium mt-1 hover:underline">
                  {t.action.label}
                </button>
              )}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-[#9CA3AF] hover:text-[#6B7280] shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

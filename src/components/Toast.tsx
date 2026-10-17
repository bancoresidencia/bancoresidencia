'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { message: string; title?: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      message,
      title,
      type = 'info',
      duration = 4000
    }: {
      message: string;
      title?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => toast({ message, title, type: 'success' }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ message, title, type: 'error' }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ message, title, type: 'info' }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ message, title, type: 'warning' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/30'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/30'
                : t.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-800/80 shadow-amber-950/30'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-black/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-sm min-w-0">
              {t.title && <p className="font-bold text-white text-xs mb-0.5">{t.title}</p>}
              <p className="leading-snug text-xs sm:text-sm text-slate-200">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback gracioso caso chamado fora do provider
    return {
      toast: (opts: { message: string }) => console.log('Toast:', opts.message),
      success: (msg: string) => console.log('Success:', msg),
      error: (msg: string) => console.error('Error:', msg),
      info: (msg: string) => console.log('Info:', msg),
      warning: (msg: string) => console.warn('Warning:', msg)
    };
  }
  return context;
};

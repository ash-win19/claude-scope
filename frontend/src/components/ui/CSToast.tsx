import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const TOAST_DURATION = 4000;

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useCSToast = () => useContext(ToastContext);

const variantConfig: Record<ToastVariant, {
  icon: React.ReactNode;
  accentColor: string;
  bgTint: string;
  iconColor: string;
}> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    accentColor: 'var(--cs-success)',
    bgTint: 'rgba(74, 222, 128, 0.06)',
    iconColor: 'var(--cs-success)',
  },
  error: {
    icon: <AlertCircle size={18} />,
    accentColor: 'var(--cs-danger)',
    bgTint: 'rgba(248, 113, 113, 0.06)',
    iconColor: 'var(--cs-danger)',
  },
  info: {
    icon: <Info size={18} />,
    accentColor: 'var(--cs-info)',
    bgTint: 'rgba(96, 165, 250, 0.06)',
    iconColor: 'var(--cs-info)',
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = useState(false);
  const config = variantConfig[toast.variant];

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, TOAST_DURATION - 300);

    const removeTimer = setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      className="relative flex items-start gap-3 rounded-xl border pl-4 pr-3 py-3 shadow-lg backdrop-blur-sm overflow-hidden"
      style={{
        backgroundColor: config.bgTint,
        borderColor: 'var(--cs-border-default)',
        animation: exiting
          ? 'cs-toast-exit 200ms ease forwards'
          : 'cs-slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 320,
        maxWidth: 420,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* Icon */}
      <div className="shrink-0 mt-0.5" style={{ color: config.iconColor }}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--cs-text-primary)' }}>
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 transition-colors duration-150 hover:bg-white/5"
        style={{ color: 'var(--cs-text-muted)' }}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="h-full"
          style={{
            backgroundColor: config.accentColor,
            opacity: 0.5,
            animation: `cs-toast-progress ${TOAST_DURATION}ms linear`,
          }}
        />
      </div>
    </div>
  );
};

export const CSToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-2), { id, message, variant, createdAt: Date.now() }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

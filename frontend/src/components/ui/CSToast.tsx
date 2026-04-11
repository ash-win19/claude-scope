import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useCSToast = () => useContext(ToastContext);

const variantBorder: Record<ToastVariant, string> = {
  success: 'var(--cs-success)',
  error: 'var(--cs-danger)',
  info: 'var(--cs-info)',
};

export const CSToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{
              backgroundColor: 'var(--cs-bg-raised)',
              borderColor: 'var(--cs-border-default)',
              borderLeft: `3px solid ${variantBorder[toast.variant]}`,
              animation: 'cs-fade-in 150ms ease',
            }}
          >
            <span className="text-[13px] flex-1" style={{ color: 'var(--cs-text-primary)' }}>
              {toast.message}
            </span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--cs-text-secondary)' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

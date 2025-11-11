/**
 * Toast Notification Component
 *
 * Simple toast notifications for user feedback
 */

'use client';

import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const bgColor = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    error: 'bg-red-600',
  }[toast.type];

  const icon = {
    success: '✓',
    info: 'ℹ',
    error: '✕',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up pointer-events-auto max-w-md`}
      onClick={() => onDismiss(toast.id)}
      role="button"
      tabIndex={0}
    >
      <span className="text-lg font-bold">{icon}</span>
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'success', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    dismissToast,
    ToastContainer: () => <ToastContainer toasts={toasts} onDismiss={dismissToast} />,
  };
}

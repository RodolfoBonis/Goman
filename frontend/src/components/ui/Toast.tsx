import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    container: 'bg-white border-l-4 border-success-500',
    icon: 'text-success-500',
    title: 'text-success-900',
    description: 'text-success-700',
  },
  error: {
    container: 'bg-white border-l-4 border-error-500',
    icon: 'text-error-500',
    title: 'text-error-900',
    description: 'text-error-700',
  },
  warning: {
    container: 'bg-white border-l-4 border-warning-500',
    icon: 'text-warning-500',
    title: 'text-warning-900',
    description: 'text-warning-700',
  },
  info: {
    container: 'bg-white border-l-4 border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    description: 'text-blue-700',
  },
};

export const ToastComponent: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  action,
  onClose,
}) => {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  return (
    <div
      className={cn(
        'relative flex items-start p-4 rounded-lg shadow-medium animate-slide-up',
        'max-w-sm w-full pointer-events-auto',
        styles.container
      )}
    >
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5', styles.icon)} />
      </div>
      
      <div className="ml-3 flex-1">
        <p className={cn('text-sm font-medium', styles.title)}>
          {title}
        </p>
        
        {description && (
          <p className={cn('mt-1 text-sm', styles.description)}>
            {description}
          </p>
        )}
        
        {action && (
          <div className="mt-3">
            <button
              type="button"
              className={cn(
                'text-sm font-medium underline transition-colors duration-200',
                styles.title,
                'hover:no-underline focus:outline-none focus:no-underline'
              )}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <button
          type="button"
          className={cn(
            'rounded-md p-1.5 transition-colors duration-200',
            'text-gray-400 hover:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
          )}
          onClick={() => onClose(id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  React.useEffect(() => {
    toasts.forEach((toast) => {
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        const timer = setTimeout(() => {
          onClose(toast.id);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, onClose]);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionStyles[position]
      )}
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const toast = React.useMemo(() => ({
    success: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, description, ...options }),
    error: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, description, ...options }),
    warning: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, description, ...options }),
    info: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, description, ...options }),
  }), [addToast]);

  return {
    toasts,
    toast,
    removeToast,
    removeAllToasts,
  };
};
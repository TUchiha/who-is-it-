import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className = '',
}) => {
  const configs = {
    info: {
      bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-950',
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200/80 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50/80 border-rose-200/80 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm shadow-subtle ${configs.bg} ${className}`}
    >
      {configs.icon}
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-semibold text-slate-900">{title}</h4>}
        <p className="leading-relaxed opacity-95 text-slate-700">{message}</p>
      </div>
    </div>
  );
};

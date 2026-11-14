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
      bg: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${configs.bg} ${className}`}
    >
      {configs.icon}
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-semibold text-slate-100">{title}</h4>}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
};

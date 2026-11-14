import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-900 border border-slate-800 shadow-xl',
    glass: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl',
    bordered: 'bg-transparent border border-slate-800 hover:border-slate-700',
  }[variant];

  return (
    <div className={`rounded-2xl p-6 ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

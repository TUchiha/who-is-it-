import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{content}</div>;
};

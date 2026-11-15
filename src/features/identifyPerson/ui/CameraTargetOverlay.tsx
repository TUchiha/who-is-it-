import React from 'react';
import { Scan, AlertCircle } from 'lucide-react';
import type { QualityMetrics } from '../../../core/ml/mlTypes';

export interface CameraTargetOverlayProps {
  quality: QualityMetrics | null;
  isScanning: boolean;
}

export const CameraTargetOverlay: React.FC<CameraTargetOverlayProps> = ({
  quality,
  isScanning,
}) => {
  const isAligned = quality?.passesQuality ?? false;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Status Pill */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              isScanning
                ? 'bg-amber-400 animate-ping'
                : isAligned
                ? 'bg-emerald-400'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-slate-200">
            {isScanning
              ? 'Analyzing subject biometric vector...'
              : isAligned
              ? 'Subject in focus • Ready to identify'
              : 'Aim camera at subject face'}
          </span>
        </div>
      </div>

      {/* Center Targeting Reticle */}
      <div className="relative flex items-center justify-center my-auto">
        <div
          className={`relative w-64 h-80 sm:w-72 sm:h-88 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center ${
            isAligned
              ? 'border-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.3)]'
              : 'border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
          }`}
        >
          {/* Viewfinder corner brackets */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

          {/* Scanning line animation */}
          {isScanning && (
            <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          )}

          <Scan className="w-10 h-10 text-cyan-400/30" />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex justify-center">
        {quality?.failureReason ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{quality.failureReason}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-950/70 px-3 py-1 rounded-full backdrop-blur-md">
            Zero raw imagery is uploaded &bull; In-memory vector matching only
          </span>
        )}
      </div>
    </div>
  );
};

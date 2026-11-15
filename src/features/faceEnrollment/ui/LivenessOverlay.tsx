import React from 'react';
import { Eye, ArrowLeft, ArrowRight, Focus, Smile, CheckCircle2, AlertCircle } from 'lucide-react';
import type { LivenessStep } from '../../../core/ml/livenessService';
import type { QualityMetrics } from '../../../core/ml/mlTypes';

export interface LivenessOverlayProps {
  currentStep: LivenessStep | null;
  stepIndex: number;
  totalSteps: number;
  quality: QualityMetrics | null;
  samplesCollected: number;
  targetSamples: number;
  isProcessing: boolean;
}

export const LivenessOverlay: React.FC<LivenessOverlayProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  quality,
  samplesCollected,
  targetSamples,
  isProcessing,
}) => {
  const getStepIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Eye':
        return <Eye className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case 'ArrowLeft':
        return <ArrowLeft className="w-8 h-8 text-cyan-400 animate-bounce" />;
      case 'ArrowRight':
        return <ArrowRight className="w-8 h-8 text-cyan-400 animate-bounce" />;
      case 'Smile':
        return <Smile className="w-8 h-8 text-cyan-400" />;
      case 'Focus':
      default:
        return <Focus className="w-8 h-8 text-emerald-400" />;
    }
  };

  const isAligned = quality?.passesQuality ?? false;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Banner: Step Tracker & Instructions */}
      <div className="w-full max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs">
          <span className="font-semibold text-cyan-400">
            Liveness Challenge: Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="font-mono text-slate-400">
            Biometric Samples: {samplesCollected}/{targetSamples}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-500 h-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Center: Face Oval Guide Target */}
      <div className="relative flex items-center justify-center my-auto">
        <div
          className={`w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-4 transition-all duration-300 flex items-center justify-center ${
            isAligned
              ? 'border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.35)]'
              : 'border-cyan-400/60 border-dashed shadow-[0_0_20px_rgba(56,189,248,0.2)]'
          }`}
        >
          {/* Subtle crosshairs */}
          <div className="w-12 h-12 border-t border-b border-cyan-400/30 rounded-full" />
        </div>
      </div>

      {/* Bottom: Active Prompt Action Card */}
      <div className="w-full max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
            {currentStep ? getStepIcon(currentStep.icon) : <Focus className="w-8 h-8 text-cyan-400" />}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-base text-white tracking-tight">
              {currentStep ? currentStep.prompt : 'Position your face in the oval'}
            </h3>
            {quality?.failureReason ? (
              <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{quality.failureReason}</span>
              </p>
            ) : isAligned ? (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Face aligned. {isProcessing ? 'Vectorizing...' : 'Performing action'}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Fit your full face inside the oval guide
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

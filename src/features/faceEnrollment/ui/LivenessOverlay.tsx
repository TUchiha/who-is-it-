import React from 'react';
import { Eye, ArrowLeft, ArrowRight, ArrowUp, Focus, Smile, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { MultiAngleSnapStep } from '../../../core/ml/livenessService';
import type { QualityMetrics } from '../../../core/ml/mlTypes';

export interface LivenessOverlayProps {
  steps: MultiAngleSnapStep[];
  currentStepIndex: number;
  quality: QualityMetrics | null;
  capturedIndices: Set<number>;
  thumbnails: Record<number, string>;
  isProcessing: boolean;
  holdProgress: number; // 0 to 100 for auto-capture hold progress
  transitionMessage?: string | null;
}

export const LivenessOverlay: React.FC<LivenessOverlayProps> = ({
  steps,
  currentStepIndex,
  quality,
  capturedIndices,
  thumbnails,
  isProcessing,
  holdProgress,
  transitionMessage,
}) => {
  const currentStep = steps[currentStepIndex] || steps[0]!;

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'ArrowLeft':
        return <ArrowLeft className="w-8 h-8 text-indigo-400 animate-pulse" />;
      case 'ArrowRight':
        return <ArrowRight className="w-8 h-8 text-indigo-400 animate-pulse" />;
      case 'ArrowUp':
        return <ArrowUp className="w-8 h-8 text-indigo-400 animate-bounce" />;
      case 'Smile':
        return <Smile className="w-8 h-8 text-amber-400 animate-pulse" />;
      case 'Eye':
        return <Eye className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case 'Focus':
      default:
        return <Focus className="w-8 h-8 text-emerald-400" />;
    }
  };

  const isAligned = quality?.passesQuality ?? false;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top 5 Angle Snap Indicator Cards with Live Photo Thumbnails */}
      <div className="w-full max-w-xl mx-auto space-y-2">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {steps.map((s, idx) => {
            const isCaptured = capturedIndices.has(idx);
            const isCurrent = idx === currentStepIndex;
            const thumb = thumbnails[idx];

            return (
              <div
                key={s.id}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-300 border backdrop-blur-md relative overflow-hidden ${
                  isCaptured
                    ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-indigo-600/90 border-indigo-300 text-white ring-2 ring-indigo-400/70 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}
              >
                {/* Thumbnail Preview or Icon Badge */}
                {thumb ? (
                  <div className="relative">
                    <img
                      src={thumb}
                      alt={s.label}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center">
                    <span className="text-[11px] font-mono font-bold">#{idx + 1}</span>
                  </div>
                )}

                <span className="text-[10px] font-bold tracking-tight truncate max-w-full mt-1">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Transition / Cooldown Confirmation Banner */}
        {transitionMessage && (
          <div className="p-2 px-3 rounded-xl bg-emerald-500/95 backdrop-blur-md text-white text-xs font-bold text-center border border-emerald-400 shadow-xl flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{transitionMessage}</span>
          </div>
        )}

        {/* Hold Capture Circular/Linear Progress Bar */}
        {holdProgress > 0 && holdProgress < 100 && !transitionMessage && (
          <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-slate-700/80">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-150"
              style={{ width: `${holdProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Center Target: Face Oval Frame with Directional Guides */}
      <div className="relative flex items-center justify-center my-auto">
        <div
          className={`relative w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-4 transition-all duration-300 flex items-center justify-center ${
            isAligned
              ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.35)]'
              : 'border-indigo-400/70 border-dashed shadow-[0_0_30px_rgba(99,102,241,0.25)]'
          }`}
        >
          {/* Animated Directional Cue Indicator inside the oval */}
          {currentStep.action === 'angle_left' && (
            <div className="absolute -left-10 p-3 rounded-full bg-indigo-600 text-white shadow-lg animate-bounce">
              <ArrowLeft className="w-6 h-6" />
            </div>
          )}
          {currentStep.action === 'angle_right' && (
            <div className="absolute -right-10 p-3 rounded-full bg-indigo-600 text-white shadow-lg animate-bounce">
              <ArrowRight className="w-6 h-6" />
            </div>
          )}
          {currentStep.action === 'angle_up' && (
            <div className="absolute -top-10 p-3 rounded-full bg-indigo-600 text-white shadow-lg animate-bounce">
              <ArrowUp className="w-6 h-6" />
            </div>
          )}

          {/* Center alignment reticle */}
          <div className="w-16 h-16 border-t-2 border-b-2 border-indigo-400/40 rounded-full" />
        </div>
      </div>

      {/* Bottom Instructions Card */}
      <div className="w-full max-w-lg mx-auto">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 text-white shadow-2xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            {getStepIcon(currentStep.icon)}
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                {currentStep.title}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Snap {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              {currentStep.prompt}
            </h3>
            <p className="text-xs text-slate-400">
              {currentStep.instruction}
            </p>

            {quality?.failureReason ? (
              <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{quality.failureReason}</span>
              </p>
            ) : isAligned ? (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {holdProgress >= 100 || isProcessing
                    ? 'Capturing snapshot...'
                    : 'Face aligned. Hold steady or click Take Snap below.'}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { UserCheck, Sparkles, RefreshCw, XCircle } from 'lucide-react';
import type { IdentificationOutcome } from '../domain/identifyTypes';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';

export interface IdentityResultCardProps {
  outcome: IdentificationOutcome;
  onReset: () => void;
}

export const IdentityResultCard: React.FC<IdentityResultCardProps> = ({
  outcome,
  onReset,
}) => {
  if (outcome.status === 'MATCHED') {
    const { person } = outcome;
    const confidencePct = (person.confidenceScore * 100).toFixed(1);

    return (
      <Card className="w-full max-w-md mx-auto border-emerald-500/50 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Verified Identity Match
              </span>
              <span className="text-xs text-slate-400">
                Cosine Similarity: {confidencePct}%
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
            Enrolled User
          </span>
        </div>

        {/* Person Information Display */}
        <div className="flex items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
            {person.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {person.displayName}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consent-verified biometric template</span>
            </p>
          </div>
        </div>

        {/* Audit Transparency Note */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p>
            <strong>Privacy Note:</strong> A transparent lookup timestamp was recorded. The user can view that their public profile was identified.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={onReset}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Scan Another Person
        </Button>
      </Card>
    );
  }

  // Uniform No Match State (Design Rule 7)
  return (
    <Card className="w-full max-w-md mx-auto border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">No Enrolled Match</h4>
          <span className="text-xs text-slate-400 font-mono">Similarity Below Threshold (&lt; 0.75)</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
        <p>
          {outcome.message}
        </p>
        <p className="text-[11px] text-slate-500">
          Under strict privacy-by-default rules, people who are not enrolled or who have disabled public identification produce an identical no-match result.
        </p>
      </div>

      <Button
        variant="secondary"
        size="md"
        className="w-full"
        onClick={onReset}
        leftIcon={<RefreshCw className="w-4 h-4" />}
      >
        Try Scanning Again
      </Button>
    </Card>
  );
};

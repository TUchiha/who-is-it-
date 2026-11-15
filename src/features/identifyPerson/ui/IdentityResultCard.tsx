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
      <Card className="w-full max-w-md mx-auto border border-emerald-200/90 bg-white shadow-float space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-extrabold block">
                Verified Identity Match
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Cosine Similarity: <strong className="text-emerald-600">{confidencePct}%</strong>
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            Enrolled User
          </span>
        </div>

        {/* Person Information Display */}
        <div className="flex items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-500/20">
            {person.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {person.displayName}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Consent-verified biometric template</span>
            </p>
          </div>
        </div>

        {/* Audit Transparency Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <p>
            <strong className="text-slate-800">Privacy Notice:</strong> A transparent lookup timestamp was recorded. The subject can audit that their public profile was matched.
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
    <Card className="w-full max-w-md mx-auto border border-slate-200 bg-white shadow-card space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">No Enrolled Match</h4>
          <span className="text-xs text-slate-500 font-mono">Similarity Below Threshold (&lt; 0.75)</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2 leading-relaxed">
        <p className="font-medium text-slate-700">
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

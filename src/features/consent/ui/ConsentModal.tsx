import React, { useState } from 'react';
import { ShieldAlert, Check, EyeOff, Lock, Scale, X } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { CONSENT_CONSTANTS } from '../../../core/config/constants';

export interface ConsentModalProps {
  isOpen: boolean;
  onAccept: (allowIdentification: boolean) => void;
  onCancel?: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onCancel,
}) => {
  const [allowIdentification, setAllowIdentification] = useState(true);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!hasAcknowledged) return;
    onAccept(allowIdentification);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 border-cyan-800/60 shadow-2xl shadow-cyan-950/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 id="consent-title" className="text-xl font-bold text-white">
                Biometric Consent Agreement
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Policy Version {CONSENT_CONSTANTS.CURRENT_VERSION} &bull; Effective {CONSENT_CONSTANTS.POLICY_EFFECTIVE_DATE}
              </span>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Core Guarantees */}
        <div className="space-y-3 text-sm text-slate-300">
          <p className="leading-relaxed">
            In accordance with the Illinois Biometric Information Privacy Act (BIPA) and GDPR Article 9, we require your explicit written consent prior to collecting biometric facial measurements.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <EyeOff className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100">Zero Raw Images Stored</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your camera stream is processed strictly in temporary device memory. No photos or video frames are ever saved, uploaded, or persisted.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100">Mathematical Vector Primary Key</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Only a 192-dimensional numerical vector (embedding) is stored in the database. This mathematical fingerprint serves as your matching key to identify you to other users.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <Scale className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100">Statutory 3-Year Destruction Cap</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your biometric template is automatically scheduled for permanent deletion 3 years from creation, or immediately upon requesting data deletion in the Privacy Center.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Options & Acknowledgments */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowIdentification}
              onChange={(e) => setAllowIdentification(e.target.checked)}
              className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4"
            />
            <span className="text-xs text-slate-300">
              <strong>Allow other enrolled users to identify me</strong> when they point their camera at me in Identification Mode.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4"
            />
            <span className="text-xs text-slate-300">
              I have read, understand, and provide my explicit consent to the collection and mathematical vectorization of my facial biometric data.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button variant="ghost" size="md" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            disabled={!hasAcknowledged}
            onClick={handleConfirm}
            rightIcon={<Check className="w-4 h-4" />}
          >
            Agree &amp; Start Camera Enrollment
          </Button>
        </div>
      </Card>
    </div>
  );
};

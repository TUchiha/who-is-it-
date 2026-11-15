import React, { useState } from 'react';
import { ShieldCheck, Check, EyeOff, Lock, Scale, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 bg-white border border-slate-200 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="consent-title" className="text-xl font-extrabold text-slate-900">
                Biometric Consent Agreement
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Policy Version {CONSENT_CONSTANTS.CURRENT_VERSION} &bull; Effective {CONSENT_CONSTANTS.POLICY_EFFECTIVE_DATE}
              </span>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Core Guarantees */}
        <div className="space-y-3 text-sm text-slate-600">
          <p className="leading-relaxed">
            In accordance with the Illinois Biometric Information Privacy Act (BIPA) and GDPR Article 9, we require your explicit written consent prior to collecting biometric facial measurements.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-subtle">
              <EyeOff className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Zero Raw Images Stored</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Your camera stream is processed strictly in temporary device memory. No photos or video frames are ever saved, uploaded, or persisted.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-subtle">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Mathematical Vector Primary Key</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Only a 192-dimensional numerical vector (embedding) is stored in the database. This mathematical fingerprint serves as your matching key to identify you to other users.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-subtle">
              <Scale className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Statutory 3-Year Destruction Cap</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Your biometric template is automatically scheduled for permanent deletion 3 years from creation, or immediately upon requesting data deletion in the Privacy Center.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Options & Acknowledgments */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowIdentification}
              onChange={(e) => setAllowIdentification(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-xs text-slate-700">
              <strong>Allow other enrolled users to identify me</strong> when they point their camera at me in Identification Mode.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-xs text-slate-700">
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

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../auth/ui/useAuthStore';
import { cameraService } from '../../../core/camera/cameraService';
import { usePermission } from '../../../core/camera/usePermission';
import { workerClient } from '../../../core/ml/workerClient';
import { LivenessChallengeGenerator, LivenessStep } from '../../../core/ml/livenessService';
import { enrollFaceUseCase } from '../domain/enrollFaceUseCase';
import { ConsentModal } from '../../consent/ui/ConsentModal';
import { LivenessOverlay } from './LivenessOverlay';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';
import type { QualityMetrics } from '../../../core/ml/mlTypes';
import { logger } from '../../../core/utils/logger';

const TARGET_SAMPLE_COUNT = 4;

export const EnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { status: permissionStatus, requestPermission, helpText } = usePermission();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamActiveRef = useRef(false);

  // Enrollment lifecycle states
  const [showConsentModal, setShowConsentModal] = useState(true);
  const [consentGranted, setConsentGranted] = useState(false);
  const [allowIdentification, setAllowIdentification] = useState(true);

  const [challengeSteps, setChallengeSteps] = useState<LivenessStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [samples, setSamples] = useState<Float32Array[]>([]);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize random challenge sequence
  useEffect(() => {
    setChallengeSteps(LivenessChallengeGenerator.generateChallengeSequence());
  }, []);

  // Handle consent confirmation
  const handleConsentAccept = (allowId: boolean) => {
    setAllowIdentification(allowId);
    setConsentGranted(true);
    setShowConsentModal(false);
  };

  // Start Camera Stream once consent is granted
  useEffect(() => {
    if (!consentGranted) return;

    let mounted = true;
    const startCamera = async () => {
      const res = await cameraService.startStream({ facingMode: 'user' });
      if (!mounted) return;

      if (res.success && videoRef.current) {
        videoRef.current.srcObject = res.value;
        videoRef.current.play().catch((e) => logger.warn('Video play error', e));
        streamActiveRef.current = true;
      } else if (!res.success) {
        setErrorMsg('Could not access camera. Please check permissions.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      streamActiveRef.current = false;
      cameraService.stopStream();
    };
  }, [consentGranted]);

  // Main Frame Processing Loop
  const processLoop = useCallback(async () => {
    if (!videoRef.current || !streamActiveRef.current || isCompleted || isProcessing) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      requestAnimationFrame(processLoop);
      return;
    }

    const currentStep = challengeSteps[currentStepIndex];
    if (!currentStep) return;

    try {
      // Capture current video frame into ImageBitmap
      const bitmap = await createImageBitmap(video);

      const mode = currentStep.action === 'look_straight' ? 'EXTRACT_EMBEDDING' : 'LIVENESS';
      const result = await workerClient.processFrame(bitmap, mode, currentStep.action);

      if (result.success && result.value) {
        const payload = result.value;
        if (payload.detection) {
          setQuality(payload.detection.quality);
        }

        // Liveness passed for current action
        if (payload.livenessPassed) {
          // If in final step (look_straight), collect embedding samples
          if (currentStep.action === 'look_straight' && payload.embedding) {
            const vec = new Float32Array(payload.embedding);
            setSamples((prev) => {
              const updated = [...prev, vec];
              if (updated.length >= TARGET_SAMPLE_COUNT && !isProcessing) {
                finalizeEnrollment(updated);
              }
              return updated;
            });
          } else {
            // Advance to next liveness challenge step
            if (currentStepIndex + 1 < challengeSteps.length) {
              setCurrentStepIndex((prev) => prev + 1);
            }
          }
        }
      }
    } catch (e) {
      logger.debug('Frame loop skipped', e);
    }

    if (!isCompleted) {
      requestAnimationFrame(processLoop);
    }
  }, [challengeSteps, currentStepIndex, isCompleted, isProcessing]);

  // Trigger frame loop when video starts playing
  const handleVideoCanPlay = () => {
    requestAnimationFrame(processLoop);
  };

  // Finalize Enrollment with collected vectors
  const finalizeEnrollment = async (finalSamples: Float32Array[]) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await enrollFaceUseCase.execute({
        userId: user.id,
        displayName: user.displayName || user.email.split('@')[0] || 'Enrolled User',
        sampleVectors: finalSamples,
        allowIdentificationByOthers: allowIdentification,
      });

      setIsCompleted(true);
      cameraService.stopStream();
      streamActiveRef.current = false;
      logger.info('Mandatory 1st-login face enrollment completed successfully');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Enrollment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto flex flex-col justify-center items-center">
      {/* Biometric Informed Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onCancel={() => navigate('/')}
      />

      {/* Success State */}
      {isCompleted ? (
        <Card className="max-w-md w-full text-center space-y-6 border-emerald-500/40 shadow-2xl shadow-emerald-950/40">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-16 h-16 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">
              Biometric Enrollment Complete!
            </h2>
            <p className="text-sm text-slate-300">
              Your 192-dimensional facial embedding vector has been generated and stored in the database as your primary identification key.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Zero raw images persisted &bull; BIPA/GDPR 3-year statutory cap active
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/identify')}
            >
              Open Camera Identification Mode
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </Card>
      ) : (
        /* Active Enrollment Screen */
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Mandatory First-Time Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Face Registration &amp; Liveness
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Follow the on-screen gestures to verify you are a live person and generate your unique mathematical vector key.
            </p>
          </div>

          {errorMsg && <Alert type="error" message={errorMsg} />}

          {/* Camera Viewfinder View */}
          <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] sm:aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            {permissionStatus === 'denied' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Camera Access Blocked</h3>
                <p className="text-xs text-slate-400 max-w-md">{helpText}</p>
                <Button variant="primary" size="md" onClick={requestPermission} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Retry Permission
                </Button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  onCanPlay={handleVideoCanPlay}
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Interactive Liveness Guide Overlay */}
                {consentGranted && (
                  <LivenessOverlay
                    currentStep={challengeSteps[currentStepIndex] || null}
                    stepIndex={currentStepIndex}
                    totalSteps={challengeSteps.length}
                    quality={quality}
                    samplesCollected={samples.length}
                    targetSamples={TARGET_SAMPLE_COUNT}
                    isProcessing={isProcessing}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

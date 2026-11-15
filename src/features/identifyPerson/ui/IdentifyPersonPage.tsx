import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, SwitchCamera, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../auth/ui/useAuthStore';
import { cameraService } from '../../../core/camera/cameraService';
import { usePermission } from '../../../core/camera/usePermission';
import { workerClient } from '../../../core/ml/workerClient';
import { identificationRepository } from '../data/identificationRepository';
import { CameraTargetOverlay } from './CameraTargetOverlay';
import { IdentityResultCard } from './IdentityResultCard';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import type { QualityMetrics } from '../../../core/ml/mlTypes';
import type { IdentificationOutcome } from '../domain/identifyTypes';
import type { CameraFacingMode } from '../../../core/camera/cameraTypes';
import { logger } from '../../../core/utils/logger';

export const IdentifyPersonPage: React.FC = () => {
  const { user } = useAuthStore();
  const { status: permissionStatus, requestPermission, helpText } = usePermission();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamActiveRef = useRef(false);

  const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment');
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [outcome, setOutcome] = useState<IdentificationOutcome | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start Camera Stream
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      const res = await cameraService.startStream({ facingMode });
      if (!mounted) return;

      if (res.success && videoRef.current) {
        videoRef.current.srcObject = res.value;
        videoRef.current.play().catch((e) => logger.warn('Video play error', e));
        streamActiveRef.current = true;
      } else if (!res.success) {
        setErrorMessage('Camera access failed. Please verify browser permissions.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      streamActiveRef.current = false;
      cameraService.stopStream();
    };
  }, [facingMode]);

  // Video Frame Quality Evaluation Loop
  const checkFrameLoop = useCallback(async () => {
    if (!videoRef.current || !streamActiveRef.current || isScanning || outcome) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      try {
        const bitmap = await createImageBitmap(video);
        const res = await workerClient.processFrame(bitmap, 'FACE_DETECT');
        if (res.success && res.value?.detection) {
          setQuality(res.value.detection.quality);
        }
      } catch (e) {
        logger.debug('Frame analysis skipped', e);
      }
    }

    if (!outcome && !isScanning) {
      requestAnimationFrame(checkFrameLoop);
    }
  }, [isScanning, outcome]);

  const handleVideoCanPlay = () => {
    requestAnimationFrame(checkFrameLoop);
  };

  // Toggle Camera Facing Mode (Front vs Back camera)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Execute Identification on the Target Subject in Camera
  const handleIdentify = async () => {
    if (!videoRef.current || !user || isScanning) return;
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const bitmap = await createImageBitmap(videoRef.current);
      const workerRes = await workerClient.processFrame(bitmap, 'EXTRACT_EMBEDDING');

      if (!workerRes.success || !workerRes.value?.embedding) {
        setErrorMessage('No clear face detected in the targeting box. Please hold steady and try again.');
        setIsScanning(false);
        requestAnimationFrame(checkFrameLoop);
        return;
      }

      const queryVector = new Float32Array(workerRes.value.embedding);

      // Perform server-side / database vector similarity comparison
      const matchResult = await identificationRepository.identifySubject(
        queryVector,
        user.id
      );

      setOutcome(matchResult);
      setIsScanning(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Identification failed');
      setIsScanning(false);
      requestAnimationFrame(checkFrameLoop);
    }
  };

  const handleResetScan = () => {
    setOutcome(null);
    setErrorMessage(null);
    requestAnimationFrame(checkFrameLoop);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto flex flex-col justify-center items-center space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <UserCheck className="w-4 h-4" />
          <span>Real-Time Biometric Identification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Identify Person via Camera
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Point your device camera at an enrolled subject to verify their identity through database vector matching.
        </p>
      </div>

      {errorMessage && <Alert type="error" message={errorMessage} className="w-full max-w-2xl" />}

      {/* Main View Area: Either Result Card or Live Camera Viewfinder */}
      {outcome ? (
        <IdentityResultCard outcome={outcome} onReset={handleResetScan} />
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          <div className="relative aspect-[3/4] sm:aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            {permissionStatus === 'denied' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Camera Access Blocked</h3>
                <p className="text-xs text-slate-400 max-w-md">{helpText}</p>
                <Button variant="primary" size="md" onClick={requestPermission} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Grant Camera Permission
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
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'transform -scale-x-100' : ''
                  }`}
                />

                {/* HUD Targeting Overlay */}
                <CameraTargetOverlay quality={quality} isScanning={isScanning} />
              </>
            )}
          </div>

          {/* Camera Controls Toolbar */}
          <div className="flex items-center justify-between gap-4 px-2">
            <Button
              variant="secondary"
              size="md"
              onClick={toggleFacingMode}
              leftIcon={<SwitchCamera className="w-4 h-4" />}
            >
              {facingMode === 'user' ? 'Switch to Rear Camera' : 'Switch to Front Camera'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleIdentify}
              isLoading={isScanning}
              disabled={isScanning}
              leftIcon={<Camera className="w-5 h-5" />}
              className="px-8 shadow-cyan-500/25"
            >
              {isScanning ? 'Matching Vector...' : 'Scan & Identify Subject'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

import { Result, ok, err } from '../utils/result';
import type { CameraFailure } from '../errors/failure';
import type {
  CameraDeviceInfo,
  CameraFacingMode,
  CameraStreamOptions,
} from './cameraTypes';
import { DEFAULT_CAMERA_RESOLUTIONS } from './cameraTypes';
import { logger } from '../utils/logger';

class CameraService {
  private activeStream: MediaStream | null = null;
  private currentFacingMode: CameraFacingMode = 'user';

  /**
   * Queries connected video input devices.
   */
  async enumerateVideoDevices(): Promise<CameraDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => {
          const lowerLabel = d.label.toLowerCase();
          const facing: CameraFacingMode =
            lowerLabel.includes('back') || lowerLabel.includes('environment')
              ? 'environment'
              : 'user';
          return {
            deviceId: d.deviceId,
            label: d.label || `Camera ${index + 1}`,
            facing,
          };
        });
    } catch (e) {
      logger.warn('Failed to enumerate media devices', e);
      return [];
    }
  }

  /**
   * Starts a camera stream with fallback handling.
   */
  async startStream(
    options: CameraStreamOptions = {}
  ): Promise<Result<MediaStream, CameraFailure>> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return err({
        type: 'CAMERA_STREAM_UNAVAILABLE',
        message: 'Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser.',
      });
    }

    // Stop existing stream to avoid hardware contention
    this.stopStream();

    const facingMode = options.facingMode ?? 'user';
    this.currentFacingMode = facingMode;

    const resolution = options.preferredResolution ?? DEFAULT_CAMERA_RESOLUTIONS.DESKTOP_HD;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: options.deviceId
        ? {
            deviceId: { exact: options.deviceId },
            width: { ideal: resolution.width },
            height: { ideal: resolution.height },
            frameRate: { ideal: options.targetFps ?? 30, max: 30 },
          }
        : {
            facingMode: { ideal: facingMode },
            width: { ideal: resolution.width },
            height: { ideal: resolution.height },
            frameRate: { ideal: options.targetFps ?? 30, max: 30 },
          },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      logger.info('Camera stream acquired successfully');
      return ok(stream);
    } catch (error: unknown) {
      const e = error as DOMException;
      logger.error('getUserMedia failed with error name:', e?.name);

      if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
        return err({
          type: 'CAMERA_PERMISSION_DENIED',
          message: 'Permission to access the camera was denied by the user or browser policy.',
        });
      }

      if (e?.name === 'NotFoundError' || e?.name === 'DevicesNotFoundError') {
        return err({
          type: 'CAMERA_DEVICE_NOT_FOUND',
          message: 'No video input devices found on this system.',
        });
      }

      if (e?.name === 'NotReadableError' || e?.name === 'TrackStartError') {
        return err({
          type: 'CAMERA_DEVICE_IN_USE',
          message: 'The selected camera is currently locked or in use by another program.',
        });
      }

      if (e?.name === 'OverconstrainedError') {
        // Fallback to minimal unconstrained stream
        try {
          logger.warn('Overconstrained error, attempting minimal fallback constraints');
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          this.activeStream = fallbackStream;
          return ok(fallbackStream);
        } catch {
          return err({
            type: 'CAMERA_OVERCONSTRAINED',
            message: 'Camera does not satisfy requested video constraints.',
          });
        }
      }

      return err({
        type: 'CAMERA_STREAM_UNAVAILABLE',
        message: e?.message || 'An unknown error occurred while activating camera.',
      });
    }
  }

  /**
   * Safely stops all video tracks and releases the camera hardware.
   */
  stopStream(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => {
        track.stop();
        logger.debug(`Camera track stopped: ${track.id}`);
      });
      this.activeStream = null;
    }
  }

  getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  getCurrentFacingMode(): CameraFacingMode {
    return this.currentFacingMode;
  }

  isStreaming(): boolean {
    if (!this.activeStream) return false;
    return this.activeStream
      .getVideoTracks()
      .some((track) => track.readyState === 'live' && track.enabled);
  }
}

export const cameraService = new CameraService();

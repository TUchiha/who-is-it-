/**
 * Camera domain types and permission lifecycle definitions.
 */

export type CameraPermissionState =
  | 'checking'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type CameraFacingMode = 'user' | 'environment';

export interface CameraResolution {
  readonly width: number;
  readonly height: number;
}

export interface CameraDeviceInfo {
  readonly deviceId: string;
  readonly label: string;
  readonly facing: CameraFacingMode;
}

export interface CameraStreamOptions {
  readonly facingMode?: CameraFacingMode;
  readonly preferredResolution?: CameraResolution;
  readonly targetFps?: number;
  readonly deviceId?: string;
}

export const DEFAULT_CAMERA_RESOLUTIONS = {
  DESKTOP_HD: { width: 1280, height: 720 },
  MOBILE_PORTRAIT: { width: 720, height: 1280 },
  LOW_OVERHEAD: { width: 640, height: 480 },
} as const;

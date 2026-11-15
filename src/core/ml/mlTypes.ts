/**
 * ML Worker Communication Protocol and Vision Data Types.
 * Strictly adheres to Design Rule 1: Heavy ML runs in Web Worker (OffscreenCanvas).
 */

export type LivenessAction =
  | 'angle_front'
  | 'angle_left'
  | 'angle_right'
  | 'angle_up'
  | 'liveness_expression'
  | 'blink'
  | 'turn_left'
  | 'turn_right'
  | 'smile'
  | 'look_straight';

export interface FaceBoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly confidence: number;
}

export interface QualityMetrics {
  readonly brightness: number; // 0 - 255
  readonly sharpness: number;  // Laplacian variance
  readonly faceRatio: number;  // Face box area relative to frame
  readonly isCentered: boolean;
  readonly passesQuality: boolean;
  readonly failureReason?: string;
}

export interface FaceDetectionResult {
  readonly facesDetected: number;
  readonly boundingBox?: FaceBoundingBox;
  readonly quality: QualityMetrics;
  readonly yawDegree: number;   // Head rotation (- left, + right)
  readonly isBlinking: boolean;
  readonly isSmiling: boolean;
}

export interface WorkerInitRequest {
  readonly id: string;
  readonly type: 'INIT_MODELS';
}

export interface WorkerProcessFrameRequest {
  readonly id: string;
  readonly type: 'PROCESS_FRAME';
  readonly imageBitmap: ImageBitmap;
  readonly mode: 'FACE_DETECT' | 'LIVENESS' | 'EXTRACT_EMBEDDING';
  readonly requiredAction?: LivenessAction;
}

export interface WorkerResponsePayload {
  readonly id: string;
  readonly success: boolean;
  readonly detection?: FaceDetectionResult;
  readonly embedding?: number[]; // Serialized Float32Array
  readonly livenessPassed?: boolean;
  readonly error?: string;
}

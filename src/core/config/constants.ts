/**
 * Core Application Constants and Thresholds
 */

export const BIOMETRIC_CONSTANTS = {
  // MobileFaceNet alignment input specifications
  FACE_INPUT_WIDTH: 112,
  FACE_INPUT_HEIGHT: 112,

  // Embedding dimensions
  EMBEDDING_DIMENSION: 192,
  EMBEDDING_MODEL_VERSION: 'mobilefacenet-v1',

  // Matching thresholds (L2-normalized vectors; dot product = cosine similarity)
  DEFAULT_SIMILARITY_THRESHOLD: 0.75,
  LOCAL_UNLOCK_SIMILARITY_THRESHOLD: 0.78,

  // Enrollment parameters
  ENROLLMENT_SAMPLE_COUNT: 5,
  ENROLLMENT_MIN_INTERVAL_MS: 300,

  // Quality filters
  MIN_FACE_BOX_SIZE_PX: 110,
  MIN_BRIGHTNESS_SCORE: 40,
  MAX_BRIGHTNESS_SCORE: 220,
  MAX_BLUR_LAPLACIAN_VARIANCE: 100, // minimum sharpness threshold

  // Liveness detection thresholds
  BLINK_EYE_CLOSED_THRESHOLD: 0.55,
  TURN_HEAD_YAW_DEGREE_THRESHOLD: 18.0,
  LIVENESS_STEP_TIMEOUT_MS: 8000,
} as const;

export const CONSENT_CONSTANTS = {
  CURRENT_VERSION: '1.0.0',
  POLICY_EFFECTIVE_DATE: '2026-11-14',
  STATUTORY_RETENTION_DAYS: 1095, // 3-year hard cap under Illinois BIPA
} as const;

export const VISIBILITY_OPTIONS = {
  NOBODY: 'nobody',
  CONTACTS: 'contacts',
  ALL: 'all',
} as const;

export type VisibilityLevel = (typeof VISIBILITY_OPTIONS)[keyof typeof VISIBILITY_OPTIONS];

export const RATE_LIMIT_CONSTANTS = {
  LOOKUP_WINDOW_SECONDS: 60,
  LOOKUP_MAX_PER_WINDOW: 10,
} as const;

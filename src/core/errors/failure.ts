/**
 * Discriminated union Failure types for domain and application layers.
 */

export type AuthFailure =
  | { type: 'AUTH_INVALID_CREDENTIALS'; message: string }
  | { type: 'AUTH_EMAIL_NOT_VERIFIED'; message: string; email: string }
  | { type: 'AUTH_USER_NOT_FOUND'; message: string }
  | { type: 'AUTH_USER_ALREADY_EXISTS'; message: string }
  | { type: 'AUTH_WEAK_PASSWORD'; message: string }
  | { type: 'AUTH_SESSION_EXPIRED'; message: string }
  | { type: 'AUTH_UNAUTHENTICATED'; message: string };

export type CameraFailure =
  | { type: 'CAMERA_PERMISSION_DENIED'; message: string }
  | { type: 'CAMERA_DEVICE_NOT_FOUND'; message: string }
  | { type: 'CAMERA_OVERCONSTRAINED'; message: string }
  | { type: 'CAMERA_STREAM_UNAVAILABLE'; message: string }
  | { type: 'CAMERA_DEVICE_IN_USE'; message: string };

export type BiometricFailure =
  | { type: 'BIO_NO_FACE_DETECTED'; message: string }
  | { type: 'BIO_MULTIPLE_FACES'; message: string }
  | { type: 'BIO_POOR_LIGHTING'; message: string }
  | { type: 'BIO_BLURRY_FRAME'; message: string }
  | { type: 'BIO_FACE_TOO_FAR'; message: string }
  | { type: 'BIO_FACE_TOO_CLOSE'; message: string }
  | { type: 'BIO_LIVENESS_CHALLENGE_FAILED'; message: string; challengeStep?: string }
  | { type: 'BIO_SIMILARITY_BELOW_THRESHOLD'; message: string }
  | { type: 'BIO_NO_MATCH'; message: string }
  | { type: 'BIO_TEMPLATE_NOT_FOUND'; message: string };

export type ConsentFailure =
  | { type: 'CONSENT_REQUIRED'; message: string }
  | { type: 'CONSENT_REVOKED'; message: string }
  | { type: 'CONSENT_VERSION_MISMATCH'; message: string; requiredVersion: string; currentVersion: string };

export type CryptoFailure =
  | { type: 'CRYPTO_KEY_GENERATION_FAILED'; message: string }
  | { type: 'CRYPTO_ENCRYPTION_FAILED'; message: string }
  | { type: 'CRYPTO_DECRYPTION_FAILED'; message: string }
  | { type: 'CRYPTO_STORAGE_ERROR'; message: string };

export type NetworkFailure =
  | { type: 'NETWORK_OFFLINE'; message: string }
  | { type: 'NETWORK_TIMEOUT'; message: string }
  | { type: 'NETWORK_RATE_LIMITED'; message: string; retryAfterSeconds?: number }
  | { type: 'NETWORK_SERVER_ERROR'; message: string; statusCode?: number };

export type ValidationFailure = {
  type: 'VALIDATION_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
};

export type AppFailure =
  | AuthFailure
  | CameraFailure
  | BiometricFailure
  | ConsentFailure
  | CryptoFailure
  | NetworkFailure
  | ValidationFailure;

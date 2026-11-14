import type { AppFailure } from './failure';

/**
 * Maps domain failures to user-friendly messages with contextual guidance.
 */
export function mapFailureToUserMessage(failure: AppFailure): string {
  switch (failure.type) {
    case 'AUTH_INVALID_CREDENTIALS':
      return 'The email or password you entered is incorrect. Please double-check and try again.';
    case 'AUTH_EMAIL_NOT_VERIFIED':
      return `Please verify your email address (${failure.email}) before accessing camera identification features. Check your inbox for the confirmation link.`;
    case 'AUTH_USER_NOT_FOUND':
      return 'No account was found with this email address.';
    case 'AUTH_USER_ALREADY_EXISTS':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'AUTH_WEAK_PASSWORD':
      return 'Your password is too weak. Please use at least 8 characters including uppercase, lowercase, numbers, and symbols.';
    case 'AUTH_SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    case 'AUTH_UNAUTHENTICATED':
      return 'You must be signed in to perform this action.';

    case 'CAMERA_PERMISSION_DENIED':
      return 'Camera access was blocked. Please click the camera or lock icon in your browser address bar, allow camera permissions, and reload the page.';
    case 'CAMERA_DEVICE_NOT_FOUND':
      return 'No camera device was detected on your system. Please connect a webcam or switch devices.';
    case 'CAMERA_OVERCONSTRAINED':
      return 'Your camera could not support the requested resolution or framerate. Falling back to default settings.';
    case 'CAMERA_STREAM_UNAVAILABLE':
      return 'Could not start camera video stream. Please check browser permissions.';
    case 'CAMERA_DEVICE_IN_USE':
      return 'Your camera is currently in use by another application. Please close other camera apps and refresh.';

    case 'BIO_NO_FACE_DETECTED':
      return 'No face detected in the camera frame. Please position yourself in front of the camera.';
    case 'BIO_MULTIPLE_FACES':
      return 'Multiple faces detected. Please ensure only one person is in the frame for enrollment and verification.';
    case 'BIO_POOR_LIGHTING':
      return 'Lighting is too dark or washed out. Please move to an evenly lit area.';
    case 'BIO_BLURRY_FRAME':
      return 'Image is blurry. Please hold steady and clean your camera lens.';
    case 'BIO_FACE_TOO_FAR':
      return 'Please move closer to the camera so your face fills the frame guide.';
    case 'BIO_FACE_TOO_CLOSE':
      return 'Please step back slightly so your entire face is visible.';
    case 'BIO_LIVENESS_CHALLENGE_FAILED':
      return `Liveness verification did not complete. Please perform the requested gesture when prompted.`;
    case 'BIO_SIMILARITY_BELOW_THRESHOLD':
    case 'BIO_NO_MATCH':
      // Design Rule 7: Uniform no-match response
      return 'No enrolled profile matched this person.';
    case 'BIO_TEMPLATE_NOT_FOUND':
      return 'No biometric template found on this device. Please enroll your face first.';

    case 'CONSENT_REQUIRED':
      return 'Biometric privacy consent has not been granted. You must review and accept the consent agreement before using facial features.';
    case 'CONSENT_REVOKED':
      return 'Your biometric consent has been revoked. All facial templates have been erased.';
    case 'CONSENT_VERSION_MISMATCH':
      return 'The biometric privacy policy has been updated. Please review the updated policy to continue.';

    case 'CRYPTO_KEY_GENERATION_FAILED':
    case 'CRYPTO_ENCRYPTION_FAILED':
    case 'CRYPTO_DECRYPTION_FAILED':
    case 'CRYPTO_STORAGE_ERROR':
      return 'A secure local storage error occurred. Please clear site data or ensure private browsing allows IndexedDB.';

    case 'NETWORK_OFFLINE':
      return 'You are currently offline. Local object detection and local face unlock remain available.';
    case 'NETWORK_TIMEOUT':
      return 'Network request timed out. Please check your internet connection.';
    case 'NETWORK_RATE_LIMITED':
      return failure.retryAfterSeconds
        ? `Rate limit reached. Please wait ${failure.retryAfterSeconds} seconds before trying another lookup.`
        : 'Too many requests. Please wait a moment before trying again.';
    case 'NETWORK_SERVER_ERROR':
      return 'A server error occurred. Please try again shortly.';

    case 'VALIDATION_ERROR':
      return failure.message || 'Please correct the invalid input fields.';

    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

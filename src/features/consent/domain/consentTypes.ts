/**
 * Biometric Privacy Consent Entities.
 * Adheres strictly to GDPR Article 9 (Special Category Biometric Data)
 * and Illinois Biometric Information Privacy Act (740 ILCS 14).
 */

export interface BiometricConsentRecord {
  readonly userId: string;
  readonly version: string;
  readonly grantedAt: string;
  readonly statutoryRetentionExpiry: string; // 3 years max
  readonly allowIdentificationByOthers: boolean;
  readonly jurisdiction: 'GDPR_BIPA_CCPA';
}

export interface ConsentRepository {
  getConsent(userId: string): Promise<BiometricConsentRecord | null>;
  grantConsent(record: BiometricConsentRecord): Promise<void>;
  revokeConsent(userId: string): Promise<void>;
}

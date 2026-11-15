import type { BiometricConsentRecord, ConsentRepository } from '../domain/consentTypes';
import { supabase } from '../../../core/supabase/supabaseClient';
import { logger } from '../../../core/utils/logger';

export class ConsentRepositoryImpl implements ConsentRepository {
  private localPrefix = 'who_is_it_consent_';

  async getConsent(userId: string): Promise<BiometricConsentRecord | null> {
    // Check local storage fallback first
    try {
      const local = localStorage.getItem(`${this.localPrefix}${userId}`);
      if (local) {
        return JSON.parse(local) as BiometricConsentRecord;
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.user_id,
        version: data.version,
        grantedAt: data.granted_at,
        statutoryRetentionExpiry: new Date(
          new Date(data.granted_at).getTime() + 1095 * 24 * 60 * 60 * 1000
        ).toISOString(),
        allowIdentificationByOthers: true,
        jurisdiction: 'GDPR_BIPA_CCPA',
      };
    } catch (e) {
      logger.warn('Failed querying remote consent table', e);
      return null;
    }
  }

  async grantConsent(record: BiometricConsentRecord): Promise<void> {
    // 1. Always write locally for high-speed client checks
    localStorage.setItem(`${this.localPrefix}${record.userId}`, JSON.stringify(record));

    // 2. Persist to database
    try {
      await supabase.from('consents').upsert({
        user_id: record.userId,
        version: record.version,
        granted_at: record.grantedAt,
        revoked_at: null,
        jurisdiction_acknowledged: record.jurisdiction,
      });
      logger.info('Biometric consent record successfully persisted');
    } catch (e) {
      logger.warn('Could not sync consent to remote database', e);
    }
  }

  async revokeConsent(userId: string): Promise<void> {
    localStorage.removeItem(`${this.localPrefix}${userId}`);

    try {
      await supabase
        .from('consents')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId);
      logger.info('Biometric consent revoked on database');
    } catch (e) {
      logger.warn('Could not revoke consent on remote database', e);
    }
  }
}

export const consentRepository = new ConsentRepositoryImpl();

import type { FaceTemplateRecord, EnrolledProfile } from '../domain/enrollmentTypes';
import { secureStore } from '../../../core/security/secureStore';
import { supabase } from '../../../core/supabase/supabaseClient';
import { logger } from '../../../core/utils/logger';

export class FaceTemplateRepository {
  private localKeyPrefix = 'who_is_it_template_';
  private allTemplatesKey = 'who_is_it_all_enrolled_profiles';

  async isUserEnrolled(userId: string): Promise<boolean> {
    // 1. If explicit fresh test user persona, always report unenrolled to test flow
    if (userId.startsWith('99999999-')) {
      return false;
    }

    // 2. Check user-specific localStorage cache
    if (localStorage.getItem(`${this.localKeyPrefix}${userId}`)) {
      return true;
    }

    // 3. Check local enrolled registry for this specific user
    try {
      const existingRaw = localStorage.getItem(this.allTemplatesKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (parsed[userId]) {
          return true;
        }
      }
    } catch {}

    // 4. Check remote Supabase database
    try {
      const { data, error } = await supabase
        .from('face_templates')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        localStorage.setItem(`${this.localKeyPrefix}${userId}`, 'true');
        return true;
      }
    } catch (e) {
      logger.warn('Could not query remote face_templates table', e);
    }

    // 5. Check local device secure vault (IndexedDB) for demo persona
    if (userId === '11111111-1111-1111-1111-111111111111') {
      const localVault = await secureStore.getLocalFaceTemplate();
      if (localVault.success && localVault.value) {
        return true;
      }
    }

    return false;
  }

  async saveFaceTemplate(
    record: FaceTemplateRecord,
    displayName: string,
    allowIdentification: boolean
  ): Promise<void> {
    // 1. Save to WebCrypto encrypted IndexedDB vault (Design Rule 3)
    await secureStore.saveLocalFaceTemplate(
      record.embedding,
      record.modelVersion,
      record.sampleCount
    );

    // 2. Cache in enrolled directory for immediate local camera matching
    const profileEntry: EnrolledProfile = {
      userId: record.userId,
      displayName,
      embedding: record.embedding,
      allowIdentification,
    };

    this.saveToLocalEnrolledRegistry(profileEntry);

    // 3. Persist to database with pgvector formatting
    try {
      // Format Float32Array as pgvector string: "[0.12, -0.34, ...]"
      const vectorString = `[${Array.from(record.embedding).join(',')}]`;

      await supabase.from('face_templates').upsert({
        user_id: record.userId,
        model_version: record.modelVersion,
        embedding: vectorString,
        created_at: record.createdAt,
        statutory_expiry: record.statutoryExpiry,
      });

      // Update profile identification visibility
      await supabase.from('profiles').upsert({
        id: record.userId,
        display_name: displayName,
        allow_identification: allowIdentification,
        visibility: allowIdentification ? 'all' : 'nobody',
        updated_at: new Date().toISOString(),
      });

      logger.info('Face template vector successfully persisted to database');
    } catch (e) {
      logger.warn('Could not write face template to remote database (cached locally)', e);
    }
  }

  private saveToLocalEnrolledRegistry(profile: EnrolledProfile): void {
    try {
      const existingRaw = localStorage.getItem(this.allTemplatesKey);
      const registry: Record<string, { userId: string; displayName: string; vector: number[]; allowIdentification: boolean }> =
        existingRaw ? JSON.parse(existingRaw) : {};

      registry[profile.userId] = {
        userId: profile.userId,
        displayName: profile.displayName,
        vector: Array.from(profile.embedding),
        allowIdentification: profile.allowIdentification,
      };

      localStorage.setItem(this.allTemplatesKey, JSON.stringify(registry));
      localStorage.setItem(`${this.localKeyPrefix}${profile.userId}`, 'true');
    } catch (e) {
      logger.error('Failed updating local enrolled registry', e);
    }
  }

  async getAllEnrolledProfiles(): Promise<EnrolledProfile[]> {
    const list: EnrolledProfile[] = [];

    // 1. Read from local registry
    try {
      const existingRaw = localStorage.getItem(this.allTemplatesKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw) as Record<
          string,
          { userId: string; displayName: string; vector: number[]; allowIdentification: boolean }
        >;
        for (const item of Object.values(parsed)) {
          list.push({
            userId: item.userId,
            displayName: item.displayName,
            embedding: new Float32Array(item.vector),
            allowIdentification: item.allowIdentification,
          });
        }
      }
    } catch (e) {
      logger.warn('Error reading local enrolled registry', e);
    }

    // 2. Query remote database if available
    try {
      const { data, error } = await supabase
        .from('face_templates')
        .select('user_id, embedding, profiles(display_name, allow_identification)');

      if (!error && data) {
        for (const row of data) {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          if (profile && profile.allow_identification) {
            let vec: Float32Array;
            if (typeof row.embedding === 'string') {
              const nums = row.embedding.replace(/[\[\]]/g, '').split(',').map(Number);
              vec = new Float32Array(nums);
            } else if (Array.isArray(row.embedding)) {
              vec = new Float32Array(row.embedding);
            } else {
              continue;
            }

            // Deduplicate if already loaded
            if (!list.some((existing) => existing.userId === row.user_id)) {
              list.push({
                userId: row.user_id,
                displayName: profile.display_name || 'Enrolled User',
                embedding: vec,
                allowIdentification: true,
              });
            }
          }
        }
      }
    } catch (e) {
      logger.warn('Could not fetch enrolled profiles from database', e);
    }

    return list;
  }
}

export const faceTemplateRepository = new FaceTemplateRepository();

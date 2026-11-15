import type { IdentificationOutcome } from '../domain/identifyTypes';
import { cosineSimilarity } from '../../../core/ml/vectorMath';
import { BIOMETRIC_CONSTANTS } from '../../../core/config/constants';
import { faceTemplateRepository } from '../../faceEnrollment/data/faceTemplateRepository';
import { supabase } from '../../../core/supabase/supabaseClient';
import { logger } from '../../../core/utils/logger';

export class IdentificationRepository {
  /**
   * Matches a query embedding vector against enrolled database profiles.
   * Enforces Design Rule 7 (uniform no-match for non-enrolled or hidden users).
   */
  async identifySubject(
    queryVector: Float32Array,
    callerUserId: string
  ): Promise<IdentificationOutcome> {
    const timestamp = new Date().toISOString();

    // 1. Fetch enrolled candidate profiles
    const candidates = await faceTemplateRepository.getAllEnrolledProfiles();

    let bestMatch: { userId: string; displayName: string; score: number } | null = null;
    let highestScore = -1;

    for (const candidate of candidates) {
      // Server-side visibility rule: Ignore users who opted out of identification
      if (!candidate.allowIdentification) {
        continue;
      }

      const score = cosineSimilarity(queryVector, candidate.embedding);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          userId: candidate.userId,
          displayName: candidate.displayName,
          score,
        };
      }
    }

    // 2. Evaluate against configured cosine similarity threshold (default 0.75)
    if (bestMatch && highestScore >= BIOMETRIC_CONSTANTS.DEFAULT_SIMILARITY_THRESHOLD) {
      // Record audit log for transparency (Design Rule: target can audit who looked them up)
      this.recordAuditLog(bestMatch.userId, callerUserId, 'matched');

      return {
        status: 'MATCHED',
        person: {
          userId: bestMatch.userId,
          displayName: bestMatch.displayName,
          confidenceScore: highestScore,
          matchedAt: timestamp,
        },
      };
    }

    // 3. Uniform No Match response (Design Rule 7)
    // Never reveals whether the person is in the database with visibility=nobody or simply non-enrolled
    return {
      status: 'NO_MATCH',
      message: 'No enrolled profile matched this person.',
      timestamp,
    };
  }

  private async recordAuditLog(
    targetUserId: string,
    callerUserId: string,
    result: 'matched' | 'no_match_or_hidden'
  ): Promise<void> {
    try {
      await supabase.from('lookup_logs').insert({
        target_user_id: targetUserId,
        caller_user_id: callerUserId,
        timestamp: new Date().toISOString(),
        result,
      });
      logger.info('Audit lookup log created');
    } catch (e) {
      logger.warn('Failed recording lookup log', e);
    }
  }
}

export const identificationRepository = new IdentificationRepository();

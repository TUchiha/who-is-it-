import type { FaceTemplateRecord } from './enrollmentTypes';
import { averageAndNormalizeTemplates } from '../../../core/ml/vectorMath';
import { BIOMETRIC_CONSTANTS, CONSENT_CONSTANTS } from '../../../core/config/constants';
import { faceTemplateRepository, FaceTemplateRepository } from '../data/faceTemplateRepository';
import { consentRepository, ConsentRepositoryImpl } from '../../consent/data/consentRepository';

export interface EnrollFaceParams {
  readonly userId: string;
  readonly displayName: string;
  readonly sampleVectors: Float32Array[];
  readonly allowIdentificationByOthers: boolean;
}

export class EnrollFaceUseCase {
  constructor(
    private readonly templateRepo: FaceTemplateRepository = faceTemplateRepository,
    private readonly consentRepo: ConsentRepositoryImpl = consentRepository
  ) {}

  async execute(params: EnrollFaceParams): Promise<FaceTemplateRecord> {
    if (params.sampleVectors.length === 0) {
      throw new Error('At least one face sample vector is required for enrollment');
    }

    // 1. Average 3-5 embeddings into one canonical L2-normalized master template
    const masterEmbedding = averageAndNormalizeTemplates(params.sampleVectors);

    const now = new Date();
    const expiry = new Date(now.getTime() + CONSENT_CONSTANTS.STATUTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const record: FaceTemplateRecord = {
      userId: params.userId,
      modelVersion: BIOMETRIC_CONSTANTS.EMBEDDING_MODEL_VERSION,
      embedding: masterEmbedding,
      sampleCount: params.sampleVectors.length,
      createdAt: now.toISOString(),
      statutoryExpiry: expiry.toISOString(),
    };

    // 2. Persist template to encrypted local vault & remote database
    await this.templateRepo.saveFaceTemplate(
      record,
      params.displayName,
      params.allowIdentificationByOthers
    );

    // 3. Record statutory informed consent
    await this.consentRepo.grantConsent({
      userId: params.userId,
      version: CONSENT_CONSTANTS.CURRENT_VERSION,
      grantedAt: now.toISOString(),
      statutoryRetentionExpiry: expiry.toISOString(),
      allowIdentificationByOthers: params.allowIdentificationByOthers,
      jurisdiction: 'GDPR_BIPA_CCPA',
    });

    return record;
  }
}

export const enrollFaceUseCase = new EnrollFaceUseCase();

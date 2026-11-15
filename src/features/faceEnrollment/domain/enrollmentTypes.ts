/**
 * Face Template Entity and Enrollment Definitions.
 */

export interface FaceTemplateRecord {
  readonly userId: string;
  readonly modelVersion: string;
  readonly embedding: Float32Array;
  readonly sampleCount: number;
  readonly createdAt: string;
  readonly statutoryExpiry: string;
}

export interface EnrolledProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly embedding: Float32Array;
  readonly allowIdentification: boolean;
}

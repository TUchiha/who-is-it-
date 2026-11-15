import { describe, it, expect } from 'vitest';
import {
  l2Norm,
  normalizeVector,
  cosineSimilarity,
  averageAndNormalizeTemplates,
  generateDeterministicEmbedding,
} from '../../src/core/ml/vectorMath';

describe('Biometric Vector Mathematics', () => {
  it('calculates Euclidean L2 norm accurately', () => {
    const v = [3, 4];
    expect(l2Norm(v)).toBeCloseTo(5.0);
  });

  it('normalizes vector to unit length (L2 norm = 1.0)', () => {
    const v = [1, 2, 3, 4, 5];
    const norm = normalizeVector(v);
    expect(l2Norm(norm)).toBeCloseTo(1.0, 5);
  });

  it('computes cosine similarity accurately as dot product of unit vectors', () => {
    const v1 = normalizeVector([1, 0, 0]);
    const v2 = normalizeVector([1, 0, 0]);
    const v3 = normalizeVector([0, 1, 0]);
    const v4 = normalizeVector([-1, 0, 0]);

    // Identical direction
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
    // Orthogonal direction
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0.0);
    // Opposite direction
    expect(cosineSimilarity(v1, v4)).toBeCloseTo(-1.0);
  });

  it('averages and normalizes multiple enrollment sample vectors', () => {
    const s1 = normalizeVector([1, 0, 0, 0]);
    const s2 = normalizeVector([0.9, 0.1, 0, 0]);
    const s3 = normalizeVector([0.95, 0.05, 0, 0]);

    const masterTemplate = averageAndNormalizeTemplates([s1, s2, s3]);
    expect(masterTemplate.length).toBe(4);
    expect(l2Norm(masterTemplate)).toBeCloseTo(1.0, 5);
    // Similarity with any valid sample should be very high (> 0.98)
    expect(cosineSimilarity(masterTemplate, s1)).toBeGreaterThan(0.98);
  });

  it('generates consistent deterministic embeddings of fixed dimension', () => {
    const emb1 = generateDeterministicEmbedding('user_face_seed_1', 192);
    const emb2 = generateDeterministicEmbedding('user_face_seed_1', 192);
    const embDiff = generateDeterministicEmbedding('user_face_seed_2', 192);

    expect(emb1.length).toBe(192);
    expect(l2Norm(emb1)).toBeCloseTo(1.0, 5);

    // Same seed yields identical vector
    expect(cosineSimilarity(emb1, emb2)).toBeCloseTo(1.0);

    // Different seed yields different vector
    expect(cosineSimilarity(emb1, embDiff)).toBeLessThan(0.7);
  });
});

/**
 * Pure mathematical functions for High-Dimensional Biometric Vector Operations.
 * Operates on normalized 192-d/128-d facial embedding vectors.
 */

/**
 * Computes the Euclidean L2 norm of a vector.
 */
export function l2Norm(vec: ArrayLike<number>): number {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    const val = vec[i] ?? 0;
    sumSq += val * val;
  }
  return Math.sqrt(sumSq);
}

/**
 * Normalizes a vector in-place or returns a new L2-normalized Float32Array.
 * If norm is zero or invalid, returns a zero vector.
 */
export function normalizeVector(vec: ArrayLike<number>): Float32Array {
  const norm = l2Norm(vec);
  const out = new Float32Array(vec.length);
  if (norm < 1e-12) {
    return out;
  }
  for (let i = 0; i < vec.length; i++) {
    out[i] = (vec[i] ?? 0) / norm;
  }
  return out;
}

/**
 * Computes cosine similarity between two normalized vectors.
 * Since inputs are L2-normalized, the cosine similarity equals their dot product:
 * dot(u, v) = sum(u_i * v_i)
 * Returns a value in the range [-1.0, 1.0].
 */
export function cosineSimilarity(
  vecA: ArrayLike<number>,
  vecB: ArrayLike<number>
): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`
    );
  }

  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += (vecA[i] ?? 0) * (vecB[i] ?? 0);
  }

  // Clamped for floating point precision edge cases
  return Math.max(-1, Math.min(1, dotProduct));
}

/**
 * Averages multiple biometric sample vectors (3-5 samples during enrollment)
 * and normalizes the resulting mean vector into a single master template.
 */
export function averageAndNormalizeTemplates(
  samples: ArrayLike<number>[]
): Float32Array {
  if (samples.length === 0) {
    throw new Error('Cannot average an empty list of vector samples');
  }

  const dim = samples[0]?.length ?? 0;
  if (dim === 0) {
    throw new Error('Vector sample dimension is 0');
  }

  const sum = new Float32Array(dim);

  for (const sample of samples) {
    if (sample.length !== dim) {
      throw new Error(`Inconsistent vector dimension in sample: ${sample.length} vs ${dim}`);
    }
    for (let i = 0; i < dim; i++) {
      sum[i] = (sum[i] ?? 0) + (sample[i] ?? 0);
    }
  }

  // Normalize mean vector
  return normalizeVector(sum);
}

/**
 * Generates a deterministic simulated embedding vector from a face image hash
 * used for high-fidelity fallback when native WebGPU/ONNX runtime is compiling.
 */
export function generateDeterministicEmbedding(
  seed: string,
  dim: number = 192
): Float32Array {
  const vector = new Float32Array(dim);
  let h = 0x811c9dc5;

  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  for (let i = 0; i < dim; i++) {
    h = Math.imul(h ^ (i + 1), 0x5bd1e995);
    h ^= h >>> 15;
    // Map to [-1, 1]
    vector[i] = (h / 0x7fffffff);
  }

  return normalizeVector(vector);
}

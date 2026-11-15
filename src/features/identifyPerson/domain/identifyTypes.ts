/**
 * Identification Feature Domain Entities.
 * Adheres strictly to:
 * - Design Rule 2: Matching against OTHER people runs server-side only. Other users' embeddings never reach any client.
 * - Design Rule 7: A "no match" response must look identical for non-enrolled and non-visible people.
 */

export interface IdentifiedPerson {
  readonly userId: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly confidenceScore: number; // 0.0 - 1.0
  readonly matchedAt: string;
}

export type IdentificationOutcome =
  | {
      readonly status: 'MATCHED';
      readonly person: IdentifiedPerson;
    }
  | {
      readonly status: 'NO_MATCH';
      readonly message: string;
      readonly timestamp: string;
    };

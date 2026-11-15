import { describe, it, expect } from 'vitest';
import { LivenessChallengeGenerator } from '../../src/core/ml/livenessService';

describe('Liveness Challenge Service (Design Rule 8)', () => {
  it('generates a randomized sequence ending with steady focus', () => {
    const sequence = LivenessChallengeGenerator.generateChallengeSequence();

    expect(sequence.length).toBe(3);
    expect(sequence[2]?.action).toBe('look_straight');
    expect(['blink', 'turn_left', 'turn_right']).toContain(sequence[0]?.action);
    expect(['blink', 'turn_left', 'turn_right']).toContain(sequence[1]?.action);
    expect(sequence[0]?.action).not.toBe(sequence[1]?.action);
  });

  it('includes descriptive prompts and accessibility descriptions', () => {
    const sequence = LivenessChallengeGenerator.generateChallengeSequence();

    for (const step of sequence) {
      expect(step.prompt.length).toBeGreaterThan(5);
      expect(step.ariaDescription.length).toBeGreaterThan(10);
      expect(step.icon).toBeDefined();
    }
  });
});

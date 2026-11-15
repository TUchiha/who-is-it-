import { describe, it, expect } from 'vitest';
import { LivenessChallengeGenerator } from '../../src/core/ml/livenessService';

describe('Multi-Angle Registration & Liveness Service (Design Rule 8)', () => {
  it('provides the structured 5-angle registration sequence', () => {
    const steps = LivenessChallengeGenerator.getRegistrationSteps();

    expect(steps.length).toBe(5);
    expect(steps[0]?.action).toBe('angle_front');
    expect(steps[1]?.action).toBe('angle_left');
    expect(steps[2]?.action).toBe('angle_right');
    expect(steps[3]?.action).toBe('angle_up');
    expect(steps[4]?.action).toBe('liveness_expression');
  });

  it('includes descriptive prompts, labels, and icons for each angle', () => {
    const steps = LivenessChallengeGenerator.getRegistrationSteps();

    for (const step of steps) {
      expect(step.label.length).toBeGreaterThan(2);
      expect(step.prompt.length).toBeGreaterThan(5);
      expect(step.instruction.length).toBeGreaterThan(10);
      expect(step.icon).toBeDefined();
    }
  });
});

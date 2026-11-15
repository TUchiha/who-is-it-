import type { LivenessAction } from './mlTypes';

export interface LivenessStep {
  readonly action: LivenessAction;
  readonly prompt: string;
  readonly icon: string;
  readonly ariaDescription: string;
}

export const LIVENESS_STEP_CONFIGS: Record<LivenessAction, { prompt: string; icon: string; ariaDescription: string }> = {
  blink: {
    prompt: 'Blink your eyes naturally',
    icon: 'Eye',
    ariaDescription: 'Please blink your eyes naturally to verify physical presence.',
  },
  turn_left: {
    prompt: 'Slowly turn your head to your left',
    icon: 'ArrowLeft',
    ariaDescription: 'Please slowly rotate your head to your left.',
  },
  turn_right: {
    prompt: 'Slowly turn your head to your right',
    icon: 'ArrowRight',
    ariaDescription: 'Please slowly rotate your head to your right.',
  },
  smile: {
    prompt: 'Smile gently at the camera',
    icon: 'Smile',
    ariaDescription: 'Please smile gently at the camera.',
  },
  look_straight: {
    prompt: 'Hold still and look directly at the camera',
    icon: 'Focus',
    ariaDescription: 'Hold steady and gaze straight ahead into the frame guide.',
  },
};

export class LivenessChallengeGenerator {
  /**
   * Generates a randomized sequence of challenges.
   * Mandated by Design Rule 8: Prevents static image and replay video attacks.
   */
  static generateChallengeSequence(): LivenessStep[] {
    const candidates: LivenessAction[] = ['blink', 'turn_left', 'turn_right'];

    // Shuffle the dynamic actions
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    // Pick 2 random dynamic challenges and always conclude with looking straight for clean embedding capture
    const selectedActions: LivenessAction[] = [shuffled[0]!, shuffled[1]!, 'look_straight'];

    return selectedActions.map((action) => ({
      action,
      prompt: LIVENESS_STEP_CONFIGS[action].prompt,
      icon: LIVENESS_STEP_CONFIGS[action].icon,
      ariaDescription: LIVENESS_STEP_CONFIGS[action].ariaDescription,
    }));
  }
}

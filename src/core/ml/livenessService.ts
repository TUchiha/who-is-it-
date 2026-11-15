import type { LivenessAction } from './mlTypes';

export interface MultiAngleSnapStep {
  readonly id: number;
  readonly action: LivenessAction;
  readonly label: string;
  readonly title: string;
  readonly prompt: string;
  readonly instruction: string;
  readonly icon: string;
  readonly ariaDescription: string;
}

export const MULTI_ANGLE_REGISTRATION_STEPS: MultiAngleSnapStep[] = [
  {
    id: 1,
    action: 'angle_front',
    label: 'Front',
    title: 'Snap 1: Front Facing',
    prompt: 'Look straight ahead at the camera',
    instruction: 'Keep your head level and look directly into the frame guide.',
    icon: 'Focus',
    ariaDescription: 'Snap 1 of 5: Front view. Please look directly at the camera with a neutral expression.',
  },
  {
    id: 2,
    action: 'angle_left',
    label: 'Turn Left',
    title: 'Snap 2: Left Angle',
    prompt: 'Slowly turn your face to your left',
    instruction: 'Turn your head about 15° to the left so your left cheek is visible.',
    icon: 'ArrowLeft',
    ariaDescription: 'Snap 2 of 5: Left angle. Slowly turn your face slightly to the left.',
  },
  {
    id: 3,
    action: 'angle_right',
    label: 'Turn Right',
    title: 'Snap 3: Right Angle',
    prompt: 'Slowly turn your face to your right',
    instruction: 'Turn your head about 15° to the right so your right cheek is visible.',
    icon: 'ArrowRight',
    ariaDescription: 'Snap 3 of 5: Right angle. Slowly turn your face slightly to the right.',
  },
  {
    id: 4,
    action: 'angle_up',
    label: 'Tilt Up',
    title: 'Snap 4: Upward Angle',
    prompt: 'Tilt your chin slightly upwards',
    instruction: 'Raise your chin slightly so your jawline is clearly captured.',
    icon: 'ArrowUp',
    ariaDescription: 'Snap 4 of 5: Upward angle. Tilt your chin slightly upwards.',
  },
  {
    id: 5,
    action: 'liveness_expression',
    label: 'Expression',
    title: 'Snap 5: Live Expression',
    prompt: 'Smile gently or blink naturally',
    instruction: 'A gentle smile or natural blink confirms you are a live human.',
    icon: 'Smile',
    ariaDescription: 'Snap 5 of 5: Live expression. Smile gently or blink naturally to complete registration.',
  },
];

export class LivenessChallengeGenerator {
  /**
   * Returns the structured 5-angle registration sequence for comprehensive multi-angle capture.
   */
  static getRegistrationSteps(): MultiAngleSnapStep[] {
    return MULTI_ANGLE_REGISTRATION_STEPS;
  }

  /**
   * Generates a 3-step dynamic sequence for fast unlocks.
   */
  static generateChallengeSequence(): MultiAngleSnapStep[] {
    return [
      MULTI_ANGLE_REGISTRATION_STEPS[0]!,
      MULTI_ANGLE_REGISTRATION_STEPS[1]!,
      MULTI_ANGLE_REGISTRATION_STEPS[4]!,
    ];
  }
}

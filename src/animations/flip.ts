import type { Animation, AnimationType } from '../types';

/**
 * Flip animation - tiles flip in with 3D rotation
 */
export class FlipAnimation implements Animation {
  name: AnimationType = 'flip';

  getInitialStyles(): Record<string, string> {
    return {
      opacity: '0',
      transform: 'perspective(1000px) rotateY(90deg)',
      'backface-visibility': 'hidden',
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
      transform: 'perspective(1000px) rotateY(0deg)',
    };
  }

  getTransition(duration: number, easing: string): string {
    return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
  }
}

import type { Animation, AnimationType } from '../types';

/**
 * Scale animation - tiles scale up from zero
 */
export class ScaleAnimation implements Animation {
  name: AnimationType = 'scale';

  getInitialStyles(): Record<string, string> {
    return {
      opacity: '0',
      transform: 'scale(0)',
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
      transform: 'scale(1)',
    };
  }

  getTransition(duration: number, easing: string): string {
    return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
  }
}

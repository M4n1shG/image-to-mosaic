import type { Animation, AnimationType } from '../types';

/**
 * Fade animation - tiles fade in from transparent
 */
export class FadeAnimation implements Animation {
  name: AnimationType = 'fade';

  getInitialStyles(): Record<string, string> {
    return {
      opacity: '0',
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
    };
  }

  getTransition(duration: number, easing: string): string {
    return `opacity ${duration}ms ${easing}`;
  }
}

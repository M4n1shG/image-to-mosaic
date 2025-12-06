import type { Animation, AnimationType } from '../types';

/**
 * Slide animation - tiles slide in from edges
 */
export class SlideAnimation implements Animation {
  name: AnimationType = 'slide';

  getInitialStyles(): Record<string, string> {
    return {
      opacity: '0',
      transform: 'translateY(50px)',
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
      transform: 'translateY(0)',
    };
  }

  getTransition(duration: number, easing: string): string {
    return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
  }
}

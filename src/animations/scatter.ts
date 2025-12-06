import type { Animation, AnimationType } from '../types';

/**
 * Scatter animation - tiles scatter in from random positions
 */
export class ScatterAnimation implements Animation {
  name: AnimationType = 'scatter';

  getInitialStyles(): Record<string, string> {
    // Random scatter direction
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 200;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const rotation = (Math.random() - 0.5) * 360;

    return {
      opacity: '0',
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0.5)`,
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
      transform: 'translate(0, 0) rotate(0deg) scale(1)',
    };
  }

  getTransition(duration: number, easing: string): string {
    return `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
  }
}

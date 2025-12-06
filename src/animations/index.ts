import type { Animation, AnimationType } from '../types';
import { FadeAnimation } from './fade';
import { ScaleAnimation } from './scale';
import { FlipAnimation } from './flip';
import { SlideAnimation } from './slide';
import { ScatterAnimation } from './scatter';

/**
 * No animation - immediate display
 */
class NoneAnimation implements Animation {
  name: AnimationType = 'none';

  getInitialStyles(): Record<string, string> {
    return {
      opacity: '1',
    };
  }

  getFinalStyles(): Record<string, string> {
    return {
      opacity: '1',
    };
  }

  getTransition(): string {
    return 'none';
  }
}

/**
 * Animation registry
 */
const animations: Map<AnimationType, Animation> = new Map([
  ['fade', new FadeAnimation()],
  ['scale', new ScaleAnimation()],
  ['flip', new FlipAnimation()],
  ['slide', new SlideAnimation()],
  ['scatter', new ScatterAnimation()],
  ['none', new NoneAnimation()],
]);

/**
 * Get an animation by name
 */
export function getAnimation(name: AnimationType): Animation {
  const animation = animations.get(name);
  if (!animation) {
    console.warn(`Animation "${name}" not found, falling back to fade`);
    return animations.get('fade')!;
  }
  return animation;
}

/**
 * Get all available animation names
 */
export function getAnimationNames(): AnimationType[] {
  return Array.from(animations.keys());
}

/**
 * Register a custom animation
 */
export function registerAnimation(animation: Animation): void {
  animations.set(animation.name, animation);
}

// Re-export animation classes
export { FadeAnimation } from './fade';
export { ScaleAnimation } from './scale';
export { FlipAnimation } from './flip';
export { SlideAnimation } from './slide';
export { ScatterAnimation } from './scatter';

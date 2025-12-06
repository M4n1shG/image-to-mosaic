import type { DelayCalculator, DelayMode } from '../types';
import { SequentialDelay } from './sequential';
import { RandomDelay } from './random';
import { CenterDelay } from './center';
import { SpiralDelay } from './spiral';

/**
 * Fixed delay - same delay for all tiles
 */
class FixedDelay implements DelayCalculator {
  constructor(private delay: number) {}

  calculate(): number {
    return this.delay;
  }
}

/**
 * Delay calculator registry
 */
const delayCalculators: Map<string, DelayCalculator> = new Map([
  ['sequential', new SequentialDelay()],
  ['random', new RandomDelay()],
  ['center', new CenterDelay()],
  ['spiral', new SpiralDelay()],
]);

/**
 * Get a delay calculator by mode
 */
export function getDelayCalculator(mode: DelayMode): DelayCalculator {
  if (typeof mode === 'number') {
    return new FixedDelay(mode);
  }

  const calculator = delayCalculators.get(mode);
  if (!calculator) {
    console.warn(`Delay mode "${mode}" not found, falling back to random`);
    return delayCalculators.get('random')!;
  }
  return calculator;
}

/**
 * Get all available delay mode names
 */
export function getDelayModeNames(): string[] {
  return Array.from(delayCalculators.keys());
}

/**
 * Register a custom delay calculator
 */
export function registerDelayCalculator(name: string, calculator: DelayCalculator): void {
  delayCalculators.set(name, calculator);
}

// Re-export delay classes
export { SequentialDelay } from './sequential';
export { RandomDelay } from './random';
export { CenterDelay } from './center';
export { SpiralDelay } from './spiral';

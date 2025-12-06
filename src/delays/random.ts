import type { DelayCalculator, TileData } from '../types';

/**
 * Random delay - tiles animate with random delays
 */
export class RandomDelay implements DelayCalculator {
  calculate(
    _tile: TileData,
    _totalTiles: number,
    _cols: number,
    _rows: number,
    maxDelay: number
  ): number {
    return Math.random() * maxDelay;
  }
}

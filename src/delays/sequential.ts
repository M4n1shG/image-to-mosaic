import type { DelayCalculator, TileData } from '../types';

/**
 * Sequential delay - tiles animate one after another
 */
export class SequentialDelay implements DelayCalculator {
  calculate(
    tile: TileData,
    totalTiles: number,
    _cols: number,
    _rows: number,
    maxDelay: number
  ): number {
    return (tile.index / totalTiles) * maxDelay;
  }
}

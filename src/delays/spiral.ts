import type { DelayCalculator, TileData } from '../types';
import { spiralOrder } from '../utils/math';

/**
 * Spiral delay - tiles animate in a spiral pattern from center
 */
export class SpiralDelay implements DelayCalculator {
  private spiralCache: Map<string, number[]> = new Map();

  calculate(
    tile: TileData,
    totalTiles: number,
    cols: number,
    rows: number,
    maxDelay: number
  ): number {
    // Cache spiral order for this grid size
    const cacheKey = `${cols}x${rows}`;
    let order = this.spiralCache.get(cacheKey);

    if (!order) {
      order = spiralOrder(cols, rows);
      this.spiralCache.set(cacheKey, order);
    }

    // Find position in spiral order
    const spiralIndex = order.indexOf(tile.index);
    const normalizedIndex = spiralIndex >= 0 ? spiralIndex : tile.index;

    return (normalizedIndex / totalTiles) * maxDelay;
  }
}

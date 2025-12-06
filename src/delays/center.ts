import type { DelayCalculator, TileData } from '../types';
import { distance, gridCenter } from '../utils/math';

/**
 * Center delay - tiles animate from center outward
 */
export class CenterDelay implements DelayCalculator {
  calculate(
    tile: TileData,
    _totalTiles: number,
    cols: number,
    rows: number,
    maxDelay: number
  ): number {
    const center = gridCenter(cols, rows);
    const dist = distance(tile.col, tile.row, center.x, center.y);
    const maxDist = distance(0, 0, center.x, center.y);

    return (dist / maxDist) * maxDelay;
  }
}

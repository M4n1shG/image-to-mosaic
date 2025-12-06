import type { TileData, PatternType } from '../types';
import { BasePattern } from './base';

/**
 * Standard square grid pattern
 * The most basic and performant pattern
 */
export class GridPattern extends BasePattern {
  name: PatternType = 'grid';

  generateTiles(
    containerWidth: number,
    containerHeight: number,
    cols: number,
    rows: number,
    gap: number
  ): TileData[] {
    // Store container dimensions for background calculations
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;

    const tiles: TileData[] = [];

    // Calculate tile dimensions accounting for gaps
    const totalGapWidth = gap * (cols - 1);
    const totalGapHeight = gap * (rows - 1);
    const tileWidth = (containerWidth - totalGapWidth) / cols;
    const tileHeight = (containerHeight - totalGapHeight) / rows;

    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (tileWidth + gap);
        const y = row * (tileHeight + gap);

        tiles.push({
          index,
          row,
          col,
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          bgPosX: 0,
          bgPosY: 0,
        });

        index++;
      }
    }

    return tiles;
  }
}

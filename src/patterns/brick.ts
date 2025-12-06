import type { TileData, PatternType } from '../types';
import { BasePattern } from './base';

/**
 * Brick pattern - offset rows like brickwork
 * Creates a staggered brick-like arrangement
 */
export class BrickPattern extends BasePattern {
  name: PatternType = 'brick';

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

    // Calculate tile dimensions
    const totalGapWidth = gap * (cols - 1);
    const totalGapHeight = gap * (rows - 1);
    const tileWidth = (containerWidth - totalGapWidth) / cols;
    const tileHeight = (containerHeight - totalGapHeight) / rows;

    // Offset for odd rows (half tile width + half gap)
    const offset = (tileWidth + gap) / 2;

    let index = 0;
    for (let row = 0; row < rows; row++) {
      const isOddRow = row % 2 === 1;
      const y = row * (tileHeight + gap);

      // For odd rows, we need cols + 1 tiles to fill the space
      const tilesInRow = isOddRow ? cols + 1 : cols;

      for (let col = 0; col < tilesInRow; col++) {
        let x: number;
        let width: number;

        if (isOddRow) {
          // Odd rows are offset
          x = col * (tileWidth + gap) - offset;

          // First tile (partial, starts at edge)
          if (col === 0) {
            width = offset - gap / 2;
            x = 0;
          }
          // Last tile (partial, ends at edge)
          else if (col === tilesInRow - 1) {
            width = offset - gap / 2;
            x = containerWidth - width;
          } else {
            width = tileWidth;
          }
        } else {
          // Even rows - normal grid
          x = col * (tileWidth + gap);
          width = tileWidth;
        }

        // Skip tiles that would be too small or outside bounds
        if (width < 1) continue;

        tiles.push({
          index,
          row,
          col,
          x,
          y,
          width,
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

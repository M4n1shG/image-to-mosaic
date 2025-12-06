import type { TileData, PatternType } from '../types';
import { BasePattern } from './base';

/**
 * Strips pattern - horizontal or vertical strips
 * Uses cols for vertical strips, rows for horizontal
 */
export class StripsPattern extends BasePattern {
  name: PatternType = 'strips';
  private orientation: 'horizontal' | 'vertical' = 'horizontal';

  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this.orientation = orientation;
  }

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

    if (this.orientation === 'horizontal') {
      // Horizontal strips - use rows count
      const count = rows;
      const totalGapHeight = gap * (count - 1);
      const stripHeight = (containerHeight - totalGapHeight) / count;

      for (let i = 0; i < count; i++) {
        const y = i * (stripHeight + gap);

        tiles.push({
          index: i,
          row: i,
          col: 0,
          x: 0,
          y,
          width: containerWidth,
          height: stripHeight,
          bgPosX: 0,
          bgPosY: 0,
        });
      }
    } else {
      // Vertical strips - use cols count
      const count = cols;
      const totalGapWidth = gap * (count - 1);
      const stripWidth = (containerWidth - totalGapWidth) / count;

      for (let i = 0; i < count; i++) {
        const x = i * (stripWidth + gap);

        tiles.push({
          index: i,
          row: 0,
          col: i,
          x,
          y: 0,
          width: stripWidth,
          height: containerHeight,
          bgPosX: 0,
          bgPosY: 0,
        });
      }
    }

    return tiles;
  }
}

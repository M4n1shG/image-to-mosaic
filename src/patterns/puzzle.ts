import type { TileData, PatternType } from '../types';
import { BasePattern } from './base';

/**
 * Puzzle pattern - jigsaw-like interlocking pieces with smooth bezier curves
 * Uses clip-path: path() with SVG cubic bezier curves for authentic jigsaw tabs
 */
export class PuzzlePattern extends BasePattern {
  name: PatternType = 'puzzle';

  // Store bump directions for edge consistency
  private horizontalBumps: boolean[][] = [];
  private verticalBumps: boolean[][] = [];
  private tabSize = 0;
  private gap = 0;

  generateTiles(
    containerWidth: number,
    containerHeight: number,
    cols: number,
    rows: number,
    gap: number
  ): TileData[] {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.gap = gap;

    const tiles: TileData[] = [];

    const baseTileWidth = containerWidth / cols;
    const baseTileHeight = containerHeight / rows;

    // Tab size proportional to tile size (18% of smaller dimension)
    this.tabSize = Math.min(baseTileWidth, baseTileHeight) * 0.18;

    // Pre-generate random bump directions for all internal edges
    // horizontalBumps[row][col] = true means right edge of tile[row][col] has outward tab
    this.horizontalBumps = [];
    for (let row = 0; row < rows; row++) {
      this.horizontalBumps[row] = [];
      for (let col = 0; col < cols - 1; col++) {
        this.horizontalBumps[row][col] = Math.random() > 0.5;
      }
    }

    // verticalBumps[row][col] = true means bottom edge of tile[row][col] has outward tab
    this.verticalBumps = [];
    for (let row = 0; row < rows - 1; row++) {
      this.verticalBumps[row] = [];
      for (let col = 0; col < cols; col++) {
        this.verticalBumps[row][col] = Math.random() > 0.5;
      }
    }

    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = col * baseTileWidth;
        const baseY = row * baseTileHeight;

        // Determine edge types for this tile
        // 'tab' = protrudes outward, 'hole' = indents inward, 'flat' = straight edge
        const edges = {
          top: row === 0 ? 'flat' : (this.verticalBumps[row - 1][col] ? 'hole' : 'tab'),
          right: col === cols - 1 ? 'flat' : (this.horizontalBumps[row][col] ? 'tab' : 'hole'),
          bottom: row === rows - 1 ? 'flat' : (this.verticalBumps[row][col] ? 'tab' : 'hole'),
          left: col === 0 ? 'flat' : (this.horizontalBumps[row][col - 1] ? 'hole' : 'tab'),
        };

        // Expanded bounds to accommodate tabs
        const expandedX = baseX - this.tabSize;
        const expandedY = baseY - this.tabSize;
        const expandedWidth = baseTileWidth + this.tabSize * 2;
        const expandedHeight = baseTileHeight + this.tabSize * 2;

        // Generate the SVG path for this puzzle piece
        const clipPath = this.generatePuzzlePath(
          baseTileWidth,
          baseTileHeight,
          this.tabSize,
          edges,
          this.gap
        );

        tiles.push({
          index,
          row,
          col,
          x: expandedX,
          y: expandedY,
          width: expandedWidth,
          height: expandedHeight,
          bgPosX: 0,
          bgPosY: 0,
          clipPath,
        });

        index++;
      }
    }

    return tiles;
  }

  /**
   * Generate SVG path for a puzzle piece with bezier curve tabs
   */
  private generatePuzzlePath(
    tileWidth: number,
    tileHeight: number,
    tabSize: number,
    edges: { top: string; right: string; bottom: string; left: string },
    gap: number
  ): string {
    // Coordinates relative to expanded bounds
    // The actual tile content starts at (tabSize, tabSize)
    // Inset by half the gap on each side to create separation
    const inset = gap / 2;
    const left = tabSize + inset;
    const top = tabSize + inset;
    const right = tabSize + tileWidth - inset;
    const bottom = tabSize + tileHeight - inset;

    const pathParts: string[] = [];

    // Start at top-left corner
    pathParts.push(`M ${left} ${top}`);

    // Effective tab size reduced by gap inset
    const effectiveTabSize = Math.max(tabSize - inset, tabSize * 0.5);

    // Top edge (left to right)
    pathParts.push(this.generateEdgePath(
      left, top, right, top,
      edges.top, 'horizontal', 'up', effectiveTabSize
    ));

    // Right edge (top to bottom)
    pathParts.push(this.generateEdgePath(
      right, top, right, bottom,
      edges.right, 'vertical', 'right', effectiveTabSize
    ));

    // Bottom edge (right to left)
    pathParts.push(this.generateEdgePath(
      right, bottom, left, bottom,
      edges.bottom, 'horizontal', 'down', effectiveTabSize
    ));

    // Left edge (bottom to top)
    pathParts.push(this.generateEdgePath(
      left, bottom, left, top,
      edges.left, 'vertical', 'left', effectiveTabSize
    ));

    pathParts.push('Z');

    return `path('${pathParts.join(' ')}')`;
  }

  /**
   * Generate path for a single edge with optional tab or hole
   */
  private generateEdgePath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    edgeType: string,
    orientation: 'horizontal' | 'vertical',
    outwardDir: 'up' | 'down' | 'left' | 'right',
    tabSize: number
  ): string {
    if (edgeType === 'flat') {
      return `L ${endX} ${endY}`;
    }

    const isTab = edgeType === 'tab';
    // For holes, we go opposite direction
    const direction = isTab ? outwardDir : this.oppositeDir(outwardDir);

    // Calculate the tab/hole path
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Tab dimensions
    const tabWidth = tabSize * 0.8;  // Width of the neck
    const tabDepth = tabSize * 0.95; // How far the tab extends

    if (orientation === 'horizontal') {
      // Edge goes horizontally
      const goingRight = endX > startX;
      const sign = goingRight ? 1 : -1;

      const neckStart = midX - sign * tabWidth;
      const neckEnd = midX + sign * tabWidth;

      const perpSign = direction === 'up' ? -1 : 1;
      const y = startY;
      const peakY = y + perpSign * tabDepth;
      const neckY = y + perpSign * (tabDepth * 0.35);

      // Classic jigsaw shape using cubic beziers
      return `L ${neckStart} ${y} ` +
             `C ${neckStart} ${neckY}, ${midX - sign * tabWidth * 1.3} ${peakY}, ${midX} ${peakY} ` +
             `C ${midX + sign * tabWidth * 1.3} ${peakY}, ${neckEnd} ${neckY}, ${neckEnd} ${y} ` +
             `L ${endX} ${endY}`;
    } else {
      // Edge goes vertically
      const goingDown = endY > startY;
      const sign = goingDown ? 1 : -1;

      const neckStart = midY - sign * tabWidth;
      const neckEnd = midY + sign * tabWidth;

      const perpSign = direction === 'right' ? 1 : -1;
      const x = startX;
      const peakX = x + perpSign * tabDepth;
      const neckX = x + perpSign * (tabDepth * 0.35);

      // Classic jigsaw shape using cubic beziers
      return `L ${x} ${neckStart} ` +
             `C ${neckX} ${neckStart}, ${peakX} ${midY - sign * tabWidth * 1.3}, ${peakX} ${midY} ` +
             `C ${peakX} ${midY + sign * tabWidth * 1.3}, ${neckX} ${neckEnd}, ${x} ${neckEnd} ` +
             `L ${endX} ${endY}`;
    }
  }

  private oppositeDir(dir: 'up' | 'down' | 'left' | 'right'): 'up' | 'down' | 'left' | 'right' {
    switch (dir) {
      case 'up': return 'down';
      case 'down': return 'up';
      case 'left': return 'right';
      case 'right': return 'left';
    }
  }

  getTileStyles(
    tile: TileData,
    imageUrl: string,
    _cols: number,
    _rows: number
  ): Record<string, string> {
    // Background position: we need to show the correct portion of the image
    // tile.x and tile.y are the expanded positions (can be negative)
    // The math: -tile.x positions the image correctly
    // But we need to handle negative tile.x properly
    const bgPosX = -tile.x;
    const bgPosY = -tile.y;

    return {
      position: 'absolute',
      left: `${tile.x}px`,
      top: `${tile.y}px`,
      width: `${tile.width}px`,
      height: `${tile.height}px`,
      'background-image': `url('${this.sanitizeUrl(imageUrl)}')`,
      'background-size': `${this.containerWidth}px ${this.containerHeight}px`,
      'background-position': `${bgPosX}px ${bgPosY}px`,
      'background-repeat': 'no-repeat',
      'clip-path': tile.clipPath || '',
      filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
    };
  }
}

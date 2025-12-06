import type { TileData, PatternType } from '../types';
import { BasePattern } from './base';

/**
 * Voronoi pattern - organic irregular cells
 * Uses a simple Voronoi-like algorithm to create irregular polygons
 */
export class VoronoiPattern extends BasePattern {
  name: PatternType = 'voronoi';

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
    const numPoints = cols * rows;

    // Generate random seed points with some jitter from grid positions
    const points: { x: number; y: number }[] = [];
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Add jitter to grid positions
        const jitterX = (Math.random() - 0.5) * cellWidth * 0.6;
        const jitterY = (Math.random() - 0.5) * cellHeight * 0.6;

        points.push({
          x: (col + 0.5) * cellWidth + jitterX,
          y: (row + 0.5) * cellHeight + jitterY,
        });
      }
    }

    // For each point, calculate its Voronoi cell
    for (let i = 0; i < numPoints; i++) {
      const point = points[i];
      const polygon = this.computeVoronoiCell(
        point,
        points,
        containerWidth,
        containerHeight,
        gap
      );

      if (polygon.length < 3) continue;

      // Calculate bounding box
      const xs = polygon.map((p) => p.x);
      const ys = polygon.map((p) => p.y);
      const minX = Math.max(0, Math.min(...xs));
      const maxX = Math.min(containerWidth, Math.max(...xs));
      const minY = Math.max(0, Math.min(...ys));
      const maxY = Math.min(containerHeight, Math.max(...ys));

      const width = maxX - minX;
      const height = maxY - minY;

      if (width <= 0 || height <= 0) continue;

      // Create clip path relative to bounding box
      const clipPoints = polygon.map((p) => {
        const x = ((p.x - minX) / width) * 100;
        const y = ((p.y - minY) / height) * 100;
        return `${x}% ${y}%`;
      });

      const bgPosX = (point.x / containerWidth) * 100;
      const bgPosY = (point.y / containerHeight) * 100;

      tiles.push({
        index: i,
        row: Math.floor(i / cols),
        col: i % cols,
        x: minX,
        y: minY,
        width,
        height,
        bgPosX,
        bgPosY,
        clipPath: `polygon(${clipPoints.join(', ')})`,
      });
    }

    return tiles;
  }

  private computeVoronoiCell(
    center: { x: number; y: number },
    allPoints: { x: number; y: number }[],
    width: number,
    height: number,
    gap: number
  ): { x: number; y: number }[] {
    // Start with container bounds
    let polygon: { x: number; y: number }[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];

    // Clip polygon by perpendicular bisector with each other point
    for (const other of allPoints) {
      if (other === center) continue;

      // Midpoint and perpendicular direction
      const midX = (center.x + other.x) / 2;
      const midY = (center.y + other.y) / 2;

      // Direction from center to other
      const dx = other.x - center.x;
      const dy = other.y - center.y;

      // Clip polygon to keep only the side containing center
      polygon = this.clipPolygon(polygon, midX, midY, dx, dy, gap / 2);

      if (polygon.length < 3) break;
    }

    return polygon;
  }

  private clipPolygon(
    polygon: { x: number; y: number }[],
    lineX: number,
    lineY: number,
    normalX: number,
    normalY: number,
    offset: number
  ): { x: number; y: number }[] {
    if (polygon.length < 3) return [];

    // Offset the line slightly for gap
    const len = Math.sqrt(normalX * normalX + normalY * normalY);
    const nx = normalX / len;
    const ny = normalY / len;
    const offsetLineX = lineX - nx * offset;
    const offsetLineY = lineY - ny * offset;

    const result: { x: number; y: number }[] = [];

    for (let i = 0; i < polygon.length; i++) {
      const current = polygon[i];
      const next = polygon[(i + 1) % polygon.length];

      const currentSide = this.sideOfLine(current, offsetLineX, offsetLineY, nx, ny);
      const nextSide = this.sideOfLine(next, offsetLineX, offsetLineY, nx, ny);

      if (currentSide <= 0) {
        result.push(current);
      }

      if ((currentSide < 0 && nextSide > 0) || (currentSide > 0 && nextSide < 0)) {
        const intersection = this.lineIntersection(
          current,
          next,
          offsetLineX,
          offsetLineY,
          nx,
          ny
        );
        if (intersection) {
          result.push(intersection);
        }
      }
    }

    return result;
  }

  private sideOfLine(
    point: { x: number; y: number },
    lineX: number,
    lineY: number,
    normalX: number,
    normalY: number
  ): number {
    return (point.x - lineX) * normalX + (point.y - lineY) * normalY;
  }

  private lineIntersection(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    lineX: number,
    lineY: number,
    normalX: number,
    normalY: number
  ): { x: number; y: number } | null {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const denom = dx * normalX + dy * normalY;

    if (Math.abs(denom) < 1e-10) return null;

    const t = ((lineX - p1.x) * normalX + (lineY - p1.y) * normalY) / denom;

    return {
      x: p1.x + t * dx,
      y: p1.y + t * dy,
    };
  }

  getTileStyles(
    tile: TileData,
    imageUrl: string,
    _cols: number,
    _rows: number
  ): Record<string, string> {
    return {
      position: 'absolute',
      left: `${tile.x}px`,
      top: `${tile.y}px`,
      width: `${tile.width}px`,
      height: `${tile.height}px`,
      'background-image': `url(${imageUrl})`,
      'background-size': `${this.containerWidth}px ${this.containerHeight}px`,
      'background-position': `-${tile.x}px -${tile.y}px`,
      'background-repeat': 'no-repeat',
      'clip-path': tile.clipPath || '',
    };
  }
}

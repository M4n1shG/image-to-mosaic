import type { GridDimensions } from '../types';

/**
 * Default minimum tiles (2×2 grid)
 */
const MIN_TILES = 4;

/**
 * Convert density value (1-100) to grid dimensions
 * Maintains aspect ratio of the container
 */
export function densityToGrid(
  density: number,
  containerWidth: number,
  containerHeight: number,
  maxTiles: number,
  gap: number
): GridDimensions {
  // Clamp density to valid range
  const clampedDensity = Math.max(1, Math.min(100, density));

  // Calculate target tile count based on density
  // Use exponential scaling for more intuitive feel
  const normalizedDensity = clampedDensity / 100;
  const targetTiles = Math.round(
    MIN_TILES + Math.pow(normalizedDensity, 1.5) * (maxTiles - MIN_TILES)
  );

  // Calculate aspect ratio
  const aspectRatio = containerWidth / containerHeight;

  // Calculate columns and rows maintaining aspect ratio
  // cols / rows ≈ aspectRatio
  // cols * rows ≈ targetTiles
  // Therefore: cols ≈ sqrt(targetTiles * aspectRatio)
  let cols = Math.round(Math.sqrt(targetTiles * aspectRatio));
  let rows = Math.round(cols / aspectRatio);

  // Ensure minimum of 2×2
  cols = Math.max(2, cols);
  rows = Math.max(2, rows);

  // Recalculate if we exceed maxTiles
  while (cols * rows > maxTiles) {
    if (cols > rows) {
      cols--;
    } else {
      rows--;
    }
  }

  // Calculate tile dimensions accounting for gaps
  const totalGapWidth = gap * (cols - 1);
  const totalGapHeight = gap * (rows - 1);
  const tileWidth = (containerWidth - totalGapWidth) / cols;
  const tileHeight = (containerHeight - totalGapHeight) / rows;

  return {
    cols,
    rows,
    tileWidth,
    tileHeight,
  };
}

/**
 * Calculate the optimal density for a given number of columns
 */
export function columnsToApproxDensity(
  cols: number,
  containerWidth: number,
  containerHeight: number,
  maxTiles: number
): number {
  const aspectRatio = containerWidth / containerHeight;
  const rows = Math.round(cols / aspectRatio);
  const tiles = cols * rows;

  // Reverse the density calculation
  const normalizedTiles = (tiles - MIN_TILES) / (maxTiles - MIN_TILES);
  const density = Math.pow(normalizedTiles, 1 / 1.5) * 100;

  return Math.max(1, Math.min(100, Math.round(density)));
}

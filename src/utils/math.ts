/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate the center point of a grid
 */
export function gridCenter(cols: number, rows: number): { x: number; y: number } {
  return {
    x: (cols - 1) / 2,
    y: (rows - 1) / 2,
  };
}

/**
 * Shuffle an array in place (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a random number between min and max
 */
export function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate spiral order for tiles (used for spiral delay mode)
 * Returns an array of indices in spiral order from center outward
 */
export function spiralOrder(cols: number, rows: number): number[] {
  const result: number[] = [];
  const matrix: number[][] = [];

  // Create matrix with tile indices
  for (let r = 0; r < rows; r++) {
    matrix[r] = [];
    for (let c = 0; c < cols; c++) {
      matrix[r][c] = r * cols + c;
    }
  }

  // Find center
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);

  // Spiral outward from center
  const visited = new Set<string>();
  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [0, -1],  // left
    [-1, 0],  // up
  ];

  let r = centerRow;
  let c = centerCol;
  let dirIndex = 0;
  let steps = 1;
  let stepsTaken = 0;
  let turnsAtCurrentSteps = 0;

  while (result.length < cols * rows) {
    const key = `${r},${c}`;
    if (r >= 0 && r < rows && c >= 0 && c < cols && !visited.has(key)) {
      visited.add(key);
      result.push(matrix[r][c]);
    }

    // Move in current direction
    r += directions[dirIndex][0];
    c += directions[dirIndex][1];
    stepsTaken++;

    // Check if we need to turn
    if (stepsTaken === steps) {
      stepsTaken = 0;
      dirIndex = (dirIndex + 1) % 4;
      turnsAtCurrentSteps++;

      // Increase steps after every 2 turns
      if (turnsAtCurrentSteps === 2) {
        turnsAtCurrentSteps = 0;
        steps++;
      }
    }
  }

  return result;
}

/**
 * Calculate angle from center for a given position
 */
export function angleFromCenter(
  col: number,
  row: number,
  centerCol: number,
  centerRow: number
): number {
  return Math.atan2(row - centerRow, col - centerCol);
}

import type { Pattern, PatternType } from '../types';
import { GridPattern } from './grid';
import { BrickPattern } from './brick';
import { DiamondPattern } from './diamond';
import { StripsPattern } from './strips';
import { VoronoiPattern } from './voronoi';
import { PuzzlePattern } from './puzzle';

/**
 * Pattern registry - maps pattern names to pattern instances
 * V1 Patterns: grid, brick, diamond, strips, voronoi, puzzle
 */
const patterns: Map<PatternType, Pattern> = new Map([
  ['grid', new GridPattern()],
  ['brick', new BrickPattern()],
  ['diamond', new DiamondPattern()],
  ['strips', new StripsPattern()],
  ['voronoi', new VoronoiPattern()],
  ['puzzle', new PuzzlePattern()],
]);

/**
 * Get a pattern by name
 */
export function getPattern(name: PatternType): Pattern {
  const pattern = patterns.get(name);
  if (!pattern) {
    console.warn(`Pattern "${name}" not found, falling back to grid`);
    return patterns.get('grid')!;
  }
  return pattern;
}

/**
 * Get all available pattern names
 */
export function getPatternNames(): PatternType[] {
  return Array.from(patterns.keys());
}

/**
 * Register a custom pattern
 */
export function registerPattern(pattern: Pattern): void {
  patterns.set(pattern.name, pattern);
}

// Re-export pattern classes for extension
export { BasePattern } from './base';
export { GridPattern } from './grid';
export { BrickPattern } from './brick';
export { DiamondPattern } from './diamond';
export { StripsPattern } from './strips';
export { VoronoiPattern } from './voronoi';
export { PuzzlePattern } from './puzzle';

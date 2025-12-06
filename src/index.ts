/**
 * image-to-mosaic
 * A zero-dependency JavaScript library that transforms images into interactive mosaic tiles
 */

// Main class
export { Mosaic } from './mosaic';

// Web Component
export { MosaicImageElement, registerMosaicElement } from './mosaic-element';

// Types
export type {
  MosaicConfig,
  TileData,
  PatternType,
  AnimationType,
  DelayMode,
  HoverEffect,
  RenderMode,
  AnimationConfig,
  HoverConfig,
  Pattern,
  Animation,
  DelayCalculator,
} from './types';

// Pattern utilities (v1: grid, brick, diamond, strips, voronoi, puzzle)
export {
  getPattern,
  getPatternNames,
  registerPattern,
  BasePattern,
  GridPattern,
  BrickPattern,
  DiamondPattern,
  StripsPattern,
  VoronoiPattern,
  PuzzlePattern,
} from './patterns';

// Animation utilities
export {
  getAnimation,
  getAnimationNames,
  registerAnimation,
  FadeAnimation,
  ScaleAnimation,
  FlipAnimation,
  SlideAnimation,
  ScatterAnimation,
} from './animations';

// Delay utilities
export {
  getDelayCalculator,
  getDelayModeNames,
  registerDelayCalculator,
  SequentialDelay,
  RandomDelay,
  CenterDelay,
  SpiralDelay,
} from './delays';

// Utility functions
export { densityToGrid, columnsToApproxDensity } from './utils/density';

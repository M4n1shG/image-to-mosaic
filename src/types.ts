/**
 * Supported mosaic patterns (v1)
 */
export type PatternType =
  | 'grid'
  | 'brick'
  | 'diamond'
  | 'strips'
  | 'voronoi'
  | 'puzzle';

/**
 * Supported animation types
 */
export type AnimationType = 'fade' | 'scale' | 'flip' | 'slide' | 'scatter' | 'none';

/**
 * Supported delay modes for animations
 */
export type DelayMode = 'sequential' | 'random' | 'center' | 'spiral' | number;

/**
 * Supported hover effects
 */
export type HoverEffect = 'lift' | 'glow' | 'zoom' | 'tilt' | 'flip' | 'blur' | 'pop' | 'spotlight' | 'none';

/**
 * Render mode for the mosaic
 */
export type RenderMode = 'element' | 'webcomponent';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Animation type */
  type: AnimationType;
  /** Duration per tile in milliseconds */
  duration?: number;
  /** Delay mode or fixed delay in ms */
  delay?: DelayMode;
  /** CSS easing function */
  easing?: string;
}

/**
 * Hover effect configuration
 */
export interface HoverConfig {
  /** Hover effect type */
  effect: HoverEffect;
  /** Scale factor for zoom effect */
  scale?: number;
  /** Transition duration in ms */
  duration?: number;
  /** Color for glow effect (CSS color value) */
  color?: string;
}

/**
 * Tile data representing a single mosaic piece
 */
export interface TileData {
  /** Tile index */
  index: number;
  /** Row position */
  row: number;
  /** Column position */
  col: number;
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** Tile width in pixels */
  width: number;
  /** Tile height in pixels */
  height: number;
  /** Background position X percentage */
  bgPosX: number;
  /** Background position Y percentage */
  bgPosY: number;
  /** The DOM element for this tile */
  element?: HTMLElement;
  /** Animation delay for this tile */
  animationDelay?: number;
  /** Clip path for non-rectangular tiles */
  clipPath?: string;
}

/**
 * Grid dimensions
 */
export interface GridDimensions {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

/**
 * Main configuration options for Mosaic
 */
export interface MosaicConfig {
  /** Target element or selector */
  target: string | HTMLElement;
  /** Image source URL */
  image: string;
  /** Render mode: 'element' (divs) or 'webcomponent' */
  renderAs?: RenderMode;
  /** Container width in pixels or 'auto' */
  width?: number | 'auto';
  /** Container height in pixels or 'auto' */
  height?: number | 'auto';
  /** Mosaic pattern type */
  pattern?: PatternType;
  /** Density value from 1-100 (1=few large tiles, 100=many small tiles) */
  density?: number;
  /** Maximum number of tiles to prevent performance issues */
  maxTiles?: number;
  /** Gap between tiles in pixels */
  gap?: number;
  /** Border radius for rounded corners (px or %) */
  borderRadius?: number | string;
  /** Animation configuration */
  animation?: AnimationConfig;
  /** Hover effect configuration */
  hover?: HoverConfig;
  /** Enable drag and drop tiles */
  draggable?: boolean;
  /** Start with shuffled tiles */
  shuffle?: boolean;
  /** Callback when mosaic is ready */
  onReady?: () => void;
  /** Callback when a tile is clicked */
  onTileClick?: (tile: TileData, index: number) => void;
  /** Callback when an error occurs (e.g., image load failure) */
  onError?: (error: Error) => void;
}

/**
 * Resolved hover config - color remains optional since it's only for glow effect
 */
export interface ResolvedHoverConfig {
  effect: HoverEffect;
  scale: number;
  duration: number;
  color?: string;
}

/**
 * Internal resolved configuration with all defaults applied
 */
export interface ResolvedConfig extends Required<Omit<MosaicConfig, 'target' | 'animation' | 'hover' | 'onReady' | 'onTileClick' | 'onError' | 'borderRadius'>> {
  target: HTMLElement;
  animation: Required<AnimationConfig>;
  hover: ResolvedHoverConfig;
  borderRadius: string;
  onReady?: () => void;
  onTileClick?: (tile: TileData, index: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Pattern generator interface
 */
export interface Pattern {
  /** Pattern name */
  name: PatternType;
  /** Generate tiles for this pattern */
  generateTiles(
    containerWidth: number,
    containerHeight: number,
    cols: number,
    rows: number,
    gap: number
  ): TileData[];
  /** Get CSS for container */
  getContainerStyles(): Record<string, string>;
  /** Get CSS for individual tile */
  getTileStyles(tile: TileData, imageUrl: string, cols: number, rows: number): Record<string, string>;
}

/**
 * Animation handler interface
 */
export interface Animation {
  /** Animation name */
  name: AnimationType;
  /** Get initial styles before animation */
  getInitialStyles(): Record<string, string>;
  /** Get final styles after animation */
  getFinalStyles(): Record<string, string>;
  /** Get CSS transition property */
  getTransition(duration: number, easing: string): string;
}

/**
 * Delay calculator interface
 */
export interface DelayCalculator {
  /** Calculate delay for a tile based on its position */
  calculate(
    tile: TileData,
    totalTiles: number,
    cols: number,
    rows: number,
    maxDelay: number
  ): number;
}

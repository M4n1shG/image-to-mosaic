import type {
  MosaicConfig,
  ResolvedConfig,
  TileData,
  Pattern,
  DelayCalculator,
  PatternType,
  AnimationType,
  DelayMode,
  HoverEffect,
} from './types';
import {
  resolveTarget,
  createElement,
  applyStyles,
  clearElement,
  preloadImage,
  getElementDimensions,
  debounce,
  nextFrame,
} from './utils/dom';
import { densityToGrid } from './utils/density';
import { shuffleArray } from './utils/math';
import { getPattern } from './patterns';
import { getDelayCalculator } from './delays';
import { applyHoverEffect, removeHoverEffect } from './interactions/hover';
import { initDraggable, destroyDraggable } from './interactions/drag';
import { injectStyles, removeStyles } from './styles';

/**
 * Allowed CSS easing values (prevents CSS injection)
 */
const ALLOWED_EASINGS = [
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
] as const;

/**
 * Validate easing value against whitelist
 */
function validateEasing(easing: string): string {
  if (ALLOWED_EASINGS.includes(easing as (typeof ALLOWED_EASINGS)[number])) {
    return easing;
  }
  // Also allow cubic-bezier with validated format
  const cubicBezierRegex = /^cubic-bezier\(\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*\)$/;
  if (cubicBezierRegex.test(easing)) {
    return easing;
  }
  // Default to safe value
  return 'ease-out';
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<MosaicConfig> = {
  renderAs: 'element',
  width: 'auto',
  height: 'auto',
  pattern: 'grid',
  density: 50,
  maxTiles: 2500,
  gap: 2,
  borderRadius: 0,
  animation: {
    type: 'none',
    duration: 500,
    delay: 'sequential',
    easing: 'ease-out',
  },
  hover: {
    effect: 'none',
    scale: 1.1,
    duration: 200,
  },
  draggable: false,
  shuffle: false,
};

/**
 * Main Mosaic class
 * Transforms an image into an interactive mosaic of tiles
 */
export class Mosaic {
  private config: ResolvedConfig;
  private container: HTMLElement | null = null;
  private tiles: TileData[] = [];
  private pattern: Pattern;
  private delayCalculator: DelayCalculator;
  private imageLoaded = false;
  private imageDimensions: { width: number; height: number } = { width: 0, height: 0 };
  private resizeObserver: ResizeObserver | null = null;
  private originalTilePositions: Map<number, { x: number; y: number }> = new Map();
  private lastContainerSize: { width: number; height: number } = { width: 0, height: 0 };
  private tileClickHandlers: Map<HTMLElement, () => void> = new Map();

  constructor(config: MosaicConfig) {
    this.config = this.resolveConfig(config);
    this.pattern = getPattern(this.config.pattern);
    this.delayCalculator = getDelayCalculator(this.config.animation.delay);
  }

  /**
   * Resolve and merge configuration with defaults
   */
  private resolveConfig(config: MosaicConfig): ResolvedConfig {
    const target = resolveTarget(config.target);

    const animation = {
      type: config.animation?.type ?? DEFAULT_CONFIG.animation!.type!,
      duration: config.animation?.duration ?? DEFAULT_CONFIG.animation!.duration!,
      delay: config.animation?.delay ?? DEFAULT_CONFIG.animation!.delay!,
      easing: config.animation?.easing ?? DEFAULT_CONFIG.animation!.easing!,
    };

    const hover = {
      effect: config.hover?.effect ?? DEFAULT_CONFIG.hover!.effect!,
      scale: config.hover?.scale ?? DEFAULT_CONFIG.hover!.scale!,
      duration: config.hover?.duration ?? DEFAULT_CONFIG.hover!.duration!,
      color: config.hover?.color,
    };

    // Normalize borderRadius to string
    const borderRadiusValue = config.borderRadius ?? DEFAULT_CONFIG.borderRadius!;
    const borderRadius = typeof borderRadiusValue === 'number'
      ? `${borderRadiusValue}px`
      : borderRadiusValue;

    return {
      target,
      image: config.image,
      renderAs: config.renderAs ?? DEFAULT_CONFIG.renderAs!,
      width: config.width ?? DEFAULT_CONFIG.width!,
      height: config.height ?? DEFAULT_CONFIG.height!,
      pattern: config.pattern ?? DEFAULT_CONFIG.pattern!,
      density: config.density ?? DEFAULT_CONFIG.density!,
      maxTiles: config.maxTiles ?? DEFAULT_CONFIG.maxTiles!,
      gap: config.gap ?? DEFAULT_CONFIG.gap!,
      borderRadius,
      animation,
      hover,
      draggable: config.draggable ?? DEFAULT_CONFIG.draggable!,
      shuffle: config.shuffle ?? DEFAULT_CONFIG.shuffle!,
      onReady: config.onReady,
      onTileClick: config.onTileClick,
      onError: config.onError,
    };
  }

  /**
   * Render the mosaic
   */
  async render(): Promise<void> {
    // Inject CSS styles (only once)
    injectStyles();

    // Cleanup old interactivity before re-render
    if (this.container) {
      destroyDraggable(this.container);
      this.tiles.forEach((tile) => {
        if (tile.element) {
          removeHoverEffect(tile.element);
        }
      });
    }

    // Disconnect old resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Preload image to get dimensions
    if (!this.imageLoaded) {
      try {
        this.imageDimensions = await preloadImage(this.config.image);
        this.imageLoaded = true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load image');
        this.config.onError?.(err);
        throw err;
      }
    }

    // Get container dimensions
    const containerDimensions = this.getContainerDimensions();

    // Store dimensions to prevent resize loops
    this.lastContainerSize = { ...containerDimensions };

    // Create mosaic container
    this.createContainer(containerDimensions);

    // Generate tiles based on pattern
    const gridDimensions = densityToGrid(
      this.config.density,
      containerDimensions.width,
      containerDimensions.height,
      this.config.maxTiles,
      this.config.gap
    );

    this.tiles = this.pattern.generateTiles(
      containerDimensions.width,
      containerDimensions.height,
      gridDimensions.cols,
      gridDimensions.rows,
      this.config.gap
    );

    // Store original positions for reset
    this.tiles.forEach((tile) => {
      this.originalTilePositions.set(tile.index, { x: tile.x, y: tile.y });
    });

    // Calculate animation delays
    this.calculateDelays(gridDimensions.cols, gridDimensions.rows);

    // Shuffle if configured
    if (this.config.shuffle) {
      this.shuffleTilePositions();
    }

    // Render tiles
    await this.renderTiles(gridDimensions.cols, gridDimensions.rows);

    // Setup interactivity
    this.setupInteractivity();

    // Setup resize observer
    this.setupResizeObserver();

    // Trigger onReady callback
    this.config.onReady?.();
  }

  /**
   * Get container dimensions
   */
  private getContainerDimensions(): { width: number; height: number } {
    let width: number;
    let height: number;

    if (this.config.width === 'auto' || this.config.height === 'auto') {
      const dims = getElementDimensions(this.config.target);
      width = this.config.width === 'auto' ? dims.width : this.config.width;
      height = this.config.height === 'auto' ? dims.height : this.config.height;

      // If height is still 0, use image aspect ratio
      if (height === 0 && this.imageDimensions.height > 0) {
        height = (width / this.imageDimensions.width) * this.imageDimensions.height;
      }
    } else {
      width = this.config.width;
      height = this.config.height;
    }

    return { width, height };
  }

  /**
   * Create the mosaic container element
   */
  private createContainer(dimensions: { width: number; height: number }): void {
    clearElement(this.config.target);

    this.container = createElement(
      'div',
      {
        ...this.pattern.getContainerStyles(),
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      },
      'mosaic-container'
    );

    this.config.target.appendChild(this.container);
  }

  /**
   * Calculate animation delays for each tile
   */
  private calculateDelays(cols: number, rows: number): void {
    const maxDelay = this.config.animation.duration * 2;
    const totalTiles = this.tiles.length;

    this.tiles.forEach((tile) => {
      tile.animationDelay = this.delayCalculator.calculate(
        tile,
        totalTiles,
        cols,
        rows,
        maxDelay
      );
    });
  }

  /**
   * Shuffle tile visual positions (not the background)
   */
  private shuffleTilePositions(): void {
    const positions = this.tiles.map((tile) => ({ x: tile.x, y: tile.y }));
    const shuffledPositions = shuffleArray(positions);

    this.tiles.forEach((tile, index) => {
      tile.x = shuffledPositions[index].x;
      tile.y = shuffledPositions[index].y;
    });
  }

  /**
   * Render all tiles to the container
   */
  private async renderTiles(cols: number, rows: number): Promise<void> {
    if (!this.container) return;

    // Use DocumentFragment for batched DOM insertion (better performance)
    const fragment = document.createDocumentFragment();

    // Create all tile elements with initial (hidden) state
    for (const tile of this.tiles) {
      const element = this.createTileElement(tile, cols, rows);
      tile.element = element;
      fragment.appendChild(element);
    }

    // Single DOM insertion for all tiles
    this.container.appendChild(fragment);

    // Wait for next frame to ensure elements are in DOM
    await nextFrame();

    // Animate tiles in
    for (const tile of this.tiles) {
      if (tile.element) {
        this.animateTileIn(tile);
      }
    }
  }

  /**
   * Create a single tile element
   */
  private createTileElement(tile: TileData, cols: number, rows: number): HTMLElement {
    const tileStyles = this.pattern.getTileStyles(tile, this.config.image, cols, rows);

    // Apply borderRadius only for patterns without clip-path
    const borderRadiusStyle: Record<string, string> = !tile.clipPath && this.config.borderRadius !== '0px'
      ? { 'border-radius': this.config.borderRadius }
      : {};

    const element = createElement(
      'div',
      {
        ...tileStyles,
        ...borderRadiusStyle,
        cursor: this.config.onTileClick || this.config.draggable ? 'pointer' : 'default',
      },
      'mosaic-tile'
    );

    // Set CSS custom properties for animation timing
    element.style.setProperty('--animation-duration', `${this.config.animation.duration}ms`);
    element.style.setProperty('--animation-delay', `${tile.animationDelay}ms`);
    element.style.setProperty('--animation-easing', validateEasing(this.config.animation.easing));

    // Set random values for scatter animation
    if (this.config.animation.type === 'scatter') {
      element.style.setProperty('--random-x', String(Math.random()));
      element.style.setProperty('--random-y', String(Math.random()));
      element.style.setProperty('--random-r', String(Math.random()));
    }

    // Add animation class
    const animationType = this.config.animation.type;
    element.classList.add(`animate-${animationType}`);

    // When animation completes, swap to 'complete' class to remove transform
    // This allows hover transforms to work without conflict
    if (animationType !== 'none') {
      element.addEventListener('animationend', () => {
        element.classList.remove(`animate-${animationType}`);
        element.classList.add('animate-complete');
      }, { once: true });
    }

    element.dataset.index = String(tile.index);
    element.dataset.row = String(tile.row);
    element.dataset.col = String(tile.col);

    // Add click handler (store reference for cleanup)
    if (this.config.onTileClick) {
      const handler = () => this.config.onTileClick?.(tile, tile.index);
      element.addEventListener('click', handler);
      this.tileClickHandlers.set(element, handler);
    }

    return element;
  }

  /**
   * Animate a tile into view
   * With CSS-only animations, the animation class already handles this
   * The element is created with the animation class which triggers automatically
   */
  private animateTileIn(_tile: TileData): void {
    // CSS animations with 'forwards' fill mode handle the final state automatically
    // No JavaScript manipulation needed
  }

  /**
   * Setup hover and drag interactivity
   */
  private setupInteractivity(): void {
    // Setup hover effects
    if (this.config.hover.effect !== 'none') {
      this.tiles.forEach((tile) => {
        if (tile.element) {
          applyHoverEffect(tile.element, this.config.hover);
        }
      });
    }

    // Setup draggable
    if (this.config.draggable && this.container) {
      initDraggable(this.container, this.tiles);
    }
  }

  /**
   * Setup resize observer for responsive behavior
   */
  private setupResizeObserver(): void {
    // Feature detection: ResizeObserver not available in older browsers (IE11, Safari <13.1)
    if (typeof ResizeObserver === 'undefined') {
      return; // Graceful fallback - no auto-resize on unsupported browsers
    }

    const debouncedResize = debounce(() => {
      // Check if size actually changed to prevent render loops
      const currentSize = getElementDimensions(this.config.target);
      if (
        currentSize.width === this.lastContainerSize.width &&
        currentSize.height === this.lastContainerSize.height
      ) {
        return; // Size hasn't changed, skip re-render
      }
      this.render();
    }, 250);

    this.resizeObserver = new ResizeObserver(debouncedResize);
    this.resizeObserver.observe(this.config.target);
  }

  /**
   * Shuffle tiles to random positions
   */
  shuffle(): void {
    this.shuffleTilePositions();

    this.tiles.forEach((tile) => {
      if (tile.element) {
        applyStyles(tile.element, {
          left: `${tile.x}px`,
          top: `${tile.y}px`,
        });
      }
    });
  }

  /**
   * Reset tiles to original positions
   */
  reset(): void {
    this.tiles.forEach((tile) => {
      const original = this.originalTilePositions.get(tile.index);
      if (original && tile.element) {
        tile.x = original.x;
        tile.y = original.y;
        applyStyles(tile.element, {
          left: `${tile.x}px`,
          top: `${tile.y}px`,
        });
      }
    });
  }

  /**
   * Update the image
   */
  async setImage(src: string): Promise<void> {
    this.config.image = src;
    this.imageLoaded = false;
    await this.render();
  }

  /**
   * Update density
   */
  async setDensity(density: number): Promise<void> {
    this.config.density = Math.max(1, Math.min(100, density));
    await this.render();
  }

  /**
   * Update pattern
   */
  async setPattern(pattern: PatternType): Promise<void> {
    this.config.pattern = pattern;
    this.pattern = getPattern(pattern);
    await this.render();
  }

  /**
   * Update animation type
   * Note: Requires re-render to apply new animation class to tiles
   */
  async setAnimation(type: AnimationType): Promise<void> {
    this.config.animation.type = type;
    await this.render();
  }

  /**
   * Update delay mode
   */
  setDelayMode(delay: DelayMode): void {
    this.config.animation.delay = delay;
    this.delayCalculator = getDelayCalculator(delay);
  }

  /**
   * Update hover effect
   */
  setHoverEffect(effect: HoverEffect): void {
    // Remove old effects
    this.tiles.forEach((tile) => {
      if (tile.element) {
        removeHoverEffect(tile.element);
      }
    });

    this.config.hover.effect = effect;

    // Apply new effects
    if (effect !== 'none') {
      this.tiles.forEach((tile) => {
        if (tile.element) {
          applyHoverEffect(tile.element, this.config.hover);
        }
      });
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<MosaicConfig>): Promise<void> {
    this.config = this.resolveConfig({ ...this.config, ...config });

    if (config.pattern) {
      this.pattern = getPattern(this.config.pattern);
    }
    if (config.animation?.delay) {
      this.delayCalculator = getDelayCalculator(this.config.animation.delay);
    }

    await this.render();
  }

  /**
   * Get current tiles
   */
  getTiles(): TileData[] {
    return [...this.tiles];
  }

  /**
   * Get current configuration
   */
  getConfig(): ResolvedConfig {
    return { ...this.config };
  }

  /**
   * Destroy the mosaic and cleanup
   */
  destroy(): void {
    // Remove resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Cleanup draggable
    if (this.container) {
      destroyDraggable(this.container);
    }

    // Remove click handlers
    this.tileClickHandlers.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.tileClickHandlers.clear();

    // Remove hover effects
    this.tiles.forEach((tile) => {
      if (tile.element) {
        removeHoverEffect(tile.element);
      }
    });

    // Clear container
    clearElement(this.config.target);

    // Reset state
    this.container = null;
    this.tiles = [];
    this.originalTilePositions.clear();

    // Remove shared styles (only when all instances destroyed)
    removeStyles();
  }
}

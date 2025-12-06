import { Mosaic } from './mosaic';
import type { PatternType, AnimationType, DelayMode, HoverEffect } from './types';

/**
 * MosaicImage Web Component
 * Usage: <mosaic-image src="image.jpg" pattern="grid" density="50"></mosaic-image>
 */
export class MosaicImageElement extends HTMLElement {
  private mosaic: Mosaic | null = null;
  private container: HTMLDivElement;

  static get observedAttributes(): string[] {
    return [
      'src',
      'pattern',
      'density',
      'gap',
      'animation',
      'animation-duration',
      'animation-delay',
      'hover',
      'draggable',
      'width',
      'height',
    ];
  }

  constructor() {
    super();

    // Create shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        position: relative;
      }
      .mosaic-wrapper {
        width: 100%;
        height: 100%;
      }
    `;
    shadow.appendChild(style);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'mosaic-wrapper';
    shadow.appendChild(this.container);
  }

  connectedCallback(): void {
    this.initMosaic();
  }

  disconnectedCallback(): void {
    this.mosaic?.destroy();
    this.mosaic = null;
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;

    if (this.mosaic) {
      this.updateMosaicFromAttributes();
    }
  }

  private async initMosaic(): Promise<void> {
    const src = this.getAttribute('src');
    if (!src) {
      const error = new Error('MosaicImage: src attribute is required');
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      return;
    }

    const config = this.getConfigFromAttributes();

    try {
      this.mosaic = new Mosaic({
        target: this.container,
        image: src,
        ...config,
        onError: (error) => {
          this.dispatchEvent(new CustomEvent('error', { detail: error }));
        },
      });

      await this.mosaic.render();
      this.dispatchEvent(new CustomEvent('ready'));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  private getConfigFromAttributes(): Record<string, unknown> {
    const config: Record<string, unknown> = {};

    // Pattern
    const pattern = this.getAttribute('pattern');
    if (pattern) {
      config.pattern = pattern as PatternType;
    }

    // Density
    const density = this.getAttribute('density');
    if (density) {
      config.density = parseInt(density, 10);
    }

    // Gap
    const gap = this.getAttribute('gap');
    if (gap) {
      config.gap = parseInt(gap, 10);
    }

    // Dimensions
    const width = this.getAttribute('width');
    if (width) {
      config.width = width === 'auto' ? 'auto' : parseInt(width, 10);
    }

    const height = this.getAttribute('height');
    if (height) {
      config.height = height === 'auto' ? 'auto' : parseInt(height, 10);
    }

    // Animation
    const animation = this.getAttribute('animation');
    const animationDuration = this.getAttribute('animation-duration');
    const animationDelay = this.getAttribute('animation-delay');

    if (animation || animationDuration || animationDelay) {
      config.animation = {
        type: (animation as AnimationType) || 'fade',
        duration: animationDuration ? parseInt(animationDuration, 10) : 500,
        delay: this.parseDelayMode(animationDelay),
      };
    }

    // Hover
    const hover = this.getAttribute('hover');
    if (hover) {
      config.hover = {
        effect: hover as HoverEffect,
      };
    }

    // Draggable
    const draggable = this.getAttribute('draggable');
    if (draggable !== null) {
      config.draggable = draggable !== 'false';
    }

    return config;
  }

  private parseDelayMode(value: string | null): DelayMode {
    if (!value) return 'random';
    const num = parseInt(value, 10);
    if (!isNaN(num)) return num;
    return value as DelayMode;
  }

  private async updateMosaicFromAttributes(): Promise<void> {
    if (!this.mosaic) return;

    try {
      const src = this.getAttribute('src');
      if (src) {
        await this.mosaic.setImage(src);
      }

      const config = this.getConfigFromAttributes();
      await this.mosaic.updateConfig(config);
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  // Public API methods

  /**
   * Shuffle the tiles
   */
  shuffle(): void {
    this.mosaic?.shuffle();
  }

  /**
   * Reset tiles to original positions
   */
  reset(): void {
    this.mosaic?.reset();
  }

  /**
   * Re-render the mosaic
   */
  async render(): Promise<void> {
    await this.mosaic?.render();
  }

  /**
   * Get the underlying Mosaic instance
   */
  getMosaic(): Mosaic | null {
    return this.mosaic;
  }
}

/**
 * Register the custom element
 */
export function registerMosaicElement(tagName = 'mosaic-image'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, MosaicImageElement);
  }
}

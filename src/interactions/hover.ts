import type { HoverConfig } from '../types';

// Store tilt handlers for cleanup
const tiltHandlers = new WeakMap<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>();

/**
 * Apply hover effect to a tile element using CSS class
 */
export function applyHoverEffect(element: HTMLElement, config: HoverConfig): void {
  const { effect, scale, duration, color } = config;

  if (effect === 'none') return;

  // Set CSS custom properties for scale and duration
  if (scale !== undefined) {
    element.style.setProperty('--hover-scale', scale.toString());
  }
  if (duration !== undefined) {
    element.style.setProperty('--hover-duration', `${duration}ms`);
  }

  // Set glow color if provided
  if (color && effect === 'glow') {
    element.style.setProperty('--hover-color', color);
  }

  // Add the CSS class
  element.classList.add(`hover-${effect}`);

  // For tilt effect, add dynamic mouse tracking
  if (effect === 'tilt') {
    setupTiltTracking(element);
  }
}

/**
 * Setup dynamic tilt tracking based on mouse position
 */
function setupTiltTracking(element: HTMLElement): void {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate tilt based on mouse position relative to center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max tilt of 15 degrees
    const tiltY = ((x - centerX) / centerX) * 15;
    const tiltX = ((centerY - y) / centerY) * 15;

    element.style.setProperty('--tilt-x', `${tiltX}deg`);
    element.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handleMouseLeave = () => {
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Store handlers for cleanup
  tiltHandlers.set(element, { move: handleMouseMove, leave: handleMouseLeave });
}

/**
 * Remove hover effect from an element
 */
export function removeHoverEffect(element: HTMLElement): void {
  // Remove all hover classes
  element.classList.remove(
    'hover-lift',
    'hover-glow',
    'hover-zoom',
    'hover-tilt',
    'hover-flip',
    'hover-blur',
    'hover-pop',
    'hover-spotlight'
  );

  // Clean up tilt handlers if present
  const handlers = tiltHandlers.get(element);
  if (handlers) {
    element.removeEventListener('mousemove', handlers.move);
    element.removeEventListener('mouseleave', handlers.leave);
    tiltHandlers.delete(element);
  }

  // Reset CSS custom properties
  element.style.removeProperty('--tilt-x');
  element.style.removeProperty('--tilt-y');
  element.style.removeProperty('--hover-color');
}

/**
 * Apply hover effect to all tiles in a container
 */
export function applyHoverToContainer(container: HTMLElement, config: HoverConfig): void {
  if (config.effect === 'none') return;

  const tiles = container.querySelectorAll('.mosaic-tile');
  tiles.forEach((tile) => {
    applyHoverEffect(tile as HTMLElement, config);
  });
}

/**
 * Remove hover effects from all tiles in a container
 */
export function removeHoverFromContainer(container: HTMLElement): void {
  const tiles = container.querySelectorAll('.mosaic-tile');
  tiles.forEach((tile) => {
    removeHoverEffect(tile as HTMLElement);
  });
}

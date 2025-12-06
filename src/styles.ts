/**
 * CSS styles for mosaic effects
 * All animations and hover effects are CSS-only
 */

let styleElement: HTMLStyleElement | null = null;
let instanceCount = 0;

/**
 * Inject all mosaic styles into the document
 * Uses reference counting to support multiple Mosaic instances
 */
export function injectStyles(): void {
  instanceCount++;
  if (styleElement) return;

  styleElement = document.createElement('style');
  styleElement.id = 'mosaic-styles';

  styleElement.textContent = `
    /* ========== BASE TILE STYLES ========== */
    .mosaic-tile {
      position: absolute;
      background-repeat: no-repeat;
      transform-origin: center center;
    }

    /* ========== ANIMATION KEYFRAMES ========== */
    @keyframes mosaic-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes mosaic-scale {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes mosaic-flip {
      from { opacity: 0; transform: perspective(400px) rotateY(90deg); }
      to { opacity: 1; transform: perspective(400px) rotateY(0deg); }
    }

    @keyframes mosaic-slide {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes mosaic-scatter {
      from {
        opacity: 0;
        transform: translate(calc((var(--random-x, 0) - 0.5) * 200px), calc((var(--random-y, 0) - 0.5) * 200px)) rotate(calc((var(--random-r, 0) - 0.5) * 90deg));
      }
      to {
        opacity: 1;
        transform: translate(0, 0) rotate(0deg);
      }
    }

    /* ========== ANIMATION CLASSES ========== */
    .mosaic-tile.animate-none {
      opacity: 1;
    }

    /* Completed state - no transform so hover works */
    .mosaic-tile.animate-complete {
      opacity: 1;
    }

    .mosaic-tile.animate-fade {
      opacity: 0;
      animation: mosaic-fade var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-scale {
      opacity: 0;
      transform: scale(0.5);
      animation: mosaic-scale var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-flip {
      opacity: 0;
      transform: perspective(400px) rotateY(90deg);
      animation: mosaic-flip var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-slide {
      opacity: 0;
      transform: translateY(30px);
      animation: mosaic-slide var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-scatter {
      opacity: 0;
      animation: mosaic-scatter var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    /* ========== HOVER EFFECTS ========== */

    /* Lift - rises up with shadow */
    .mosaic-tile.hover-lift {
      transition: transform var(--hover-duration, 200ms) ease-out, box-shadow var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-lift:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      z-index: 10;
    }

    /* Glow - glows with customizable color (no movement) */
    .mosaic-tile.hover-glow {
      transition: box-shadow var(--hover-duration, 200ms) ease-out, filter var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-glow:hover {
      filter: brightness(1.2) saturate(1.2);
      box-shadow: 0 0 20px var(--hover-color, rgba(255,255,255,0.6)), 0 0 40px var(--hover-color, rgba(255,255,255,0.3));
      z-index: 10;
    }

    /* Zoom - dramatic scale with shadow */
    .mosaic-tile.hover-zoom {
      transition: transform var(--hover-duration, 200ms) cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-zoom:hover {
      transform: scale(var(--hover-scale, 1.15));
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10;
    }

    /* Tilt - dynamic 3D tilt based on mouse position (JS sets --tilt-x, --tilt-y) */
    .mosaic-tile.hover-tilt {
      transition: transform var(--hover-duration, 200ms) ease-out;
      transform-style: preserve-3d;
    }
    .mosaic-tile.hover-tilt:hover {
      transform: perspective(600px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.05);
      z-index: 10;
    }

    /* Flip - 3D flip on hover */
    @keyframes mosaic-hover-flip {
      0% { transform: perspective(600px) rotateY(0deg); }
      100% { transform: perspective(600px) rotateY(180deg); }
    }
    .mosaic-tile.hover-flip {
      transition: transform var(--hover-duration, 300ms) ease-in-out;
      transform-style: preserve-3d;
    }
    .mosaic-tile.hover-flip:hover {
      transform: perspective(600px) rotateY(180deg) scale(1.05);
      z-index: 10;
    }

    /* Blur - glassmorphism blur effect */
    .mosaic-tile.hover-blur {
      transition: filter var(--hover-duration, 200ms) ease-out, transform var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-blur:hover {
      filter: blur(0px) brightness(1.1);
      transform: scale(1.08);
      z-index: 10;
    }
    .mosaic-tile.hover-blur:not(:hover) {
      filter: blur(1px) brightness(0.9);
    }

    /* Pop - bouncy scale animation */
    @keyframes mosaic-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1.08); }
    }
    .mosaic-tile.hover-pop {
      transition: transform var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-pop:hover {
      animation: mosaic-pop 0.3s ease-out forwards;
      box-shadow: 0 8px 25px rgba(0,0,0,0.25);
      z-index: 10;
    }

    /* Spotlight - subtle darkening, brighten on hover */
    .mosaic-tile.hover-spotlight {
      transition: filter var(--hover-duration, 200ms) ease-out, transform var(--hover-duration, 200ms) ease-out;
      filter: brightness(0.7);
    }
    .mosaic-tile.hover-spotlight:hover {
      filter: brightness(1.1) contrast(1.1);
      transform: scale(1.05);
      z-index: 10;
    }

    /* ========== DRAGGABLE STYLES ========== */
    .mosaic-tile.draggable {
      cursor: grab;
    }
    .mosaic-tile.draggable:active {
      cursor: grabbing;
    }
    .mosaic-tile.dragging {
      z-index: 100;
      cursor: grabbing;
      transition: none !important;
    }
  `;

  document.head.appendChild(styleElement);
}

/**
 * Remove injected styles (only when all instances are destroyed)
 * Uses reference counting to support multiple Mosaic instances
 */
export function removeStyles(): void {
  instanceCount--;
  if (instanceCount <= 0 && styleElement) {
    styleElement.remove();
    styleElement = null;
    instanceCount = 0; // Reset to prevent negative counts
  }
}
